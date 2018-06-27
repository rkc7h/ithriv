
import datetime
from uuid import uuid4

import boto3
import flask_restful
from flask import jsonify, request
from marshmallow import ValidationError

from app import app, RestException, db, elastic_index
from app.model.resource_category import ResourceCategory
from app.model.resource import ThrivResource
from app.resources.schema import ThrivResourceSchema


class ResourceEndpoint(flask_restful.Resource):

    def get(self, id):
        resource = db.session.query(ThrivResource).filter(ThrivResource.id == id).first()
        if resource is None: raise RestException(RestException.NOT_FOUND)
        return ThrivResourceSchema().dump(resource)

    def delete(self, id):
        resource = db.session.query(ThrivResource).filter(ThrivResource.id == id).first()
        elastic_index.remove_resource(resource)
        db.session.query(ThrivResource).filter_by(id=id).delete()
        db.session.commit()
        return None

    def put(self, id):
        request_data = request.get_json()
        instance = db.session.query(ThrivResource).filter_by(id=id).first()
        updated, errors = ThrivResourceSchema().load(request_data, instance=instance)
        updated.last_updated = datetime.datetime.now()
        if errors: raise RestException(RestException.INVALID_RESOURCE, details=errors)
        db.session.add(updated)
        db.session.commit()
        elastic_index.update_resource(updated)
        return ThrivResourceSchema().dump(updated)

    @app.route('/api/resource/<int:id>/icon', methods=['POST'])
    def set_icon_image(id):
        """Assign a new Icon URL and return a signed URL for upload."""
        # see: http://stackoverflow.com/questions/10044151/
        #           how-to-generate-a-temporary-url-to-upload-file-to-
        #           amazon-s3-with-boto-library
        # Post to this endpoint, get back an s3 upload URL.
        # When you create a pre-signed URL, you must provide your security
        # credentials, specify a bucket name an object key, an HTTP method
        # (PUT of uploading objects) and an expiration date and time. The
        # pre-signed URLs are valid only for the specified duration.
        resource = db.session.query(
            ThrivResource).filter(ThrivResource.id == id).first()
        if resource is None:
            raise RestException(RestException.NOT_FOUND)

        s3 = boto3.client('s3')
        upload_bucket = app.config['S3_INCOMING_BUCKET_NAME']
        icon_id = 'ThrivResource({}).Icon({}).svg'.format(id, uuid4().hex)
        share_url = '{}/{}'.format(app.config['PHOTO_SERVE_URL'], icon_id)
        upload_post_args = s3.generate_presigned_post(upload_bucket, icon_id)

        if resource.icon_id:
            # TODO: Delete the existing svg file
            pass

        resource.icon_id = icon_id
        resource.last_updated = datetime.datetime.now()
        db.session.add(resource) ## TODO is this necessary?
        db.session.commit()
        elastic_index.update_resource(resource)
        return_this = {'upload_post_args': upload_post_args}
        return jsonify(return_this)

    @app.route('/api/resource/<int:id>/header', methods=['POST'])
    def set_header_image(id):
        """Assign a new Header URL and return a signed URL for upload."""
        # see: http://stackoverflow.com/questions/10044151/
        #           how-to-generate-a-temporary-url-to-upload-file-to-
        #           amazon-s3-with-boto-library
        # Post to this endpoint, get back an s3 upload URL.
        # When you create a pre-signed URL, you must provide your security
        # credentials, specify a bucket name an object key, an HTTP method
        # (PUT of uploading objects) and an expiration date and time. The
        # pre-signed URLs are valid only for the specified duration.
        resource = db.session.query(
            ThrivResource).filter(ThrivResource.id == id).first()
        if resource is None:
            raise RestException(RestException.NOT_FOUND)

        s3 = boto3.client('s3')
        upload_bucket = app.config['S3_INCOMING_BUCKET_NAME']
        header_id = 'ThrivResource({}).Header({}).svg'.format(id, uuid4().hex)
        share_url = '{}/{}'.format(app.config['PHOTO_SERVE_URL'], header_id)
        upload_post_args = s3.generate_presigned_post(upload_bucket, header_id)

        if resource.header_id:
            # TODO: Delete the existing svg file
            pass

        resource.header_id = header_id
        resource.last_updated = datetime.datetime.now()
        db.session.add(resource) ## TODO is this necessary?
        db.session.commit()
        elastic_index.update_resource(resource)
        return_this = {'upload_post_args': upload_post_args}
        return jsonify(return_this)

class ResourceListEndpoint(flask_restful.Resource):

    def get(self):
        schema = ThrivResourceSchema(many=True)
        resources = db.session.query(ThrivResource).all()
        return schema.dump(resources)

    def post(self):
        schema = ThrivResourceSchema()
        request_data = request.get_json()
        resource, errors = ThrivResourceSchema().load(request_data)
        if errors: raise RestException(RestException.INVALID_OBJECT, details=errors)
        db.session.add(resource)
        db.session.commit()
        elastic_index.add_resource(resource)
        return schema.dump(resource)
