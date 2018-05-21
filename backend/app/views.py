import urllib

import elasticsearch
from flask import jsonify, url_for, request
from marshmallow import ValidationError

from app import app, db, ma, elastic_index
from app.model.category import Category, CategorySchema
from app.model.resource import ThrivResource, ThrivResourceSchema
from app.model.search import Search, Facet, FacetCount, SearchSchema
import flask_restful
from flask_restful import reqparse

from app.rest_exception import RestException

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
        resource = db.session.query(ThrivResource).filter(ThrivResource.id == id).first()
        if resource is None: raise RestException(RestException.NOT_FOUND)
        return ThrivResourceSchema().dump(resource)

    def delete(self, id):
        db.session.query(ThrivResource).filter_by(id=id).delete()
        db.session.commit()
        return None

    def put(self, id):
        request_data = request.get_json()
        request_data["availabilities"] = []
        try:
            load_result = ThrivResourceSchema().load(request_data)
            db.session.query(ThrivResource).filter_by(id=id).update({
                "name": load_result.data.namense,
                "description": load_result.data.description
                })
            db.session.commit()
            return ThrivResourceSchema().dump(db.session.query(ThrivResource).filter_by(id=id).first())
        except ValidationError as err:
            raise RestException(RestException.INVALID_RESOURCE,
                                details=load_result.errors)


class ResourceListEndpoint(flask_restful.Resource):

    def get(self):
        schema = ThrivResourceSchema(many=True)
        resources = db.session.query(ThrivResource).all()
        return schema.dump(resources)

    def post(self):
        schema = ThrivResourceSchema()
        request_data = request.get_json()
        try:
            load_result = ThrivResourceSchema().load(request_data).data
            db.session.add(load_result)
            db.session.commit()
            return schema.dump(load_result)
        except ValidationError as err:
            raise RestException(RestException.INVALID_RESOURCE,
                                details=load_result.errors)


class CategoryEndpoint(flask_restful.Resource):
    schema = CategorySchema()

    def get(self, id):
        category = db.session.query(Category).filter(Category.id == id).first()
        return self.schema.dump(category)

    def delete(self, id):
        category = db.session.query(Category).filter(Category.id == id).first()
        db.session.delete(category)
        return self.schema.dump(category)

    def put(self, id):
        args = parser.parse_args()
        category = Category(args['category'])
        db.session.add(category)


class CategoryListEndpoint(flask_restful.Resource):

    def get(self):
        schema = CategorySchema(many=True)
        categories = db.session.query(Category).filter(Category.parent_id == None).all()
        return schema.dump(categories)


@app.route('/api', methods=['GET'])
def root():
    _links = {"_links":{
        "resources": url_for("resourcelistendpoint"),
        "categories": url_for("categorylistendpoint"),
    }}
    return jsonify(_links)


@app.route('/api/resource/search', methods=['POST'])
def search_resources():
    request_data = request.get_json()
    search = SearchSchema().load(request_data).data
    try:
        results = elastic_index.search_resources(search)
    except elasticsearch.ElasticsearchException as e:
        raise e
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
api.add_resource(CategoryListEndpoint, '/api/category')
api.add_resource(CategoryEndpoint, '/api/category/<id>')

