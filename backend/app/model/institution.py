from app import db
from marshmallow import Schema, fields

class ThrivInstitution(db.Model):
    __tablename__ = 'institution'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.String)
    resources = db.relationship('ThrivResource', backref=db.backref('institution', lazy=True))

class ThrivInstitutionSchema(Schema):
    id = fields.Integer()
    name = fields.String()

