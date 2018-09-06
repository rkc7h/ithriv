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
SSO_DEVELOPMENT_EPPN = 'dhf8r@virginia.edu'
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

API_URL = "http://localhost:5000"
SITE_URL = "http://localhost:4200"
FRONTEND_AUTH_CALLBACK = SITE_URL + "/#/session"
FRONTEND_EMAIL_RESET = SITE_URL + "/#/reset_password/"
SSO_LOGIN_URL = '/api/login'

MAIL_SERVER = 'smtp.mailtrap.io'
MAIL_PORT = 25
MAIL_USE_SSL = False
MAIL_USE_TLS = False
MAIL_USERNAME = "YOUR-MAILTRIP-NAME - Copy these lines to your instance/config! edit there."
MAIL_PASSWORD = "YOUR-MAILTRIP-PASSWORD - Copy these lines to your instance/config! edit there."
MAIL_DEFAULT_SENDER='someaddress@fake.com'
MAIL_DEFAULT_USER='someaddress@fake.com'
MAIL_TIMEOUT = 10

MAIL_CONSULT_RECIPIENT = 'ResearchConcierge@hscmail.mcc.virginia.edu'
