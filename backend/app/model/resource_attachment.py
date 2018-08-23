from app import db


class ResourceAttachment(db.Model):
    __tablename__ = 'resource_attachment'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    url = db.Column(db.String)
    resource_id = db.Column('resource_id', db.Integer(), db.ForeignKey('resource.id'))