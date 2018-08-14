from app import db
from marshmallow import Schema, fields, post_load


class ThrivType(db.Model):
    __tablename__ = 'type'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    resources = db.relationship('ThrivResource', backref=db.backref('type', lazy=True))
    icon_id = db.Column(db.Integer, db.ForeignKey('icon.id'))
    icon = db.relationship("Icon")
