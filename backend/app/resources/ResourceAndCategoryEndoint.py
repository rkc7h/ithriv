import flask_restful
from flask import request

from app import db, RestException
from app.model.resource_category import ResourceCategory
from app.resources.schema import CategorySchema, ThrivResourceSchema, ResourceCategorySchema, CategoryResourcesSchema, \
    ResourceCategoriesSchema


class ResourceByCategoryEndpoint(flask_restful.Resource):

    schema = CategoryResourcesSchema()

    def get(self, category_id):
        resource_categories = db.session.query(ResourceCategory).filter(ResourceCategory.category_id == category_id).all()
        return self.schema.dump(resource_categories,many=True)


class CategoryByResourceEndpoint(flask_restful.Resource):

    schema = ResourceCategoriesSchema()

    def get(self, resource_id):
        resource_categories = db.session.query(ResourceCategory).filter(ResourceCategory.resource_id == resource_id).all()
        return self.schema.dump(resource_categories,many=True)


class ResourceCategoryEndpoint(flask_restful.Resource):
    schema = ResourceCategorySchema()

    def get(self, id):
        model = db.session.query(ResourceCategory).filter_by(id=id).first()
        if model is None: raise RestException(RestException.NOT_FOUND)
        return self.schema.dump(model)

    def delete(self, id):
        db.session.query(ResourceCategory).filter_by(id=id).delete()
        db.session.commit()
        return None

class ResourceCategoryListEndpoint(flask_restful.Resource):
    schema = ResourceCategorySchema()

    def post(self):
        request_data = request.get_json()
        load_result = self.schema.load(request_data).data
        db.session.add(load_result)
        db.session.commit()
        return self.schema.dump(load_result)
