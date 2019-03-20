
import datetime
from uuid import uuid4

import boto3
import flask_restful
from flask import jsonify, request, g
from marshmallow import ValidationError

from app import app, RestException, db, elastic_index, auth
from app.models import Availability
from app.models import Favorite
from app.models import ResourceCategory
from app.models import ThrivResource
from app.resources.schema import ThrivResourceSchema
from app.resources.Auth import login_optional


class ResourceEndpoint(flask_restful.Resource):

    @login_optional
    def get(self, id):
        resource = db.session.query(ThrivResource).filter(ThrivResource.id == id).first()
        if resource is None: raise RestException(RestException.NOT_FOUND)
        return ThrivResourceSchema().dump(resource)

    @auth.login_required
    def delete(self, id):
        resource = db.session.query(ThrivResource).filter(ThrivResource.id == id).first()
        if resource.user_may_edit():
            try:
                elastic_index.remove_resource(resource)
            except:
                print("unable to remove record from elastic index, might not exist.")
            db.session.query(Availability).filter_by(resource_id=id).delete()
            db.session.query(ResourceCategory).filter_by(resource_id=id).delete()
            db.session.query(Favorite).filter_by(resource_id=id).delete()
            db.session.query(ThrivResource).filter_by(id=id).delete()
            db.session.commit()
            return None
        else:
            raise RestException(RestException.PERMISSION_DENIED)

    @auth.login_required
    def put(self, id):
        request_data = request.get_json()
        instance = db.session.query(ThrivResource).filter_by(id=id).first()
        if instance.user_may_edit():
            updated, errors = ThrivResourceSchema().load(request_data, instance=instance)
            if errors: raise RestException(RestException.INVALID_OBJECT, details=errors)
            updated.last_updated = datetime.datetime.now()
            db.session.add(updated)
            db.session.commit()
            elastic_index.update_resource(updated)
            return ThrivResourceSchema().dump(updated)
        else:
            raise RestException(RestException.PERMISSION_DENIED)


class ResourceListEndpoint(flask_restful.Resource):

    @login_optional
    def get(self):
        args = request.args
        limit = eval(args["limit"]) if ("limit" in args) else 10
        schema = ThrivResourceSchema(many=True)
        resources = db.session.query(ThrivResource).order_by(ThrivResource.last_updated.desc()).limit(limit).all()
        viewable_resources = []
        for r in resources:
            if r.user_may_view():
                    viewable_resources.append(r)

        return schema.dump(viewable_resources)

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
