import elasticsearch
import flask_restful
from flask import request, g

from app import elastic_index, RestException
from app.model.resource import ThrivResource
from app.model.search import Facet, FacetCount, Filter
from app.resources.schema import SearchSchema, ThrivResourceSchema
from app.resources.Auth import login_optional


class SearchEndpoint(flask_restful.Resource):
    @login_optional
    def post(self):
        request_data = request.get_json()
        search, errors = SearchSchema().load(request_data)

        if errors:
            raise RestException(RestException.INVALID_OBJECT, details=errors)
        try:
            if 'user' not in g or not g.user or g.user.role != "Admin":
                search.filters.append(
                    Filter(field="Approved", value="Approved"))
                results = elastic_index.search_resources(search)
                search.filters = search.filters[:-1]
            else:
                results = elastic_index.search_resources(search)
        except elasticsearch.ElasticsearchException as e:
            raise RestException(RestException.ELASTIC_ERROR)

        search.total = results.hits.total

        search.facets = []
        for facet_name in results.facets:
            if facet_name == "Approved":
                if 'user' in g and g.user and g.user.role == "Admin":
                    facet = Facet(facet_name)
                    facet.facetCounts = []
                    for category, hit_count, is_selected in results.facets[
                            facet_name]:
                        facet.facetCounts.append(
                            FacetCount(category, hit_count, is_selected))
                    search.facets.append(facet)
            else:
                facet = Facet(facet_name)
                facet.facetCounts = []
                for category, hit_count, is_selected in results.facets[
                        facet_name]:
                    facet.facetCounts.append(
                        FacetCount(category, hit_count, is_selected))
                search.facets.append(facet)

        resources = []
        for hit in results:
            resource = ThrivResource.query.filter_by(id=hit.id).first()
            if resource is not None and resource.user_may_view:
                resources.append(resource)
        search.resources = ThrivResourceSchema().dump(
            resources, many=True).data
        return SearchSchema().jsonify(search)
