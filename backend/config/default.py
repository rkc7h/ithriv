NAME = "iThriv Resource Database"
VERSION = "0.1"

CORS_ENABLED = False
DEVELOPMENT = True
TESTING = True
SQLALCHEMY_DATABASE_URI = "postgresql://ed_user:ed_pass@localhost/ithriv"
PHOTO_SERVE_URL = "https://ithriv.s3.aws.com"
S3_INCOMING_BUCKET_NAME = 'edplatform-ithriv-test-bucket'

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