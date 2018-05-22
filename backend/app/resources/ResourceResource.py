import flask_restful
from flask import request
from marshmallow import ValidationError

from app import RestException, db
from app.model.resource import ThrivResource, ThrivResourceSchema


class ResourceEndpoint(flask_restful.Resource):

    def get(self, id):
        resource = db.session.query(ThrivResource).filter(ThrivResource.id == id).first()
        if resource is None: raise RestException(RestException.NOT_FOUND)
        return ThrivResourceSchema().dump(resource)

    def delete(self, id):
        db.session.query(ThrivResource).filter_by(id=id).delete()
        db.session.commit()
        return None

    def put(self, id):
        request_data = request.get_json()
        request_data["availabilities"] = []
        try:
            load_result, errors = ThrivResourceSchema().load(request_data)
            if errors: raise RestException(RestException.INVALID_RESOURCE, details=errors)
            db.session.query(ThrivResource).filter_by(id=id).update({
                "name": load_result.name,
                "description": load_result.description
                })
            db.session.commit()
            return ThrivResourceSchema().dump(db.session.query(ThrivResource).filter_by(id=id).first())
        except ValidationError as err:
            raise RestException(RestException.INVALID_RESOURCE,
                                details=load_result.errors)


class ResourceListEndpoint(flask_restful.Resource):

    def get(self):
        schema = ThrivResourceSchema(many=True)
        resources = db.session.query(ThrivResource).all()
        return schema.dump(resources)

    def post(self):
        schema = ThrivResourceSchema()
        request_data = request.get_json()
        try:
            load_result = ThrivResourceSchema().load(request_data).data
            db.session.add(load_result)
            db.session.commit()
            return schema.dump(load_result)
        except ValidationError as err:
            raise RestException(RestException.INVALID_RESOURCE,
                                details=load_result.errors)



