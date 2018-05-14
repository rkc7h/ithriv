from flask import logging

from elasticsearch_dsl import DocType, Date, Float, Keyword, Text, \
    Index, Search, analyzer, Nested, Integer, analysis, Q, tokenizer
import elasticsearch_dsl
from elasticsearch_dsl.connections import connections
import logging

class ElasticIndex:

    logger = logging.getLogger("ElasticIndex")

    def __init__(self, app):
        self.logger.debug("Initializing Elastic Index")
        self.establish_connection(app.config['ELASTIC_SEARCH'])
        self.index_prefix = app.config['ELASTIC_SEARCH']["index_prefix"]

        self.resource_index_name = '%s_workshops' % self.index_prefix
        self.resource_index = Index(self.resource_index_name)
        self.resource_index.doc_type(ElasticResource)

        try:
            ElasticResource.init()
        except:
            self.logger.info("Failed to create the index(s).  They may already exist.")


    def establish_connection(self, settings):
        """Establish connection to an ElasticSearch host, and initialize the Submission collection"""
        if(settings["http_auth_user"] != ''):
            self.connection = connections.create_connection(hosts=settings["hosts"],
                                                        port=settings["port"],
                                                        timeout=settings["timeout"],
                                                        verify_certs=settings["verify_certs"],
                                                        use_ssl=settings["use_ssl"],
                                                        http_auth=(settings["http_auth_user"],
                                                                   settings["http_auth_pass"]))
        else:
            # Don't set an http_auth at all for connecting to AWS ElasticSearch or you will
            # get a cryptic message that is darn near ungoogleable.
            self.connection = connections.create_connection(hosts=settings["hosts"],
                                                            port=settings["port"],
                                                            timeout=settings["timeout"],
                                                            verify_certs=settings["verify_certs"],
                                                            use_ssl=settings["use_ssl"])
    def clear(self):
        try:
            self.logger.info("Clearing the index.")
            self.resource_index.delete(ignore=404)
            ElasticResource.init()
        except:
            self.logger.error("Failed to delete the indices.  They night not exist.")

    def remove_resource(self, id):
        ws = ElasticResource.get(id='resource_' + str(id))
        ws.delete()

    def get_resource(self, id):
        return ElasticResource.get(id='resource_' + str(id))

    def add_resource(self, r, flush=True):
        er = ElasticResource(meta={'id': 'workshop_' + str(r.id)},
                             id=r.id,
                             name=r.name,
                             description=r.description,
                             last_updated = r.last_updated,
                             website=r.website,
                             owner=r.owner
                             )

        if (r.institution != None):
            er.institution = r.institution.name

        if (r.type != None):
            er.type = r.type.name

        ElasticResource.save(er)
        if(flush): self.resource_index.flush()

    def load_resources(self, resources):
        print ("Loading resources into %s" % self.index_prefix)
        for r in resources:
            self.add_resource(r, flush=False)
        self.resource_index.flush()

    def search_resources(self, search):
        resource_search = ResourceSearch(search.query, search.jsonFilters(), index=self.resource_index_name)
        resource_search = resource_search[search.start:search.start + search.size]
        return resource_search.execute()

autocomplete = analyzer('autocomplete',
    tokenizer=tokenizer('ngram', 'edge_ngram', min_gram=2, max_gram=15, token_chars=["letter","digit"]),
    filter=['lowercase']
)
autocomplete_search = analyzer('autocomplete_search',
    tokenizer=tokenizer('lowercase')
)

class ElasticResource(DocType):
    id = Integer()
    name = Text(analyzer=autocomplete, search_analyzer=autocomplete_search)
    last_updated = Date()
    description = Text()
    type = Keyword()
    institution = Keyword()
    website = Keyword()
    owner = Text()
    viewable_institution = Keyword(multi=True)

class ResourceSearch(elasticsearch_dsl.FacetedSearch):
    def __init__(self, *args, **kwargs):
        self.index = kwargs["index"]
#        self.date_restriction = kwargs["date_restriction"]
        kwargs.pop("index")
#        kwargs.pop("date_restriction")
        super(ResourceSearch, self).__init__(*args, **kwargs)

    doc_types = [ElasticResource]
    fields = ['name^10', 'description^5', 'type^2', 'institution', 'owner', 'website']

    facets = {
        'type': elasticsearch_dsl.TermsFacet(field='type'),
        'institution': elasticsearch_dsl.TermsFacet(field='institution')
    }

    def search(self):
        ' Override search to add your own filters '
        s = super(ResourceSearch, self).search()
        return s

