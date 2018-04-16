from marshmallow import fields
from marshmallow import post_load

from app import ma


class Search():
    query = ""
    filters = []
    total = 0
    resources = []
    facets = []
    start = 0
    size = 0

    def __init__(self, query="", filters=[],start=0, size=10):
        self.query = query
        self.filters = filters
        self.start = start
        self.size = size

    def jsonFilters(self):
        jfilter = {}
        for f in self.filters:
            jfilter[f.field] = f.value

        return jfilter

class Facet():
    name = ""
    count = 0
    is_selected = False

class Filter():
    field = ""
    value = ""

    def __init__(self, field, value):
        self.field = field
        self.value = value


class SearchSchema(ma.Schema):

    class FilterSchema(ma.Schema):
        field = fields.Str()
        value = fields.Str()

        @post_load
        def make_filter(self, data):
            return Filter(**data)

    query = fields.Str()
    start = fields.Integer()
    size = fields.Integer()
    filters = ma.List(ma.Nested(FilterSchema))
    total = fields.Integer(dump_only=True)
    resources = fields.List(fields.Dict(), dump_only=True)
    facets = fields.Dict(dump_only=True)
    ordered = True

    @post_load
    def make_search(self, data):
        return Search(**data)