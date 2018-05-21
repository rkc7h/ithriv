from app import db, ma
from marshmallow import Schema, fields


class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.String)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    icon = db.Column(db.String)
    children = db.relationship("Category",
                               backref=db.backref('parent', remote_side=[id]))


class ParentCategorySchema(Schema):
    """Provides a view of the parent category, all the way to the top, but ignores children"""
    id = fields.Integer()
    name = fields.String()
    parent = fields.Nested('self')
    _links = ma.Hyperlinks({
        'self': ma.URLFor('categoryendpoint', id='<id>'),
        'collection': ma.URLFor('categorylistendpoint')})


class CategorySchema(Schema):
    """Provides detailed information about a category, including all the children"""
    id = fields.Integer()
    name = fields.String()
    description = fields.String()
    children = fields.Nested('self', many=True)
    parent = fields.Nested(ParentCategorySchema)
    _links = ma.Hyperlinks({
        'self': ma.URLFor('categoryendpoint', id='<id>'),
        'collection': ma.URLFor('categorylistendpoint')})
