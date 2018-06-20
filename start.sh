#!/bin/bash

# Run the basic operations to start the server on the local machine.
# --------------------------------------------------------------------------

# Set the home directory
export HOME_DIR=`pwd`
BACKEND_PATH="${HOME_DIR}/backend"
FRONTEND_PATH="${HOME_DIR}/frontend"
DATABASE_PATH="/usr/local/var/postgres"

echo "Running from ${HOME_DIR}"
pg_ctl start -D $DATABASE_PATH &
POSTGRES_PID=$! # Save the process ID

echo -e '\n\n*** Starting postgresql and elasticsearch... ***\n\n'
elasticsearch &
ELASTIC_PID=$! # Save the process ID

echo -e '\n\n*** Starting backend app... ***\n\n'
cd $BACKEND_PATH
source python-env/bin/activate
export FLASK_APP=./app/__init__.py
flask run &
FLASK_PID=$! # Save the process ID

echo -e '\n\n*** Starting frontend app... ***\n\n'
cd $FRONTEND_PATH
ng serve &
NG_PID=$! # Save the process ID

echo -e '\n\n*** frontend app running at http://localhost:4200 ***\n\n'
wait $POSTGRES_PID $ELASTIC_PID $FLASK_PID $NG_PID
