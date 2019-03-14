import datetime
import json
import math
import os
import quopri
import random
import re
import string
import base64
import unittest

from app import app, db, elastic_index
from app.email_service import TEST_MESSAGES
from app.model.resource_category import ResourceCategory
from app.model.availability import Availability
from app.model.category import Category
from app.model.favorite import Favorite
from app.model.resource import ThrivResource
from app.model.type import ThrivType
from app.model.institution import ThrivInstitution
from app.model.icon import Icon
from app.model.user import User
from app.model.email_log import EmailLog
from app.model.uploaded_file import UploadedFile
from app.resources.schema import CategorySchema, IconSchema, ThrivTypeSchema, \
    UserSchema, FileSchema
from botocore.vendored import requests
from io import BytesIO
from sqlalchemy import or_

# Set environment variable to testing before loading.
# IMPORTANT - Environment must be loaded before app, models, etc....
os.environ["APP_CONFIG_FILE"] = '../config/testing.py'


class TestCase(unittest.TestCase):
    test_eppn = "dhf8r@virginia.edu"
    admin_eppn = "dhf8admin@virginia.edu"

    def setUp(self):
        db.create_all()
        self.app = app.test_client()
        self.ctx = app.test_request_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()
        elastic_index.clear()
        db.session.remove()
        db.drop_all()

    def assertSuccess(self, rv):
        try:
            data = json.loads(rv.get_data(as_text=True))
            self.assertTrue(
                200 <= rv.status_code < 300,
                'BAD Response: %i. \n %s' % (rv.status_code, json.dumps(data)))
        except:
            self.assertTrue(
                200 <= rv.status_code < 300,
                'BAD Response: %i.' % rv.status_code)

    def construct_user(self,
                       id=421,
                       eppn="poe.resistance@rebels.org",
                       display_name="Poe Dameron",
                       email="poe.resistance@rebels.org",
                       role="User",
                       institution=None):
        u = User(
            id=id,
            eppn=eppn,
            display_name=display_name,
            email=email,
            role=role)

        if institution:
            u.institution_id = institution.id

        db.session.add(u)
        db.session.commit()

        db_user = db.session.query(User).filter_by(eppn=u.eppn).first()
        self.assertEqual(db_user.display_name, u.display_name)
        return db_user

    def construct_admin_user(self,
                             id=1138,
                             eppn="general.organa@rebels.org",
                             display_name="General Organa",
                             email="general.organa@rebels.org",
                             role="Admin",
                             institution=None):
        u = User(
            id=id,
            eppn=eppn,
            display_name=display_name,
            email=email,
            role=role)

        if institution:
            u.institution_id = institution.id

        db.session.add(u)
        db.session.commit()

        db_user = db.session.query(User).filter_by(eppn=u.eppn).first()
        self.assertEqual(db_user.display_name, u.display_name)
        return db_user

    def construct_various_users(self):
        users = [
            self.construct_user(
                id=123,
                eppn=self.test_eppn,
                display_name="Oscar the Grouch",
                email=self.test_eppn),
            self.construct_user(
                id=456,
                eppn=self.admin_eppn,
                display_name="Big Bird",
                email=self.admin_eppn,
                role="Admin"),
            self.construct_user(
                id=789,
                eppn="stuff123@vt.edu",
                display_name="Elmo",
                email="stuff123@vt.edu")
        ]

        db_users = []

        for user in users:
            db_user = db.session \
                .query(User) \
                .filter_by(display_name=user.display_name).first()
            self.assertEqual(db_user.email, user.email)
            db_users.append(db_user)

        self.assertEqual(len(db_users), len(users))
        return db_users

    def construct_institution(
            self,
            name="School for Exceptionally Talented Mynocks",
            domain="asete.edu",
            description="The asteroid's premiere exogorth parasite education"):
        institution = ThrivInstitution(
            name=name, domain=domain, description=description)

        # Check database for existing institution
        existing_inst = db.session \
            .query(ThrivInstitution) \
            .filter(or_(
            (ThrivInstitution.name == name),
            (ThrivInstitution.domain == domain))).first()

        if not existing_inst:
            db.session.add(institution)
            db.session.commit()
            db_inst = db.session \
                .query(ThrivInstitution) \
                .filter_by(name=name).first()
        else:
            db_inst = existing_inst

        return db_inst

    def construct_resource(self,
                           type="Starfighter",
                           institution=None,
                           name="T-70 X-Wing",
                           description="Small. Fast. Blows stuff up.",
                           owner="poe.resistance@rebels.org",
                           website="rebels.org",
                           cost='$100B credits',
                           available_to=None,
                           contact_email='poe.resistance@rebels.org',
                           contact_phone='111-222-3333',
                           contact_notes='I have a bad feeling about this.',
                           approved='Unapproved',
                           private=False):
        type_obj = ThrivType(name=type)

        if available_to is not None:
            institution = self.construct_institution(name=available_to)

        resource = ThrivResource(
            name=name,
            description=description,
            type=type_obj,
            institution=institution,
            owner=owner,
            website=website,
            cost=cost,
            contact_email=contact_email,
            contact_phone=contact_phone,
            contact_notes=contact_notes,
            approved=approved,
            private=private)
        db.session.add(resource)

        if available_to is not None:
            availability = Availability(
                resource=resource, institution=institution, available=True)
            db.session.add(availability)
        db.session.commit()

        db_resource = db.session.query(ThrivResource).filter_by(name=name).first()
        self.assertIsNotNone(db_resource)

        elastic_index.add_resource(db_resource)
        return db_resource

    def construct_various_resources(self, institution=None, owner=None):
        resources = []
        i1_name = "Binks College of Bantha Poodology"
        i1_domain = "first-order.mil"
        i2_name = "Organa School for Rebellious Orphans"
        i2_domain = "rebels.org"
        o1 = "kylo.ren@first-order.mil"
        o2 = "mon.mothma@rebels.org"

        if institution is not None:
            # Assign institution to half of the resources
            i1 = institution
        else:
            i1 = self.construct_institution(name=i1_name, domain=i1_domain)
        i2 = self.construct_institution(name=i2_name, domain=i2_domain)

        if owner is not None:
            # Assign owner to half of the resources
            o1 = owner

        resource_names = [
            "The Phantom of Menace", "The Clone Army Attacketh",
            "Tragedy of the Sith's Revenge", "Verily, A New Hope",
            "The Empire Striketh Back", "The Jedi Doth Return",
            "The Force Doth Awaken", "Jedi The Last",
            "The Ewok Quest of Courage's Caravan", "Hurlyburly for Endor",
            "Wars of Yonder Stars Midwinter's Celebration",
            "Cloning of the Soldiers", "Rebellion-Upon-Mandalore",
            "Resistance's Tale", "MacSolo", "Rogue The First"
        ]

        for index, name in enumerate(resource_names):
            n = index + 1
            r_approved = "Approved" if (n % 2 == 0) else "Unapproved"
            r_private = (math.ceil(n / 2) % 2 == 0)
            r_institution = i1 if (math.ceil(n / 4) % 2 == 0) else i2
            r_owner = o1 if (math.ceil(n / 8) % 2 == 0) else o2

            resource = self.construct_resource(
                name=name,
                approved=r_approved,
                private=r_private,
                institution=r_institution,
                owner=r_owner)

            resources.append(resource)

        return resources

    def construct_category(self,
                           name="Test Category",
                           description="A category to test with!",
                           parent=None,
                           display_order=None):
        category = Category(name=name, description=description)
        if parent is not None:
            category.parent = parent
        if display_order is not None:
            category.display_order = display_order
        db.session.add(category)
        return category

    def construct_favorite(self, user, resource):
        favorite = Favorite(user_id=user.id, resource_id=resource.id)
        db.session.add(favorite)
        db.session.commit()
        return favorite

    def test_base_endpoint(self):
        rv = self.app.get(
            '/', follow_redirects=True, content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['api.categoryendpoint'], '/api/category/<id>')
        self.assertEqual(response['api.categorylistendpoint'], '/api/category')
        self.assertEqual(response['api.institutionendpoint'], '/api/institution/<id>')
        self.assertEqual(response['api.institutionlistendpoint'], '/api/institution')
        self.assertEqual(response['api.resourceendpoint'], '/api/resource/<id>')
        self.assertEqual(response['api.resourcelistendpoint'], '/api/resource')
        self.assertEqual(response['api.sessionendpoint'], '/api/session')
        self.assertEqual(response['api.sessionstatusendpoint'], '/api/session_status')
        self.assertEqual(response['api.userendpoint'], '/api/user/<id>')
        self.assertEqual(response['auth.forgot_password'], '/api/forgot_password')
        self.assertEqual(response['auth.login_password'], '/api/login_password')
        self.assertEqual(response['auth.reset_password'], '/api/reset_password')

    def test_resource_basics(self):
        r_name = "Speeder Bike"
        r_description = "Thou and I have thirty miles to" \
                        "ride yet ere dinner time."
        self.construct_resource(name=r_name, description=r_description)
        rv = self.app.get(
            '/api/resource/1',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["id"], 1)
        self.assertEqual(response["name"], r_name)
        self.assertEqual(response["description"], r_description)

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
        rv = self.app.put(
            '/api/resource/1',
            data=json.dumps(response),
            content_type="application/json",
            headers=self.logged_in_headers(),
            follow_redirects=True)
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['name'],
                         'Edwarardos Lemonade and Oil Change')
        self.assertEqual(response['description'],
                         'Better fluids for you and your car.')
        self.assertEqual(response['website'], 'http://sartography.com')
        self.assertEqual(response['cost'], '$.25 or the going rate')
        self.assertEqual(response['owner'], 'Daniel GG Dog Da Funk-a-funka')
        self.assertNotEqual(orig_date, response['last_updated'])

    def test_set_resource_institution(self):
        institution_name = "Billy Bob Thorton's School for" \
                           "mean short men with big heads"
        inst = self.construct_institution(name=institution_name)
        self.construct_resource()
        rv = self.app.get('/api/resource/1', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['institution_id'] = inst.id
        rv = self.app.put(
            '/api/resource/1',
            data=json.dumps(response),
            content_type="application/json",
            headers=self.logged_in_headers(),
            follow_redirects=True)
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['institution']['name'], institution_name)
        self.assertEqual(response['institution_id'], inst.id)

    def test_set_resource_type(self):
        self.construct_resource()
        type = ThrivType(name="A sort of greenish purple apricot like thing. ")
        db.session.add(type)
        db.session.commit()
        rv = self.app.get('/api/resource/1', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['type_id'] = type.id
        rv = self.app.put(
            '/api/resource/1',
            data=json.dumps(response),
            content_type="application/json",
            headers=self.logged_in_headers(),
            follow_redirects=True)
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['type']['name'],
                         "A sort of greenish purple apricot like thing. ")
        self.assertEqual(response['type_id'], type.id)

    def test_delete_resource(self):
        r = self.construct_resource()
        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)

        rv = self.app.delete(
            '/api/resource/1',
            content_type="application/json",
            headers=self.logged_in_headers(),
            follow_redirects=True)
        self.assertSuccess(rv)

        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertEqual(404, rv.status_code)

    def test_user_edit_resource(self):
        u1 = self.construct_user(
            eppn="peter@cottontail",
            display_name="Peter Cottontail",
            email="peter@cottontail")
        u2 = self.construct_admin_user(
            eppn="rabbit@velveteen.com",
            display_name="The Velveteen Rabbit",
            email="rabbit@velveteen.com")
        r1 = self.construct_resource(owner=u1.email)
        r2 = self.construct_resource(owner="flopsy@cottontail.com")

        rv = self.app.get('/api/resource/1', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['name'] = 'Farm Fresh Carrots'
        response['owner'] = 'peter@cottontail, flopsy@cottontail.com'
        orig_date = response['last_updated']

        # Peter should be able to edit his own resource
        rv = self.app.put(
            '/api/resource/1',
            data=json.dumps(response),
            content_type="application/json",
            headers=self.logged_in_headers(user=u1),
            follow_redirects=True)
        self.assertSuccess(rv)
        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['name'], 'Farm Fresh Carrots')
        self.assertEqual(response['owner'],
                         'peter@cottontail, flopsy@cottontail.com')
        self.assertNotEqual(orig_date, response['last_updated'])

        # But Peter should not be able to edit anyone else's resources.
        rv = self.app.get('/api/resource/2', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['name'] = 'Farm Fresh Carrots'
        response['owner'] = 'peter@cottontail, flopsy@cottontail.com'
        orig_date = response['last_updated']
        rv = self.app.put(
            '/api/resource/2',
            data=json.dumps(response),
            content_type="application/json",
            headers=self.logged_in_headers(user=u1),
            follow_redirects=True)
        self.assertEqual(400, rv.status_code)

        # The Velveteen Rabbit can edit others' resources though, as an Admin:
        rv = self.app.get('/api/resource/2', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['name'] = 'All the Carrots and Love'
        response['owner'] = 'rabbit@velveteen.com,' \
                            'peter@cottontail,' \
                            'flopsy@cottontail.com'
        rv = self.app.put(
            '/api/resource/2',
            data=json.dumps(response),
            content_type="application/json",
            headers=self.logged_in_headers(user=u2),
            follow_redirects=True)
        self.assertSuccess(rv)

    def test_general_user_delete_resource(self):
        u1 = self.construct_user(
            eppn="peter@cottontail",
            display_name="Peter Cottontail",
            email="peter@cottontail",
            role="User")
        r1 = self.construct_resource(owner=u1.email)
        r2 = self.construct_resource(owner="flopsy@cottontail.com")
        db.session.add_all([r1, r2])
        db.session.commit()

        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)

        rv = self.app.get('/api/resource/2', content_type="application/json")
        self.assertSuccess(rv)
        self.assertEqual(2, db.session.query(ThrivResource).count())

        # We shouldn't be able to delete a resource when not logged in
        rv = self.app.delete(
            '/api/resource/1', content_type="application/json")
        self.assertEqual(401, rv.status_code)
        self.assertEqual(2, db.session.query(ThrivResource).count())

        # A general user should be able to delete their own resources
        rv = self.app.delete(
            '/api/resource/1',
            content_type="application/json",
            headers=self.logged_in_headers(user=u1),
            follow_redirects=True)
        self.assertSuccess(rv)

        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertEqual(404, rv.status_code)
        self.assertEqual(1, db.session.query(ThrivResource).count())

        # And a user shouldn't be able to delete a resource that doesn't
        # belong to them (Flopsy might not want Peter deleting that thing)
        rv = self.app.delete(
            '/api/resource/2',
            content_type="application/json",
            headers=self.logged_in_headers(user=u1),
            follow_redirects=True)
        self.assertEqual(400, rv.status_code)

        rv = self.app.get('/api/resource/2', content_type="application/json")
        self.assertSuccess(rv)
        self.assertEqual(1, db.session.query(ThrivResource).count())

    def test_admin_user_delete_resource(self):
        # Remember -- A user shouldn't be able to delete a resource that
        # doesn't belong to them...
        # ...Unless that user is a superuser, in which case they can delete
        # whatever they want (The Velveteen Rabbit is all-powerful)
        r1 = self.construct_resource(owner="mopsy@cottontail.com")
        u = self.construct_user(
            id=2,
            eppn="rabbit@velveteen.com",
            display_name="The Velveteen Rabbit",
            email="rabbit@velveteen.com",
            role="Admin")

        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertSuccess(rv)
        self.assertEqual(1, db.session.query(ThrivResource).count())

        rv = self.app.delete(
            '/api/resource/1',
            content_type="application/json",
            headers=self.logged_in_headers(user=u),
            follow_redirects=True)
        self.assertSuccess(rv)

        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertEqual(404, rv.status_code)
        self.assertEqual(0, db.session.query(ThrivResource).count())

    def test_create_resource(self):
        resource = {
            'name': "Barbarella's Funky Gun",
            'description': "A thing. In a movie, or something."
        }
        rv = self.app.post(
            '/api/resource',
            data=json.dumps(resource),
            content_type="application/json",
            headers=self.logged_in_headers(),
            follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['name'], 'Barbarella\'s Funky Gun')
        self.assertEqual(response['description'],
                         'A thing. In a movie, or something.')
        self.assertEqual(response['id'], 1)

    def test_category_basics(self):
        category = self.construct_category()
        rv = self.app.get(
            '/api/category/1',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["id"], 1)
        self.assertEqual(response["name"], 'Test Category')
        self.assertEqual(response["description"], 'A category to test with!')

    def test_resource_has_type(self):
        type_name = "Human-Cyborg Relations"
        self.construct_resource(type=type_name)
        rv = self.app.get(
            '/api/resource/1',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["type"]["name"], type_name)

    def test_proper_error_on_no_resource(self):
        rv = self.app.get(
            '/api/resource/1',
            follow_redirects=True,
            content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["code"], "not_found")

    def test_resource_has_institution(self):
        institution_name = "Hoth Center for Limb Reconstruction"
        institution = self.construct_institution(name=institution_name)
        self.construct_resource(institution=institution)
        rv = self.app.get(
            '/api/resource/1',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["institution"]["name"], institution_name)

    def test_resource_has_website(self):
        self.construct_resource(website='testy.edu')
        rv = self.app.get(
            '/api/resource/1',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["website"], 'testy.edu')

    def test_resource_has_owner(self):
        self.construct_resource(owner="Mac Daddy Test")
        rv = self.app.get(
            '/api/resource/1',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["owner"], 'Mac Daddy Test')

    def test_resource_has_contact_information(self):
        self.construct_resource(
            contact_email='thor@disney.com',
            contact_phone='555-123-4321',
            contact_notes='Valhala calling!')
        rv = self.app.get(
            '/api/resource/1',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["contact_email"], 'thor@disney.com')
        self.assertEqual(response["contact_phone"], '555-123-4321')
        self.assertEqual(response["contact_notes"], 'Valhala calling!')

    def test_resource_has_approval(self):
        resource = self.construct_resource()
        rv = self.app.get(
            '/api/resource/1',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["approved"], 'Unapproved')
        response["approved"] = 'Approved'
        rv = self.app.put(
            '/api/resource/%i' % 1,
            data=json.dumps(response),
            content_type="application/json",
            headers=self.logged_in_headers(),
            follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["approved"], 'Approved')

    def test_resource_has_availability(self):
        self.construct_resource(owner="Mac Daddy Test", available_to="UVA")
        rv = self.app.get(
            '/api/resource/1',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertIsNotNone(response["availabilities"])
        self.assertIsNotNone(response["availabilities"][0])
        self.assertEqual(True, response["availabilities"][0]["available"])
        self.assertEqual("UVA",
                         response["availabilities"][0]["institution"]["name"])

    def test_resource_has_links(self):
        self.construct_resource()
        rv = self.app.get(
            '/api/resource/1',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["_links"]["self"], '/api/resource/1')
        self.assertEqual(response["_links"]["collection"], '/api/resource')

    def test_my_resources_list(self):
        # Testing that the resource owner is correctly split
        # with ; , or spaces between email addresses
        self.construct_resource(
            name="Birdseed sale at Hooper's", owner="bigbird@sesamestreet.com")
        self.construct_resource(
            name="Slimy the worm's flying school",
            owner="oscar@sesamestreet.com; "
                  "bigbird@sesamestreet.com")
        self.construct_resource(
            name="Oscar's Trash Orchestra",
            owner="oscar@sesamestreet.com, "
                  "bigbird@sesamestreet.com")
        self.construct_resource(
            name="Snuffy's Balloon Collection",
            owner="oscar@sesamestreet.com "
                  "bigbird@sesamestreet.com")
        u1 = self.construct_user(
            role="User",
            display_name="Oscar the Grouch",
            email="oscar@sesamestreet.com",
            eppn="oscar@sesamestreet.com")
        u2 = self.construct_admin_user(
            role="Admin",
            display_name="Big Bird",
            email="bigbird@sesamestreet.com",
            eppn="bigbird@sesamestreet.com")

        # Testing that the correct amount of user-owned resources
        # show up for the correct user
        rv = self.app.get(
            '/api/session/resource',
            content_type="application/json",
            headers=self.logged_in_headers(user=u1),
            follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(3, len(response))

        rv = self.app.get(
            '/api/session/resource',
            content_type="application/json",
            headers=self.logged_in_headers(user=u2),
            follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(4, len(response))

        # Testing to see that user-owned resources are not
        # viewable when logged out
        rv = self.app.get(
            '/api/session/resource', content_type="application/json")
        self.assertEqual(401, rv.status_code)

    def test_approved_resources_list_with_general_users(self):
        big_bird = self.construct_user(
            id=123,
            display_name="Big Bird",
            email="bigbird@sesamestreet.com",
            eppn="bigbird@sesamestreet.com")
        oscar = self.construct_user(
            id=456,
            display_name="Oscar",
            email="oscar@sesamestreet.com",
            eppn="oscar@sesamestreet.com")
        grover = self.construct_user(
            id=789,
            display_name="Grover",
            email="grover@sesamestreet.com",
            eppn="grover@sesamestreet.com")

        self.construct_resource(
            name="Birdseed sale at Hooper's",
            owner=big_bird.email,
            approved="Approved")
        self.construct_resource(
            name="Slimy the worm's flying school",
            owner=oscar.email + "; " + big_bird.email,
            approved="Approved")
        self.construct_resource(
            name="Oscar's Trash Orchestra",
            owner=oscar.email,
            approved="Unapproved")
        self.construct_resource(
            name="Snuffy's Balloon Collection",
            owner=oscar.email + " " + big_bird.email,
            approved="Unapproved")

        # Testing that the correct amount of resources show up
        # for the correct user. Oscar should see all four
        # resources -- the three he owns and the Approved
        # one he doesn't
        rv = self.app.get(
            '/api/resource',
            content_type="application/json",
            headers=self.logged_in_headers(user=oscar),
            follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(4, len(response))

        # Big Bird should see the three resources he owns, and
        # not the Unapproved one he doesn't
        rv = self.app.get(
            '/api/resource',
            content_type="application/json",
            headers=self.logged_in_headers(user=big_bird),
            follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(3, len(response))

        # Grover should see the two approved resources and nothing else
        rv = self.app.get(
            '/api/resource',
            content_type="application/json",
            headers=self.logged_in_headers(user=grover),
            follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(2, len(response))

    def test_approved_resources_list_with_admin_user(self):
        self.construct_resource(
            name="Birdseed sale at Hooper's",
            owner="bigbird@sesamestreet.com",
            approved="Approved")
        self.construct_resource(
            name="Slimy the worm's flying school",
            owner="oscar@sesamestreet.com; "
                  "bigbird@sesamestreet.com",
            approved="Approved")
        self.construct_resource(
            name="Oscar's Trash Orchestra",
            owner="oscar@sesamestreet.com",
            approved="Unapproved")
        self.construct_resource(
            name="Snuffy's Balloon Collection",
            owner="oscar@sesamestreet.com "
                  "bigbird@sesamestreet.com",
            approved="Unpproved")
        u1 = User(
            id=4,
            eppn='maria@seseme.edu',
            display_name="Maria",
            email="maria@sesamestreet.com",
            role="Admin")
        db.session.add(u1)
        db.session.commit()

        # Maria should see all the resources as an Admin
        rv = self.app.get(
            '/api/resource',
            content_type="application/json",
            headers=self.logged_in_headers(user=u1),
            follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(4, len(response))

    def test_approved_resources_list_with_no_user(self):
        self.construct_resource(
            name="Birdseed sale at Hooper's",
            owner="bigbird@sesamestreet.com",
            approved="Approved")
        self.construct_resource(
            name="Slimy the worm's flying school",
            owner="oscar@sesamestreet.com; "
                  "bigbird@sesamestreet.com",
            approved="Approved")
        self.construct_resource(
            name="Oscar's Trash Orchestra",
            owner="oscar@sesamestreet.com",
            approved="Unapproved")
        self.construct_resource(
            name="Snuffy's Balloon Collection",
            owner="oscar@sesamestreet.com "
                  "bigbird@sesamestreet.com",
            approved="Unapproved")

        # When there is no user logged in, they should only see
        # the two approved resources
        rv = self.app.get('/api/resource', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(2, len(response))

    def test_list_categories(self):
        self.construct_category(
            name="c1", description="c1 description", parent=None)
        self.construct_category(
            name="c2", description="c2 description", parent=None)
        self.construct_category(
            name="c3", description="c3 description", parent=None)

        rv = self.app.get(
            '/api/category',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response[0]['name'], 'c1')
        self.assertEqual(response[1]['name'], 'c2')
        self.assertEqual(response[2]['name'], 'c3')

    def test_list_categories_sorts_in_display_order(self):
        self.construct_category(
            name="M", description="M description", display_order=1)
        self.construct_category(name="O", description="O description")
        self.construct_category(
            name="N", description="N description", display_order=0)
        self.construct_category(name="K", description="K description")
        self.construct_category(
            name="E", description="E description", display_order=2)
        self.construct_category(name="Y", description="Y description")

        rv = self.app.get(
            '/api/category',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))

        # Items with an explicit display order are listed first
        self.assertEqual(response[0]['name'], 'N')
        self.assertEqual(response[1]['name'], 'M')
        self.assertEqual(response[2]['name'], 'E')

        # Items with same display order are sorted by name
        self.assertEqual(response[3]['name'], 'K')
        self.assertEqual(response[4]['name'], 'O')
        self.assertEqual(response[5]['name'], 'Y')

    def test_list_root_categories(self):
        self.construct_category(
            name="c1", description="c1 description", parent=None)
        self.construct_category(
            name="c2", description="c2 description", parent=None)
        self.construct_category(
            name="c3", description="c3 description", parent=None)

        rv = self.app.get(
            '/api/category/root',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response[0]['name'], 'c1')
        self.assertEqual(response[1]['name'], 'c2')
        self.assertEqual(response[2]['name'], 'c3')

    def test_list_root_categories_sorts_in_display_order(self):
        self.construct_category(
            name="Z", description="Z description", display_order=1)
        self.construct_category(name="O", description="O description")
        self.construct_category(
            name="M", description="M description", display_order=0)
        self.construct_category(name="B", description="B description")
        self.construct_category(
            name="I", description="I description", display_order=2)
        self.construct_category(name="E", description="E description")

        rv = self.app.get(
            '/api/category/root',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))

        # Items with an explicit display order are listed first
        self.assertEqual(response[0]['name'], 'M')
        self.assertEqual(response[1]['name'], 'Z')
        self.assertEqual(response[2]['name'], 'I')

        # Items with same display order are sorted by name
        self.assertEqual(response[3]['name'], 'B')
        self.assertEqual(response[4]['name'], 'E')
        self.assertEqual(response[5]['name'], 'O')

    def test_category_has_links(self):
        self.construct_category()
        rv = self.app.get(
            '/api/category/1',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["_links"]["self"], '/api/category/1')
        self.assertEqual(response["_links"]["collection"], '/api/category')

    def test_category_has_children(self):
        c1 = self.construct_category()
        c2 = self.construct_category(
            name="I'm the kid", description="A Child Category", parent=c1)
        rv = self.app.get(
            '/api/category/1',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["children"][0]['id'], 2)
        self.assertEqual(response["children"][0]['name'], "I'm the kid")

    def test_category_has_parents_and_that_parent_has_no_children(self):
        c1 = self.construct_category()
        c2 = self.construct_category(
            name="I'm the kid", description="A Child Category", parent=c1)
        c3 = self.construct_category(
            name="I'm the grand kid",
            description="A Child Category",
            parent=c2)
        rv = self.app.get(
            '/api/category/3',
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response["parent"]['id'], 2)
        self.assertNotIn("children", response["parent"])

    def test_category_depth_is_limited(self):
        c1 = self.construct_category()
        c2 = self.construct_category(
            name="I'm the kid", description="A Child Category", parent=c1)
        c3 = self.construct_category(
            name="I'm the grand kid",
            description="A Child Category",
            parent=c2)
        c4 = self.construct_category(
            name="I'm the great grand kid",
            description="A Child Category",
            parent=c3)

        rv = self.app.get(
            '/api/category',
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

    def search(self, query, user=None):
        """Executes a query as the given user, returning the resulting search results object."""
        rv = self.app.post(
            '/api/search',
            data=json.dumps(query),
            follow_redirects=True,
            content_type="application/json",
            headers=self.logged_in_headers(user))
        self.assertSuccess(rv)
        return json.loads(rv.get_data(as_text=True))

    def search_anonymous(self, query):
        """Executes a query as an anonymous user, returning the resulting search results object."""
        rv = self.app.post(
            '/api/search',
            data=json.dumps(query),
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        return json.loads(rv.get_data(as_text=True))

    def test_search_crud(self):
        rainbow_query = {'query': 'rainbows', 'filters': []}
        world_query = {'query': 'world', 'filters': []}
        search_results = self.search(rainbow_query)
        self.assertEqual(0, len(search_results["resources"]))
        search_results = self.search(world_query)
        self.assertEqual(0, len(search_results["resources"]))

        resource = self.construct_resource(
            name='space unicorn', description="delivering rainbows")
        elastic_index.add_resource(resource)
        search_results = self.search(rainbow_query)
        self.assertEqual(1, len(search_results["resources"]))
        self.assertEqual(search_results['resources'][0]['id'], resource.id)
        search_results = self.search(world_query)
        self.assertEqual(0, len(search_results["resources"]))

        resource.description = 'all around the world'
        elastic_index.update_resource(resource)

        search_results = self.search(rainbow_query)
        self.assertEqual(0, len(search_results["resources"]))
        search_results = self.search(world_query)
        self.assertEqual(1, len(search_results["resources"]))
        self.assertEqual(resource.id, search_results['resources'][0]['id'])

        elastic_index.remove_resource(resource)
        search_results = self.search(rainbow_query)
        self.assertEqual(0, len(search_results["resources"]))
        search_results = self.search(world_query)
        self.assertEqual(0, len(search_results["resources"]))

    def test_search_resource_by_name(self):
        resource = self.construct_resource(name="space kittens")
        data = {'query': 'kittens', 'filters': []}
        search_results = self.search(data)
        self.assertEqual(1, len(search_results["resources"]))

    def test_search_unapproved_resource(self):
        # Unapproved resources should only appear in
        # search results for Admin users
        r = self.construct_resource(
            name="space kittens", approved="Unapproved")
        query = {'query': 'kittens', 'filters': []}

        # Anonymous user gets 0 results
        results_anon = self.search_anonymous(query)
        self.assertEqual(0, len(results_anon["resources"]))

        # Admin user gets 1 result
        results_admin = self.search(query)
        self.assertEqual(1, len(results_admin["resources"]))

    def test_search_resource_by_description(self):
        r = self.construct_resource(
            name="space kittens", description="Flight of the fur puff")
        data = {'query': 'fur puff', 'filters': []}
        search_results = self.search(data)
        self.assertEqual(1, len(search_results["resources"]))

    def test_search_resource_by_website(self):
        resource = self.construct_resource(website="www.stuff.edu")
        data = {'query': 'www.stuff.edu', 'filters': []}
        search_results = self.search(data)
        self.assertEqual(1, len(search_results["resources"]))

    def test_search_resource_by_owner(self):
        resource = self.construct_resource(owner="Mr. McDoodle Pants")
        data = {'query': 'McDoodle', 'filters': []}
        search_results = self.search(data)
        self.assertEqual(1, len(search_results["resources"]))

    def test_search_filters(self):
        r = self.construct_resource(
            type="hgttg",
            description="There is a theory which "
                        "states that if ever anyone discovers exactly what "
                        "the Universe is for and why it is here, it will "
                        "instantly disappear and be replaced by something "
                        "even more bizarre and inexplicable. There is another "
                        "theory which states that this has already happened.")
        data = {'query': '', 'filters': [{'field': 'Type', 'value': 'hgttg'}]}

        search_results = self.search(data)
        self.assertEqual(1, len(search_results["resources"]))

    def test_search_filter_on_approval(self):
        r = self.construct_resource(
            type="Woods",
            description="A short trip on the river.",
            approved="Approved")
        data = {
            'query': '',
            'filters': [{
                'field': 'Approved',
                'value': "Approved"
            }]
        }
        search_results = self.search(data)
        self.assertEqual(1, len(search_results["resources"]))

    def test_search_facet_counts(self):
        r1 = self.construct_resource(
            type="hgttg",
            name="Golgafrinchan Ark Fleet Ship B",
            description="There is a theory which states that if ever "
                        "anyone discovers exactly what the Universe is "
                        "for and why it is here, it will instantly "
                        "disappear and be replaced by something even more "
                        "bizarre and inexplicable. There is another "
                        "theory which states that this has already "
                        "happened.")
        r2 = self.construct_resource(
            type="brazil",
            name="Spoor and Dowser",
            description="Information Transit got the wrong man. I got the "
                        "*right* man. The wrong one was delivered to me "
                        "as the right man, I accepted him on good faith "
                        "as the right man. Was I wrong?")

        db_resources = db.session.query(ThrivResource).all()
        self.assertEqual(2, len(db_resources))

        data = {'query': '', 'filters': []}
        search_results = self.search(data)
        self.assertEqual(2, len(search_results["resources"]))
        self.assertTrue("facets" in search_results)
        self.assertEqual(3, len(search_results["facets"]))
        self.assertTrue("facetCounts" in search_results["facets"][0])
        self.assertTrue(
            "category" in search_results["facets"][0]["facetCounts"][0])
        self.assertTrue(
            "hit_count" in search_results["facets"][0]["facetCounts"][0])
        self.assertTrue(
            "is_selected" in search_results["facets"][0]["facetCounts"][0])

    def test_resource_add_search(self):
        data = {'query': "Flash Gordon", 'filters': []}
        search_results = self.search(data)
        self.assertEqual(0, len(search_results["resources"]))

        resource = {
            'name': "Flash Gordon's zippy ship",
            'description': "Another thing. In a movie, or something."
        }
        rv = self.app.post(
            '/api/resource',
            data=json.dumps(resource),
            content_type="application/json",
            headers=self.logged_in_headers(),
            follow_redirects=True)
        self.assertSuccess(rv)

        search_results = self.search(data)
        self.assertEqual(1, len(search_results["resources"]))

    def test_resource_delete_search(self):
        data = {'query': "Flash Gordon", 'filters': []}
        resource = {
            'name': "Flash Gordon's zippy ship",
            'description': "Another thing. In a movie, or something."
        }

        search_results = self.search(data)
        self.assertEqual(0, len(search_results["resources"]))

        rv = self.app.post(
            '/api/resource',
            data=json.dumps(resource),
            content_type="application/json",
            headers=self.logged_in_headers(),
            follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        resource_id = response['id']

        search_results = self.search(data)
        self.assertEqual(1, len(search_results["resources"]))

        rv = self.app.delete(
            '/api/resource/{}'.format(resource_id),
            content_type="application/json",
            headers=self.logged_in_headers(),
            follow_redirects=True)
        self.assertSuccess(rv)

        search_results = self.search(data)
        self.assertEqual(0, len(search_results["resources"]))

    def test_resource_modify_search(self):
        resource = self.construct_resource(
            name="Flash Gordon's zappy raygun",
            description="Yet another thing. In a movie, or something.")
        zappy_query = {'query': 'zappy', 'filters': []}
        zorpy_query = {'query': 'zorpy', 'filters': []}
        search_results = self.search(zappy_query)
        self.assertEqual(1, len(search_results["resources"]))
        search_results = self.search(zorpy_query)
        self.assertEqual(0, len(search_results["resources"]))

        rv = self.app.get('/api/resource/1', content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['name'], "Flash Gordon's zappy raygun")
        response['name'] = "Flash Gordon's zorpy raygun"
        rv = self.app.put(
            '/api/resource/1',
            data=json.dumps(response),
            content_type="application/json",
            headers=self.logged_in_headers(),
            follow_redirects=True)
        self.assertSuccess(rv)

        search_results = self.search(zappy_query)
        self.assertEqual(0, len(search_results["resources"]))
        search_results = self.search(zorpy_query)
        self.assertEqual(1, len(search_results["resources"]))

    def test_create_institution(self):
        institution = {
            "name": "Ender's Academy for wayward space boys",
            "description": "A school, in outerspace, with weightless games"
        }
        rv = self.app.post(
            '/api/institution',
            data=json.dumps(institution),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(response['name'],
                         'Ender\'s Academy for wayward space boys')
        self.assertEqual(response['description'],
                         'A school, in outerspace, with weightless games')
        self.assertEqual(1, response['id'])
        self.assertIsNotNone(
            db.session.query(ThrivInstitution).filter_by(id=1).first())

    def test_list_institutions(self):
        i1 = ThrivInstitution(name="Delmar's", description="autobody")
        i2 = ThrivInstitution(
            name="News Leader", description="A once formidable news source")
        db.session.add(i1)
        db.session.add(i2)
        db.session.commit()
        rv = self.app.get('/api/institution', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(2, len(response))

    def test_list_institutions_with_availability(self):
        i1 = ThrivInstitution(
            name="Delmar's", description="autobody", hide_availability=True)
        i2 = ThrivInstitution(
            name="News Leader",
            description="A once formidable news source",
            hide_availability=False)
        i3 = ThrivInstitution(
            name="Baja", description="Yum. Is it lunch time?")
        db.session.add_all([i1, i2, i3])
        db.session.commit()
        rv = self.app.get(
            '/api/institution/availability', content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(2, len(response))

    def test_delete_institution(self):
        institution = {
            "name": "Ender's Academy for wayward space boys",
            "description": "A school, in outerspace, with weightless games"
        }
        rv = self.app.post(
            '/api/institution',
            data=json.dumps(institution),
            content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        rv = self.app.delete('/api/institution/%i' % response['id'])
        self.assertSuccess(rv)
        self.assertEqual(
            0,
            db.session.query(ThrivInstitution).filter_by(id=1).count())

    def test_modify_institution(self):
        institution = {
            "name": "Ender's Academy for wayward space boys",
            "description": "A school, in outerspace, with weightless games"
        }
        rv = self.app.post(
            '/api/institution',
            data=json.dumps(institution),
            content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response["name"] = "My little bronnie"
        response["description"] = "A biopic on the best and brightest " \
                                  "adults who are 'My Little Pony' fans."
        rv = self.app.put(
            '/api/institution/%i' % response['id'],
            data=json.dumps(response),
            content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.get('/api/institution/%i' % response["id"])
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual("My little bronnie", response["name"])

    def test_create_type(self):
        r_type = {"name": "A typey typer type"}
        rv = self.app.post(
            '/api/type',
            data=json.dumps(r_type),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        response["name"] = "A typey typer type"
        self.assertEqual(1, db.session.query(ThrivType).count())

    def test_edit_type(self):
        r_type = ThrivType(name="one way")
        db.session.add(r_type)
        db.session.commit()
        rv = self.app.get(
            '/api/type/%i' % r_type.id, content_type="application/json")
        response = json.loads(rv.get_data(as_text=True))
        response['name'] = "or another"
        rv = self.app.put(
            '/api/type/%i' % r_type.id,
            data=json.dumps(response),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        response["name"] = "or another"

    def test_delete_type(self):
        r_type = ThrivType(name="one way")
        db.session.add(r_type)
        db.session.commit()
        self.assertEqual(1, db.session.query(ThrivType).count())
        rv = self.app.delete(
            '/api/type/%i' % r_type.id, content_type="application/json")
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
        file = UploadedFile(
            file_name='happy_coconuts.svg',
            display_name='Happy Coconuts',
            date_modified=datetime.datetime.now(),
            md5="3399")
        rv = self.app.post(
            '/api/file',
            data=json.dumps(FileSchema().dump(file).data),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        file_id = response["id"]
        raw_data = BytesIO(b"<svg xmlns=\"http://www.w3.org/2000/svg\"/>")
        rv = self.app.put(
            '/api/file/%i' % file_id, data=raw_data, content_type='image/svg')
        self.assertSuccess(rv)
        data = json.loads(rv.get_data(as_text=True))
        self.assertEqual(
            "https://s3.amazonaws.com/edplatform-ithriv-test-bucket/"
            "ithriv/resource/attachment/%i.svg" % file_id, data["url"])
        self.assertEqual('happy_coconuts.svg', data['file_name'])
        self.assertEqual('Happy Coconuts', data['display_name'])
        self.assertIsNotNone(data['date_modified'])
        self.assertEqual('image/svg', data['mime_type'])
        self.assertEqual("3399", data['md5'])
        return data

    def test_remove_file(self):
        file_data = self.test_add_file()
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
        rv = self.app.put(
            '/api/file/%i' % file['id'],
            data=json.dumps(file),
            content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.get(
            '/api/resource/%i' % r.id, content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(1, len(response['files']))
        self.assertEqual("happy_coconuts.svg",
                         response['files'][0]['file_name'])

    def addFile(self,
                file_name='happy_coconuts.svg',
                display_name='Happy Coconuts',
                md5="3399"):
        file = UploadedFile(
            file_name=file_name,
            display_name=display_name,
            date_modified=datetime.datetime.now(),
            md5=md5)
        rv = self.app.post(
            '/api/file',
            data=json.dumps(FileSchema().dump(file).data),
            content_type="application/json")
        return rv

    def test_find_attachment_by_md5(self):
        f1 = self.addFile()
        f2 = self.addFile(md5='123412341234')
        f3 = self.addFile(md5='666666666666', display_name="Lots a 6s")
        rv = self.app.get(
            '/api/file?md5=666666666666', content_type="application/json")
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
        rv = self.app.get(
            '/api/category/%i/resource' % c.id,
            content_type="application/json",
            headers=self.logged_in_headers())
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
        db.session.add_all([cr, cr2])
        db.session.commit()
        rv = self.app.get(
            '/api/category/%i/resource' % c.id,
            content_type="application/json",
            headers=self.logged_in_headers())
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(r.id, response[0]["id"])
        self.assertEqual(2,
                         len(response[0]["resource"]["resource_categories"]))
        self.assertEqual(
            "c1", response[0]["resource"]["resource_categories"][0]["category"]
            ["name"])

    def test_get_resource_by_category_sorts_by_favorite_count(self):
        u = self.construct_user(
            display_name="Jar Jar Binks", email="jjb@senate.galaxy.gov")
        c = self.construct_category(name="c1")
        r1 = self.construct_resource(name="r1")
        r2 = self.construct_resource(name="r2")
        cr1 = ResourceCategory(resource=r1, category=c)
        cr2 = ResourceCategory(resource=r2, category=c)
        db.session.add_all([cr1, cr2])
        db.session.commit()

        # Should be sorted by name before any resources are favorited
        rv = self.app.get(
            '/api/category/%i/resource' % c.id,
            content_type="application/json",
            headers=self.logged_in_headers())
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual("r1", response[0]["resource"]["name"])

        # Should be sorted by favorite_count now
        favorite = self.construct_favorite(user=u, resource=r2)
        self.assertEqual(r2.id, favorite.resource_id)

        rv = self.app.get(
            '/api/category/%i/resource' % c.id,
            content_type="application/json",
            headers=self.logged_in_headers())
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual("r2", response[0]["resource"]["name"])

    def test_category_resource_count(self):
        c = self.construct_category()
        r = self.construct_resource(approved="Approved")
        cr = ResourceCategory(resource=r, category=c)
        db.session.add(cr)
        db.session.commit()
        rv = self.app.get(
            '/api/category/%i' % c.id, content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(1, response["resource_count"])

    def test_get_category_by_resource(self):
        c = self.construct_category()
        r = self.construct_resource()
        cr = ResourceCategory(resource=r, category=c)
        db.session.add(cr)
        db.session.commit()
        rv = self.app.get(
            '/api/resource/%i/category' % r.id,
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(1, len(response))
        self.assertEqual(c.id, response[0]["id"])
        self.assertEqual(c.description, response[0]["category"]["description"])

    def test_add_category_to_resource(self):
        c = self.construct_category()
        r = self.construct_resource()

        rc_data = {"resource_id": r.id, "category_id": c.id}

        rv = self.app.post(
            '/api/resource_category',
            data=json.dumps(rc_data),
            content_type="application/json")
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
            {
                "category_id": c1.id
            },
            {
                "category_id": c2.id
            },
            {
                "category_id": c3.id
            },
        ]
        rv = self.app.post(
            '/api/resource/%i/category' % r.id,
            data=json.dumps(rc_data),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(3, len(response))

        rc_data = [{"category_id": c1.id}]
        rv = self.app.post(
            '/api/resource/%i/category' % r.id,
            data=json.dumps(rc_data),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(1, len(response))

    def test_remove_category_from_resource(self):
        self.test_add_category_to_resource()
        rv = self.app.delete('/api/resource_category/%i' % 1)
        self.assertSuccess(rv)
        rv = self.app.get(
            '/api/resource/%i/category' % 1, content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(0, len(response))

    def test_add_availability(self):
        r = self.construct_resource()
        institution = self.construct_institution(
            name="Delmar's", description="autobody")

        availability_data = {
            "resource_id": r.id,
            "institution_id": institution.id,
            "available": True
        }

        rv = self.app.post(
            '/api/availability',
            data=json.dumps(availability_data),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(institution.id, response["institution_id"])
        self.assertEqual(r.id, response["resource_id"])
        self.assertEqual(True, response["available"])

    def test_add_availability_via_resource(self):
        r = self.construct_resource()
        institution = self.construct_institution(
            name="Delmar's", description="autobody")

        availability_data = [{
            "resource_id": r.id,
            "institution_id": institution.id,
            "available": True
        }]

        rv = self.app.post(
            '/api/resource/%i/availability' % r.id,
            data=json.dumps(availability_data),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(institution.id, response[0]["institution_id"])
        self.assertEqual(r.id, response[0]["resource_id"])
        self.assertEqual(True, response[0]["available"])

    def test_remove_availability(self):
        self.test_add_availability()
        rv = self.app.get(
            '/api/availability/%i' % 1, content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.delete('/api/availability/%i' % 1)
        self.assertSuccess(rv)
        rv = self.app.get(
            '/api/availability/%i' % 1, content_type="application/json")
        self.assertEqual(404, rv.status_code)

    def test_set_all_availability(self):
        r = self.construct_resource()
        i1 = self.construct_institution(
            name="Delmar's", description="autobody")
        i2 = self.construct_institution(
            name="Frank's", description="printers n stuff")
        i3 = self.construct_institution(
            name="Rick's", description="custom cabinets")

        availability_data = [{
            "institution_id": i1.id,
            "resource_id": r.id,
            "available": True
        }, {
            "institution_id": i2.id,
            "resource_id": r.id,
            "available": True
        }, {
            "institution_id": i3.id,
            "resource_id": r.id,
            "available": True
        }]

        rv = self.app.post(
            '/api/resource/%i/availability' % r.id,
            data=json.dumps(availability_data),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(3, len(response))

        availability_data = [{
            "institution_id": i2.id,
            "resource_id": r.id,
            "available": True
        }]

        rv = self.app.post(
            '/api/resource/%i/availability' % r.id,
            data=json.dumps(availability_data),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))

        self.assertEqual(1, len(response))
        self.assertEqual(i2.id, response[0]["institution_id"])

        av = db.session.query(Availability).first()
        self.assertIsNotNone(av)

        av_id = av.id

        rv = self.app.get(
            '/api/availability/%i' % av_id, content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.delete('/api/availability/%i' % av_id)
        self.assertSuccess(rv)
        rv = self.app.get(
            '/api/availability/%i' % av_id, content_type="application/json")
        self.assertEqual(404, rv.status_code)

    def test_add_favorite(self):
        self.construct_various_users()

        r = self.construct_resource()
        u = User.query.filter_by(eppn=self.test_eppn).first()
        favorite_data = {"resource_id": r.id, "user_id": u.id}

        rv = self.app.post(
            '/api/favorite',
            data=json.dumps(favorite_data),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(u.id, response["user_id"])
        self.assertEqual(r.id, response["resource_id"])
        self.assertEqual(1, len(r.favorites))

    def test_remove_favorite(self):
        self.test_add_favorite()
        rv = self.app.get(
            '/api/favorite/%i' % 1, content_type="application/json")
        self.assertSuccess(rv)
        rv = self.app.delete('/api/favorite/%i' % 1)
        self.assertSuccess(rv)
        rv = self.app.get(
            '/api/favorite/%i' % 1, content_type="application/json")
        self.assertEqual(404, rv.status_code)

    def test_delete_resource_deletes_favorite(self):
        r = self.construct_resource()
        u = self.construct_user(display_name="Oscar the Grouch")

        favorite_data = {"resource_id": r.id, "user_id": u.id}

        rv = self.app.post(
            '/api/favorite',
            data=json.dumps(favorite_data),
            content_type="application/json")
        self.assertSuccess(rv)
        self.assertEqual(1, len(r.favorites))

        rv = self.app.delete(
            '/api/resource/1',
            content_type="application/json",
            headers=self.logged_in_headers(),
            follow_redirects=True)
        self.assertSuccess(rv)

        rv = self.app.get('/api/resource/1', content_type="application/json")
        self.assertEqual(404, rv.status_code)

        rv = self.app.get('/api/favorite/1', content_type="application/json")
        self.assertEqual(404, rv.status_code)

    def test_user_favorites_list(self):
        r1 = self.construct_resource(name="Birdseed sale at Hooper's")
        r2 = self.construct_resource(name="Slimy the worm's flying school")
        r3 = self.construct_resource(name="Oscar's Trash Orchestra")
        u1 = User(
            id=1,
            eppn=self.test_eppn,
            display_name="Oscar the Grouch",
            email="oscar@sesamestreet.com")
        u2 = User(
            id=2,
            eppn=self.admin_eppn,
            display_name="Big Bird",
            email="bigbird@sesamestreet.com")

        db.session.commit()

        favorite_data_u1 = [
            {
                "resource_id": r2.id
            },
            {
                "resource_id": r3.id
            },
        ]

        favorite_data_u2 = [
            {
                "resource_id": r1.id
            },
            {
                "resource_id": r2.id
            },
            {
                "resource_id": r3.id
            },
        ]

        # Creating Favorites and testing that the correct amount
        # show up for the correct user
        rv = self.app.post(
            '/api/session/favorite',
            data=json.dumps(favorite_data_u1),
            content_type="application/json",
            headers=self.logged_in_headers(user=u1),
            follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(2, len(response))

        rv = self.app.post(
            '/api/session/favorite',
            data=json.dumps(favorite_data_u2),
            content_type="application/json",
            headers=self.logged_in_headers(user=u2),
            follow_redirects=True)
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(3, len(response))

        # Testing to see that favorites are not viewable when logged out
        rv = self.app.get(
            '/api/session/favorite', content_type="application/json")
        self.assertEqual(401, rv.status_code)

    def test_create_category(self):
        c = {
            "name": "Old bowls",
            "description": "Funky bowls of yuck still on my desk. Ews!",
            "color": "#000",
            "brief_description": "Funky Bowls!",
            "image": "image.png"
        }
        rv = self.app.post(
            '/api/category',
            data=json.dumps(c),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(c["name"], response["name"])
        self.assertEqual(c["description"], response["description"])
        self.assertEqual(c["brief_description"], response["brief_description"])
        self.assertEqual(c["color"], response["color"])
        self.assertEqual(c["image"], response["image"])

    def test_create_child_category(self):
        parent = Category(
            name="Desk Stuffs", description="The many stuffs on my desk")
        db.session.add(parent)
        db.session.commit()
        c = {
            "name": "Old bowls",
            "description": "Funky bowls of yuck still on my desk. Ews!",
            "parent_id": parent.id
        }
        rv = self.app.post(
            '/api/category',
            data=json.dumps(c),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(parent.id, response["parent"]["id"])
        self.assertEqual(0, response["parent"]["level"])
        self.assertEqual(1, response["level"])

    def test_update_category(self):
        c = Category(
            name="Desk Stuffs",
            description="The many stuffs on my desk",
            color="#ABC222")
        db.session.add(c)
        db.session.commit()
        c.description = "A new better description of the crap all over my " \
                        "desk right now.  It's a mess."
        rv = self.app.put(
            '/api/category/%i' % c.id,
            data=json.dumps(CategorySchema().dump(c).data),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(c.description, response["description"])

    def test_category_has_parents_color_if_not_set(self):
        parent = Category(
            name="Beer",
            description="There are lots of types of beer.",
            color="#A52A2A")
        db.session.add(parent)
        db.session.commit()
        c = {
            "name": "Old bowls",
            "description": "Funky bowls of yuck still on my desk. Ews!",
            "parent_id": parent.id
        }
        rv = self.app.post(
            '/api/category',
            data=json.dumps(c),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual("#A52A2A", response["color"])

    def test_category_has_ordered_children(self):
        parent = Category(
            name="Beer",
            description="There are lots of types of beer.",
            color="#A52A2A")
        c1 = Category(
            name="Zinger",
            description="Orange flavoered crap beer, served with shame "
                        "and an umbrella",
            parent=parent)
        c2 = Category(
            name="Ale",
            description="Includes the Indian Pale Ale, which comes in "
                        "120,000 different varieties now.",
            parent=parent)
        c3 = Category(
            name="Hefeweizen",
            description="Smells of bananas, best drunk in a German garden",
            parent=parent)

        db.session.add_all([parent, c1, c2, c3])
        db.session.commit()
        rv = self.app.get(
            '/api/category/%i' % parent.id, content_type="application/json")
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
        rv = self.app.put(
            '/api/icon/%i' % i.id,
            data=json.dumps(IconSchema().dump(i).data),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual("Happier Coconuts", i.name)

    def test_upload_icon(self):
        i = {"name": "Happy Coconuts"}
        rv = self.app.post(
            '/api/icon', data=json.dumps(i), content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        icon_id = response["id"]

        rv = self.app.put(
            '/api/icon/%i' % icon_id,
            data=dict(image=(BytesIO(b"hi everyone"), 'test.svg'), ))
        self.assertSuccess(rv)
        data = json.loads(rv.get_data(as_text=True))
        self.assertEqual(
            "https://s3.amazonaws.com/edplatform-ithriv-test-bucket/"
            "ithriv/icon/%i.svg" % icon_id, data["url"])

    def test_set_category_icon(self):
        category = Category(
            name="City Museum",
            description="A wickedly cool amazing place in St Louis",
            color="blue")
        db.session.add(category)
        icon = Icon(name="Cool Places")
        db.session.add(icon)
        db.session.commit()
        category.icon_id = icon.id
        rv = self.app.post(
            '/api/category',
            data=json.dumps(CategorySchema().dump(category).data),
            content_type="application/json")
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
        rv = self.app.post(
            '/api/category',
            data=json.dumps(ThrivTypeSchema().dump(thrivtype).data),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(icon.id, response["icon_id"])
        self.assertEqual("Cool Places", response["icon"]["name"])

    def logged_in_headers(self, user=None):
        # If no user is provided, generate a dummy Admin user
        if not user:
            user = User(
                id=7,
                eppn=self.admin_eppn,
                display_name="Admin",
                email=self.admin_eppn,
                role="Admin")

        # Add institution if it's not already in database
        domain = user.email.split("@")[1]
        institution = self.construct_institution(name=domain, domain=domain)

        # Add user if it's not already in database
        if user.eppn:
            existing_user = User.query.filter_by(eppn=user.eppn).first()
        if not existing_user and user.email:
            existing_user = User.query.filter_by(email=user.email).first()

        if not existing_user:
            user.institution_id = institution.id
            db.session.add(user)
            db.session.commit()

        headers = {
            'eppn': user.eppn,
            'givenName': user.display_name,
            'mail': user.email
        }

        rv = self.app.get(
            "/api/login",
            headers=headers,
            follow_redirects=True,
            content_type="application/json")

        db_user = User.query.filter_by(eppn=user.eppn).first()
        return dict(
            Authorization='Bearer ' + db_user.encode_auth_token().decode())

    def test_create_user_with_password(self, display_name="Peter Dinklage", eppn="tyrion@got.com",
                                       email="tyrion@got.com", role="User", password="peterpass"):
        data = {
            "display_name": display_name,
            "eppn": eppn,
            "email": email,
            "role": role
        }
        rv = self.app.post(
            '/api/user',
            data=json.dumps(data),
            follow_redirects=True,
            headers=self.logged_in_headers(),
            content_type="application/json")
        self.assertSuccess(rv)
        user = User.query.filter_by(eppn=eppn).first()
        user.password = password
        db.session.add(user)
        db.session.commit()

        rv = self.app.get(
            '/api/user/%i' % user.id,
            content_type="application/json",
            headers=self.logged_in_headers())
        response = json.loads(rv.get_data(as_text=True))
        self.assertEqual(display_name, response["display_name"])
        self.assertEqual(email, response["email"])
        self.assertEqual(role, response["role"])
        self.assertEqual(True, user.is_correct_password(password))
        return user

    def test_sso_login_sets_institution_to_uva_correctly(self):
        inst_obj = ThrivInstitution(name="UVA", domain='virginia.edu')
        db.session.add(inst_obj)
        user = User(
            eppn="dhf8r@virginia.edu",
            display_name='Dan Funk',
            email='dhf8r@virginia.edu')
        self.logged_in_headers(user)
        dbu = User.query.filter_by(eppn='dhf8r@virginia.edu').first()
        self.assertIsNotNone(dbu)
        self.assertIsNotNone(dbu.institution)
        self.assertEqual('UVA', dbu.institution.name)

    def test_sso_login_with_existing_email_address_doesnt_bomb_out(self):
        # There is an existing user in the database, but it has no eppn.
        user = User(
            display_name='Engelbert Humperdinck', email='ehb11@virginia.edu')
        db.session.add(user)
        db.session.commit()
        # Log in via sso as a user with an eppn that matches an
        # existing users email address.
        user2 = User(
            eppn="ehb11@virginia.edu",
            display_name='Engelbert Humperdinck',
            email='ehb11@virginia.edu')

        headers = {
            'eppn': user.eppn,
            'givenName': user.display_name,
            'mail': user.email
        }

        rv = self.app.get(
            "/api/login",
            headers=headers,
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)

        db_user = User.query.filter_by(eppn=user.eppn).first()
        auth_token = dict(
            Authorization='Bearer ' + db_user.encode_auth_token().decode())

        # No errors occur when this user logs in, and we only have one
        # account with that email address.
        self.assertEqual(
            1, len(
                User.query.filter(User.email == 'ehb11@virginia.edu').all()))

    def test_login_user(self, display_name="Kit Harington", eppn="jonsnow@got.com",
                                       email="jonsnow@got.com", role="User", password="y0ukn0wn0th!ng"):
        user = self.test_create_user_with_password(display_name=display_name, eppn=eppn,
                                       email=email, role=role, password=password)
        data = {"email": email, "password": password}

        # Login shouldn't work with email not yet verified
        rv = self.app.post(
            '/api/login_password',
            data=json.dumps(data),
            content_type="application/json")
        self.assertEqual(400, rv.status_code)

        user.email_verified = True
        rv = self.app.post(
            '/api/login_password',
            data=json.dumps(data),
            content_type="application/json")
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertIsNotNone(response["token"])

        return user

    def test_logout_user(self, display_name="Emilia Clarke", eppn="daeneryst@got.com",
                                       email="daeneryst@got.com", role="User", password="5t0rmb0r~"):
        user = self.test_login_user(display_name=display_name, eppn=eppn,
                                       email=email, role=role, password=password)
        rv = self.app.delete('/api/session',
            content_type="application/json",
            headers=self.logged_in_headers(user))
        self.assertSuccess(rv)
        response = json.loads(rv.get_data(as_text=True))
        self.assertIsNone(response)

        return user

    def test_admin_get_users(self):
        rv = self.app.get('/api/user')
        self.assertEqual(rv.status, "401 UNAUTHORIZED")

        rv = self.app.get(
            '/api/user',
            content_type="application/json",
            headers=self.logged_in_headers())
        self.assertSuccess(rv)

    def test_admin_update_user(self):
        user = self.test_create_user_with_password()
        user.name = "The Artist Formerly Known As Prince"
        rv = self.app.put(
            '/api/user/%i' % user.id,
            data=json.dumps(UserSchema().dump(user).data),
            content_type="application/json")
        self.assertEqual(rv.status, "401 UNAUTHORIZED")

        rv = self.app.put(
            '/api/user/%i' % user.id,
            data=json.dumps(UserSchema().dump(user).data),
            content_type="application/json",
            headers=self.logged_in_headers())
        self.assertSuccess(rv)

    def test_admin_delete_user(self):
        admin_user = self.construct_admin_user()
        user = self.construct_user()
        rv = self.app.delete(
            '/api/user/%i' % user.id, content_type="application/json")
        self.assertEqual(rv.status, "401 UNAUTHORIZED")

        rv = self.app.delete(
            '/api/user/%i' % user.id,
            content_type="application/json",
            headers=self.logged_in_headers(user=admin_user))
        self.assertSuccess(rv)

    def decode(self, encoded_words):
        """
        Useful for checking the content of email messages
        (which we store in an array for testing)
        """
        encoded_word_regex = r'=\?{1}(.+)\?{1}([b|q])\?{1}(.+)\?{1}='
        charset, encoding, encoded_text = re.match(encoded_word_regex,
                                                   encoded_words).groups()
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
        self.assertEqual("iTHRIV: Confirm Email",
                         self.decode(TEST_MESSAGES[-1]['subject']))

        logs = EmailLog.query.all()
        self.assertIsNotNone(logs[-1].tracking_code)

    def test_forgot_password_sends_email(self, display_name="Gemma Whelan", eppn="yara-greyjoy@got.com",
                                       email="yara-greyjoy@got.com", role="User", password="AshaKraken"):
        user = self.test_create_user_with_password(display_name=display_name, eppn=eppn,
                                       email=email, role=role, password=password)
        message_count = len(TEST_MESSAGES)
        data = {"email": user.email}
        rv = self.app.post(
            '/api/forgot_password',
            data=json.dumps(data),
            content_type="application/json")
        self.assertSuccess(rv)
        self.assertGreater(len(TEST_MESSAGES), message_count)
        self.assertEqual("iTHRIV: Password Reset Email",
                         self.decode(TEST_MESSAGES[-1]['subject']))

        logs = EmailLog.query.all()
        self.assertIsNotNone(logs[-1].tracking_code)

    def test_consult_request_sends_email(self):
        # This test will send two emails. One confirming
        # that the user is created:
        user = self.test_create_user_with_password()
        message_count = len(TEST_MESSAGES)
        data = {"user_id": user.id}
        # ...And a second email requesting the consult:
        rv = self.app.post(
            '/api/consult_request',
            data=json.dumps(data),
            headers=self.logged_in_headers(user),
            content_type="application/json")
        self.assertSuccess(rv)
        self.assertGreater(len(TEST_MESSAGES), message_count)
        self.assertEqual("iTHRIV: Consult Request",
                         self.decode(TEST_MESSAGES[-1]['subject']))

        logs = EmailLog.query.all()
        self.assertIsNotNone(logs[-1].tracking_code)

    def test_approval_request_sends_email(self):
        # This test will send three emails.
        # 1. First email confirms that the user is created:
        user = self.construct_user()
        admin_user = self.construct_admin_user()
        message_count = len(TEST_MESSAGES)

        # Create the resource
        resource = self.construct_resource()

        data = {"user_id": user.id, "resource_id": resource.id}

        # Request approval
        rv = self.app.post(
            '/api/approval_request',
            data=json.dumps(data),
            headers=self.logged_in_headers(user=user),
            content_type="application/json")
        self.assertSuccess(rv)
        self.assertGreater(len(TEST_MESSAGES), message_count)
        logs = EmailLog.query.all()

        # 2. Second email goes to the admin requesting approval:
        self.assertEqual("iTHRIV: Resource Approval Request",
                         self.decode(TEST_MESSAGES[-2]['Subject']))
        self.assertEqual(admin_user.email, TEST_MESSAGES[-2]['To'])
        self.assertIsNotNone(logs[-2].tracking_code)

        # 3. Third email goes to the user confirming
        # receipt of the approval request:
        self.assertEqual("iTHRIV: Resource Approval Request Confirmed",
                         self.decode(TEST_MESSAGES[-1]['Subject']))
        self.assertEqual(user.email, TEST_MESSAGES[-1]['To'])
        self.assertIsNotNone(logs[-1].tracking_code)

    def test_get_current_participant(self):
        """ Test for the current participant status """
        # Create the user
        headers = {
            'eppn': self.test_eppn,
            'givenName': 'Daniel',
            'mail': 'dhf8r@virginia.edu'
        }
        rv = self.app.get(
            "/api/login",
            headers=headers,
            follow_redirects=True,
            content_type="application/json")
        # Don't check success, login does a redirect to the
        # front end that might not be running.
        # self.assert_success(rv)

        user = User.query.filter_by(eppn=self.test_eppn).first()

        # Now get the user back.
        response = self.app.get(
            '/api/session',
            headers=dict(
                Authorization='Bearer ' + user.encode_auth_token().decode()))
        self.assertSuccess(response)
        return json.loads(response.data.decode())

    def searchUsers(self, query, user=None):
        '''Executes a query, returning the resulting search results object.'''
        rv = self.app.get(
            '/api/user',
            query_string=query,
            follow_redirects=True,
            content_type="application/json",
            headers=self.logged_in_headers(user=user))
        self.assertSuccess(rv)
        return json.loads(rv.get_data(as_text=True))

    def test_find_users_respects_pageSize(self):
        self.construct_various_users()

        query = {
            'filter': '',
            'sortOrder': 'asc',
            'pageNumber': '0',
            'pageSize': '1'
        }
        response = self.searchUsers(query)
        self.assertEqual(1, len(response['items']))

        query = {
            'filter': '',
            'sortOrder': 'asc',
            'pageNumber': '0',
            'pageSize': '2'
        }
        response = self.searchUsers(query)
        self.assertEqual(2, len(response['items']))

    def test_find_users_respects_pageNumber(self):
        self.construct_various_users()
        self.assertEqual(3, len(db.session.query(User).all()))

        query = {
            'filter': '',
            'sort': 'display_name',
            'sortOrder': 'asc',
            'pageNumber': '0',
            'pageSize': '2'
        }
        response = self.searchUsers(query)
        self.assertEqual(2, len(response['items']))
        self.assertEqual(3, response['total'])
        self.assertEqual('Big Bird', response['items'][0]['display_name'])

        query['pageNumber'] = 1
        response = self.searchUsers(query)
        self.assertEqual(1, len(response['items']))
        self.assertEqual('Oscar the Grouch',
                         response['items'][0]['display_name'])

        query['pageNumber'] = 2
        response = self.searchUsers(query)
        self.assertEqual(0, len(response['items']))

    def test_find_users_respects_filter(self):
        self.construct_various_users()
        query = {
            'filter': 'big',
            'sortOrder': 'asc',
            'pageNumber': '0',
            'pageSize': '20'
        }
        response = self.searchUsers(query)
        self.assertEqual(1, len(response['items']))

        query = {
            'filter': 'Grouch',
            'sortOrder': 'asc',
            'pageNumber': '0',
            'pageSize': '20'
        }
        response = self.searchUsers(query)
        self.assertEqual(1, len(response['items']))

        query = {
            'filter': '123',
            'sortOrder': 'asc',
            'pageNumber': '0',
            'pageSize': '20'
        }
        response = self.searchUsers(query)
        self.assertEqual(1, len(response['items']))

        query = {
            'filter': 'Ididnputthisinthedata',
            'sortOrder': 'asc',
            'pageNumber': '0',
            'pageSize': '20'
        }
        response = self.searchUsers(query)
        self.assertEqual(0, len(response['items']))

    def test_find_users_orders_results(self):
        db.session.query(User).delete()
        users_before = db.session.query(User).all()
        self.assertEqual(len(users_before), 0)

        users = self.construct_various_users()
        users_next = db.session.query(User).all()
        self.assertEqual(len(users_next), 3)

        admin_user = users[1]
        self.assertEqual(admin_user.role, "Admin")

        normal_user = users[0]
        self.assertEqual(normal_user.role, "User")

        q1 = {
            'filter': '',
            'sort': 'display_name',
            'sortOrder': 'asc',
            'pageNumber': '0',
            'pageSize': '20'
        }
        response = self.searchUsers(query=q1, user=admin_user)
        # users_after1 = db.session.query(User).all()
        # self.assertEqual(len(users_after1), 3)

        self.assertEqual(admin_user.display_name,
                         response['items'][0]['display_name'])

        q2 = {
            'filter': '',
            'sort': 'display_name',
            'sortOrder': 'desc',
            'pageNumber': '0',
            'pageSize': '20'
        }
        response = self.searchUsers(query=q2, user=admin_user)

        # users_after2 = db.session.query(User).all()
        # self.assertEqual(len(users_after2), 3)

        self.assertEqual(normal_user.display_name,
                         response['items'][0]['display_name'])

    def test_resource_list_limits_to_10_by_default(self):
        for i in range(20):
            self.construct_resource()
        rv = self.app.get(
            '/api/resource',
            follow_redirects=True,
            content_type="application/json",
            headers=self.logged_in_headers())
        self.assertSuccess(rv)
        result = json.loads(rv.get_data(as_text=True))
        self.assertEqual(10, len(result))

        rv = self.app.get(
            '/api/resource',
            follow_redirects=True,
            query_string={'limit': '5'},
            content_type="application/json",
            headers=self.logged_in_headers())
        self.assertSuccess(rv)
        result = json.loads(rv.get_data(as_text=True))
        self.assertEqual(5, len(result))

    def test_private_resources_not_listed_for_anonymous_user(self):
        resources = self.construct_various_resources()
        self.assertEqual(16, len(resources))

        rv = self.app.get(
            '/api/resource',
            query_string={'limit': '16'},
            follow_redirects=True,
            content_type="application/json")
        self.assertSuccess(rv)
        result = json.loads(rv.get_data(as_text=True))

        # Should only return 4 approved, non-private resources
        # out of a total 16 resources
        self.assertEqual(4, len(result))

        # Search endpoint should return the same number of results
        search_results = self.search_anonymous({})
        self.assertEqual(len(result), search_results['total'])

    def test_private_resources_for_general_user(self):
        institution = self.construct_institution(
            name="General Leia's Institute for Social Justice",
            domain="resistance.org")
        self.construct_various_resources(institution=institution)

        u = self.construct_user(
            eppn="FN-2187@resistance.org",
            display_name="Finn",
            email="FN-2187@resistance.org",
            institution=institution)

        rv = self.app.get(
            '/api/resource',
            query_string={'limit': '16'},
            follow_redirects=True,
            content_type="application/json",
            headers=self.logged_in_headers(user=u))
        self.assertSuccess(rv)
        result = json.loads(rv.get_data(as_text=True))

        # Should only return 6 approved resources (4 approved non-private,
        # 2 approved private from user's own institution) out of a total
        # 16 resources
        self.assertEqual(6, len(result))

        # Search endpoint should return the same number of results
        search_results = self.search({}, user=u)
        self.assertEqual(len(result), search_results['total'])

    def test_private_resources_listed_for_admin(self):
        institution = self.construct_institution(
            name="Alderaanian Association of Astrological Anthropology",
            domain="alderaan.gov")

        u = self.construct_admin_user(
            eppn="princess.leia@alderaan.gov",
            display_name="Princess Leia Organa",
            email="princess.leia@alderaan.gov",
            institution=institution)

        self.construct_various_resources(institution=institution)

        rv = self.app.get(
            '/api/resource',
            query_string={'limit': '16'},
            follow_redirects=True,
            content_type="application/json",
            headers=self.logged_in_headers(user=u))
        self.assertSuccess(rv)
        result = json.loads(rv.get_data(as_text=True))

        # Should return only 12 out of 16 resources, since 4 are
        # private to a different institution
        self.assertEqual(12, len(result))

        # Search endpoint should return the same number of results
        search_results = self.search({}, user=u)
        self.assertEqual(len(result), search_results['total'])

    def test_admin_owner_should_be_able_to_view_their_own_resources(self):
        institution = self.construct_institution(
            name="University of Galactic Domination",
            domain="empire.galaxy.gov")

        u = self.construct_admin_user(
            eppn="emperor@empire.galaxy.gov",
            display_name="Emperor Palpatine",
            email="emperor@empire.galaxy.gov",
            institution=institution)

        resources = self.construct_various_resources(
            institution=institution, owner=u.email)
        self.assertEqual(16, len(resources))

        rv = self.app.get(
            '/api/resource',
            query_string={'limit': '16'},
            follow_redirects=True,
            content_type="application/json",
            headers=self.logged_in_headers(user=u))
        self.assertSuccess(rv)
        result = json.loads(rv.get_data(as_text=True))

        # General user owns 8 of the 16 resources, half of
        # which are from a different institution.
        # They can see all but the 2 private resources from
        # a different institution that they don't own.
        self.assertEqual(14, len(result))

        # Search endpoint should return the same number of results
        search_results = self.search(query={}, user=u)
        self.assertEqual(len(result), search_results['total'])

    def test_user_owner_should_always_be_able_to_view_their_own_resources(
            self):
        institution = self.construct_institution(
            name="University of Galactic Domination",
            domain="senate.galaxy.gov")

        u = self.construct_user(
            eppn="jjb@senate.galaxy.gov",
            display_name="Jar Jar Binks",
            email="jjb@senate.galaxy.gov",
            institution=institution)

        resources = self.construct_various_resources(institution=institution, owner=u.email)
        self.assertEqual(16, len(resources))

        rv = self.app.get(
            '/api/resource',
            query_string={'limit': '16'},
            follow_redirects=True,
            content_type="application/json",
            headers=self.logged_in_headers(user=u))
        self.assertSuccess(rv)
        result = json.loads(rv.get_data(as_text=True))

        # General user owns only 8 of the 16 resources, but can also
        # see the 3 approved resources from other institutions
        self.assertEqual(11, len(result))

        # Search endpoint should return the same number of results
        search_results = self.search({}, user=u)
        self.assertEqual(len(result), search_results['total'])

    def test_user_email_is_case_insensitive(self):
        password = "s00p3rS3cur3"
        email = email="Darth.maul@sith.net"
        user = self.test_logout_user(
            display_name="Darth Maul",
            eppn="DARTH.MAUL@sith.net",
            email=email,
            role="User",
            password=password
        )

        emails = [
            "darth.maul@sith.net",
            "DARTH.MAUL@SITH.NET",
            "Darth.Maul@Sith.Net",
            "dArTh.mAuL@sItH.nEt"
        ]

        for email_variant in emails:
            data = {"email": email_variant, "password": password}

            # Should be able to log in successfully
            rv = self.app.post(
                '/api/login_password',
                data=json.dumps(data),
                content_type="application/json")
            self.assertSuccess(rv)
            response = json.loads(rv.get_data(as_text=True))
            self.assertIsNotNone(response["token"])

            # Log out
            rv = self.app.delete('/api/session',
                content_type="application/json",
                headers=self.logged_in_headers(user))
            self.assertSuccess(rv)

            # Make sure user can retrieve password
            message_count = len(TEST_MESSAGES)
            rv = self.app.post(
                '/api/forgot_password',
                data=json.dumps({"email": email_variant}),
                content_type="application/json")
            self.assertSuccess(rv)
            self.assertGreater(len(TEST_MESSAGES), message_count)
            self.assertEqual("iTHRIV: Password Reset Email", self.decode(TEST_MESSAGES[-1]['subject']))

            logs = EmailLog.query.all()
            self.assertIsNotNone(logs[-1].tracking_code)

if __name__ == '__main__':
    unittest.main()
