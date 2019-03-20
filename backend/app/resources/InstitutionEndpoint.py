import flask_restful
from flask import request
from marshmallow import ValidationError

from app import RestException, db
from app.models import ThrivInstitution
from app.resources.schema import ThrivInstitutionSchema


class InstitutionEndpoint(flask_restful.Resource):

    schema = ThrivInstitutionSchema()

    def get(self, id):
        model = db.session.query(ThrivInstitution).filter_by(id=id).first()
        if model is None: raise RestException(RestException.NOT_FOUND)
        return self.schema.dump(model)

    def delete(self, id):
        db.session.query(ThrivInstitution).filter_by(id=id).delete()
        db.session.commit()
        return None

    def put(self, id):
        request_data = request.get_json()
        instance = db.session.query(ThrivInstitution).filter_by(id=id).first()
        updated, errors = self.schema.load(request_data, instance=instance)
        if errors: raise RestException(RestException.INVALID_OBJECT, details=errors)
        db.session.add(updated)
        db.session.commit()
        return self.schema.dump(updated)


class InstitutionListEndpoint(flask_restful.Resource):

    def get(self):
        schema = ThrivInstitutionSchema(many=True)
        institutions = db.session.query(ThrivInstitution).all()
        return schema.dump(institutions)

    def post(self):
        schema = ThrivInstitutionSchema()
        request_data = request.get_json()
        try:
            load_result = schema.load(request_data).data
            db.session.add(load_result)
            db.session.commit()
            return schema.dump(load_result)
        except ValidationError as err:
            raise RestException(RestException.INVALID_OBJECT,
                                details=load_result.errors)


class InstitutionAvailabilityListEndpoint(flask_restful.Resource):

    def get(self):
        schema = ThrivInstitutionSchema(many=True)
        institutions = db.session.query(ThrivInstitution).filter(ThrivInstitution.hide_availability != True).all()
        return schema.dump(institutions)
