from marshmallow_sqlalchemy import ModelSchema

from app import db


class ThrivInstitution(db.Model):
    __tablename__ = 'institution'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.String)
    domain = db.Column(db.String)
    resources = db.relationship(
        'ThrivResource', backref=db.backref('institution', lazy=True))
    hide_availability = db.Column(db.Boolean, default=False)
