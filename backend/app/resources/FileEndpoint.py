import flask_restful
from flask import request

from app import RestException, db, file_server, auth
from app.models import UploadedFile
from app.resources.schema import FileSchema
from app.wrappers import requires_roles


class FileEndpoint(flask_restful.Resource):

    schema = FileSchema()

    def get(self, id):
        model = db.session.query(UploadedFile).filter_by(id=id).first()
        if model is None:
            raise RestException(RestException.NOT_FOUND)
        return self.schema.dump(model)

    def delete(self, id):
        file = db.session.query(UploadedFile).filter_by(id=id).first()
        file_server.delete_file(file)
        db.session.delete(file)
        db.session.commit()
        return None

    def put(self, id):
        uploaded_file = db.session.query(UploadedFile).filter_by(id=id).first()
        if uploaded_file is None:
            raise RestException(RestException.NOT_FOUND)
        updated = uploaded_file
        if (request.is_json):
            json_data = request.get_json()
            updated, errors = self.schema.load(json_data, instance=uploaded_file)
            if errors:
                raise RestException(RestException.INVALID_OBJECT, details=errors)
        else:
            data = request.data
            mime = request.mimetype
            updated.url = file_server.save_file(data, uploaded_file, mime)
            updated.size = request.content_length
            updated.mime_type = mime
        db.session.add(updated)
        db.session.commit()
        return self.schema.dump(updated)

class FileListEndpoint(flask_restful.Resource):

    filesSchema = FileSchema(many=True)
    fileSchema = FileSchema()

    def get(self):
        args = request.args
        query = db.session.query(UploadedFile)
        if "md5" in args:
            query = query.filter(UploadedFile.md5 == args["md5"])
        files = query.all()
        return self.filesSchema.dump(files, many=True)

    def post(self):
        json_data = request.get_json()
        uploaded_file, errors = self.fileSchema.load(json_data)
        if errors:
            raise RestException(RestException.INVALID_OBJECT, details=errors)
        db.session.add(uploaded_file)
        db.session.commit()
        return self.fileSchema.dump(uploaded_file)

