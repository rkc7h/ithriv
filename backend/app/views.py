from flask import jsonify, url_for
from app import app
import flask_restful
from flask_restful import reqparse

from app.resources.IconEndpoint import IconListEndpoint, IconEndpoint
from app.resources.ResourceAndCategoryEndoint import ResourceByCategoryEndpoint, CategoryByResourceEndpoint, \
    ResourceCategoryEndpoint, ResourceCategoryListEndpoint
from app.resources.ResourceEndpoint import ResourceListEndpoint, ResourceEndpoint
from app.resources.CategoryEndoint import CategoryListEndpoint, CategoryEndpoint
from app.resources.AvailabilityEndpoint import AvailabilityEndpoint, AvailabilityListEndpoint, \
    ResourceAvailabilityEndpoint
from app.resources.InstitutionEndpoint import InstitutionEndpoint, InstitutionListEndpoint
from app.resources.SearchEndpoint import SearchEndpoint
from app.resources.TypeEndpoint import TypeEndpoint, TypeListEndpoint

api = flask_restful.Api(app)

parser = flask_restful.reqparse.RequestParser()
parser.add_argument('resource')

@app.route('/api', methods=['GET'])
def root():
    _links = {"_links": {
        "resources": url_for("resourcelistendpoint"),
        "categories": url_for("categorylistendpoint"),
        "institutions": url_for("institutionlistendpoint"),
        "types": url_for("typelistendpoint"),
        "search": url_for("searchendpoint"),
    }}
    return jsonify(_links)


api.add_resource(ResourceListEndpoint, '/api/resource')
api.add_resource(ResourceEndpoint, '/api/resource/<id>')
api.add_resource(CategoryByResourceEndpoint, '/api/resource/<resource_id>/category')
api.add_resource(CategoryListEndpoint, '/api/category')
api.add_resource(CategoryEndpoint, '/api/category/<id>')
api.add_resource(ResourceByCategoryEndpoint, '/api/category/<category_id>/resource')
api.add_resource(InstitutionEndpoint, '/api/institution/<id>')
api.add_resource(InstitutionListEndpoint, '/api/institution')
api.add_resource(TypeEndpoint, '/api/type/<id>')
api.add_resource(TypeListEndpoint, '/api/type')
api.add_resource(SearchEndpoint, '/api/search')
api.add_resource(ResourceCategoryListEndpoint, '/api/resource_category')
api.add_resource(ResourceCategoryEndpoint, '/api/resource_category/<id>')
api.add_resource(AvailabilityListEndpoint, '/api/availability')
api.add_resource(AvailabilityEndpoint, '/api/availability/<id>')
api.add_resource(ResourceAvailabilityEndpoint, '/api/resource/<resource_id>/availability')
api.add_resource(IconListEndpoint, '/api/icon')
api.add_resource(IconEndpoint, '/api/icon/<id>')
