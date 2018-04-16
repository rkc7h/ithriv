import unittest
from app.model.resource import ThrivResource
from app.model.type import ThrivType
from app.model.institution import ThrivInstitution

from app import app, db, elastic_index
import os
import json

# Set enivoronment variable to testing before loading.
os.environ["APP_CONFIG_FILE"] = '../config/testing.py'

class TestCase(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        db.create_all()
        self.ctx = app.test_request_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()
        db.drop_all()
        elastic_index.clear()
        pass

    def assertSuccess(self, rv):
        self.assertTrue(rv.status_code >= 200 and rv.status_code < 300,
                        "BAD Response:" + rv.status + ".")

    def test_base_endpoint(self):
        rv = self.app.get('/api',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertTrue("_links" in response)

    def construct_resource(self, type="TestyType", institution="TestyU",
                           name="Test Resource", description="Some stuff bout it"):
        type_obj = ThrivType(name=type)
        inst_obj = ThrivInstitution(name=institution)
        resource = ThrivResource(name=name, description=description,
                                 type=type_obj, institution=inst_obj)
        db.session.add(resource)
        db.session.commit()
        return resource

    def index_resource(self, resource):
        elastic_index.add_resource(resource)

    def test_resource_basics(self):
        self.construct_resource()
        rv = self.app.get('/api/resource/1',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["id"], '1')
        self.assertEqual(response["name"], 'Test Resource')
        self.assertEqual(response["description"], 'Some stuff bout it')

    def test_resource_has_type(self):
        self.construct_resource()
        rv = self.app.get('/api/resource/1',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["type"]["name"], 'TestyType')

    def test_resource_has_institution(self):
        self.construct_resource()
        rv = self.app.get('/api/resource/1',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["institution"]["name"], 'TestyU')

    def test_resource_has_links(self):
        self.construct_resource()
        rv = self.app.get('/api/resource/1',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["_links"]["self"], '/api/resource/1')
        self.assertEqual(response["_links"]["collection"], '/api/resource')

    def search(self, query):
        '''Executes a query, returning the resulting search results object.'''
        rv = self.app.post('/api/resource/search', data=json.dumps(query), follow_redirects=True,
                           content_type="application/json")
        self.assertSuccess(rv)
        return json.loads(rv.get_data(as_text=True))

    def test_search_resource_by_name(self):
        resource = self.construct_resource(name="space kittens")
        self.index_resource(resource)
        data = {'query': 'kittens', 'filters': []}
        search_results = self.search(data)
        self.assertEqual(len(search_results["resources"]), 1)

    def test_search_resource_by_description(self):
        resource = self.construct_resource(name="space kittens", description="Flight of the fur puff")
        self.index_resource(resource)
        data = {'query': 'fur puff', 'filters': []}
        search_results = self.search(data)
        self.assertEqual(len(search_results["resources"]), 1)

    def test_search_filters(self):
        resource = self.construct_resource(type="hgttg", description="There is a theory which states that if ever anyone discovers exactly what the Universe is for and why it is here, it will instantly disappear and be replaced by something even more bizarre and inexplicable. There is another theory which states that this has already happened.")
        self.index_resource(resource)
        data = {'query': '', 'filters': [{'field': 'type', 'value': 'hgttg'}]}
        search_results = self.search(data)
        self.assertEqual(len(search_results["resources"]), 1)

    def test_search_facet_counts(self):
        resource = self.construct_resource(type="hgttg", description="There is a theory which states that if ever anyone discovers exactly what the Universe is for and why it is here, it will instantly disappear and be replaced by something even more bizarre and inexplicable. There is another theory which states that this has already happened.")
        resource2 = self.construct_resource(type="brazil", description="Information Transit got the wrong man. I got the *right* man. The wrong one was delivered to me as the right man, I accepted him on good faith as the right man. Was I wrong?")
        self.index_resource(resource)
        self.index_resource(resource2)
        data = {'query': ''}
        search_results = self.search(data)
        self.assertEqual(len(search_results["resources"]), 2)
        self.assertTrue("facets" in search_results)
        self.assertTrue("type" in search_results["facets"])
        self.assertTrue("type" in search_results["facets"])
