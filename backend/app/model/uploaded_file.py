from app import db
from app.model.resource import ThrivResource


class UploadedFile(db.Model):
    __tablename__ = 'uploaded_file'
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String)
    display_name = db.Column(db.String)
    date_modified = db.Column(db.DateTime)
    mime_type = db.Column(db.String)
    size = db.Column(db.Integer)
    md5 = db.Column(db.String)
    url = db.Column(db.String)
    resource_id = db.Column(db.Integer, db.ForeignKey(ThrivResource.id), nullable=True)
    resource = db.relationship(ThrivResource)