import flask_restful
from flask import request
from marshmallow import ValidationError

from app import RestException, db
from app.models import ThrivType
from app.resources.schema import ThrivTypeSchema


class TypeEndpoint(flask_restful.Resource):

    schema = ThrivTypeSchema()

    def get(self, id):
        model = db.session.query(ThrivType).filter_by(id=id).first()
        if model is None: raise RestException(RestException.NOT_FOUND)
        return self.schema.dump(model)

    def delete(self, id):
        db.session.query(ThrivType).filter_by(id=id).delete()
        db.session.commit()
        return None

    def put(self, id):
        request_data = request.get_json()
        instance = db.session.query(ThrivType).filter_by(id=id).first()
        updated, errors = self.schema.load(request_data, instance=instance)
        if errors: raise RestException(RestException.INVALID_OBJECT, details=errors)
        db.session.add(updated)
        db.session.commit()
        return self.schema.dump(updated)


class TypeListEndpoint(flask_restful.Resource):

    typesSchema = ThrivTypeSchema(many=True)
    typeSchema = ThrivTypeSchema()

    def get(self):
        types = db.session.query(ThrivType).all()
        return self.typesSchema.dump(types)

    def post(self):
        request_data = request.get_json()
        try:
            load_result = self.typeSchema.load(request_data).data
            db.session.add(load_result)
            db.session.commit()
            return self.typeSchema.dump(load_result)
        except ValidationError as err:
            raise RestException(RestException.INVALID_OBJECT,
                                details=load_result.errors)