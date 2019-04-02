from config.base import *

conn_info = fetch_connections_info()

# SQLALCHEMY/ALEMBIC Settings
SQLALCHEMY_DATABASE_URI = ''.join(['postgresql://',
                                   conn_info["RDBMS"]["CLIENT_ID"], ':', conn_info["RDBMS"]["CLIENT_SECRET"],
                                   '@', conn_info["RDBMS"]["HOSTS"][0], ':', conn_info["RDBMS"]["PORT"],
                                   '/ithriv'])

# Amazon S3 Bucket for storing images.

# Elastic Search Settings
ELASTIC_SEARCH['index_prefix'] = 'ithriv'

# SMTP Email Settings
MAIL_DEFAULT_SENDER = 'support@ithriv.org'

# Single Signon configuration Settings
SSO_ATTRIBUTE_MAP['eppn'] = (True, 'eppn')
SSO_ATTRIBUTE_MAP['uid'] = (False, 'uid')

API_URL = 'https://portal.ithriv.org'
SITE_URL = 'https://portal.ithriv.org'
FRONTEND_AUTH_CALLBACK, FRONTEND_EMAIL_RESET, FRONTEND_EMAIL_CONFIRM = auth_callback_url_tuple(
    SITE_URL, '/#/session', '/#/reset_password/', '/#/login/')
