from app import db

from app.model.user import User
from app.model.resource import ThrivResource


class Favorite(db.Model):
    __tablename__ = 'favorite'
    id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column(db.Integer, db.ForeignKey(ThrivResource.id), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    resource = db.relationship(ThrivResource)
    user = db.relationship(User)
