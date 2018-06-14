# Introduction
This is the API for iTHRIV, a Translational Medicine service that provides a searchable, browsable index of resources avaialable to reseachers, clinicians and the public, to improve access and improve health care in our community.

## Platform
This is a Python3 / Flask based api. It relies on a Relational Database for storing and organizing resources.  It uses Elastic Search as a full text search engine for locating resources.  It will use Scrapy to crawl a currated list of related websites.

### Prerequisites
#### Python 3 and python3-dev, and some cryptography libraries
MacOS:
```BASH
$ brew install python
```

Debian:
```bash
sudo apt-get install python3 python3-dev
sudo apt-get install -y libssl-dev libffi-dev
```

#### PostgreSQL
MacOS:
```BASH
$ brew install postgres
```

Debian:
```BASH
$ apt-get install postgresql postgresql-client
```

#### ElasticSearch
MacOS
```BASH
$ brew install elasticsearch
```

Debian:
[follow these instructions](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html).

#### Angular
```BASH
$ npm install -g @angular/cli
```

### Project Setup
* Please use Python 3's virtual environment setup, and install the dependencies in requirements.txt
```bash
cd backend
pip3 install -r requirements.txt
python3 -m venv python-env
source python-env/bin/activate
```

* Consider using an auto-environment like pythons autoenv, and creating a shell script that gets executed whenever you enter the backend directory. My .env file looks like this (but isn't committed as you might have different needs)
```
source python-env/bin/activate
export FLASK_APP=./app/__init__.py
```

## Database Setup
### Create a Database
*NOTE:* The configuration is currently set up to use "ed_pass" as a password.  You will be promoted to enter a password when you connect.
```BASH
$ sudo su postgres
$ createuser --no-createdb --no-superuser --pwprompt ed_user
$ createdb ithriv -O ed_user ed_platform
$ exit
```
If you are using Ubuntu you will likely need to [enable PSQL](https://help.ubuntu.com/community/PostgreSQL#Managing_users_and_rights) to manage its own users.

Alternatively, you can install [pgAdmin](https://www.pgadmin.org/) and use the GUI to add the new `ed_user` user and `ithriv` database.

### Update the Database
You will need to update your database each time you return to do a pull to make sure all the migrations are run.  Use this:
```BASH
$ flask db upgrade
```

### Update Data Models
Each time you modify your data models you will need to create new migrations. The following command will compare the database to the code and create new migrations as needed.  You can edit this newly generated file - it will show up under migrations/versions
```BASH
$ flask db migrate
```

### Load in the seed data
This will pull in initial values into the database.
```BASH
$ flask initdb
$ flask initindex
```

## Add a config file
In the `backend` directory, execute the following command:
```BASH
$ mkdir instance && cp -r config instance/config
```

## Run the app
Execute the following at the top level of the repository to start PostgreSQL, ElasticSearch, flask, and Angular all in one command:
```BASH
$ ./start.sh
```

Alternatively, you could start each of the services individually, using the commands below.

### Start PostgreSQL
```BASH
$ pg_ctl -D /usr/local/var/postgres start
```

### Start ElasticSearch
```BASH
$ elasticsearch
```

### Start the backend app
In the `backend` directory, execute the following command:
```BASH
$ flask run
```

### Start the frontend app
In the `frontend` directory, execute the following commands:
```BASH
$ npm install
$ ng serve
```

## Stopping the app
Execute the following at the top level of the repository to stop all running services:
```BASH
$ ./stop.sh
```


## Maintenance

### Clear out the database
This will remove all data from the database.
```BASH
$ flask cleardb
```

### Clear indexes
Delete all information from the ElasticSearch Index.
```BASH
$ flask clearindex
```

### Reseed database
Remove all data and recreate it from the example data files.
```BASH
$ flask reset
```

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

Testing github/slack integration.