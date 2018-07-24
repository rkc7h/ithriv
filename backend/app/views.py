from flask import jsonify, url_for, redirect, g
from app import app, db, sso, auth
import flask_restful
from flask_restful import reqparse

from app.model.user import User
from app.resources.IconEndpoint import IconListEndpoint, IconEndpoint
from app.resources.ResourceAndCategoryEndoint import ResourceByCategoryEndpoint, CategoryByResourceEndpoint, \
    ResourceCategoryEndpoint, ResourceCategoryListEndpoint
from app.resources.ResourceEndpoint import ResourceListEndpoint, ResourceEndpoint
from app.resources.CategoryEndoint import CategoryListEndpoint, CategoryEndpoint
from app.resources.AvailabilityEndpoint import AvailabilityEndpoint, AvailabilityListEndpoint, \
    ResourceAvailabilityEndpoint
from app.resources.InstitutionEndpoint import InstitutionEndpoint, InstitutionListEndpoint
from app.resources.SearchEndpoint import SearchEndpoint
from app.resources.SessionEndpoint import SessionEndpoint
from app.resources.TypeEndpoint import TypeEndpoint, TypeListEndpoint
from app.resources.UserEndpoint import UserEndpoint, UserListEndpoint
from app.resources.FavoriteEndpoint import UserFavoriteEndpoint, FavoriteEndpoint, FavoriteListEndpoint

api = flask_restful.Api(app)

parser = flask_restful.reqparse.RequestParser()
parser.add_argument('resource')


@app.route('/api', methods=['GET'])
def root():
    _links = {"_links": {
        "resources": url_for("resourcelistendpoint"),
        "categories": url_for("categorylistendpoint"),
        "institutions": url_for("institutionlistendpoint"),
        "types": url_for("typelistendpoint"),
        "search": url_for("searchendpoint"),
    }}
    return jsonify(_links)


# Login
# *****************************
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
                    email_address=user_info["email"])
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


@auth.verify_token
def verify_token(token):
    try:
        resp = User.decode_auth_token(token)
        g.user = User.query.filter_by(uid=resp).first()
    except:
        g.user = None

    if g.user:
        return True
    else:
        return False


api.add_resource(ResourceListEndpoint, '/api/resource')
api.add_resource(ResourceEndpoint, '/api/resource/<id>')
api.add_resource(CategoryByResourceEndpoint, '/api/resource/<resource_id>/category')
api.add_resource(CategoryListEndpoint, '/api/category')
api.add_resource(CategoryEndpoint, '/api/category/<id>')
api.add_resource(ResourceByCategoryEndpoint, '/api/category/<category_id>/resource')
api.add_resource(InstitutionEndpoint, '/api/institution/<id>')
api.add_resource(InstitutionListEndpoint, '/api/institution')
api.add_resource(TypeEndpoint, '/api/type/<id>')
api.add_resource(TypeListEndpoint, '/api/type')
api.add_resource(SearchEndpoint, '/api/search')
api.add_resource(ResourceCategoryListEndpoint, '/api/resource_category')
api.add_resource(ResourceCategoryEndpoint, '/api/resource_category/<id>')
api.add_resource(AvailabilityListEndpoint, '/api/availability')
api.add_resource(AvailabilityEndpoint, '/api/availability/<id>')
api.add_resource(ResourceAvailabilityEndpoint, '/api/resource/<resource_id>/availability')
api.add_resource(IconListEndpoint, '/api/icon')
api.add_resource(IconEndpoint, '/api/icon/<id>')
api.add_resource(UserListEndpoint, '/api/user')
api.add_resource(UserEndpoint, '/api/user/<id>')
api.add_resource(SessionEndpoint, '/api/session')
api.add_resource(FavoriteListEndpoint, '/api/favorite')
api.add_resource(FavoriteEndpoint, '/api/favorite/<id>')
api.add_resource(UserFavoriteEndpoint, '/api/user/<user_id>/favorite')
