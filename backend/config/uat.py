from config.base import *

CORS_ENABLED = True

# SQLALCHEMY/ALEMBIC Settings

# Amazon S3 Bucket for storing images.
S3['bucket'] = 'edplatform-ithriv-test-bucket'

# Elastic Search Settings

# SMTP Email Settings

# Single Signon configuration Settings
SSO_ATTRIBUTE_MAP['uid'] = (False, 'uid')