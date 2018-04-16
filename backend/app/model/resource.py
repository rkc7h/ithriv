import datetime

from marshmallow import Schema, post_load, fields
from app import app, db, ma
from app.model.institution import ThrivInstitutionSchema
from app.model.type import ThrivTypeSchema


class ThrivResource(db.Model):
    '''A resource is meta data about a website, database, group, institution or other entity that might prove useful
    to medical research, clinical application, or to educate and empower the community'''
    __tablename__ = 'resource'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    last_updated= db.Column(db.DateTime, default=datetime.datetime.now)
    description = db.Column(db.String)
    type_id = db.Column('type_id', db.Integer(), db.ForeignKey('type.id'))
    institution_id = db.Column('institution_id', db.Integer(), db.ForeignKey('institution.id'))

class ThrivResourceSchema(Schema):

  id = fields.Str()
  name = fields.Str()
  description = fields.Str()
  type = fields.Nested(ThrivTypeSchema())
  institution = fields.Nested(ThrivInstitutionSchema())
  _links = ma.Hyperlinks({
      'self': ma.URLFor('resourceendpoint', id='<id>'),
      'collection': ma.URLFor('resourcelistendpoint')})

  @post_load
  def make_resource(self, data):
    return ThrivResource(**data)