from config.base import *

CORS_ENABLED = True

SQLALCHEMY_LOG_LEVEL = logging.ERROR
ALEMBIC_PRINT_SQL = False


# SQLALCHEMY/ALEMBIC Settings

# Amazon S3 Bucket for storing images.

# Elastic Search Settings

# SMTP Email Settings

# Single Signon configuration Settings
SSO_ATTRIBUTE_MAP['uid'] = (False, 'uid')
