from app import db
from marshmallow import Schema, fields

from app.model.institution import ThrivInstitutionSchema, ThrivInstitution


class Availability(db.Model):
    __tablename__ = 'availability'
    id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column('resource_id', db.Integer(), db.ForeignKey('resource.id'))
    institution_id = db.Column('institution_id', db.Integer(), db.ForeignKey('institution.id'))
    institution = db.relationship(ThrivInstitution)
    viewable = db.Column(db.Boolean())
    available = db.Column(db.Boolean())

class AvailabilitySchema(Schema):
    id = fields.Integer()
    institution = fields.Nested(ThrivInstitutionSchema())
    resource_id = fields.Integer()
    viewable = fields.Boolean()
    available = fields.Boolean()
