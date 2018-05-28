import flask_restful
from flask import request
from marshmallow import ValidationError

from app import db, RestException
from app.model.category import Category
from app.resources.schema import CategorySchema


class CategoryEndpoint(flask_restful.Resource):
    schema = CategorySchema()

    def get(self, id):
        category = db.session.query(Category).filter(Category.id == id).first()
        return self.schema.dump(category)

    def delete(self, id):
        category = db.session.query(Category).filter(Category.id == id).first()
        db.session.delete(category)
        return self.schema.dump(category)

    def put(self, id):
        request_data = request.get_json()
        instance = db.session.query(Category).filter_by(id=id).first()
        updated, errors = self.schema.load(request_data, instance=instance)
        if errors: raise RestException(RestException.INVALID_OBJECT, details=errors)
        db.session.add(updated)
        db.session.commit()
        return self.schema.dump(updated)


class CategoryListEndpoint(flask_restful.Resource):
    category_schema = CategorySchema()
    categories_schema = CategorySchema(many=True)

    def get(self):
        categories = db.session.query(Category).filter(Category.parent_id == None).all()
        return self.categories_schema.dump(categories)

    def post(self):
        request_data = request.get_json()
        try:
            load_result = self.category_schema.load(request_data).data
            db.session.add(load_result)
            db.session.commit()
            return self.category_schema.dump(load_result)
        except ValidationError as err:
            raise RestException(RestException.INVALID_RESOURCE,
                                details=load_result.errors)
