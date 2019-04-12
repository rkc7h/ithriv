import json
import logging

NAME = 'iThriv Resource Database'
VERSION = '0.1'


def fetch_connections_info(): return json.load(
    open('/etc/private/ithriv/connections.json'))


def auth_callback_url_tuple(portal_host_url, auth_callback_route, auth_email_reset_route, auth_email_confirm_route): return (
    ''.join([portal_host_url, auth_callback_route]), ''.join([portal_host_url, auth_email_reset_route]), ''.join([portal_host_url, auth_email_confirm_route]))


conn_info = fetch_connections_info()

ENV_BOOL_FLAGS_TUPLE = (conn_info['ENV'] in (
    'local', 'dev'), conn_info['ENV'] == 'qa', conn_info['ENV'] == 'uat', conn_info['ENV'] == 'prod')

DEVELOPMENT, TESTING, STAGING, PRODUCTION = ENV_BOOL_FLAGS_TUPLE
CORS_ENABLED = False
DEBUG = False

# SQLALCHEMY/ALEMBIC Settings
SQLALCHEMY_DATABASE_URI = ''.join(['postgresql://',
                                   conn_info["RDBMS"]["CLIENT_ID"], ':', conn_info["RDBMS"]["CLIENT_SECRET"],
                                   '@', conn_info["RDBMS"]["HOSTS"][0], ':', conn_info["RDBMS"]["PORT"],
                                   ''.join(['/ithriv-', conn_info['ENV']])])
SQLALCHEMY_LOG_LEVEL = logging.WARN
ALEMBIC_PRINT_SQL = False


# Amazon S3 Bucket for storing images.
S3 = {
    'bucket': 'ithriv-media',
    'base_url': ''.join(['https://', conn_info["AMAZON_S3"]["HOSTS"][0]]),
    'base_path': conn_info['ENV']
}

# Elastic Search Settings
ELASTIC_SEARCH = {
    'hosts': conn_info["ELASTIC_SEARCH"]["HOSTS"],
    'port': conn_info["ELASTIC_SEARCH"]["PORT"],
    'http_auth_user': conn_info["ELASTIC_SEARCH"]["CLIENT_ID"],
    'http_auth_pass': conn_info["ELASTIC_SEARCH"]["CLIENT_SECRET"],
    'index_prefix': ''.join(['ithriv-', conn_info['ENV']]),
    'timeout': 20,
    'verify_certs': False,
    'use_ssl': False
}

# SMTP Email Settings
MAIL_SERVER = conn_info["SMTP"]["HOSTS"][0]
MAIL_PORT = conn_info["SMTP"]["PORT"]
MAIL_USERNAME = conn_info["SMTP"]["CLIENT_ID"]
MAIL_PASSWORD = conn_info["SMTP"]["CLIENT_SECRET"]
MAIL_DEFAULT_SENDER = ''.join(['support-', conn_info['ENV'], '@ithriv.org'])
MAIL_DEFAULT_USER = 'rkc7h@virginia.edu'
MAIL_DEFAULT_RECIPIENT = 'rkc7h@virginia.edu'
MAIL_CONSULT_RECIPIENT = 'ResearchConcierge@hscmail.mcc.virginia.edu'
MAIL_USE_SSL = False
MAIL_USE_TLS = False
MAIL_TIMEOUT = 10

# Single Signon configuration Settings
SECRET_KEY = conn_info["INCOMMON_SSO"]["CLIENT_SECRET"]
if DEVELOPMENT:
    SSO_DEVELOPMENT_EPPN = 'ithriv_user@virginia.edu'
SSO_ATTRIBUTE_MAP = {
    'eppn': (False, 'eppn'),  # valid email address
    'uid': (True, 'uid'),  # computing id
    'givenName': (False, 'givenName'),
    'mail': (False, 'email'),  # valid email address
    'sn': (False, 'surName'),  # Funk# 'staff@virginia.edu;member@virginia.edu'
    'affiliation': (False, 'affiliation'),
    'displayName': (False, 'displayName'),
    'title': (False, 'title')
}
SSO_LOGIN_URL = '/api/login'


API_URL = ''.join(['https:///service.', conn_info['ENV'], '.ithriv.org'])
SITE_URL = ''.join(['https://portal.', conn_info['ENV'], '.ithriv.org'])
FRONTEND_AUTH_CALLBACK, FRONTEND_EMAIL_RESET, FRONTEND_EMAIL_CONFIRM = auth_callback_url_tuple(
    SITE_URL, '/#/session', '/#/reset_password/', '/#/login/')
PHOTO_SERVE_URL = 'https://ithriv.s3.aws.com'
