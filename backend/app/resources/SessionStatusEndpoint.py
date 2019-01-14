import datetime
import flask_restful
from flask import g, jsonify
import jwt
from app import app


class SessionStatusEndpoint(flask_restful.Resource):
    """
    Returns the timecode (in seconds) when the current session expires,
    or 0 if there is no current session.
    """

    def get(self, auth_token):
        if not auth_token:
            return 0
        else:
            try:
                payload = jwt.decode(
                    auth_token,
                    app.config.get('SECRET_KEY'),
                    algorithms='HS256')
                return payload['exp']
            except Exception as e:
                return 0
