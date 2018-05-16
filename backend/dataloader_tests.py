# Set enivoronment variable to testing before loading.

import unittest
import os
import json

from app.model.availability import Availability

os.environ["APP_CONFIG_FILE"] = '../config/testing.py'

from app.model.resource import ThrivResource
from app.model.type import ThrivType
from app.model.institution import ThrivInstitution
from app import app, db, elastic_index, data_loader


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

