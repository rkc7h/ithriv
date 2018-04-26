import urllib

import elasticsearch
from flask import jsonify, url_for, request

from app import app, db, ma, elastic_index
from app.model.resource import ThrivResource, ThrivResourceSchema
from app.model.search import Search, Facet, FacetCount, SearchSchema
import flask_restful
from flask_restful import reqparse


api = flask_restful.Api(app)

thriv_resources = {
    'tr1': ThrivResource(id=1, name="SOMRC", description="SOMRC Resource"),
    'tr2': ThrivResource(id=2, name="Concierge", description="Concierge Services"),
    'tr3': ThrivResource(id=3, name="UVA", description="UVA stuffs"),
}

parser = flask_restful.reqparse.RequestParser()
parser.add_argument('resource')

class ResourceEndpoint(flask_restful.Resource):


    def get(self, id):
        resource = db.session.query(ThrivResource).filter(id == id).first()
        return ThrivResourceSchema().dump(resource)
    def delete(self, id):
        del thriv_resources[id]
    def put(self, id):
        args = parser.parse_args()
        resource = args['resource']
        thriv_resources[id] = resource
        return resource

# TodoList
# shows a list of all todos, and lets you POST to add new tasks
class ResourceListEndpoint(flask_restful.Resource):
    def get(self):
        schema = ThrivResourceSchema(many=True)
        resources = db.session.query(ThrivResource).all()
        return schema.dump(resources)

@app.route('/api', methods=['GET'])
def root():
    _links = {"_links":{
        "resources": url_for("resourcelistendpoint"),
    }}
    return jsonify(_links)

@app.route('/api/resource/search', methods=['POST'])
def search_resources():
    request_data = request.get_json()
    search = SearchSchema().load(request_data).data
    try:
        results = elastic_index.search_resources(search)
    except elasticsearch.ElasticsearchException as e:
#        raise RestException(RestException.ELASTIC_ERROR)
        pass
    search.total = results.hits.total

    search.facets = []
    for facet_name in results.facets:
        facet = Facet(facet_name)
        facet.facetCounts = []
        for category, hit_count, is_selected in results.facets[facet_name]:
            facet.facetCounts.append(FacetCount(category, hit_count, is_selected))
        search.facets.append(facet)
    resources = []
    for hit in results:
        resource = ThrivResource.query.filter_by(id=hit.id).first()
        if(resource is not None):
            resources.append(resource)
    search.resources = ThrivResourceSchema().dump(resources, many=True).data
    return SearchSchema().jsonify(search)



api.add_resource(ResourceListEndpoint, '/api/resource')
api.add_resource(ResourceEndpoint, '/api/resource/<id>')