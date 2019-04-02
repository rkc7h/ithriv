from config.base import *

CORS_ENABLED = True

SQLALCHEMY_LOG_LEVEL = logging.INFO
ALEMBIC_PRINT_SQL = True


# SQLALCHEMY/ALEMBIC Settings

# Amazon S3 Bucket for storing images.

# Elastic Search Settings

# SMTP Email Settings

# Single Signon configuration Settings
SSO_ATTRIBUTE_MAP['uid'] = (False, 'uid')

API_URL = 'http://localhost:5000'
SITE_URL = 'http://localhost:4200'
FRONTEND_AUTH_CALLBACK, FRONTEND_EMAIL_RESET, FRONTEND_EMAIL_CONFIRM = auth_callback_url_tuple(
    SITE_URL, '/#/session', '/#/reset_password/', '/#/login/')
