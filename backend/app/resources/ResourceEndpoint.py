
import datetime
from uuid import uuid4

import boto3
import flask_restful
from flask import jsonify, request, g
from marshmallow import ValidationError

from app import app, RestException, db, elastic_index, auth
from app.model.availability import Availability
from app.model.resource_category import ResourceCategory
from app.model.resource import ThrivResource
from app.resources.schema import ThrivResourceSchema


class ResourceEndpoint(flask_restful.Resource):

    def get(self, id):
        resource = db.session.query(ThrivResource).filter(ThrivResource.id == id).first()
        if resource is None: raise RestException(RestException.NOT_FOUND)
        return ThrivResourceSchema().dump(resource)

    @auth.login_required
    def delete(self, id):
        resource = db.session.query(ThrivResource).filter(ThrivResource.id == id).first()
        try:
            elastic_index.remove_resource(resource)
        except:
            print("unable to remove record from elastic index, might not exist.")
        db.session.query(Availability).filter_by(resource_id=id).delete()
        db.session.query(ResourceCategory).filter_by(resource_id=id).delete()
        db.session.query(ThrivResource).filter_by(id=id).delete()
        db.session.commit()
        return None

    @auth.login_required
    def put(self, id):
        request_data = request.get_json()
        instance = db.session.query(ThrivResource).filter_by(id=id).first()
        updated, errors = ThrivResourceSchema().load(request_data, instance=instance)
        if errors: raise RestException(RestException.INVALID_OBJECT, details=errors)
        updated.last_updated = datetime.datetime.now()
        db.session.add(updated)
        db.session.commit()
        elastic_index.update_resource(updated)
        return ThrivResourceSchema().dump(updated)


class ResourceListEndpoint(flask_restful.Resource):

    def get(self):
        args = request.args
        limit = eval(args["limit"]) if ("limit" in args) else 10
        schema = ThrivResourceSchema(many=True)
        if g.user is not None:
            if g.user.role == "Admin":
                resources = db.session.query(ThrivResource).order_by(ThrivResource.last_updated.desc()).limit(limit).all()
            else:
                resources = db.session.query(ThrivResource).filter(ThrivResource.approved == "Approved").limit(limit).all()
                all_resources = db.session.query(ThrivResource).all()
                for r in all_resources:
                    if g.user.email in r.owners():
                        resources.append(r)
                resources.order_by(ThrivResource.last_updated.desc())
        else:
            resources = db.session.query(ThrivResource).filter(ThrivResource.approved == "Approved").order_by(
                ThrivResource.last_updated.desc()).limit(limit).all()

        return schema.dump(resources)

    @auth.login_required
    def post(self):
        schema = ThrivResourceSchema()
        request_data = request.get_json()
        resource, errors = ThrivResourceSchema().load(request_data)
        if errors: raise RestException(RestException.INVALID_OBJECT, details=errors)
        db.session.add(resource)
        db.session.commit()
        elastic_index.add_resource(resource)
        return schema.dump(resource)


class UserResourceEndpoint(flask_restful.Resource):
    """Provides a way to get the resources owned by the current user."""
    schema = ThrivResourceSchema()

    @auth.login_required
    def get(self):
        schema = ThrivResourceSchema(many=True)
        resources = []
        all_resources = db.session.query(ThrivResource).all()
        for r in all_resources:
            if g.user.email in r.owners():
                resources.append(r)
        return schema.dump(resources)
