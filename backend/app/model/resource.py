import datetime
from app.model.availability import Availability
from app import db


class ThrivResource(db.Model):
    '''A resource is meta data about a website, database, group, institution or other entity that might prove useful
    to medical research, clinical application, or to educate and empower the community'''
    __tablename__ = 'resource'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    last_updated = db.Column(db.DateTime, default=datetime.datetime.now)
    description = db.Column(db.String)
    owner = db.Column(db.String)
    contact_email = db.Column(db.String)
    contact_phone = db.Column(db.String)
    contact_notes = db.Column(db.String)
    website = db.Column(db.String)
    cost = db.Column(db.String)
    type_id = db.Column('type_id', db.Integer(), db.ForeignKey('type.id'))
    institution_id = db.Column('institution_id', db.Integer(), db.ForeignKey('institution.id'))
    availabilities = db.relationship(lambda: Availability,  cascade="all, delete-orphan",
                                     backref=db.backref('resource', lazy=True))
    approved = db.Column(db.Boolean, default=False)


