from app import db

from app.model.institution import ThrivInstitution


class Availability(db.Model):
    __tablename__ = 'availability'
    id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column('resource_id', db.Integer(), db.ForeignKey('resource.id'))
    institution_id = db.Column('institution_id', db.Integer(), db.ForeignKey('institution.id'))
    institution = db.relationship(ThrivInstitution)
    viewable = db.Column(db.Boolean())
    available = db.Column(db.Boolean())
