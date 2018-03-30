from flask import jsonify

from app import app
from app.model.resource import ThrivResource, ThrivResourceSchema
import flask_restful
from flask_restful import reqparse


api = flask_restful.Api(app)

thriv_resources = {
    'tr1': ThrivResource(id=1, name="SOMRC", description="SOMRC Resource"),
    'tr2': ThrivResource(id=2, name="Concierge", description="Concierge Services"),
    'tr3': ThrivResource(id=3, name="UVA", description="UVA stuffs"),
}

parser = flask_restful.reqparse.RequestParser()
parser.add_argument('resource')

class ResourceEndpoint(flask_restful.Resource):


    def get(self, id):
        return ThrivResourceSchema().dump(thriv_resources[id])
    def delete(self, id):
        del thriv_resources[id]
    def put(self, id):
        args = parser.parse_args()
        resource = args['resource']
        thriv_resources[id] = resource
        return resource

# TodoList
# shows a list of all todos, and lets you POST to add new tasks
class ResourceListEndpoint(flask_restful.Resource):
    def get(self):
        schema = ThrivResourceSchema(many=True)
        resources = schema.dump(thriv_resources.values())
        return jsonify(resources)


@app.route('/api', methods=['GET'])
def root():
    return "iTHRIV API"


api.add_resource(ResourceListEndpoint, '/api/resources')
api.add_resource(ResourceEndpoint, '/api/resources/<id>')