from app import db


class Favorite(db.Model):
    __tablename__ = 'favorite'
    id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column(
        'resource_id',
        db.Integer,
        db.ForeignKey('resource.id'),
        nullable=False)
    user_id = db.Column(
        'user_id', db.Integer, db.ForeignKey('ithriv_user.id'), nullable=False)
