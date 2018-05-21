from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
import click
import os
from flask_marshmallow import Marshmallow

from app.elastic_index import ElasticIndex
from app.rest_exception import RestException

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


# Handle errors consistently
@app.errorhandler(RestException)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

@app.errorhandler(404)
def handle_404(error):
    return handle_invalid_usage(RestException(RestException.NOT_FOUND, 404))


@app.cli.command()
def initdb():
    """Initialize the database."""
    filename = 'example_data/resources.csv'
    from app import data_loader
    data_loader = data_loader.DataLoader()
    data_loader.load_resources()
    data_loader.load_availability()
    data_loader.load_categories()

@app.cli.command()
def cleardb():
    """Delete all information from the database."""
    click.echo('Clearing out the database')
    from app import data_loader
    data_loader = data_loader.DataLoader()
    data_loader.clear()

@app.cli.command()
def initindex():
    """Delete all information from the elastic search Index."""
    click.echo('Loading data into Elastic Search')
    from app import data_loader
    data_loader = data_loader.DataLoader()
    data_loader.build_index()

@app.cli.command()
def clearindex():
    """Delete all information from the elasticsearch index"""
    click.echo('Removing Data from Elastic Search')
    from app import data_loader
    data_loader = data_loader.DataLoader()
    data_loader.clear_index()

@app.cli.command()
def reset():
    """Remove all data and recreate it from the example data files"""
    click.echo('Rebuilding the databases from the example data files')
    from app import data_loader
    data_loader = data_loader.DataLoader()
    data_loader.clear_index()
    data_loader.clear()
    data_loader.load_resources()
    data_loader.load_availability()
    data_loader.load_categories()
    data_loader.build_index()


from app import views
