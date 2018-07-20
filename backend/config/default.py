NAME = "iThriv Resource Database"
VERSION = "0.1"

CORS_ENABLED = False
DEVELOPMENT = True
TESTING = True
SQLALCHEMY_DATABASE_URI = "postgresql://ed_user:ed_pass@localhost/ithriv"
PHOTO_SERVE_URL = "https://ithriv.s3.aws.com"

# Amazon S3 Bucket for storing images.
S3 = {
    "bucket": "edplatform-ithriv-test-bucket",
    "base_url": "https://s3.amazonaws.com"
}

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

# Single Signon configuration
SECRET_KEY = 'thiv_impossibly_bad_key_stored_in_public_repo_dont_use_this_ouside_development_yuck!'
SSO_DEVELOPMENT_UID = 'dhf8r'
SSO_ATTRIBUTE_MAP = {
    'eppn': (False, 'eppn'),  # dhf8r@virginia.edu
    'uid': (False, 'uid'),  # dhf8r
    'givenName': (False, 'givenName'), # Daniel
    'mail': (False, 'email'), # dhf8r@Virginia.EDU
    'sn': (False, 'surName'), # Funk
    'affiliation': (False, 'affiliation'), #  'staff@virginia.edu;member@virginia.edu'
    'displayName': (False, 'displayName'), # Daniel Harold Funk
    'title': (False, 'title')  # SOFTWARE ENGINEER V
}

FRONTEND_AUTH_CALLBACK = "http://localhost:4200/#/session"
SSO_LOGIN_URL = '/api/login'