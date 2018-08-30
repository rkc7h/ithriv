import datetime

import jwt
from elasticsearch_dsl import Binary

from sqlalchemy.ext.hybrid import hybrid_property
from app import db, app, RestException, bcrypt


class User(db.Model):
    __tablename__ = 'ithriv_user'
    id = db.Column(db.Integer, primary_key=True)
    eppn = db.Column(db.String, nullable=True)
    uid = db.Column(db.String, nullable=True)
    email = db.Column(db.String, nullable=False, unique=True)
    display_name = db.Column(db.String)
    _password = db.Column('password', db.Binary(60))
    role = db.Column(db.String(), default='User')
    email_verified = db.Column(db.Boolean, nullable=False, default=False)
    institution_id = db.Column('institution_id', db.Integer(), db.ForeignKey('institution.id'))
    institution = db.relationship('ThrivInstitution')
    institutional_role = db.Column(db.String)
    division = db.Column(db.String)

    @hybrid_property
    def password(self):
        return self._password

    @password.setter
    def password(self, plaintext):
        self._password = bcrypt.generate_password_hash(plaintext)

    def is_correct_password(self, plaintext):
        if not self._password:
            raise RestException(RestException.LOGIN_FAILURE);
        return bcrypt.check_password_hash(self._password, plaintext)

    def encode_auth_token(self):
        try:
            payload = {
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2, minutes=0, seconds=0),
                'iat': datetime.datetime.utcnow(),
                'sub': self.id
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