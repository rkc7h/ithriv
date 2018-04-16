from app import db
from marshmallow import Schema, fields

class ThrivType(db.Model):
    __tablename__ = 'type'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    resources = db.relationship('ThrivResource', backref=db.backref('type', lazy=True))

class ThrivTypeSchema(Schema):
    id = fields.Integer()
    name = fields.String()
