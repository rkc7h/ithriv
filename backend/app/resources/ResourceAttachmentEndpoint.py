import flask_restful
from flask import request
from marshmallow import ValidationError

from app import RestException, db, file_server
from app.model.resource_attachment import ResourceAttachment
from app.resources.schema import ResourceAttachmentSchema


class ResourceAttachmentEndpoint(flask_restful.Resource):

    schema = ResourceAttachmentSchema()

    def get(self, id):
        model = db.session.query(ResourceAttachment).filter_by(id=id).first()
        if model is None:
            raise RestException(RestException.NOT_FOUND)
        return self.schema.dump(model)

    def delete(self, id):
        db.session.query(ResourceAttachment).filter_by(id=id).delete()
        db.session.commit()
        return None

    def put(self, id):
        attachment = db.session.query(ResourceAttachment).filter_by(id=id).first()
        if attachment is None:
            raise RestException(RestException.NOT_FOUND)
        updated = attachment
        if 'attachment' in request.files:
            file = request.files.get('attachment')
            updated.url = file_server.save_resource_attachment(file, attachment, file.content_type)
        else:
            json_data = request.get_json()
            updated, errors = self.schema.load(json_data, instance=attachment)
            if errors:
                raise RestException(RestException.INVALID_OBJECT, details=errors)
        db.session.add(updated)
        db.session.commit()
        return self.schema.dump(updated)


class ResourceAttachmentListEndpoint(flask_restful.Resource):

    attachmentsSchema = ResourceAttachmentSchema(many=True)
    attachmentSchema = ResourceAttachmentSchema()

    def get(self):
        attachments = db.session.query(ResourceAttachment).all()
        return self.attachmentsSchema.dump(attachments)

    def post(self):
        request_data = request.get_json()
        try:
            load_result = self.attachmentSchema.load(request_data).data
            db.session.add(load_result)
            db.session.commit()
            return self.attachmentSchema.dump(load_result)
        except ValidationError:
            raise RestException(RestException.INVALID_OBJECT,
                                details=load_result.errors)


class AttachmentByResourceEndpoint(flask_restful.Resource):

    schema = ResourceAttachmentSchema(many=True)

    def get(self, resource_id):
        attachments = db.session.query(ResourceAttachment).filter_by(resource_id=resource_id).all()
        return self.schema.dump(attachments)
