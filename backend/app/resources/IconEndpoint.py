import flask_restful
from flask import request
from marshmallow import ValidationError

from app import RestException, db, file_server
from app.models import Icon
from app.resources.schema import IconSchema


class IconEndpoint(flask_restful.Resource):

    schema = IconSchema()

    def get(self, id):
        model = db.session.query(Icon).filter_by(id=id).first()
        if model is None:
            raise RestException(RestException.NOT_FOUND)
        return self.schema.dump(model)

    def delete(self, id):
        db.session.query(Icon).filter_by(id=id).delete()
        db.session.commit()
        return None

    def put(self, id):
        icon = db.session.query(Icon).filter_by(id=id).first()
        if icon is None:
            raise RestException(RestException.NOT_FOUND)
        updated = icon
        if 'image' in request.files:
            file = request.files.get('image')
            extension = file.filename.rsplit('.', 1)[1].lower()
            updated.url = file_server.save_icon(file, icon, extension, file.content_type)
        else:
            json_data = request.get_json()
            updated, errors = self.schema.load(json_data, instance=icon)
            if errors:
                raise RestException(RestException.INVALID_OBJECT, details=errors)
        db.session.add(updated)
        db.session.commit()
        return self.schema.dump(updated)


class IconListEndpoint(flask_restful.Resource):

    iconsSchema = IconSchema(many=True)
    iconSchema = IconSchema()

    def get(self):
        icons = db.session.query(Icon).all()
        return self.iconSchema.dump(icons, many=True)

    def post(self):
        request_data = request.get_json()
        try:
            load_result = self.iconSchema.load(request_data).data
            db.session.add(load_result)
            db.session.commit()
            return self.iconSchema.dump(load_result)
        except ValidationError:
            raise RestException(RestException.INVALID_OBJECT,
                                details=load_result.errors)