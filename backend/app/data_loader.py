import sys
from flask import json

from app.model.availability import Availability
from app.model.resource import ThrivResource
from app.model.institution import ThrivInstitution
from app.model.type import ThrivType
from app import db, elastic_index
import csv

class DataLoader:
    """Loads CSV files into the database"""

    def __init__(self, directory="./example_data"):
        self.resource_file = directory + "/resources.csv"
        self.availability_file = directory + "/resource_availability.csv"
        print("Data loader initialized")

    def load_resources(self):
        with open(self.resource_file, newline='') as csvfile:
            reader = csv.reader(csvfile, delimiter=csv.excel.delimiter, quotechar=csv.excel.quotechar)
            next(reader, None)  # skip the headers
            for row in reader:
                type = self.get_type_by_name(row[3])
                institution = self.get_inst_by_name(row[2])
                resource = ThrivResource(id=row[0], name=row[1], description=row[12], type=type, institution=institution,
                                         owner=row[5], website=row[9])
                db.session.add(resource)
            print("Resources loaded.  There are now %i resources into the database." % db.session.query(ThrivResource).count())
        db.session.commit()

    def load_availability(self):
        with open(self.availability_file, newline='') as csvfile:
            reader = csv.reader(csvfile, delimiter=csv.excel.delimiter, quotechar=csv.excel.quotechar)
            header = next(reader, None)  # use headers to set availability

            for row in reader:
                try:
                    resource = self.get_resource_by_id(row[0])
                except:
                    print("Warning:  Availability references non existing resource id %s, Ignoring." % row[0])
                    continue
                for i in range(3,8):
                    is_available = row[i].lower().strip() == "yes" or row[i].lower().strip() == "true"
                    institution = self.get_inst_by_name(header[i])
                    availability = Availability(resource=resource, institution_id=institution.id,
                                                available=is_available, viewable=True)
                    db.session.add(availability)
            db.session.commit()
            print("Availability loaded.  There are now %i availability records in the database." % db.session.query(Availability).count())


    def get_resource_by_id(self, id):
        resource = db.session.query(ThrivResource).filter(ThrivResource.id == id).first()
        if resource is None:
            raise(Exception("No resource found with id: %s" % id))
        return resource

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

    def clear_index(self):
        print("Clearing the index")
        elastic_index.clear()


    def clear(self):
        db.session.query(ThrivResource).delete()
        db.session.query(ThrivInstitution).delete()
        db.session.query(ThrivType).delete()
        db.session.commit()
