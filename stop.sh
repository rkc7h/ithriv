#!/bin/bash

# Run the basic operations to start the server on the local machine.
# --------------------------------------------------------------------------

# Set the home directory
export HOME_DIR=`pwd`
BACKEND_PATH="${HOME_DIR}/backend"
DATABASE_PATH="/usr/local/var/postgres"

# Stop PostgreSQL
echo -e '\n\n*** Stopping postgresql... ***\n\n'
pkill -f postgres
pg_ctl stop -D $DATABASE_PATH &
POSTGRES_PID=$! # Save the process ID

# Stop ElasticSearch
echo -e '\n\n*** Stopping elasticsearch... ***\n\n'
pkill -f elasticsearch &
ELASTIC_PID=$! # Save the process ID

# Stop flask
echo -e '\n\n*** Stopping backend app... ***\n\n'
cd $BACKEND_PATH
source python-env/bin/activate
export FLASK_APP=./app/__init__.py
flask stop &
FLASK_PID=$! # Save the process ID

# Stop Angular
echo -e '\n\n*** Stopping frontend app... ***\n\n'
lsof -t -i tcp:4200 -s tcp:listen | xargs kill

wait $POSTGRES_PID $ELASTIC_PID $FLASK_PID

# Kill any remaining server processes
lsof -t -i tcp:5000 -s tcp:listen | xargs kill
lsof -t -i tcp:9200 -s tcp:listen | xargs kill
lsof -t -i tcp:5432 -s tcp:listen | xargs kill
