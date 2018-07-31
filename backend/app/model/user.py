import datetime

import jwt

from sqlalchemy.ext.hybrid import hybrid_property
from app import db, app, RestException, bcrypt


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.String)
    email_address = db.Column(db.String)
    display_name = db.Column(db.String)
    _password = db.Column(db.String(128))

    @hybrid_property
    def password(self):
        return self._password

    @password.setter
    def _set_password(self, plaintext):
        self._password = bcrypt.generate_password_hash(plaintext)

    def is_correct_password(self, plaintext):
        return bcrypt.check_password_hash(self._password, plaintext)

    def encode_auth_token(self):
        try:
            payload = {
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2, minutes=0, seconds=0),
                'iat': datetime.datetime.utcnow(),
                'sub': self.uid
            }
            return jwt.encode(
                payload,
                app.config.get('SECRET_KEY'),
                algorithm='HS256'
            )
        except Exception as e:
            return e

    @staticmethod
    def decode_auth_token(auth_token):
        try:
            payload = jwt.decode(auth_token, app.config.get('SECRET_KEY'), algorithms='HS256')
            return payload['sub']
        except jwt.ExpiredSignatureError:
            raise RestException(RestException.TOKEN_EXPIRED)
        except jwt.InvalidTokenError:
            raise RestException(RestException.TOKEN_INVALID)