import flask_restful
from flask import g, request

from app import db, RestException, auth
from app.resources.schema import FavoriteSchema, UserFavoritesSchema
from app.models import Favorite
from app.models import ThrivResource


class UserFavoriteEndpoint(flask_restful.Resource):
    """Provides a way to get the current user's favorites, and to delete the favorites."""
    schema = UserFavoritesSchema()

    @auth.login_required
    def get(self):
        schema = UserFavoritesSchema(many=True)
        favorites = db.session.query(Favorite) \
            .join(Favorite.resource) \
            .filter(Favorite.user_id == g.user.id) \
            .order_by(ThrivResource.name) \
            .all()
        return schema.dump(favorites)

    @auth.login_required
    def post(self):
        request_data = request.get_json()
        favorites = self.schema.load(request_data, many=True).data
        db.session.query(Favorite).filter_by(user_id=g.user.id).delete()
        for f in favorites:
            db.session.add(Favorite(user_id=g.user.id, resource_id=f.resource_id))
        db.session.commit()
        return self.get()


class FavoriteEndpoint(flask_restful.Resource):
    schema = FavoriteSchema()

    def get(self, id):
        model = db.session.query(Favorite).filter_by(id=id).first()
        if model is None: raise RestException(RestException.NOT_FOUND)
        return self.schema.dump(model)

    def delete(self, id):
        db.session.query(Favorite).filter_by(id=id).delete()
        db.session.commit()
        return None


class FavoriteListEndpoint(flask_restful.Resource):
    schema = FavoriteSchema()

    def post(self):
        request_data = request.get_json()
        load_result = self.schema.load(request_data).data
        db.session.add(load_result)
        db.session.commit()
        return self.schema.dump(load_result)
