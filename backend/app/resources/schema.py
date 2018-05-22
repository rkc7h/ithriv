from flask_marshmallow.sqla import ModelSchema
from marshmallow import fields, post_load
from app import  ma
from app.model.category import Category
from app.model.institution import ThrivInstitution
from app.model.resource import ThrivResource
from app.model.search import Filter, Search
from app.model.type import ThrivType


class ThrivInstitutionSchema(ModelSchema):
    class Meta:
        model = ThrivInstitution
        fields = ('id', 'name', 'description')


class ThrivTypeSchema(ModelSchema):
    class Meta:
        model = ThrivType
        fields = ('id', 'name')


class AvailabilitySchema(ModelSchema):
    class Meta:
        model = ThrivType
        fields = ('id', 'institution_id', 'resource_id', 'viewable', 'available', 'institution')
    institution = fields.Nested(ThrivInstitutionSchema(), dump_only=True, allow_none=True)


class ThrivResourceSchema(ModelSchema):
    class Meta:
        model = ThrivResource
        fields = ('id', 'name', 'description', 'last_updated','owner',
                  'website', 'institution_id', 'type_id', 'type',
                  'institution', 'availabilities', '_links')
    type = fields.Nested(ThrivTypeSchema(), dump_only=True)
    institution = fields.Nested(ThrivInstitutionSchema(), dump_only=True, allow_none=True)
    availabilities = fields.Nested(AvailabilitySchema(), many=True, dump_only=True)
    _links = ma.Hyperlinks({
        'self': ma.URLFor('resourceendpoint', id='<id>'),
        'collection': ma.URLFor('resourcelistendpoint'),
        'institution': ma.UrlFor('institutionendpoint', id='<institution_id>'),
        'type': ma.UrlFor('typeendpoint', id='<type_id>')
        },
        dump_only=True)


class ParentCategorySchema(ModelSchema):
    """Provides a view of the parent category, all the way to the top, but ignores children"""
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'parent', '_links')
    parent = fields.Nested('self', dump_only=True)
    _links = ma.Hyperlinks({
        'self': ma.URLFor('categoryendpoint', id='<id>'),
        'collection': ma.URLFor('categorylistendpoint')})


class CategorySchema(ModelSchema):
    """Provides detailed information about a category, including all the children"""
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'children', 'parent', '_links')
    children = fields.Nested('self', many=True, dump_only=True)
    parent = fields.Nested(ParentCategorySchema, dump_only=True)
    _links = ma.Hyperlinks({
        'self': ma.URLFor('categoryendpoint', id='<id>'),
        'collection': ma.URLFor('categorylistendpoint')})


class SearchSchema(ma.Schema):

    class FilterSchema(ma.Schema):
        field = fields.Str()
        value = fields.Str()

        @post_load
        def make_filter(self, data):
            return Filter(**data)

    class FacetSchema(ma.Schema):

        class FacetCountSchema(ma.Schema):
            category = fields.Str()
            hit_count = fields.Integer()
            is_selected = fields.Boolean()

        field = fields.Str()
        facetCounts = ma.List(ma.Nested(FacetCountSchema))


    query = fields.Str()
    start = fields.Integer()
    size = fields.Integer()
    filters = ma.List(ma.Nested(FilterSchema))
    total = fields.Integer(dump_only=True)
    resources = fields.List(fields.Dict(), dump_only=True)
    facets = ma.List(ma.Nested(FacetSchema), dump_only=True)
    # facets = fields.Dict(dump_only=True)
    ordered = True

    @post_load
    def make_search(self, data):
        return Search(**data)