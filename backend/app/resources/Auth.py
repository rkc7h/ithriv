# Login
# *****************************
from itsdangerous import URLSafeTimedSerializer

from app import sso, app, RestException, db, auth, email_service
from app.model.email_log import EmailLog
from app.model.user import User
from flask import jsonify, redirect, g, request, Blueprint

auth_blueprint = Blueprint('auth', __name__, url_prefix='/api')

@sso.login_handler
def login(user_info):
    if app.config["DEVELOPMENT"]:
        uid = app.config["SSO_DEVELOPMENT_UID"]
    else:
        uid = user_info['uid']

    user = User.query.filter_by(uid=uid).first()
    if user is None:
        user = User(uid=uid,
                    display_name=user_info["givenName"],
                    email=user_info["email"])
        if "Surname" in user_info:
            user.display_name = user.display_name + " " + user_info["Surname"]

        if "displayName" in user_info and len(user_info["displayName"]) > 1:
            user.display_name = user_info["displayName"]

        db.session.add(user)
        db.session.commit()
    # redirect users back to the front end, include the new auth token.
    auth_token = user.encode_auth_token().decode()
    response_url = ("%s/%s" % (app.config["FRONTEND_AUTH_CALLBACK"], auth_token))
    return redirect(response_url)


# ourapp/views.py


def confirm_email(email_token):
    """When users create a new account with an email and a password, this
    allows the front end ot confirm their email and log them into the system."""
    try:
        ts = URLSafeTimedSerializer(app.config["SECRET_KEY"])
        email = ts.loads(email_token, salt="email-confirm-key", max_age=86400)
    except:
        raise RestException(RestException.TOKEN_INVALID)

    user = User.query.filter_by(email=email).first_or_404()
    user.email_confirmed = True
    db.session.add(user)
    db.session.commit()

    auth_token = user.encode_auth_token().decode()
    return jsonify({"token": auth_token})

@auth_blueprint.route('/login_password', methods=["GET", "POST"])
def login_password():
    request_data = request.get_json()
    email = request_data['email']
    user = User.query.filter_by(email=email).first()

    if user.email_verified:
        if user.is_correct_password(request_data["password"]):
            # redirect users back to the front end, include the new auth token.
            auth_token = user.encode_auth_token().decode()
            return jsonify({"token": auth_token})
        else:
            raise RestException(RestException.LOGIN_FAILURE)
    else:
        if 'email_token' in request_data:
            confirm_email('email_token')
        else:
            raise RestException(RestException.CONFIRM_EMAIL)


@auth_blueprint.route('/forgot_password', methods=["GET", "POST"])
def forgot_password():
    request_data = request.get_json()
    email = request_data['email']
    user = User.query.filter_by(email=email).first_or_404()

    tracking_code = email_service.reset_email(user)
    log = EmailLog(user_id=user.id, type="reset_email", tracking_code=tracking_code)
    db.session.add(log)
    db.session.commit()
    return ''


@auth_blueprint.route('/reset_password', methods=["GET", "POST"])
def reset_password():
    request_data = request.get_json()
    password = request_data['password']
    email_token = request_data['email_token']
    try:
        ts = URLSafeTimedSerializer(app.config["SECRET_KEY"])
        email = ts.loads(email_token, salt="email-reset-key", max_age=86400)
    except:
        raise RestException(RestException.TOKEN_INVALID)

    user = User.query.filter_by(email=email).first_or_404()
    user.password = password
    db.session.add(user)
    db.session.commit()

    auth_token = user.encode_auth_token().decode()
    return jsonify({"token": auth_token})


@auth.verify_token
def verify_token(token):
    try:
        resp = User.decode_auth_token(token)
        if resp:
            g.user = User.query.filter_by(id=resp).first()
    except:
        g.user = None

    if 'user' in g:
        return True
    else:
        return False

