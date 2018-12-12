from app import db
from marshmallow import Schema, fields, post_load


class Icon(db.Model):
    __tablename__ = 'icon'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    url = db.Column(db.String)
