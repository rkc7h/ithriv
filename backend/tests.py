# Set enivoronment variable to testing before loading.
import os
# IMPORTANT - Environment must be loaded before app, models, etc....
os.environ["APP_CONFIG_FILE"] = '../config/testing.py'
from io import BytesIO
from app.model.resource_category import ResourceCategory
from app.resources.schema import CategorySchema, IconSchema
import unittest
import json
from app.model.availability import Availability
from app.model.category import Category
from app.model.resource import ThrivResource
from app.model.type import ThrivType
from app.model.institution import ThrivInstitution
from app.model.icon import Icon

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
        elastic_index.add_resource(resource)
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
        self.assertEqual(response["id"], 1)
        self.assertEqual(response["name"], 'Test Resource')
        self.assertEqual(response["description"], 'Some stuff bout it')

    def test_modify_resource_basics(self):
        self.construct_resource()
        rv = self.app.get('/api/resource/1', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['name'] = 'Edwarardos Lemonade and Oil Change'
        response['description'] = 'Better fluids for you and your car.'
        response['website'] = 'http://sartography.com'
        response['owner'] = 'Daniel GG Dog Da Funk-a-funka'
        orig_date = response['last_updated']
        rv = self.app.put('/api/resource/1', data=json.dumps(response), content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['name'], 'Edwarardos Lemonade and Oil Change')
        self.assertEqual(response['description'], 'Better fluids for you and your car.')
        self.assertEqual(response['website'], 'http://sartography.com')
        self.assertEqual(response['owner'], 'Daniel GG Dog Da Funk-a-funka')
        self.assertNotEqual(orig_date, response['last_updated'])

    def test_set_resource_institution(self):
        self.construct_resource()
        inst = ThrivInstitution(name="Billy Bob Thorton's School for mean short men with big heads")
        db.session.add(inst)
        db.session.commit()
        rv = self.app.get('/api/resource/1', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['institution_id'] = inst.id
        rv = self.app.put('/api/resource/1', data=json.dumps(response), content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['institution']['name'], "Billy Bob Thorton's School for mean short men with big heads")
        self.assertEqual(response['institution_id'], inst.id)

    def test_set_resource_type(self):
        self.construct_resource()
        type = ThrivType(name="A sort of greenish purple apricot like thing. ")
        db.session.add(type)
        db.session.commit()
        rv = self.app.get('/api/resource/1', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['type_id'] = type.id
        rv = self.app.put('/api/resource/1', data=json.dumps(response), content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['type']['name'], "A sort of greenish purple apricot like thing. ")
        self.assertEqual(response['type_id'], type.id)


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
        self.assertEqual(response['id'], 1)

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

    def test_delete_category(self):
        c = self.construct_category()
        self.assertEqual(1, db.session.query(Category).count())
        rv = self.app.delete('/api/category/%i' % c.id)
        self.assertSuccess(rv)
        self.assertEqual(0, db.session.query(Category).count())

    def search(self, query):
        '''Executes a query, returning the resulting search results object.'''
        rv = self.app.post('/api/search', data=json.dumps(query), follow_redirects=True,
                           content_type="application/json")
        self.assertSuccess(rv)
        return json.loads(rv.get_data(as_text=True))

    def test_search_crud(self):
        rainbow_query = {'query': 'rainbows', 'filters': []}
        world_query = {'query': 'world', 'filters': []}
        search_results = self.search(rainbow_query)
        self.assertEqual(len(search_results["resources"]), 0)
        search_results = self.search(world_query)
        self.assertEqual(len(search_results["resources"]), 0)

        resource = self.construct_resource(name='space unicorn',
                                           description="delivering rainbows")
        elastic_index.add_resource(resource)
        search_results = self.search(rainbow_query)
        self.assertEqual(len(search_results["resources"]), 1)
        self.assertEqual(search_results['resources'][0]['id'],
                         resource.id)
        search_results = self.search(world_query)
        self.assertEqual(len(search_results["resources"]), 0)

        resource.description = 'all around the world'
        elastic_index.update_resource(resource)

        search_results = self.search(rainbow_query)
        self.assertEqual(len(search_results["resources"]), 0)
        search_results = self.search(world_query)
        self.assertEqual(len(search_results["resources"]), 1)
        self.assertEqual(search_results['resources'][0]['id'],
                         resource.id)

        elastic_index.remove_resource(resource)
        search_results = self.search(rainbow_query)
        self.assertEqual(len(search_results["resources"]), 0)
        search_results = self.search(world_query)
        self.assertEqual(len(search_results["resources"]), 0)

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

    def test_resource_add_search(self):
        data = {'query': "Flash Gordon", 'filters': []}
        search_results = self.search(data)
        self.assertEqual(len(search_results["resources"]), 0)

        resource = {'name' : "Flash Gordon's zippy ship",
                    'description' : "Another thing. In a movie, or something."}
        rv = self.app.post('/api/resource',
                           data=json.dumps(resource),
                           content_type="application/json")
        self.assertSuccess(rv)

        search_results = self.search(data)
        self.assertEqual(len(search_results["resources"]), 1)

    def test_resource_delete_search(self):
        data = {'query': "Flash Gordon", 'filters': []}
        resource = {'name' : "Flash Gordon's zippy ship",
                    'description' : "Another thing. In a movie, or something."}

        search_results = self.search(data)
        self.assertEqual(len(search_results["resources"]), 0)

        rv = self.app.post('/api/resource',
                           data=json.dumps(resource),
                           content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        resource_id = response['id']

        search_results = self.search(data)
        self.assertEqual(len(search_results["resources"]), 1)

        rv = self.app.delete('/api/resource/{}'.format(resource_id),
                             content_type="application/json")
        self.assertSuccess(rv)

        search_results = self.search(data)
        self.assertEqual(len(search_results["resources"]), 0)

    def test_resource_modify_search(self):
        resource = self.construct_resource(
            name="Flash Gordon's zappy raygun",
            description="Yet another thing. In a movie, or something.")
        self.index_resource(resource)
        zappy_query = {'query': 'zappy', 'filters': []}
        zorpy_query = {'query': 'zorpy', 'filters': []}
        search_results = self.search(zappy_query)
        self.assertEqual(len(search_results["resources"]), 1)
        search_results = self.search(zorpy_query)
        self.assertEqual(len(search_results["resources"]), 0)

        rv = self.app.get('/api/resource/1', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['name'], "Flash Gordon's zappy raygun")
        response['name'] = "Flash Gordon's zorpy raygun"
        rv = self.app.put('/api/resource/1', data=json.dumps(response), content_type="application/json")
        self.assertSuccess(rv)

        search_results = self.search(zappy_query)
        self.assertEqual(len(search_results["resources"]), 0)
        search_results = self.search(zorpy_query)
        self.assertEqual(len(search_results["resources"]), 1)

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

    def test_create_type(self):
        type = {"name": "A typey typer type"}
        rv = self.app.post('/api/type', data=json.dumps(type), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        response["name"] = "A typey typer type"
        self.assertEquals(1, db.session.query(ThrivType).count())

    def test_edit_type(self):
        type = ThrivType(name="one way")
        db.session.add(type)
        db.session.commit()
        rv = self.app.get('/api/type/%i' % type.id, content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['name'] = "or another"
        rv = self.app.put('/api/type/%i' % type.id, data=json.dumps(response), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        response["name"] = "or another"

    def test_delete_type(self):
        type = ThrivType(name="one way")
        db.session.add(type)
        db.session.commit()
        self.assertEquals(1, db.session.query(ThrivType).count())
        rv = self.app.delete('/api/type/%i' % type.id, content_type="application/json")
        self.assertEquals(0, db.session.query(ThrivType).count())

    def test_list_types(self):
        db.session.add(ThrivType(name="a"))
        db.session.add(ThrivType(name="b"))
        db.session.add(ThrivType(name="c"))
        db.session.commit()
        rv = self.app.get('/api/type', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals(3, len(response))

    def test_get_resource_by_category(self):
        c = self.construct_category()
        r = self.construct_resource()
        cr = ResourceCategory(resource=r, category=c)
        db.session.add(cr)
        db.session.commit()
        rv = self.app.get('/api/category/%i/resource' % c.id, content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals(1, len(response))
        self.assertEquals(r.id, response[0]["id"])
        self.assertEquals(r.description, response[0]["resource"]["description"])

    def test_get_category_by_resource(self):
        c = self.construct_category()
        r = self.construct_resource()
        cr = ResourceCategory(resource=r, category=c)
        db.session.add(cr)
        db.session.commit()
        rv = self.app.get('/api/resource/%i/category' % r.id, content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals(1, len(response))
        self.assertEquals(c.id, response[0]["id"])
        self.assertEquals(c.description, response[0]["category"]["description"])

    def test_add_category_to_resource(self):
        c = self.construct_category()
        r = self.construct_resource()

        rc_data = {"resource_id": r.id, "category_id": c.id}

        rv = self.app.post('/api/resource_category', data=json.dumps(rc_data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals(c.id, response["category_id"])
        self.assertEquals(r.id, response["resource_id"])

    def test_remove_category_from_resource(self):
        self.test_add_category_to_resource()
        rv = self.app.delete('/api/resource_category/%i' % 1)
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/%i/category' % 1, content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals(0, len(response))

    def test_create_category(self):
        c = {"name":"Old bowls", "description":"Funky bowls of yuck still on my desk. Ews!",
             "color": "#000", "brief_description":"Funky Bowls!", "image":"image.png"}
        rv = self.app.post('/api/category', data=json.dumps(c), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals(c["name"], response["name"])
        self.assertEquals(c["description"], response["description"])
        self.assertEquals(c["brief_description"], response["brief_description"])
        self.assertEquals(c["color"], response["color"])
        self.assertEquals(c["image"], response["image"])

    def test_create_child_category(self):
        parent = Category(name= "Desk Stuffs", description = "The many stuffs on my desk")
        db.session.add(parent)
        db.session.commit()
        c = {"name":"Old bowls", "description":"Funky bowls of yuck still on my desk. Ews!", "parent_id": parent.id}
        rv = self.app.post('/api/category', data=json.dumps(c), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals(parent.id, response["parent"]["id"])
        self.assertEquals(0, response["parent"]["level"])
        self.assertEquals(1, response["level"])


    def test_update_category(self):
        c = Category(name="Desk Stuffs",
                     description="The many stuffs on my desk",
                     color="#ABC222")
        db.session.add(c)
        db.session.commit()
        c.description="A new better description of the crap all over my desk right now.  It's a mess."
        rv = self.app.put('/api/category/%i' % c.id, data=json.dumps(CategorySchema().dump(c).data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals(c.description, response["description"])

    def test_category_has_parents_color_if_not_set(self):
        parent = Category(name= "Beer", description = "There are lots of types of beer.", color="#A52A2A")
        db.session.add(parent)
        db.session.commit()
        c = {"name":"Old bowls", "description":"Funky bowls of yuck still on my desk. Ews!", "parent_id": parent.id}
        rv = self.app.post('/api/category', data=json.dumps(c), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals("#A52A2A", response["color"])

    def test_category_has_ordered_children(self):
        parent = Category(name= "Beer", description = "There are lots of types of beer.", color="#A52A2A")
        c1 = Category(name= "Zinger", description = "Orange flavoered crap beer, served with shame and an unbrella",
                      parent=parent)
        c2 = Category(name= "Ale", description = "Includes the Indian Pale Ale, which comes in 120,000 different "
                                                 "varieties now.", parent=parent)
        c3 = Category(name= "Hefeweizen", description = "Smells of bananas, best drunk in a German garden",
                      parent=parent)

        db.session.add_all([parent, c1, c2, c3])
        db.session.commit()
        rv = self.app.get('/api/category/%i' % parent.id, content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(3, len(response["children"]))
        self.assertEqual("Ale", response["children"][0]["name"])
        self.assertEqual("Hefeweizen", response["children"][1]["name"])
        self.assertEqual("Zinger", response["children"][2]["name"])




    def test_list_category_icons(self):
        i1 = Icon(name="Happy Coconuts")
        i2 = Icon(name="Fly on Strings")
        i3 = Icon(name="Between two Swallows")
        i4 = Icon(name="otherwise unladen")
        db.session.add_all([i1, i2, i3, i4])
        db.session.commit()
        rv = self.app.get('/api/icon', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals(4, len(response))

    def test_update_icon(self):
        i = Icon(name="Happy Coconuts")
        db.session.add(i)
        db.session.commit()
        i.name = "Happier Coconuts"
        rv = self.app.put('/api/icon/%i' % i.id, data=json.dumps(IconSchema().dump(i).data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals("Happier Coconuts", i.name)

    def test_upload_icon(self):
        i = {"name": "Happy Coconuts"}
        rv = self.app.post('/api/icon', data=json.dumps(i), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        icon_id = response["id"]

        rv = self.app.put('/api/icon/%i' % icon_id,
            data=dict(
                image=(BytesIO(b"hi everyone"), 'test.svg'),
            ))
        self.assertSuccess(rv)
        data = json.loads(rv.get_data(as_text=True))
        self.assertEqual("https://s3.amazonaws.com/edplatform-ithriv-test-bucket/ithriv/icon/%i.svg" % icon_id, data["url"])

    def test_set_category_icon(self):
        category = Category(name="City Museum", description="A wickly cool amazing place in St Louis",
                            color="blue")
        db.session.add(category)
        icon = Icon(name="Cool Places")
        db.session.add(icon)
        db.session.commit()
        category.icon_id = icon.id
        rv = self.app.post('/api/category', data=json.dumps(CategorySchema().dump(category).data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEquals(icon.id, response["icon_id"]);
        self.assertEquals("Cool Places", response["icon"]["name"]);