import flask_restful
from flask import request

from app import db, RestException
from app.models import Availability
from app.resources.schema import AvailabilitySchema, ThrivResourceSchema


class AvailabilityEndpoint(flask_restful.Resource):
    schema = AvailabilitySchema()

    def get(self, id):
        model = db.session.query(Availability).filter_by(id=id).first()
        if model is None: raise RestException(RestException.NOT_FOUND)
        return self.schema.dump(model)

    def delete(self, id):
        db.session.query(Availability).filter_by(id=id).delete()
        db.session.commit()
        return None


class AvailabilityListEndpoint(flask_restful.Resource):
    schema = AvailabilitySchema()

    def post(self):
        request_data = request.get_json()
        load_result = self.schema.load(request_data).data
        db.session.add(load_result)
        db.session.commit()
        return self.schema.dump(load_result)


class ResourceAvailabilityEndpoint(flask_restful.Resource):
    schema = AvailabilitySchema()

    def get(self, resource_id):
        schema = AvailabilitySchema(many=True)
        availabilities = db.session.query(Availability).filter_by(resource_id=resource_id).all()
        return schema.dump(availabilities)

    def post(self, resource_id):
        request_data = request.get_json()
        availabilities = self.schema.load(request_data, many=True).data
        db.session.query(Availability).filter_by(resource_id=resource_id).delete()
        for a in availabilities:
            db.session.add(a)
        db.session.commit()
        return self.get(resource_id)