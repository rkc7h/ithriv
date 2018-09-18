# Set enivoronment variable to testing before loading.
import datetime
import os
# IMPORTANT - Environment must be loaded before app, models, etc....
import quopri
import re

from botocore.vendored import requests

os.environ["APP_CONFIG_FILE"] = '../config/testing.py'
import random
import string
from app.email_service import TEST_MESSAGES
from io import BytesIO
from app.model.resource_category import ResourceCategory
from app.resources.schema import CategorySchema, IconSchema, ThrivTypeSchema, UserSchema, \
     FileSchema
import unittest
import json
from app.model.availability import Availability
from app.model.category import Category
from app.model.resource import ThrivResource
from app.model.type import ThrivType
from app.model.institution import ThrivInstitution
from app.model.icon import Icon
from app.model.user import User
from app.model.email_log import EmailLog
from app.model.uploaded_file import UploadedFile
from app import app, db, elastic_index



class TestCase(unittest.TestCase):

    test_eppn = "dhf8rtest@virginia.edu"
    admin_eppn = "dhf8admin@virginia.edu"

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
        try:
            data = json.loads(rv.get_data(as_text=True))
            self.assertTrue(rv.status_code >= 200 and rv.status_code < 300,
                            "BAD Response: %i. \n %s" %
                            (rv.status_code, json.dumps(data)))
        except:
            self.assertTrue(rv.status_code >= 200 and rv.status_code < 300,
                            "BAD Response: %i." % rv.status_code)

    def randomString(self):
        char_set = string.ascii_uppercase + string.digits
        return ''.join(random.sample(char_set * 6, 6))

    def test_base_endpoint(self):
        rv = self.app.get('/',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertTrue("_links" in response)
        self.assertTrue("categories" in response['_links'])
        self.assertTrue("resources" in response['_links'])

    def construct_resource(self, type="TestyType", institution="TestyU",
                           name="Test Resource", description="Some stuff bout it",
                           owner="Mac Daddy Test", website="testy.edu", cost='$100 or your firstborn', available_to=None,
                           contact_email='mac@daddy.com', contact_phone='540-457-0024',
                           contact_notes='No robo-calls if you please.',
                           approved='Unapproved'):
        type_obj = ThrivType(name=type)
        inst_obj = ThrivInstitution(name=institution)
        resource = ThrivResource(name=name, description=description,
                                 type=type_obj, institution=inst_obj,
                                 owner=owner, website=website, cost=cost, contact_email=contact_email,
                                 contact_phone=contact_phone, contact_notes=contact_notes,
                                 approved=approved)
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
        response['cost'] = '$.25 or the going rate'
        response['owner'] = 'Daniel GG Dog Da Funk-a-funka'
        orig_date = response['last_updated']
        rv = self.app.put('/api/resource/1', data=json.dumps(response), content_type="application/json", headers=self.logged_in_headers(), follow_redirects=True)
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['name'], 'Edwarardos Lemonade and Oil Change')
        self.assertEqual(response['description'], 'Better fluids for you and your car.')
        self.assertEqual(response['website'], 'http://sartography.com')
        self.assertEqual(response['cost'], '$.25 or the going rate')
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
        rv = self.app.put('/api/resource/1', data=json.dumps(response), content_type="application/json",
                          headers=self.logged_in_headers(), follow_redirects=True)
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
        rv = self.app.put('/api/resource/1', data=json.dumps(response), content_type="application/json",
                          headers=self.logged_in_headers(), follow_redirects=True)
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

        rv = self.app.delete('/api/resource/1', content_type="application/json", headers=self.logged_in_headers(), follow_redirects=True)
        self.assertSuccess(rv)

        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertEqual(404, rv.status_code)

    def test_user_edit_resource(self):
        u1 = User(id=1, eppn="peter@cottontail", display_name="Peter Cottontail", email="peter@cottontail", role="User")
        u2 = User(id=2, eppn="rabbit@velveteen.com", display_name="The Velveteen Rabbit", email="rabbit@velveteen.com", role="Admin")
        r1 = self.construct_resource(owner=u1.email)
        r2 = self.construct_resource(owner="flopsy@cottontail.com")
        db.session.add_all([u1, u2, r1, r2])
        db.session.commit()

        rv = self.app.get('/api/resource/1', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['name'] = 'Farm Fresh Carrots'
        response['owner'] = 'peter@cottontail, flopsy@cottontail.com'
        orig_date = response['last_updated']

        # Peter should be able to edit his own resource
        rv = self.app.put('/api/resource/1', data=json.dumps(response), content_type="application/json",
                          headers=self.logged_in_headers(user=u1), follow_redirects=True)
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['name'], 'Farm Fresh Carrots')
        self.assertEqual(response['owner'], 'peter@cottontail, flopsy@cottontail.com')
        self.assertNotEqual(orig_date, response['last_updated'])

        # But Peter should not be able to edit anyone else's resources.
        rv = self.app.get('/api/resource/2', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['name'] = 'Farm Fresh Carrots'
        response['owner'] = 'peter@cottontail, flopsy@cottontail.com'
        orig_date = response['last_updated']
        rv = self.app.put('/api/resource/2', data=json.dumps(response), content_type="application/json",
                          headers=self.logged_in_headers(user=u1), follow_redirects=True)
        self.assertEqual(400, rv.status_code)

        # The Velveteen Rabbit can edit others' resources though, as an Admin:
        rv = self.app.get('/api/resource/2', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['name'] = 'All the Carrots and Love'
        response['owner'] = 'rabbit@velveteen.com, peter@cottontail, flopsy@cottontail.com'
        rv = self.app.put('/api/resource/2', data=json.dumps(response), content_type="application/json",
                          headers=self.logged_in_headers(user=u2), follow_redirects=True)
        self.assertSuccess(rv)

    def test_general_user_delete_resource(self):
        u1 = User(id=1, display_name="Peter Cottontail", email="peter@cottontail", role="User")
        r1 = self.construct_resource(owner=u1.email)
        r2 = self.construct_resource(owner="flopsy@cottontail.com")
        db.session.add_all([u1, r1, r2])
        db.session.commit()

        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)

        rv = self.app.get('/api/resource/2', content_type="application/json")
        self.assertSuccess(rv)
        self.assertEqual(2, db.session.query(ThrivResource).count())

        # We shouldn't be able to delete a resource when not logged in
        rv = self.app.delete('/api/resource/1', content_type="application/json")
        self.assertEqual(401, rv.status_code)
        self.assertEqual(2, db.session.query(ThrivResource).count())

        # A general user should be able to delete their own resources
        rv = self.app.delete('/api/resource/1', content_type="application/json", headers=self.logged_in_headers(user=u1),
                             follow_redirects=True)
        self.assertSuccess(rv)

        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertEqual(404, rv.status_code)
        self.assertEqual(1, db.session.query(ThrivResource).count())

        # And a user shouldn't be able to delete a resource that doesn't belong to them
        # (Flopsy might not want Peter deleting that thing)
        rv = self.app.delete('/api/resource/2', content_type="application/json", headers=self.logged_in_headers(user=u1),
                             follow_redirects=True)
        self.assertEqual(400, rv.status_code)

        rv = self.app.get('/api/resource/2', content_type="application/json")
        self.assertSuccess(rv)
        self.assertEqual(1, db.session.query(ThrivResource).count())

    def test_admin_user_delete_resource(self):
        # Remember -- A user shouldn't be able to delete a resource that doesn't belong to them...
        # ...Unless that user is a superuser, in which case they can delete whatever they want
        # (The Velveteen Rabbit is all-powerful)
        r1 = self.construct_resource(owner="mopsy@cottontail.com")
        u = User(id=2, eppn=self.admin_eppn, display_name="The Velveteen Rabbit", email="rabbit@velveteen.com", role="Admin")

        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)
        self.assertEqual(1, db.session.query(ThrivResource).count())

        rv = self.app.delete('/api/resource/1', content_type="application/json", headers=self.logged_in_headers(user=u),
                             follow_redirects=True)
        self.assertSuccess(rv)

        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertEqual(404, rv.status_code)
        self.assertEqual(0, db.session.query(ThrivResource).count())

    def test_create_resource(self):
        resource = {'name':"Barbarella's Funky Gun", 'description':"A thing. In a movie, or something."}
        rv = self.app.post('/api/resource', data=json.dumps(resource), content_type="application/json",
                           headers=self.logged_in_headers(), follow_redirects=True)
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

    def test_proper_error_on_no_resource(self):
        rv = self.app.get('/api/resource/1',
                          follow_redirects=True,
                          content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["code"], "not_found")

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

    def test_resource_has_contact_information(self):
        self.construct_resource(contact_email='thor@disney.com', contact_phone='555-123-4321',
                                contact_notes='Valhala calling!')
        rv = self.app.get('/api/resource/1',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["contact_email"], 'thor@disney.com')
        self.assertEqual(response["contact_phone"], '555-123-4321')
        self.assertEqual(response["contact_notes"], 'Valhala calling!')

    def test_resource_has_approval(self):
        resource = self.construct_resource()
        rv = self.app.get('/api/resource/1',
                          follow_redirects=True,
                          content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["approved"], 'Unapproved')
        response["approved"] = 'Approved';
        rv = self.app.put('/api/resource/%i' % 1, data=json.dumps(response), content_type="application/json",
                          headers=self.logged_in_headers(), follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["approved"], 'Approved')

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

    def test_my_resources_list(self):
        # Testing that the resource owner is correctly split with ; , or spaces between email addresses
        self.construct_resource(name="Birdseed sale at Hooper's", owner="bigbird@sesamestreet.com")
        self.construct_resource(name="Slimy the worm's flying school", owner="oscar@sesamestreet.com; bigbird@sesamestreet.com")
        self.construct_resource(name="Oscar's Trash Orchestra", owner="oscar@sesamestreet.com, bigbird@sesamestreet.com")
        self.construct_resource(name="Snuffy's Balloon Collection", owner="oscar@sesamestreet.com bigbird@sesamestreet.com")
        u1 = User(id=1, role="User", display_name="Oscar the Grouch", email="oscar@sesamestreet.com", eppn="oscar@sesamestreet.com")
        u2 = User(id=2, role="Admin", display_name="Big Bird", email="bigbird@sesamestreet.com", eppn="bigbird@sesamestreet.com")
        db.session.add_all([u1, u2])
        db.session.commit()

        # Testing that the correct amount of user-owned resources show up for the correct user
        rv = self.app.get('/api/session/resource', content_type="application/json",
                          headers=self.logged_in_headers(user=u1), follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(3, len(response))

        rv = self.app.get('/api/session/resource', content_type="application/json",
                          headers=self.logged_in_headers(user=u2), follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(4, len(response))

        # Testing to see that user-owned resources are not viewable when logged out
        rv = self.app.get('/api/session/resource', content_type="application/json")
        self.assertEqual(401, rv.status_code)

    def test_approved_resources_list_with_general_users(self):
        self.construct_resource(name="Birdseed sale at Hooper's", owner="bigbird@sesamestreet.com",
                                approved="Approved")
        self.construct_resource(name="Slimy the worm's flying school",
                                owner="oscar@sesamestreet.com; bigbird@sesamestreet.com", approved="Approved")
        self.construct_resource(name="Oscar's Trash Orchestra", owner="oscar@sesamestreet.com", approved="Unapproved")
        self.construct_resource(name="Snuffy's Balloon Collection",
                                owner="oscar@sesamestreet.com bigbird@sesamestreet.com", approved="Unpproved")
        u1 = User(id=1, eppn='oscar@sesamestreet.com', display_name="Oscar the Grouch", email="oscar@sesamestreet.com", role="User")
        u2 = User(id=2, eppn='bigbird@sesamestreet.com', display_name="Big Bird", email="bigbird@sesamestreet.com", role="User")
        u3 = User(id=3, eppn='grover@sesamestreet.com', display_name="Grover", email="grover@sesamestreet.com", role="User")
        db.session.add_all([u1, u2, u3])
        db.session.commit()

        # Testing that the correct amount of resources show up for the correct user
        # Oscar should see all four resources -- the three he owns and the Approved one he doesn't
        rv = self.app.get('/api/resource', content_type="application/json",
                          headers=self.logged_in_headers(user=u1), follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(4, len(response))

        # Big Bird should see the three resources he owns, and not the Unapproved one he doesn't
        rv = self.app.get('/api/resource', content_type="application/json",
                          headers=self.logged_in_headers(user=u2), follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(3, len(response))

        # Grover should see the two approved resources and nothing else
        rv = self.app.get('/api/resource', content_type="application/json",
                          headers=self.logged_in_headers(user=u3), follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(2, len(response))

    def test_approved_resources_list_with_admin_user(self):
        self.construct_resource(name="Birdseed sale at Hooper's", owner="bigbird@sesamestreet.com",
                                approved="Approved")
        self.construct_resource(name="Slimy the worm's flying school",
                                owner="oscar@sesamestreet.com; bigbird@sesamestreet.com", approved="Approved")
        self.construct_resource(name="Oscar's Trash Orchestra", owner="oscar@sesamestreet.com",
                                approved="Unapproved")
        self.construct_resource(name="Snuffy's Balloon Collection",
                                owner="oscar@sesamestreet.com bigbird@sesamestreet.com", approved="Unpproved")
        u1 = User(id=4, eppn='maria@seseme.edu', display_name="Maria", email="maria@sesamestreet.com", role="Admin")
        db.session.add(u1)
        db.session.commit()

        # Maria should see all the resources as an Admin
        rv = self.app.get('/api/resource', content_type="application/json",
                          headers=self.logged_in_headers(user=u1), follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(4, len(response))

    def test_approved_resources_list_with_no_user(self):
        self.construct_resource(name="Birdseed sale at Hooper's", owner="bigbird@sesamestreet.com",
                                approved="Approved")
        self.construct_resource(name="Slimy the worm's flying school",
                                owner="oscar@sesamestreet.com; bigbird@sesamestreet.com", approved="Approved")
        self.construct_resource(name="Oscar's Trash Orchestra", owner="oscar@sesamestreet.com",
                                approved="Unapproved")
        self.construct_resource(name="Snuffy's Balloon Collection",
                                owner="oscar@sesamestreet.com bigbird@sesamestreet.com", approved="Unpproved")

        # When there is no user logged in, they should only see the two approved resources
        rv = self.app.get('/api/resource', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(2, len(response))

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
                           content_type="application/json", headers=self.logged_in_headers(),)
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

    def test_search_unapproved_resource(self):
        # Unapproved resources should only appear in search results for Admin users
        resource = self.construct_resource(name="space kittens", approved="Unapproved")
        self.index_resource(resource)
        data = {'query': 'kittens', 'filters': []}
        rv = self.app.post('/api/search', data=json.dumps(data), follow_redirects=True,
                           content_type="application/json")
        self.assertSuccess(rv)
        results = json.loads(rv.get_data(as_text=True))
        self.assertEqual(len(results["resources"]), 0)
        rv = self.app.post('/api/search', data=json.dumps(data), follow_redirects=True,
                           content_type="application/json", headers=self.logged_in_headers())
        self.assertSuccess(rv)
        results = json.loads(rv.get_data(as_text=True))
        self.assertEqual(len(results["resources"]), 1)

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
        data = {'query': '', 'filters': [{'field': 'Type', 'value': 'hgttg'}]}

        search_results = self.search(data)
        self.assertEqual(len(search_results["resources"]), 1)

    def test_search_filter_on_approval(self):
        resource = self.construct_resource(type="Woods", description="A short trip on the river.", approved="Approved")
        self.index_resource(resource)
        data = {'query': '', 'filters': [{'field': 'Approved', 'value': "Approved"}]}
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
        self.assertEqual(3, len(search_results["facets"]))
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
                           content_type="application/json",
                           headers=self.logged_in_headers(),
                           follow_redirects=True)
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
                           content_type="application/json",
                           headers=self.logged_in_headers(),
                           follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        resource_id = response['id']

        search_results = self.search(data)
        self.assertEqual(len(search_results["resources"]), 1)

        rv = self.app.delete('/api/resource/{}'.format(resource_id),
                             content_type="application/json",
                             headers=self.logged_in_headers(),
                             follow_redirects=True)
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
        rv = self.app.put('/api/resource/1', data=json.dumps(response), content_type="application/json",
                          headers=self.logged_in_headers(), follow_redirects=True)
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

    def test_list_instititions_with_availability(self):
        i1 = ThrivInstitution(name="Delmar's", description="autobody", hide_availability=True)
        i2 = ThrivInstitution(name="News Leader", description="A once formidablele news source", hide_availability=False)
        i3 = ThrivInstitution(name="Baja", description="Yum. Is it lunch time?")
        db.session.add_all([i1, i2, i3])
        db.session.commit()
        rv = self.app.get('/api/institution/availability', content_type="application/json")
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
        self.assertEqual(0, db.session.query(ThrivInstitution).filter_by(id=1).count())

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
        self.assertEqual("My little bronnie", response["name"])

    def test_create_type(self):
        type = {"name": "A typey typer type"}
        rv = self.app.post('/api/type', data=json.dumps(type), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        response["name"] = "A typey typer type"
        self.assertEqual(1, db.session.query(ThrivType).count())

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
        self.assertEqual(1, db.session.query(ThrivType).count())
        rv = self.app.delete('/api/type/%i' % type.id, content_type="application/json")
        self.assertEqual(0, db.session.query(ThrivType).count())

    def test_list_types(self):
        db.session.add(ThrivType(name="a"))
        db.session.add(ThrivType(name="b"))
        db.session.add(ThrivType(name="c"))
        db.session.commit()
        rv = self.app.get('/api/type', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(3, len(response))

    def test_add_file(self):
        file = UploadedFile(file_name='happy_coconuts.svg', display_name='Happy Coconuts',
                                date_modified=datetime.datetime.now(),
                            md5="3399")
        rv = self.app.post('/api/file', data=json.dumps(FileSchema().dump(file).data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        file_id = response["id"]
        raw_data = BytesIO(b"<svg xmlns=\"http://www.w3.org/2000/svg\"/>");
        rv = self.app.put('/api/file/%i' % file_id,
                          data=raw_data, content_type='image/svg')
        self.assertSuccess(rv)
        data = json.loads(rv.get_data(as_text=True))
        self.assertEqual("https://s3.amazonaws.com/edplatform-ithriv-test-bucket/ithriv/resource/attachment/%i.svg" % file_id, data["url"])
        self.assertEqual('happy_coconuts.svg', data['file_name'])
        self.assertEqual('Happy Coconuts', data['display_name'])
        self.assertIsNotNone(data['date_modified'])
        self.assertEqual('image/svg', data['mime_type'])
        self.assertEqual("3399", data['md5'])
        return data

    def test_remove_file(self):
        file_data = self.test_add_file();
        response = requests.get(file_data['url'])
        self.assertEqual(200, response.status_code)
        rv = self.app.delete('/api/file/%i' % file_data['id'])
        self.assertSuccess(rv)
        response = requests.get(file_data['url'])
        self.assertEqual(404, response.status_code)

    def test_attach_file_to_resource(self):
        r = self.construct_resource()
        file = self.test_add_file()
        file['resource_id'] = r.id
        rv = self.app.put('/api/file/%i' % file['id'], data=json.dumps(file), content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/%i' % r.id, content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(1, len(response['files']))
        self.assertEqual("happy_coconuts.svg", response['files'][0]['file_name'])

    def addFile(self, file_name='happy_coconuts.svg', display_name='Happy Coconuts', md5="3399"):
        file = UploadedFile(file_name=file_name, display_name=display_name,
                                date_modified=datetime.datetime.now(),
                            md5=md5)
        rv = self.app.post('/api/file', data=json.dumps(FileSchema().dump(file).data), content_type="application/json")
        return rv

    def test_find_attachement_by_md5(self):
        file = self.addFile()
        file = self.addFile(md5='123412341234')
        file = self.addFile(md5='666666666666', display_name="Lots a 6s")
        rv = self.app.get('/api/file?md5=666666666666', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(1, len(response))
        self.assertEqual("Lots a 6s", response[0]['display_name'])

    def test_get_resource_by_category(self):
        c = self.construct_category()
        r = self.construct_resource()
        cr = ResourceCategory(resource=r, category=c)
        db.session.add(cr)
        db.session.commit()
        rv = self.app.get('/api/category/%i/resource' % c.id, content_type="application/json", headers = self.logged_in_headers())
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(1, len(response))
        self.assertEqual(r.id, response[0]["id"])
        self.assertEqual(r.description, response[0]["resource"]["description"])

    def test_get_resource_by_category_includes_category_details(self):
        c = self.construct_category(name="c1")
        c2 = self.construct_category(name="c2")
        r = self.construct_resource()
        cr = ResourceCategory(resource=r, category=c)
        cr2 = ResourceCategory(resource=r, category=c2)
        db.session.add_all([cr, cr2]);
        db.session.commit();
        rv = self.app.get('/api/category/%i/resource' % c.id, content_type="application/json", headers=self.logged_in_headers())
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(r.id, response[0]["id"])
        self.assertEqual(2, len(response[0]["resource"]["resource_categories"]))
        self.assertEqual("c1", response[0]["resource"]["resource_categories"][0]["category"]["name"])

    def test_category_resource_count(self):
        c = self.construct_category()
        r = self.construct_resource(approved="Approved")
        cr = ResourceCategory(resource=r, category=c)
        db.session.add(cr)
        db.session.commit()
        rv = self.app.get('/api/category/%i' % c.id, content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(1, response["resource_count"])

    def test_get_category_by_resource(self):
        c = self.construct_category()
        r = self.construct_resource()
        cr = ResourceCategory(resource=r, category=c)
        db.session.add(cr)
        db.session.commit()
        rv = self.app.get('/api/resource/%i/category' % r.id, content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(1, len(response))
        self.assertEqual(c.id, response[0]["id"])
        self.assertEqual(c.description, response[0]["category"]["description"])

    def test_add_category_to_resource(self):
        c = self.construct_category()
        r = self.construct_resource()

        rc_data = {"resource_id": r.id, "category_id": c.id}

        rv = self.app.post('/api/resource_category', data=json.dumps(rc_data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(c.id, response["category_id"])
        self.assertEqual(r.id, response["resource_id"])

    def test_set_all_categories_on_resource(self):
        c1 = self.construct_category(name="c1")
        c2 = self.construct_category(name="c2")
        c3 = self.construct_category(name="c3")
        r = self.construct_resource()

        rc_data = [
            {"category_id": c1.id},
            {"category_id": c2.id},
            {"category_id": c3.id},
        ]
        rv = self.app.post('/api/resource/%i/category' % r.id, data=json.dumps(rc_data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(3, len(response))

        rc_data = [
            {"category_id": c1.id}
        ]
        rv = self.app.post('/api/resource/%i/category' % r.id, data=json.dumps(rc_data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(1, len(response))

    def test_remove_category_from_resource(self):
        self.test_add_category_to_resource()
        rv = self.app.delete('/api/resource_category/%i' % 1)
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/%i/category' % 1, content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(0, len(response))

    def test_add_availability(self):
        r = self.construct_resource()
        institution = ThrivInstitution(id=1, name="Delmar's", description="autobody")

        availability_data = {"resource_id": r.id, "institution_id": institution.id, "available": True}

        rv = self.app.post('/api/availability', data=json.dumps(availability_data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(institution.id, response["institution_id"])
        self.assertEqual(r.id, response["resource_id"])
        self.assertEqual(True, response["available"])

    def test_add_availability_via_resource(self):
        r = self.construct_resource()
        institution = ThrivInstitution(id=1, name="Delmar's", description="autobody")

        availability_data = [{"resource_id": r.id, "institution_id": institution.id, "available": True}]

        rv = self.app.post('/api/resource/%i/availability' % r.id, data=json.dumps(availability_data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(institution.id, response[0]["institution_id"])
        self.assertEqual(r.id, response[0]["resource_id"])
        self.assertEqual(True, response[0]["available"])

    def test_remove_availability(self):
        self.test_add_availability()
        rv = self.app.get('/api/availability/%i' % 1, content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.delete('/api/availability/%i' % 1)
        self.assertSuccess(rv)
        rv = self.app.get('/api/availability/%i' % 1, content_type="application/json")
        self.assertEqual(404, rv.status_code)

    def test_set_all_availability(self):
        r = self.construct_resource()
        i1 = ThrivInstitution(id=1, name="Delmar's", description="autobody")
        i2 = ThrivInstitution(id=2, name="Frank's", description="printers n stuff")
        i3 = ThrivInstitution(id=3, name="Rick's", description="custom cabinets")

        availability_data = [{"institution_id": i1.id, "resource_id": r.id, "available": True},
                             {"institution_id": i2.id, "resource_id": r.id, "available": True},
                             {"institution_id": i3.id, "resource_id": r.id, "available": True}]

        rv = self.app.post('/api/resource/%i/availability' % r.id, data=json.dumps(availability_data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(3, len(response))

        availability_data = [{"institution_id": i2.id, "resource_id": r.id, "available": True}]

        rv = self.app.post('/api/resource/%i/availability' % r.id, data=json.dumps(availability_data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(1, len(response))
        self.assertEqual(2, response[0]["institution_id"])

        rv = self.app.get('/api/availability/%i' % 1, content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.delete('/api/availability/%i' % 1)
        self.assertSuccess(rv)
        rv = self.app.get('/api/availability/%i' % 1, content_type="application/json")
        self.assertEqual(404, rv.status_code)

    def test_add_favorite(self):
        r = self.construct_resource()
        u = User(id=1, display_name="Oscar the Grouch")

        favorite_data = {"resource_id": r.id, "user_id": u.id}

        rv = self.app.post('/api/favorite', data=json.dumps(favorite_data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(u.id, response["user_id"])
        self.assertEqual(r.id, response["resource_id"])
        self.assertEqual(1, len(r.favorites))

    def test_remove_favorite(self):
        self.test_add_favorite()
        rv = self.app.get('/api/favorite/%i' % 1, content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.delete('/api/favorite/%i' % 1)
        self.assertSuccess(rv)
        rv = self.app.get('/api/favorite/%i' % 1, content_type="application/json")
        self.assertEqual(404, rv.status_code)

    def test_user_favorites_list(self):
        r1 = self.construct_resource(name="Birdseed sale at Hooper's")
        r2 = self.construct_resource(name="Slimy the worm's flying school")
        r3 = self.construct_resource(name="Oscar's Trash Orchestra")
        u1 = User(id=1, eppn=self.test_eppn, display_name="Oscar the Grouch", email="oscar@sesamestreet.com")
        u2 = User(id=2, eppn=self.admin_eppn, display_name="Big Bird", email="bigbird@sesamestreet.com")

        db.session.commit()

        favorite_data_u1 = [
            {"resource_id": r2.id},
            {"resource_id": r3.id},
        ]

        favorite_data_u2 = [
            {"resource_id": r1.id},
            {"resource_id": r2.id},
            {"resource_id": r3.id},
        ]

        # Creating Favorites and testing that the correct amount show up for the correct user
        rv = self.app.post('/api/session/favorite', data=json.dumps(favorite_data_u1),
                           content_type="application/json", headers=self.logged_in_headers(user=u1), follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(2, len(response))

        rv = self.app.post('/api/session/favorite', data=json.dumps(favorite_data_u2),
                           content_type="application/json", headers=self.logged_in_headers(user=u2), follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(3, len(response))

        # Testing to see that favorites are not viewable when logged out
        rv = self.app.get('/api/session/favorite', content_type="application/json")
        self.assertEqual(401, rv.status_code)

    def test_create_category(self):
        c = {"name":"Old bowls", "description":"Funky bowls of yuck still on my desk. Ews!",
             "color": "#000", "brief_description":"Funky Bowls!", "image":"image.png"}
        rv = self.app.post('/api/category', data=json.dumps(c), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(c["name"], response["name"])
        self.assertEqual(c["description"], response["description"])
        self.assertEqual(c["brief_description"], response["brief_description"])
        self.assertEqual(c["color"], response["color"])
        self.assertEqual(c["image"], response["image"])

    def test_create_child_category(self):
        parent = Category(name= "Desk Stuffs", description = "The many stuffs on my desk")
        db.session.add(parent)
        db.session.commit()
        c = {"name":"Old bowls", "description":"Funky bowls of yuck still on my desk. Ews!", "parent_id": parent.id}
        rv = self.app.post('/api/category', data=json.dumps(c), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(parent.id, response["parent"]["id"])
        self.assertEqual(0, response["parent"]["level"])
        self.assertEqual(1, response["level"])

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
        self.assertEqual(c.description, response["description"])

    def test_category_has_parents_color_if_not_set(self):
        parent = Category(name= "Beer", description = "There are lots of types of beer.", color="#A52A2A")
        db.session.add(parent)
        db.session.commit()
        c = {"name":"Old bowls", "description":"Funky bowls of yuck still on my desk. Ews!", "parent_id": parent.id}
        rv = self.app.post('/api/category', data=json.dumps(c), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual("#A52A2A", response["color"])

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
        self.assertEqual(4, len(response))

    def test_update_icon(self):
        i = Icon(name="Happy Coconuts")
        db.session.add(i)
        db.session.commit()
        i.name = "Happier Coconuts"
        rv = self.app.put('/api/icon/%i' % i.id, data=json.dumps(IconSchema().dump(i).data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual("Happier Coconuts", i.name)

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
        category = Category(name="City Museum", description="A wickedly cool amazing place in St Louis",
                            color="blue")
        db.session.add(category)
        icon = Icon(name="Cool Places")
        db.session.add(icon)
        db.session.commit()
        category.icon_id = icon.id
        rv = self.app.post('/api/category', data=json.dumps(CategorySchema().dump(category).data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(icon.id, response["icon_id"])
        self.assertEqual("Cool Places", response["icon"]["name"])

    def test_set_type_icon(self):
        thrivtype = ThrivType(name="Wickedly Cool")
        db.session.add(thrivtype)
        icon = Icon(name="Cool Places")
        db.session.add(icon)
        db.session.commit()
        thrivtype.icon_id = icon.id
        rv = self.app.post('/api/category', data=json.dumps(ThrivTypeSchema().dump(thrivtype).data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(icon.id, response["icon_id"])
        self.assertEqual("Cool Places", response["icon"]["name"])

    def logged_in_headers(self, user=None):
        if not user:
            eppn = self.test_eppn
            headers = {'eppn': eppn, 'givenName': 'Daniel', 'mail': 'dhf8r@virginia.edu'}
        else:
            eppn = user.eppn
            headers = {'eppn': eppn, 'givenName': user.display_name, 'mail': user.email}

        rv = self.app.get("/api/login", headers=headers, follow_redirects=True,
                          content_type="application/json")
        participant = User.query.filter_by(eppn=eppn).first()
        if user:
            participant.role = user.role
        else:
            participant.role = "Admin"
        db.session.add(participant)
        db.session.commit()

        return dict(Authorization='Bearer ' + participant.encode_auth_token().decode())

    def test_create_user_with_password(self):
        data = {
            "display_name": "Peter Dinklage",
            "eppn": "tyrion@got.com",
            "email": "tyrion@got.com",
            "role": "User"
        }
        rv = self.app.post('/api/user', data=json.dumps(data), follow_redirects=True, headers=self.logged_in_headers(),
                           content_type="application/json")
        self.assertSuccess(rv)
        user = User.query.filter_by(eppn=data["eppn"]).first()
        user.password = "peterpass"
        db.session.add(user)
        db.session.commit()

        rv = self.app.get('/api/user/%i' % user.id, content_type="application/json", headers=self.logged_in_headers())
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual("Peter Dinklage", response["display_name"])
        self.assertEqual("tyrion@got.com", response["email"])
        self.assertEqual("User", response["role"])
        self.assertEqual(True, user.is_correct_password("peterpass"))
        return user;

    def test_sso_login_sets_institution_to_uva_correctly(self):
        inst_obj = ThrivInstitution(name="UVA", domain='virginia.edu')
        db.session.add(inst_obj);
        user = User(eppn="dhf8r@virginia.edu", display_name='Dan Funk', email='dhf8r@virginia.edu')
        self.logged_in_headers(user)
        dbu = User.query.filter_by(eppn='dhf8r@virginia.edu').first()
        self.assertIsNotNone(dbu)
        self.assertIsNotNone(dbu.institution)
        self.assertEqual('UVA', dbu.institution.name)

    def test_sso_login_with_existing_email_address_doesnt_bomb_out(self):
        # There is an existing user in the database, but it has no eppn.
        user = User(display_name='Engelbert Humperdinck', email='ehb11@virginia.edu')
        db.session.add(user)
        db.session.commit()
        # Log in via sso as a user with an eppn that matches an existing users email address.
        user2 = User(eppn="ehb11@virginia.edu", display_name='Engelbert Humperdinck', email='ehb11@virginia.edu')
        self.logged_in_headers(user2);
        # No errors occur when this user logs in, and we only have one account with that email address.
        self.assertEqual(1, len(User.query.filter(User.email == 'ehb11@virginia.edu').all()));


    def test_login_user(self):
        user = self.test_create_user_with_password()
        data = {
            "email": "tyrion@got.com",
            "password": "peterpass"
        }
        # Login shouldn't work with email not yet verified
        rv = self.app.post('/api/login_password', data=json.dumps(data), content_type="application/json")
        self.assertEqual(400, rv.status_code)

        user.email_verified = True
        rv = self.app.post('/api/login_password', data=json.dumps(data), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertIsNotNone(response["token"])

    def test_admin_get_users(self):
        rv = self.app.get('/api/user')
        self.assertEqual(rv.status, "401 UNAUTHORIZED")

        rv = self.app.get('/api/user', content_type="application/json", headers=self.logged_in_headers())
        self.assertSuccess(rv)

    def test_admin_update_user(self):
        user = self.test_create_user_with_password()
        user.name = "The Artist Formerly Known As Prince"
        rv = self.app.put('/api/user/%i' % user.id, data=json.dumps(UserSchema().dump(user).data),
                          content_type="application/json")
        self.assertEqual(rv.status, "401 UNAUTHORIZED")

        rv = self.app.put('/api/user/%i' % user.id, data=json.dumps(UserSchema().dump(user).data),
                          content_type="application/json", headers=self.logged_in_headers())
        self.assertSuccess(rv)

    def test_admin_delete_user(self):
        user = self.test_create_user_with_password()
        rv = self.app.delete('/api/user/%i' % user.id, content_type="application/json")
        self.assertEqual(rv.status, "401 UNAUTHORIZED")

        rv = self.app.delete('/api/user/%i' % user.id, content_type="application/json", headers=self.logged_in_headers())
        self.assertSuccess(rv)

    def decode(self, encoded_words):
        """Useful for checking the content of email messages (which we store in an array for testing"""
        encoded_word_regex = r'=\?{1}(.+)\?{1}([b|q])\?{1}(.+)\?{1}='
        charset, encoding, encoded_text = re.match(encoded_word_regex, encoded_words).groups()
        if encoding is 'b':
            byte_string = base64.b64decode(encoded_text)
        elif encoding is 'q':
            byte_string = quopri.decodestring(encoded_text)
        text = byte_string.decode(charset)
        text = text.replace("_", " ")
        return text

    def test_register_sends_email(self):
        message_count = len(TEST_MESSAGES)
        self.test_create_user_with_password()
        self.assertGreater(len(TEST_MESSAGES), message_count)
        self.assertEqual("iThriv: Confirm Email", self.decode(TEST_MESSAGES[-1]['subject']))

        logs = EmailLog.query.all()
        self.assertIsNotNone(logs[-1].tracking_code)

    def test_forgot_password_sends_email(self):
        user = self.test_create_user_with_password()
        message_count = len(TEST_MESSAGES)
        data = {
            "email": user.email
        }
        rv = self.app.post('/api/forgot_password', data=json.dumps(data), content_type="application/json")
        self.assertSuccess(rv)
        self.assertGreater(len(TEST_MESSAGES), message_count)
        self.assertEqual("iThriv: Password Reset Email", self.decode(TEST_MESSAGES[-1]['subject']))

        logs = EmailLog.query.all()
        self.assertIsNotNone(logs[-1].tracking_code)

    def test_consult_request_sends_email(self):
        # This test will send two emails. One confirming that the user is created:
        user = self.test_create_user_with_password()
        message_count = len(TEST_MESSAGES)
        data = {
            "user_id": user.id
        }
        # ...And a second email requesting the consult:
        rv = self.app.post('/api/consult_request', data=json.dumps(data), headers=self.logged_in_headers(),
                           content_type="application/json")
        self.assertSuccess(rv)
        self.assertGreater(len(TEST_MESSAGES), message_count)
        self.assertEqual("iThriv: Consult Request", self.decode(TEST_MESSAGES[-1]['subject']))

        logs = EmailLog.query.all()
        self.assertIsNotNone(logs[-1].tracking_code)

    def test_get_current_participant(self):
        """ Test for the current participant status """
        # Create the user
        headers = {'eppn': self.test_eppn, 'givenName': 'Daniel', 'mail': 'dhf8r@virginia.edu'}
        rv = self.app.get("/api/login", headers=headers, follow_redirects=True,
                          content_type="application/json")
        # Don't check success, login does a redirect to the front end that might not be running.
        # self.assert_success(rv)

        user = User.query.filter_by(eppn=self.test_eppn).first()

        # Now get the user back.
        response = self.app.get('/api/session', headers=dict(
            Authorization='Bearer ' +
                          user.encode_auth_token().decode()
        )
                                )
        self.assertSuccess(response)
        return json.loads(response.data.decode())

    def searchUsers(self, query):
        '''Executes a query, returning the resulting search results object.'''
        rv = self.app.get('/api/user', query_string=query, follow_redirects=True,
                          content_type="application/json", headers=self.logged_in_headers())
        self.assertSuccess(rv)
        return json.loads(rv.get_data(as_text=True))

    def createTestUsers(self):
        u1 = User(id=1, eppn=self.test_eppn, display_name="Oscar the Grouch", email="oscar@sesamestreet.com")
        u2 = User(id=2, eppn=self.admin_eppn, display_name="Big Bird", email="bigbird@sesamestreet.com")
        u3 = User(id=3, eppn="stuff123@vt.edu", display_name="Elmo", email="elmo@sesamestreet.com")
        db.session.add_all([u1, u2, u3])
        db.session.commit()

    def test_find_users_respects_pageSize(self):
        self.createTestUsers()

        query = {'filter' : '', 'sortOrder': 'asc', 'pageNumber': '0', 'pageSize': '1'}
        response = self.searchUsers(query)
        self.assertEqual(1, len(response['items']))

        query = {'filter' : '', 'sortOrder': 'asc', 'pageNumber': '0', 'pageSize': '2'}
        response = self.searchUsers(query)
        self.assertEqual(2, len(response['items']))

    def test_find_users_respects_pageNumber(self):
        self.createTestUsers()
        self.assertEqual(3, len(db.session.query(User).all()))

        query = {'filter' : '', 'sort': 'display_name', 'sortOrder': 'asc', 'pageNumber': '0', 'pageSize': '2'}
        response = self.searchUsers(query)
        self.assertEqual(2, len(response['items']))
        self.assertEqual(3, response['total'])
        self.assertEqual('Big Bird', response['items'][0]['display_name'])

        query['pageNumber'] = 1
        response = self.searchUsers(query)
        self.assertEqual(1, len(response['items']))
        self.assertEqual('Oscar the Grouch', response['items'][0]['display_name'])

        query['pageNumber'] = 2
        response = self.searchUsers(query)
        self.assertEqual(0, len(response['items']))

    def test_find_users_respects_filter(self):
        self.createTestUsers()
        query = {'filter': 'big', 'sortOrder': 'asc', 'pageNumber': '0', 'pageSize': '20'}
        response = self.searchUsers(query)
        self.assertEqual(1, len(response['items']))

        query = {'filter': 'Grouch', 'sortOrder': 'asc', 'pageNumber': '0', 'pageSize': '20'}
        response = self.searchUsers(query)
        self.assertEqual(1, len(response['items']))

        query = {'filter': '123', 'sortOrder': 'asc', 'pageNumber': '0', 'pageSize': '20'}
        response = self.searchUsers(query)
        self.assertEqual(1, len(response['items']))

        query = {'filter': 'Ididnputthisinthedata', 'sortOrder': 'asc', 'pageNumber': '0', 'pageSize': '20'}
        response = self.searchUsers(query)
        self.assertEqual(0, len(response['items']))

    def test_find_users_orders_results(self):
        self.createTestUsers()
        query = {'filter': '', 'sort': 'display_name', 'sortOrder': 'asc', 'pageNumber': '0', 'pageSize': '20'}
        response = self.searchUsers(query)
        self.assertEqual("Big Bird", response['items'][0]['display_name'])

        query = {'filter': '', 'sort': 'display_name', 'sortOrder': 'desc', 'pageNumber': '0', 'pageSize': '20'}
        response = self.searchUsers(query)
        self.assertEqual("Oscar the Grouch", response['items'][0]['display_name'])

    def test_resource_list_limits_to_10_by_default(self):
        for i in range(20):
            self.construct_resource()
        rv = self.app.get('/api/resource', follow_redirects=True,
                          content_type="application/json", headers=self.logged_in_headers())
        self.assertSuccess(rv)
        result = json.loads(rv.get_data(as_text=True))
        self.assertEqual(10, len(result))

        rv = self.app.get('/api/resource', follow_redirects=True,
                          query_string={'limit':'5'},
                          content_type="application/json",
                          headers=self.logged_in_headers())
        self.assertSuccess(rv)
        result = json.loads(rv.get_data(as_text=True))
        self.assertEqual(5, len(result))
