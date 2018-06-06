from app import db


class Category(db.Model):
    ''' Top Level Categories should have an image and color.  Second level categories should
        contain an icon.  Not inforcing this presently, but that is the general style.  '''
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    brief_description = db.Column(db.String)  # Shorter description of the category
    description = db.Column(db.String)  # Complete description of the category
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    color = db.Column(db.String)  # Should be a CSS color specification
    icon = db.Column(db.String) # Should be the url for an SVG icon image that contains little styling
    image = db.Column(db.String)  # Should be the url for a large background image
    children = db.relationship("Category",
                               backref=db.backref('parent', remote_side=[id]))

    def calculate_color(self):
        '''Color is inherited from the parent category if not set explicitly.'''
        color = self.color
        cat = self.parent
        while not self.color and cat:
            color = cat.color
            cat = cat.parent
        return color
