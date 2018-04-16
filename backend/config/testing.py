import os
basedir = os.path.abspath(os.path.dirname(__file__))

SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join("./", "TEST_DB")
TESTING = True
CORS_ENABLED = True
DEBUG = False
DEVELOPMENT = False

ELASTIC_SEARCH = {
    "index_prefix": "ithriv_test",
    "hosts": ["localhost"],
    "port": 9200,
    "timeout": 20,
    "verify_certs": False,
    "use_ssl": False,
    "http_auth_user": "",
    "http_auth_pass": ""
}