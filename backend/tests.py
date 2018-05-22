# Set enivoronment variable to testing before loading.
import os
os.environ["APP_CONFIG_FILE"] = '../config/testing.py'

import unittest
import json
from app.model.availability import Availability
from app.model.category import Category
from app.model.resource import ThrivResource
from app.model.type import ThrivType
from app.model.institution import ThrivInstitution

from app import app, db, elastic_index


class TestCase(unittest.TestCase):

    def setUp(self):
        self.ctx = app.test_request_context()
        self.app = app.test_client()
        db.create_all()
        self.ctx.push()

    def tearDown(self):
        db.session.commit()
        db.session.close()
        db.drop_all()
        elastic_index.clear()
        self.ctx.pop()

    def assertSuccess(self, rv):
        data = json.loads(rv.get_data(as_text=True))
        self.assertTrue(rv.status_code >= 200 and rv.status_code < 300,
                        "BAD Response: %i. \n %s" %
                        (rv.status_code, json.dumps(data)))

    def test_base_endpoint(self):
        rv = self.app.get('/api',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertTrue("_links" in response)
        self.assertTrue("categories" in response['_links'])
        self.assertTrue("resources" in response['_links'])


    def construct_resource(self, type="TestyType", institution="TestyU",
                           name="Test Resource", description="Some stuff bout it",
                           owner="Mac Daddy Test", website="testy.edu", available_to=None):
        type_obj = ThrivType(name=type)
        inst_obj = ThrivInstitution(name=institution)
        resource = ThrivResource(name=name, description=description,
                                 type=type_obj, institution=inst_obj,
                                 owner=owner, website=website)
        db.session.add(resource)

        if available_to is not None:
            institution = ThrivInstitution(name=available_to)
            db.session.add(institution)
            availability = Availability(resource=resource, institution=institution,
                                        available=True)
            db.session.add(availability)
        db.session.commit()
        return resource

    def construct_category(self, name="Test Category", description="A category to test with!", parent=None):
        category = Category(name=name, description=description)
        if parent is not None:
            category.parent = parent
        db.session.add(category)
        return category

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

    def test_modify_resource_basics(self):
        self.construct_resource()
        rv = self.app.get('/api/resource/1', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['name'] = 'Edwarardos Lemonade and Oil Change'
        response['description'] = 'Better fluids for you and your car.'
        rv = self.app.put('/api/resource/1', data=json.dumps(response), content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['name'], 'Edwarardos Lemonade and Oil Change')
        self.assertEqual(response['description'], 'Better fluids for you and your car.')

    def test_delete_resource(self):
        r = self.construct_resource()
        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)

        rv = self.app.delete('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)

        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertEqual(404, rv.status_code)

    def test_create_resource(self):
        resource = {'name':"Barbarella's Funky Gun", 'description':"A thing. In a movie, or something."}
        rv = self.app.post('/api/resource', data=json.dumps(resource), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['name'], 'Barbarella\'s Funky Gun')
        self.assertEqual(response['description'], 'A thing. In a movie, or something.')
        self.assertEqual(response['id'], '1')

    def test_category_basics(self):
        category = self.construct_category()
        rv = self.app.get('/api/category/1',
                           follow_redirects=True,
                           content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["id"], 1)
        self.assertEqual(response["name"], 'Test Category')
        self.assertEqual(response["description"], 'A category to test with!')

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

    def test_resource_has_website(self):
        self.construct_resource(website='testy.edu')
        rv = self.app.get('/api/resource/1',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["website"], 'testy.edu')

    def test_resource_has_owner(self):
        self.construct_resource(owner="Mac Daddy Test")
        rv = self.app.get('/api/resource/1',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["owner"], 'Mac Daddy Test')

    def test_resource_has_availability(self):
        self.construct_resource(owner="Mac Daddy Test", available_to="UVA")
        rv = self.app.get('/api/resource/1',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertIsNotNone(response["availabilities"])
        self.assertIsNotNone(response["availabilities"][0])
        self.assertEqual(True, response["availabilities"][0]["available"])
        self.assertEqual("UVA", response["availabilities"][0]["institution"]["name"])
        print(str(response['availabilities']))

    def test_resource_has_links(self):
        self.construct_resource()
        rv = self.app.get('/api/resource/1',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["_links"]["self"], '/api/resource/1')
        self.assertEqual(response["_links"]["collection"], '/api/resource')



    def test_category_has_links(self):
        self.construct_category()
        rv = self.app.get('/api/category/1',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["_links"]["self"], '/api/category/1')
        self.assertEqual(response["_links"]["collection"], '/api/category')

    def test_category_has_children(self):
        c1 = self.construct_category()
        c2 = self.construct_category(name="I'm the kid", description="A Child Category", parent=c1)
        rv = self.app.get('/api/category/1',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["children"][0]['id'], 2)
        self.assertEqual(response["children"][0]['name'], "I'm the kid")

    def test_category_has_parents_and_that_parent_has_no_children(self):
        c1 = self.construct_category()
        c2 = self.construct_category(name="I'm the kid", description="A Child Category", parent=c1)
        c3 = self.construct_category(name="I'm the grand kid", description="A Child Category", parent=c2)
        rv = self.app.get('/api/category/3',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["parent"]['id'], 2)
        self.assertNotIn("children", response["parent"])


    def test_category_depth_is_limited(self):
        c1 = self.construct_category()
        c2 = self.construct_category(name="I'm the kid", description="A Child Category", parent=c1)
        c3 = self.construct_category(name="I'm the grand kid", description="A Child Category", parent=c2)
        c4 = self.construct_category(name="I'm the great grand kid", description="A Child Category", parent=c3)

        rv = self.app.get('/api/category',
                          follow_redirects=True,
                          content_type="application/json")

        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))

        self.assertEqual(1, len(response))
        self.assertEqual(1, len(response[0]["children"]))


    def search(self, query):
        '''Executes a query, returning the resulting search results object.'''
        rv = self.app.post('/api/search', data=json.dumps(query), follow_redirects=True,
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

    def test_search_resource_by_website(self):
        resource = self.construct_resource(website="www.stuff.edu")
        self.index_resource(resource)
        data = {'query': 'www.stuff.edu', 'filters': []}
        search_results = self.search(data)
        self.assertEqual(len(search_results["resources"]), 1)

    def test_search_resource_by_owner(self):
        resource = self.construct_resource(owner="Mr. McDoodle Pants")
        self.index_resource(resource)
        data = {'query': 'McDoodle', 'filters': []}
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
        self.assertEqual(2, len(search_results["facets"]))
        self.assertTrue("facetCounts" in search_results["facets"][0])
        self.assertTrue("category" in search_results["facets"][0]["facetCounts"][0])
        self.assertTrue("hit_count" in search_results["facets"][0]["facetCounts"][0])
        self.assertTrue("is_selected" in search_results["facets"][0]["facetCounts"][0])

    def test_create_institution(self):
        institution = {"name":"Ender's Academy for wayward space boys", "description":"A school, in outerspace, with weightless games"}
        rv = self.app.post('/api/institution', data=json.dumps(institution), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['name'], 'Ender\'s Academy for wayward space boys')
        self.assertEqual(response['description'], 'A school, in outerspace, with weightless games')
        self.assertEqual(response['id'], 1)
        self.assertIsNotNone(db.session.query(ThrivInstitution).filter_by(id=1).first())

    def test_list_instititions(self):
        i1 = ThrivInstitution(name="Delmar's", description="autobody")
        i2 = ThrivInstitution(name="News Leader", description="A once formidablele news source")
        db.session.add(i1)
        db.session.add(i2)
        db.session.commit()
        rv = self.app.get('/api/institution', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(2, len(response))

    def test_delete_institution(self):
        institution = {"name": "Ender's Academy for wayward space boys",
                       "description": "A school, in outerspace, with weightless games"}
        rv = self.app.post('/api/institution', data=json.dumps(institution), content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        rv = self.app.delete('/api/institution/%i' % response['id'])
        self.assertSuccess(rv)
        self.assertEquals(0, db.session.query(ThrivInstitution).filter_by(id=1).count())

    def test_modify_institution(self):
        institution = {"name": "Ender's Academy for wayward space boys",
                       "description": "A school, in outerspace, with weightless games"}
        rv = self.app.post('/api/institution', data=json.dumps(institution), content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response["name"] = "My little bronnie"
        response["description"] = "A biopic on the best and brightest adults who are 'My Little Pony' fans."
        rv = self.app.put('/api/institution/%i' % response['id'],
                          data=json.dumps(response), content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.get('/api/institution/%i' % response["id"])
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals("My little bronnie", response["name"])

