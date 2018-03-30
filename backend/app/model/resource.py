import datetime

from marshmallow import Schema, post_load, fields
from app import app, db

class ThrivResource(db.Model):
    '''A resource is meta data about a website, database, group, institution or other entity that might prove useful
    to medical research, clinical application, or to educate and empower the community'''
    __tablename__ = 'resource'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    last_updated= db.Column(db.DateTime, default=datetime.datetime.now)
    description = db.Column(db.String)
    # Need to add connections to groups, institutions and types that are likely separate entities


class ThrivResourceSchema(Schema):

  id = fields.Str()
  name = fields.Str()
  description = fields.Str()

  @post_load
  def make_resource(self, data):
    return ThrivResource(**data)