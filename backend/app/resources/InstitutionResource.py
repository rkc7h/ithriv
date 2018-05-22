import flask_restful
from flask import request
from marshmallow import ValidationError

from app import RestException, db
from app.model.institution import ThrivInstitution
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
        try:
            load_result = ThrivInstitutionSchema().load(request_data)
            db.session.query(ThrivInstitution).filter_by(id=id).update({
                "name": load_result.data.name,
                "description": load_result.data.description
                })
            db.session.commit()
            return self.schema.dump(db.session.query(ThrivInstitution).filter_by(id=id).first())
        except ValidationError as err:
            raise RestException(RestException.INVALID_OBJECT,
                                details=load_result.errors)


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