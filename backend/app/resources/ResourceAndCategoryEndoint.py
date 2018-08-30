import flask_restful
from flask import request

from app import db, RestException
from app.model.category import Category
from app.model.resource import ThrivResource
from app.model.resource_category import ResourceCategory
from app.resources.schema import CategorySchema, ThrivResourceSchema, ResourceCategorySchema, CategoryResourcesSchema, \
    ResourceCategoriesSchema
from resources.Auth import login_optional


class ResourceByCategoryEndpoint(flask_restful.Resource):

    schema = CategoryResourcesSchema()

    @login_optional
    def get(self, category_id):
        resource_categories = db.session.query(ResourceCategory)\
            .join(ResourceCategory.resource)\
            .filter(ResourceCategory.category_id == category_id)\
            .order_by(ThrivResource.name)\
            .all()
        viewable_resource_categories = []
        for rc in resource_categories:
            if rc.resource.user_may_view():
                    viewable_resource_categories.append(rc)
        return self.schema.dump(viewable_resource_categories, many=True)


class CategoryByResourceEndpoint(flask_restful.Resource):

    schema = ResourceCategoriesSchema()

    def get(self, resource_id):
        resource_categories = db.session.query(ResourceCategory).\
            join(ResourceCategory.category).\
            filter(ResourceCategory.resource_id == resource_id).\
            order_by(Category.name).\
            all()
        return self.schema.dump(resource_categories,many=True)

    def post(self, resource_id):
        request_data = request.get_json()
        resource_categories = self.schema.load(request_data, many=True).data
        db.session.query(ResourceCategory).filter_by(resource_id=resource_id).delete()
        for c in resource_categories:
            db.session.add(ResourceCategory(resource_id=resource_id,
                           category_id=c.category_id))
        db.session.commit()
        return self.get(resource_id)

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
        db.session.query(ResourceCategory).filter_by(resource_id=load_result.resource_id,
                                                     category_id=load_result.category_id).delete()
        db.session.add(load_result)
        db.session.commit()
        return self.schema.dump(load_result)
