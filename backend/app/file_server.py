import boto3


class FileServer:

    def __init__(self, app):
        self.s3 = boto3.resource('s3')
        self.bucket = app.config['S3']['bucket']
        self.base_url = app.config['S3']['base_url']

    def _save_file(self, data, filename, mime_type):
        self.s3.Bucket(self.bucket).put_object(Key=filename, Body=data, ACL='public-read',
                                               ContentType=mime_type)
        return self._get_remote_path(filename)

    def _get_remote_path(self, filename):
        return "{0}/{1}/{2}".format(self.base_url, self.bucket, filename)

    def save_icon(self, data, icon, file_extension, mime_type):
        path = "ithriv/icon/%s.%s" % (icon.id, file_extension)
        file_name = self._save_file(data, path, mime_type)
        return file_name

    def save_resource_attachment(self, data, attachment, file_extension, mime_type):
        path = "ithriv/resource/attachment/%s.%s" % (attachment.id, file_extension)
        file_name = self._save_file(data, path, mime_type)
        return file_name
