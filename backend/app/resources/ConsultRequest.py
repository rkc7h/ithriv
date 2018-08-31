# Consult Request
# *****************************

from app import db, auth, email_service
from app.model.email_log import EmailLog
from app.model.user import User
from app.model.resource import ThrivResource
from flask import request, Blueprint

consult_blueprint = Blueprint('consult', __name__, url_prefix='/api')


@consult_blueprint.route('/consult_request', methods=["GET", "POST"])
@auth.login_required
def consult_request():
    request_data = request.get_json()
    user_id = request_data['user_id']
    user = User.query.filter_by(id=user_id).first_or_404()
    if 'resource_id' in request_data:
        resource_id = request_data['resource_id']
        resource = ThrivResource.query.filter_by(id=resource_id).first_or_404()
        tracking_code = email_service.consult_email(user, resource, request_data)
    else:
        resource = ThrivResource(id=0, name="None")
        tracking_code = email_service.consult_email(user, resource, request_data)
    log = EmailLog(user_id=user.id, type="consult_request", tracking_code=tracking_code)
    db.session.add(log)
    db.session.commit()
    return ''
