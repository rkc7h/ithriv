from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
import click
import os
from flask_marshmallow import Marshmallow

from app.elastic_index import ElasticIndex

app = Flask(__name__, instance_relative_config=True)

# Load the default configuration
app.config.from_object('config.default')
# Load the configuration from the instance folder
app.config.from_pyfile('config.py')
# Load the file specified by the APP_CONFIG_FILE environment variable
# Variables defined here will override those in the default configuration
if "APP_CONFIG_FILE" in os.environ:
    app.config.from_envvar('APP_CONFIG_FILE')

# Enable CORS
if(app.config["CORS_ENABLED"]) :
    cors = CORS(app, resources={r"*": {"origins": "*"}})

# Database Configuration
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Flask-Marshmallow provides HATEOAS links
ma = Marshmallow(app)

# Database Migrations
migrate = Migrate(app, db)

# Search System
elastic_index = ElasticIndex(app)

@app.cli.command()
@click.argument("filename")
def initdb(filename):
    """Initialize the database."""
    click.echo('Init the db with %s' % filename)
    from app import data_loader
    data_loader = data_loader.DataLoader(db, filename)
    data_loader.load_resources()

@app.cli.command()
def cleardb():
    """Delete all information from the database."""
    click.echo('Clearing out the database')
    from app import data_loader
    data_loader = data_loader.DataLoader(db,"")
    data_loader.clear()

@app.cli.command()
def index_resources():
    """Delete all information from the database."""
    click.echo('Loading data into Elastic Search')
    from app import data_loader
    data_loader = data_loader.DataLoader(db,"")
    data_loader.build_index()


from app import views
