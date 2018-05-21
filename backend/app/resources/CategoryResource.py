import flask_restful

from app import db
from app.model.category import CategorySchema, Category


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
        pass


class CategoryListEndpoint(flask_restful.Resource):

    def get(self):
        schema = CategorySchema(many=True)
        categories = db.session.query(Category).filter(Category.parent_id == None).all()
        return schema.dump(categories)