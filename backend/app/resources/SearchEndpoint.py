import elasticsearch
import flask_restful
from flask import request

from app import elastic_index, RestException
from app.model.resource import ThrivResource
from app.model.search import Facet, FacetCount
from app.resources.schema import SearchSchema, ThrivResourceSchema


class SearchEndpoint(flask_restful.Resource):

    def post(self):
        request_data = request.get_json()
        search, errors = SearchSchema().load(request_data)
        if errors: raise RestException(RestException.INVALID_OBJECT, details=errors)
        try:
            results = elastic_index.search_resources(search)
        except elasticsearch.ElasticsearchException as e:
            raise RestException(RestException.ELASTIC_ERROR)

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
            if resource is not None:
                resources.append(resource)
        search.resources = ThrivResourceSchema().dump(resources, many=True).data
        return SearchSchema().jsonify(search)
