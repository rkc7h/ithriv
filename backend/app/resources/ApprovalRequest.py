# Consult Request
# *****************************

from app import db, auth, email_service
from app.models import EmailLog
from app.models import User
from app.models import ThrivResource
from flask import request, Blueprint

approval_blueprint = Blueprint('approval', __name__, url_prefix='/api')


@approval_blueprint.route('/approval_request', methods=["GET", "POST"])
@auth.login_required
def approval_request():
    request_data = request.get_json()
    user_id = request_data['user_id']
    resource_id = request_data['resource_id']
    resource = ThrivResource.query.filter_by(id=resource_id).first_or_404()

    # Get admins for the user's institution
    user = User.query.filter_by(id=user_id).first_or_404()
    admins = User.query.filter_by(role="Admin", institution_id=user.institution_id).all()

    # Send approval request email to each admin for the institution
    for admin in admins:
        tracking_code = email_service.approval_request_email(user, admin, resource)
        log = EmailLog(user_id=admin.id, type="approval_request", tracking_code=tracking_code)
        db.session.add(log)
        db.session.commit()

    # Send confirmation email to user
    confirm_tracking_code = email_service.approval_request_confirm_email(user, resource)
    confirm_log = EmailLog(user_id=user.id, type="approval_request_confirm", tracking_code=confirm_tracking_code)
    db.session.add(confirm_log)
    db.session.commit()

    return ''
