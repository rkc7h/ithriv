from flask import jsonify, url_for, redirect, g, request, Blueprint
from app import app, db, sso, auth, RestException
import flask_restful
from flask_restful import reqparse

from app.resources.Auth import auth_blueprint
from app.resources.FileEndpoint import FileListEndpoint, FileEndpoint
from app.resources.IconEndpoint import IconListEndpoint, IconEndpoint
from app.resources.ResourceAndCategoryEndoint import ResourceByCategoryEndpoint, CategoryByResourceEndpoint, \
    ResourceCategoryEndpoint, ResourceCategoryListEndpoint
from app.resources.ResourceEndpoint import ResourceListEndpoint, ResourceEndpoint, UserResourceEndpoint
from app.resources.CategoryEndoint import CategoryListEndpoint, CategoryEndpoint, RootCategoryListEndpoint
from app.resources.AvailabilityEndpoint import AvailabilityEndpoint, AvailabilityListEndpoint, \
    ResourceAvailabilityEndpoint
from app.resources.InstitutionEndpoint import InstitutionEndpoint, InstitutionListEndpoint, \
    InstitutionAvailabilityListEndpoint
from app.resources.SearchEndpoint import SearchEndpoint
from app.resources.SessionEndpoint import SessionEndpoint
from app.resources.Tracking import tracking_blueprint
from app.resources.ConsultRequest import consult_blueprint
from app.resources.TypeEndpoint import TypeEndpoint, TypeListEndpoint
from app.resources.UserEndpoint import UserEndpoint, UserListEndpoint
from app.resources.FavoriteEndpoint import UserFavoriteEndpoint, FavoriteEndpoint, FavoriteListEndpoint


class IThrivApi(flask_restful.Api):
    # Define a custom error handler for all rest endpoints that
    # properly handles the RestException status.
    def handle_error(self, e):
        response = jsonify(e.to_dict())
        response.status_code = e.status_code
        flask_restful.abort(e.status_code, response)


api_blueprint = Blueprint("api", __name__, url_prefix='/api')
api = IThrivApi(api_blueprint)
app.register_blueprint(api_blueprint)
app.register_blueprint(auth_blueprint)
app.register_blueprint(tracking_blueprint)
app.register_blueprint(consult_blueprint)

parser = flask_restful.reqparse.RequestParser()
parser.add_argument('resource')


@app.route('/', methods=['GET'])
def root():
    _links = {"_links": {
        "resources": url_for("api.resourcelistendpoint"),
        "categories": url_for("api.categorylistendpoint"),
        "institutions": url_for("api.institutionlistendpoint"),
        "types": url_for("api.typelistendpoint"),
        "search": url_for("api.searchendpoint"),
        "auth": url_for("auth.login_password"),
    }}
    return jsonify(_links)


api.add_resource(ResourceListEndpoint, '/resource')
api.add_resource(ResourceEndpoint, '/resource/<id>')
api.add_resource(CategoryByResourceEndpoint, '/resource/<resource_id>/category')
api.add_resource(CategoryListEndpoint, '/category')
api.add_resource(CategoryEndpoint, '/category/<id>')
api.add_resource(RootCategoryListEndpoint, '/category/root')
api.add_resource(ResourceByCategoryEndpoint, '/category/<category_id>/resource')
api.add_resource(InstitutionEndpoint, '/institution/<id>')
api.add_resource(InstitutionListEndpoint, '/institution')
api.add_resource(InstitutionAvailabilityListEndpoint, '/institution/availability')
api.add_resource(TypeEndpoint, '/type/<id>')
api.add_resource(TypeListEndpoint, '/type')
api.add_resource(SearchEndpoint, '/search')
api.add_resource(ResourceCategoryListEndpoint, '/resource_category')
api.add_resource(ResourceCategoryEndpoint, '/resource_category/<id>')
api.add_resource(AvailabilityListEndpoint, '/availability')
api.add_resource(AvailabilityEndpoint, '/availability/<id>')
api.add_resource(ResourceAvailabilityEndpoint, '/resource/<resource_id>/availability')
api.add_resource(IconListEndpoint, '/icon')
api.add_resource(IconEndpoint, '/icon/<id>')
api.add_resource(UserListEndpoint, '/user')
api.add_resource(UserEndpoint, '/user/<id>')
api.add_resource(SessionEndpoint, '/session')
api.add_resource(FavoriteListEndpoint, '/favorite')
api.add_resource(FavoriteEndpoint, '/favorite/<id>')
api.add_resource(UserFavoriteEndpoint, '/session/favorite')
api.add_resource(UserResourceEndpoint, '/session/resource')
api.add_resource(FileEndpoint, '/file/<id>')
api.add_resource(FileListEndpoint, '/file')

#api.add_resource(ResourceAttachmentListEndpoint, '/resource/attachment')
#api.add_resource(ResourceAttachmentEndpoint, '/resource/attachment/<id>')
#api.add_resource(AttachmentByResourceEndpoint, '/resource/<resource_id>/attachment')
