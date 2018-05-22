from app import db


class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.String)
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    icon = db.Column(db.String)
    children = db.relationship("Category",
                               backref=db.backref('parent', remote_side=[id]))
