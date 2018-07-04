#!/bin/bash

# Run the basic operations to update a production setup after a code change.
# This script should be executed by a post_recieve git hook after completing
# a checkout.
# --------------------------------------------------------------------------

# Move the configuration file into place.
mkdir -p ./backend/instance
cp /home/ubuntu/ithriv_config.py ./backend/instance/config.py

if [ "$1" == "prod" ]; then
    echo "Building for production."
elif [ "$1" == "staging" ]; then
    echo "Building for staging."
else
    echo "Please specify environment (prod/staging)"
    exit
fi

export ENV=$1

export FLASK_APP=./backend/app/__init__.py

# Set the home directory
export HOME_DIR=`pwd`
echo "Running from ${HOME_DIR}"

# activate the pip environment we are running inside of, and upgrade any
# library dependencies.
source ./backend/python-env/bin/activate
export FLASK_APP=${HOME_DIR}/backend/app/__init__.py
eval 'cd ${HOME_DIR}/backend && pip3 install -r requirements.txt'

# Load up the staging environment
if [ "$ENV" == "staging" ]; then 
   eval 'cd ${HOME_DIR}/backend && flask cleardb'
   eval 'cd ${HOME_DIR}/backend && flask loadicons'
fi
eval 'cd ${HOME_DIR}/backend && flask db upgrade'
if [ "$ENV" == "staging" ]; then
    eval 'cd ${HOME_DIR}/backend && flask initdb'
fi
eval 'cd ${HOME_DIR}/backend && flask clearindex'
eval 'cd ${HOME_DIR}/backend && flask initindex'

# Rebuild the front end.
eval 'cd ${HOME_DIR}/frontend && npm install'
eval 'cd ${HOME_DIR}/frontend && ng build -c ${ENV}'    

# Reload apache
echo "Reloading Apache"
sudo service apache2 reload

