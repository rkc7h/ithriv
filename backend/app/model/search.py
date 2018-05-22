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
    field = ""
    facetCounts = []

    def __init__(self, field):
        self.field = field


class FacetCount():

    def __init__(self, category, hit_count, is_selected):
        self.category = category
        self.hit_count = hit_count
        self.is_selected = is_selected

class Filter():
    field = ""
    value = ""

    def __init__(self, field, value):
        self.field = field
        self.value = value
