# Introduction
This is the API for iTHRIV, a Translational Medicine service that
provides a searchable, browsable index of resources avaialable to
reseaches, clinicians and the public, to improve access and improve
health care in our community.

## Platform
This is a Python3 / Flask based api.
It relies on a Relational Database for storing and organizing
resources.  It uses Elastic Search as a full text search engine for
locating resources.  It will use Nutch to crawl a currated list of
related websites.


## Best Practices
There are a few things I hope to do consistently for this project,
to avoid some pitfalls from the Cadre Academy site.  When adding code
please follow these guidelines:

### Write tests.
Don't commit code that doesn't have at least some basic testing of the
new functionality.  Don't commit code without all tests passing.

### Project Setup
* Please use Python 3's virtual environment setup, and install the
dependencies in requirements.txt
```
python3 -m venv python-env
source python-env/bin/activate
```

* Consider using an auto-environment like pythons autoenv, and creating
a shell script that gets executed whenever you enter the backend directory.
My .env file looks like this (but isn't committed as you might have
different needs)
```
source python-env/bin/activate
export FLASK_APP=./app/__init__.py
```

### Database calls
* Favor db.session.query over using the models for these calls.
```
db.session.query( ...
```
not
```
models.Resrouce.query( ...
```
