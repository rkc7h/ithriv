# Consult Request
# *****************************

from app import db, auth, email_service
from app.model.email_log import EmailLog
from app.model.user import User
from app.model.resource import ThrivResource
from flask import request, Blueprint

approval_blueprint = Blueprint('approval', __name__, url_prefix='/api')


@approval_blueprint.route('/approval_request', methods=["GET", "POST"])
@auth.login_required
def approval_request():
    request_data = request.get_json()
    user_id = request_data['user_id']
    resource_id = request_data['resource_id']
    user = User.query.filter_by(id=user_id).first_or_404()
    admins = User.query.filter_by(role="Admin", institution_id=user.institution_id)
    resource = ThrivResource.query.filter_by(id=resource_id).first_or_404()

    for admin in admins:
        tracking_code = email_service.approval_request_email(user, admin, resource)
        log = EmailLog(user_id=user.id, type="approval_request", tracking_code=tracking_code)
        db.session.add(log)
        db.session.commit()
    return ''
