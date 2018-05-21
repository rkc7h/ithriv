class RestException(Exception):
    status_code = 400
    NOT_FOUND = {'code': 'not_found', 'message': 'Unknown path.', 'status_code':404}
    TOKEN_INVALID = {'code': 'token_invalid', 'message': 'Please log in again.'}
    TOKEN_EXPIRED = {'code': 'token_expired', 'message': 'Your session timed out.  Please log in again.'}
    TOKEN_MISSING = {'code': 'token_missing', 'message': 'Your are not logged in.'}
    ELASTIC_ERROR = {'code': 'elastic_error', 'message':"Error connecting to ElasticSearch."}
    NOT_YOUR_ACCOUNT = {'code': 'permission_denied', 'message': 'You may not edit another users account.'}
    PERMISSON_DENIED = {'code': 'permission_denied', 'message': 'You are not authorized to make this call.'}
    INVALID_RESOURCE = {'code': 'invalid_resource', 'message': 'Unable to save the provided resource.'}

    def __init__(self, payload, status_code=None, details=None):
        Exception.__init__(self)
        if 'status_code' in payload:
            self.status_code = payload['status_code']
        if status_code is not None:
            self.status_code = status_code
        if details is not None:
            payload['details'] = details
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload)
        return rv