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

# Update the database
export HOME_DIR=`pwd`
echo "Running from ${HOME_DIR}"

export FLASK_APP=${HOME_DIR}/backend/app/__init__.py


# Continue to update conda in case I can get that working ...
eval 'cd ${HOME_DIR}/backend && pip install -r requirements.txt'
if [ "$ENV" == "staging" ]; then 
   eval 'cd ${HOME_DIR}/backend && flask cleardb'
fi
eval 'cd ${HOME_DIR}/backend && flask db upgrade'
eval 'cd ${HOME_DIR}/backend && flask db migrate'
if [ "$ENV" == "staging" ]; then 
    eval 'cd ${HOME_DIR}/backend && flask initdb'
fi
eval 'cd ${HOME_DIR}/backend && flask index_resources'

# Rebuild the front end.
eval 'cd ${HOME_DIR}/frontend && npm install'
eval 'cd ${HOME_DIR}/frontend && ng build --environment=${ENV}'    

# Reload apache
echo "Reloading Apache"
sudo service apache2 reload

