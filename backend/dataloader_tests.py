# Set enivoronment variable to testing before loading.
import os
import unittest

from app import app, data_loader, db, elastic_index

from app.models import Availability, ThrivResource, User

os.environ["APP_CONFIG_FILE"] = '../config/qa.py'


class TestCase(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        db.create_all()
        self.ctx = app.test_request_context()
        self.ctx.push()
        self.loader = data_loader.DataLoader(directory="example_data")

    def tearDown(self):
        self.ctx.pop()
        db.drop_all()
        elastic_index.clear()
        pass

    def test_load_resources(self):
        self.loader.load_resources()
        self.loader.load_availability()
        self.assertTrue(db.session.query(ThrivResource).count() > 400)
        self.assertTrue(db.session.query(Availability).count() > 1000)

    def test_load_users(self):
        self.loader.load_users()
        self.assertEqual(6, db.session.query(User).count())
