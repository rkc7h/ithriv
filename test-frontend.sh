#!/bin/bash

# Start Postgres & Elasticsearch, then run all backend unit tests.
# --------------------------------------------------------------------------
pause_for () {
  for (( c=1; c<=$1; c++ ))
  do
     sleep 1 && echo "."
  done
}

# Set the home directory
export HOME_DIR=`pwd`
BACKEND_PATH="${HOME_DIR}/backend"
FRONTEND_PATH="${HOME_DIR}/frontend"
DATABASE_PATH="/usr/local/var/postgres"

# Pause for 3 seconds
pause_for 3

echo -e '\n\n*** Stopping currently-running services... ***\n\n'
./stop.sh

# Pause for 3 seconds to allow stop script to finish
pause_for 3

echo "Running from ${HOME_DIR}"

echo -e '\n\n*** Starting postgresql and elasticsearch... ***\n\n'
pg_ctl start -D $DATABASE_PATH -W

# Pause for 3 seconds to allow Postgres to start
pause_for 3

elasticsearch -d

# Pause for 10 seconds to allow Elasticsearch to start
pause_for 15

echo -e '\n\n*** Starting backend app... ***\n\n'
cd $BACKEND_PATH
source python-env/bin/activate
export FLASK_APP=./app/__init__.py
flask run &
FLASK_PID=$! # Save the process ID

# Pause for 5 seconds to allow Flask to start
pause_for 5

echo -e '\n\n*** Running frontend tests... ***\n\n'
cd $FRONTEND_PATH
ng e2e

