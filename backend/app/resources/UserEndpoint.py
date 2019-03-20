import flask_restful
from flask import request, app
from marshmallow import ValidationError
from sqlalchemy import exists, or_, func
from sqlalchemy.exc import IntegrityError

from app import RestException, db, email_service, auth
from app.models import EmailLog
from app.models import User
from app.resources.schema import UserSchema, UserSearchSchema
from app.wrappers import requires_roles


class UserEndpoint(flask_restful.Resource):

    schema = UserSchema()

    @auth.login_required
    @requires_roles('Admin')
    def get(self, id):
        model = db.session.query(User).filter_by(id=id).first()
        if model is None: raise RestException(RestException.NOT_FOUND)
        return self.schema.dump(model)

    @auth.login_required
    @requires_roles('Admin')
    def delete(self, id):
        db.session.query(User).filter_by(id=id).delete()
        db.session.commit()
        return None

    @auth.login_required
    @requires_roles('Admin')
    def put(self, id):
        request_data = request.get_json()
        instance = db.session.query(User).filter_by(id=id).first()
        updated, errors = self.schema.load(request_data, instance=instance)
        if errors: raise RestException(RestException.INVALID_OBJECT, details=errors)
        db.session.add(updated)
        db.session.commit()
        return self.schema.dump(updated)


class UserListEndpoint(flask_restful.Resource):

    usersSchema = UserSchema(many=True)
    userSchema = UserSchema()
    searchSchema = UserSearchSchema()

    @auth.login_required
    @requires_roles('Admin')
    def get(self):
        args = request.args
        pageNumber = eval(args["pageNumber"]) if ("pageNumber" in args) else 0
        per_page = eval(args["pageSize"]) if ("pageSize" in args) else 20
        sort_column = args["sort"] if ("sort" in args) else "display_name"
        sort_order = args["sortOrder"] if ("sortOrder" in args) else "asc"
        query = db.session.query(User)
        if "filter" in args:
            f = '%' + args["filter"] + '%'
            query = query.filter(or_(User.email.ilike(f), User.display_name.ilike(f), User.eppn.ilike(f)))
        query = query.order_by("%s %s" % (sort_column, sort_order))
        page = query.paginate(page=pageNumber  +1, per_page=per_page, error_out=False)
        return self.searchSchema.dump(page)

    @auth.login_required
    @requires_roles('Admin')
    def post(self):
        request_data = request.get_json()
        try:
            new_user, errors = self.userSchema.load(request_data)
            if errors: raise RestException(RestException.INVALID_OBJECT, details=errors)
            email_exists = db.session.query(exists().where(User.email == new_user.email)).scalar()
            if email_exists:
                raise RestException(RestException.EMAIL_EXISTS)
            db.session.add(new_user)
            db.session.commit()
            self.send_confirm_email(new_user)
            return self.userSchema.dump(new_user)
        except IntegrityError as ie:
            raise RestException(RestException.INVALID_OBJECT)
        except ValidationError as err:
            raise RestException(RestException.INVALID_OBJECT,
                                details=new_user.errors)

    def send_confirm_email(self, user):
        tracking_code = email_service.confirm_email(user)
        log = EmailLog(user_id=user.id, type="confirm_email", tracking_code=tracking_code)
        db.session.add(log)
        db.session.commit()

