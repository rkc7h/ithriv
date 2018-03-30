from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
import click

app = Flask(__name__, instance_relative_config=True)

# Load the default configuration
app.config.from_object('config.default')
# Load the configuration from the instance folder
app.config.from_pyfile('config.py')

# Database Configuration
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Migrations
migrate = Migrate(app, db)

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


from app import views
