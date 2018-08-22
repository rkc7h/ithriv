# Consult Request
# *****************************

from app import sso, app, RestException, db, auth, email_service
from app.model.email_log import EmailLog
from app.model.user import User
from flask import jsonify, redirect, g, request, Blueprint

consult_blueprint = Blueprint('consult', __name__, url_prefix='/api')

# ourapp/views.py


@consult_blueprint.route('/consult_request', methods=["GET", "POST"])
def consult_request():
    request_data = request.get_json()
    user_id = request_data['user_id']
    user = User.query.filter_by(id=user_id).first_or_404()

    tracking_code = email_service.consult_email(user, request_data)
    log = EmailLog(user_id=user.id, type="consult_request", tracking_code=tracking_code)
    db.session.add(log)
    db.session.commit()
    return ''
