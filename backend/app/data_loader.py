import sys
from flask import json
from app.model.resource import ThrivResource
from app.model.institution import ThrivInstitution
from app.model.type import ThrivType
from app import db, elastic_index
import csv

class DataLoader():
    "Loads CSV files into the database"
    file = "example_data/resources.csv"

    def __init__(self, db, filename):
        self.db = db
        if(filename):
            self.file = filename
        print("Data loader initialized")

    def load_resources(self):
        with open(self.file, newline='') as csvfile:
            reader = csv.reader(csvfile, delimiter=csv.excel.delimiter, quotechar=csv.excel.quotechar)
            next(reader, None)  # skip the headers
            for row in reader:
                type = self.get_type_by_name(row[3])
                institution = self.get_inst_by_name(row[2])
                resource = ThrivResource(id=row[0], name=row[1], description=row[12], type=type, institution=institution)
                db.session.add(resource)
                print(resource)
        db.session.commit()

    def get_type_by_name(self, type_name):
        type = db.session.query(ThrivType).filter(ThrivType.name == type_name).first()
        if (type == None):
            type = ThrivType(name = type_name)
        db.session.add(type)
        return type

    def get_inst_by_name(self, inst_name):
        institution = db.session.query(ThrivInstitution).filter(ThrivInstitution.name == inst_name).first()
        if (institution == None):
            institution = ThrivInstitution(name = inst_name)
        db.session.add(institution)
        return institution

    def build_index(self):
        elastic_index.load_resources(db.session.query(ThrivResource).all())

    def clear(self):
        db.session.query(ThrivResource).delete()
        db.session.query(ThrivInstitution).delete()
        db.session.query(ThrivType).delete()
        db.session.commit()
