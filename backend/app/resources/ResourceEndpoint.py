
import datetime
from uuid import uuid4

import boto3
import flask_restful
from flask import jsonify, request
from marshmallow import ValidationError

from app import app, RestException, db, elastic_index
from app.model.resource_category import ResourceCategory
from app.model.resource import ThrivResource
from app.resources.schema import ThrivResourceSchema


class ResourceEndpoint(flask_restful.Resource):

    def get(self, id):
        resource = db.session.query(ThrivResource).filter(ThrivResource.id == id).first()
        if resource is None: raise RestException(RestException.NOT_FOUND)
        return ThrivResourceSchema().dump(resource)

    def delete(self, id):
        resource = db.session.query(ThrivResource).filter(ThrivResource.id == id).first()
        elastic_index.remove_resource(resource)
        db.session.query(ThrivResource).filter_by(id=id).delete()
        db.session.commit()
        return None

    def put(self, id):
        request_data = request.get_json()
        instance = db.session.query(ThrivResource).filter_by(id=id).first()
        updated, errors = ThrivResourceSchema().load(request_data, instance=instance)
        updated.last_updated = datetime.datetime.now()
        if errors: raise RestException(RestException.INVALID_RESOURCE, details=errors)
        db.session.add(updated)
        db.session.commit()
        elastic_index.update_resource(updated)
        return ThrivResourceSchema().dump(updated)


class ResourceListEndpoint(flask_restful.Resource):

    def get(self):
        schema = ThrivResourceSchema(many=True)
        resources = db.session.query(ThrivResource).all()
        return schema.dump(resources)

    def post(self):
        schema = ThrivResourceSchema()
        request_data = request.get_json()
        resource, errors = ThrivResourceSchema().load(request_data)
        if errors: raise RestException(RestException.INVALID_OBJECT, details=errors)
        db.session.add(resource)
        db.session.commit()
        elastic_index.add_resource(resource)
        return schema.dump(resource)
