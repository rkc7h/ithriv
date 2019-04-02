# Introduction
This is the API for iTHRIV, a Translational Medicine service that provides a searchable, browsable index of resources avaialable to reseachers, clinicians and the public, to improve access and improve health care in our community.

## Platform
This is a Python3 / Flask based api. It relies on a Relational Database for storing and organizing resources.  It uses Elastic Search as a full text search engine for locating resources.  It will use Scrapy to crawl a currated list of related websites.

### Prerequisites
#### Python 3 and python3-dev, and some cryptography libraries
MacOS:
```BASH
brew install python
```

Debian:
```bash
sudo apt-get install python3 python3-dev
sudo apt-get install -y libssl-dev libffi-dev
```

#### PostgreSQL
* MacOS:
[Download and install Postgres.app](https://postgresapp.com). This will install `postgres`, along with the command-line tools, including `psql`, `pg_ctl`, and others. Then update your `PATH` variable to look in the Postgres.app `bin` directory for the relevant Postgres CLI tools.
```BASH
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"
```

* Debian:
```BASH
brew install Postgres or apt-get install postgresql postgresql-client
```

#### ElasticSearch
MacOS
```BASH
brew install elasticsearch
brew install libmagic
```

Debian:
[follow these instructions](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html).

### Project Setup
* Please use Python 3's virtual environment setup, and install the dependencies in requirements.txt
```bash
cd backend
python3 -m venv python-env
source python-env/bin/activate
pip3 install -r requirements.txt
```

## Database Setup
### Create a Database
*NOTE:* The configuration is currently set up to use "ed_pass" as a password.  You will be promoted to enter a password when you connect.
* MacOS:
```BASH
postgres -D /usr/local/var/postgres
createuser --createdb --pwprompt ed_user
```

* Debian
```BASH
sudo su postgres
postgres -D /usr/local/var/postgres
createuser --createdb --pwprompt ed_user
exit
```
If you are using Ubuntu you will likely need to [enable PSQL](https://help.ubuntu.com/community/PostgreSQL#Managing_users_and_rights) to manage its own users.
```

### Starting Elastic Search
Elastic Search (on Debian at least) may not start up automatically.  In these cases, you can start it
when you need it by running:
```BASH
sudo service elasticsearch start
```

### Start ElasticSearch
```BASH
elasticsearch
```

## Add a config file
In the `backend` directory, execute the following command:
```BASH
mkdir instance && cd instance && ln -s ../config/local.py settings.py && cd ..
create a folder called "ithriv" under /etc/private
Place  a copy of connections.json in this folder (will need to get a copy from app/sys admin)
export FLASK_APP=app/__init__.py
```

### Set up your connection to S3
Create a .aws directory in your home direction
create a file called "credentials"
Place your s3 credentials in this file (will need to get a copy from someone else)

### Create, initalize and Load in the seed data
This will pull in initial values into the database.
```BASH
flask setup or flask resetapp
```

### Start the backend app
In the `backend` directory, execute the following command:
```BASH
flask run
```

### Update the Database
You will need to update your database each time you return to do a pull to make sure all the migrations are run. In the `backend` directory, execute the following command:
```BASH
flask db upgrade (to check run flask db migrate and should see no changed detected)
```

### Update Data Models
Each time you modify your data models you will need to create new migrations. The following command will compare the database to the code and create new migrations as needed.  You can edit this newly generated file - it will show up under migrations/versions
```BASH
flask db migrate
```

## Run the app
Execute the following at the top level of the repository to start PostgreSQL, ElasticSearch, flask, and Angular all in one command:
```BASH
./start.sh
```

Alternatively, you could start each of the services individually, using the commands below.

### Start PostgreSQL
```BASH
pg_ctl -D /usr/local/var/postgres start
```

### Database Reset
If you encounter errors with the database, you can blow it away completely and reset with the following commands in PSQL:
```SQL
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
COMMENT ON SCHEMA public IS 'standard public schema';
```

#### Angular
```BASH
npm install -g @angular/cli
```

### Start the frontend app
In the `frontend` directory, execute the following commands:
```BASH
npm install
ng serve
```

### Stopping the app
Execute the following at the top level of the repository to stop all running services:
```BASH
./stop.sh
```

### Setting up Mailtrap
To test email integration set up an account with [Mailtrap](https://mailtrap.io/)
In your instance config, set your sname and password.
You can find these values in your Mailtrap account in the settings portion of your inbox; you will not find these values in your general account settings as the username and password are specific to each inbox you create.

MAIL_USERNAME = "numbersandletters"
MAIL_PASSWORD = "lettersandnumbers"

Also note that mail is handled differently for tests. Make sure that your instance config has

TESTING = False

## Maintenance

### Clear out the database, indexes, and reseed the database
This will remove all data from the database, delete all information from the ElasticSearch Index, and remove all data and recreate it from the example data files. In the `backend` directory, execute the following command:
```BASH
source python-env/bin/activate
export FLASK_APP=./app/__init__.py
flask cleardb
flask clearindex
flask db upgrade
flask db migrate
flask loadicons
flask initdb
flask initindex
or 
flask teardownapp
flask setupapp
```

### Migration Conflicts
If you find yourself with conflicting migrations, it might be appropriate to resolve with a merge:
```bash
flask db merge -m "merge cc4610a6ece3 and 2679ef53e0bd" cc4610a6ece3 2679ef53e0bd
```
This will auto-generate a new migration that ties the streams together.

## Best Practices
There are a few things I hope to do consistently for this project, to avoid some pitfalls from the [Cadre Academy site](https://education.cadre.virginia.edu/#/home).  When adding code please follow these guidelines:

### Write tests.
Don't commit code that doesn't have at least some basic testing of the new functionality.  Don't commit code without all tests passing.


### Database calls
* Favor db.session.query over using the models for these calls.
```
db.session.query( ...
```
not
```
models.Resrouce.query( ...
```


### Security / Authentication
This will become increasingly complicated, so check back here often.
At present the system can handle single sign on (SSO) authentication through Shibboleth via a
connector on the apache web server that looks for headers we know are provided by the University
of Virginia.  This will change in the future as we migrate to using a OnConnect which will allow
connections with more institutions.  We'll also need to offer direct log-ins for community users.

Once credentials are established, the front end (Angular) and backend (Flask/Python) will use a JWT
token.

#### Development Mode
The SSO aspect is bypassed in Development mode.  Clicking the log in button will immediately
log you in as the user specified in your instance/config.py.
```
SSO_DEVELOPMENT_UID = 'dhf8r'
```
I've created users for primary developers in our example_data, and that information is loaded
into the database automatically with a *flask reset*  Add yourself there if needed.

#### Production Mode
In production, the redirect on the front end needs to point to the url that will direct us out to Shibboleth.  The account we use will send the user back to an API endpoint that will generate a JWT token, and then redirect again to the front end, passing that token along as a GET parameter.

- Where does the instance live on production?
The iTHRIV repo is deployed using a git hook that lives here:
```
/home/ubuntu/ithriv.git/hooks/post-receive
```

The actual instance (environment variable = `DEPLOY_ROOT`) lives here:
```
/var/www/ithriv
```

- What are the CLI commands to restart the server from SSH terminal?
```
cd /var/www/ithriv
./prod_update.sh prod
```

Secrets live here:
```
~/ithriv_config.py
```

- Where are logs stored?
SMTP (e-mail) server log:
```
/var/log/mail.log
```

Web server logs:
```
/var/log/apache2
```

System log:
```
/var/log/syslog
```

- How to push to production?
Use SSH identity key


## Testing

### Start postgres and elasticsearch for backend tests
```BASH
./test-backend.sh
```

### Run backend tests
In the `backend` directory, execute the following command:
```BASH
source python-env/bin/activate
export FLASK_APP=./app/__init__.py
python tests.py
```

### Start postgres, elasticsearch, flask, and reset database for frontend tests
```BASH
./test-frontend.sh
```

### Run frontend end-to-end tests
In the `frontend` directory, execute the following command:
```BASH
ng serve
```

Then, in a new terminal window, execute the following command in the `frontend` directory:
```BASH
ng e2e --dev-server-target=
```

### Run frontend unit tests
In the `frontend` directory, execute the following command:
```BASH
ng test
```
