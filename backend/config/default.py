NAME = "iThriv Resource Database"
VERSION = "0.1"

CORS_ENABLED = False
DEVELOPMENT = False
TESTING = True
SQLALCHEMY_DATABASE_URI = "postgresql://ed_user:ed_pass@localhost/ithriv"

# Elastic Search
ELASTIC_SEARCH = {
    "index_prefix": "ithriv",
    "hosts": ["localhost"],
    "port": 9200,
    "timeout": 20,
    "verify_certs": False,
    "use_ssl": False,
    "http_auth_user": "",
    "http_auth_pass": ""
}