from flask import jsonify, url_for
from app import app
import flask_restful
from flask_restful import reqparse

from app.resources.CategoryResource import CategoryListEndpoint, CategoryEndpoint
from app.resources.InstitutionResource import InstitutionEndpoint, InstitutionListEndpoint
from app.resources.SearchResource import SearchEndpoint
from app.resources.ResourceResource import ResourceListEndpoint, ResourceEndpoint
from app.resources.TypeResource import TypeEndpoint, TypeListEndpoint

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
api.add_resource(CategoryListEndpoint, '/api/category')
api.add_resource(CategoryEndpoint, '/api/category/<id>')
api.add_resource(InstitutionEndpoint, '/api/institution/<id>')
api.add_resource(InstitutionListEndpoint, '/api/institution')
api.add_resource(TypeEndpoint, '/api/type/<id>')
api.add_resource(TypeListEndpoint, '/api/type')
api.add_resource(SearchEndpoint, '/api/search')
