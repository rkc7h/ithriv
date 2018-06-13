#!/bin/bash

# Run the basic operations to start the server on the local machine.
# --------------------------------------------------------------------------

# Set the home directory
export HOME_DIR=`pwd`
echo "Running from ${HOME_DIR}"

export CD_BACKEND="cd ${HOME_DIR}/backend"
export CD_FRONTEND='cd ${HOME_DIR}/frontend'

# Start PostgreSQL, ElasticSearch, and the backend app
eval "${CD_BACKEND} && brew services start postgresql && elasticsearch && flask run && ${CD_FRONTEND} && npm install && ng serve"
echo "Starting datbase, search service, and backend app..."
echo "App running at http://localhost:4200"
