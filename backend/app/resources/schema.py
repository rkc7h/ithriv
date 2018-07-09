from flask_marshmallow.sqla import ModelSchema
from marshmallow import fields, post_load
from app import ma
from app.model.category import Category
from app.model.icon import Icon
from app.model.institution import ThrivInstitution
from app.model.resource import ThrivResource
from app.model.resource_category import ResourceCategory
from app.model.search import Filter, Search
from app.model.type import ThrivType
from app.model.user import User


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
        fields = ('id', 'name', 'description', 'last_updated', 'owner',
                  'website', 'institution_id', 'type_id', 'type',
                  'institution', 'availabilities', 'approved',
                  'contact_email', 'contact_phone', 'contact_notes',
                  '_links')
    id = fields.Integer(required=False, allow_none=True)
    last_updated = fields.Date(required=False, allow_none=True)
    owner = fields.String(required=False, allow_none=True)
    contact_email = fields.String(required=False, allow_none=True)
    contact_phone = fields.String(required=False, allow_none=True)
    contact_notes = fields.String(required=False, allow_none=True)
    website = fields.String(required=False, allow_none=True)
    institution_id = fields.Integer(required=False, allow_none=True)
    type_id = fields.Integer(required=False, allow_none=True)

    type = fields.Nested(ThrivTypeSchema(), dump_only=True)
    institution = fields.Nested(ThrivInstitutionSchema(), dump_only=True, allow_none=True)
    availabilities = fields.Nested(AvailabilitySchema(), many=True, dump_only=True)
    _links = ma.Hyperlinks({
        'self': ma.URLFor('resourceendpoint', id='<id>'),
        'collection': ma.URLFor('resourcelistendpoint'),
        'institution': ma.UrlFor('institutionendpoint', id='<institution_id>'),
        'type': ma.UrlFor('typeendpoint', id='<type_id>'),
        'categories': ma.UrlFor('categorybyresourceendpoint', resource_id='<id>'),
    },
        dump_only=True)


class ParentCategorySchema(ModelSchema):
    """Provides a view of the parent category, all the way to the top, but ignores children"""
    class Meta:
        model = Category
        fields = ('id', 'name', 'parent', 'level', '_links')
    parent = fields.Nested('self', dump_only=True)
    level = fields.Function(lambda obj: obj.calculate_level())
    _links = ma.Hyperlinks({
        'self': ma.URLFor('categoryendpoint', id='<id>'),
        'collection': ma.URLFor('categorylistendpoint'),
        'resources': ma.URLFor('resourcebycategoryendpoint', category_id='<id>')
    })


class IconSchema(ModelSchema):
    class Meta:
        model = Icon
        fields = ('id', 'name', 'url')


class CategorySchema(ModelSchema):
    """Provides detailed information about a category, including all the children"""
    class Meta:
        model = Category
        fields = ('id', 'name', 'brief_description', 'description',
                  'color', 'level', 'image', 'icon_id', 'icon',
                  'children', 'parent_id', 'parent', '_links')
    id = fields.Integer(required=False, allow_none=True)
    icon_id = fields.Integer(required=False, allow_none=True)
    icon = fields.Nested(IconSchema,  allow_none=True, dump_only=True)
    image = fields.String(required=False, allow_none=True)
    parent_id = fields.Integer(required=False, allow_none=True)
    children = fields.Nested('self', many=True, dump_only=True)
    parent = fields.Nested(ParentCategorySchema, dump_only=True)
    color = fields.Function(lambda obj: obj.calculate_color())
    level = fields.Function(lambda obj: obj.calculate_level())
    _links = ma.Hyperlinks({
        'self': ma.URLFor('categoryendpoint', id='<id>'),
        'collection': ma.URLFor('categorylistendpoint'),
        'resources': ma.URLFor('resourcebycategoryendpoint', category_id='<id>')
    })


class ResourceCategoriesSchema(ModelSchema):
    class Meta:
        model = ResourceCategory
        fields = ('id', '_links', 'category')
    category = fields.Nested(CategorySchema, dump_only=True)
    _links = ma.Hyperlinks({
        'self': ma.URLFor('resourcecategoryendpoint', id='<id>'),
        'category': ma.URLFor('categoryendpoint', id='<category_id>'),
        'resource': ma.URLFor('resourceendpoint', id='<resource_id>')
    })


class CategoryResourcesSchema(ModelSchema):
    class Meta:
        model = ResourceCategory
        fields = ('id', '_links', 'resource')
    resource = fields.Nested(ThrivResourceSchema, dump_only=True)
    _links = ma.Hyperlinks({
        'self': ma.URLFor('resourcecategoryendpoint', id='<id>'),
        'category': ma.URLFor('categoryendpoint', id='<category_id>'),
        'resource': ma.URLFor('resourceendpoint', id='<resource_id>')
    })


class ResourceCategorySchema(ModelSchema):
    class Meta:
        model = ResourceCategory
        fields = ('id', '_links', 'resource_id', 'category_id')
    _links = ma.Hyperlinks({
        'self': ma.URLFor('resourcecategoryendpoint', id='<id>'),
        'category': ma.URLFor('categoryendpoint', id='<category_id>'),
        'resource': ma.URLFor('resourceendpoint', id='<resource_id>')
    })


class SearchSchema(ma.Schema):

    class FilterSchema(ma.Schema):
        field = fields.Str()
        value = fields.Raw()

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


class UserSchema(ModelSchema):
    class Meta:
        model = User
        fields = ('id', 'uid', 'display_name', 'email_address')

