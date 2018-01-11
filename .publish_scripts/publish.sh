#!/bin/bash

SCRIPT_FOLDER=$(dirname $0)
SCRIPT_PARENT_FOLDER=$(dirname $SCRIPT_FOLDER)
SCRIPT_FILENAME="$(basename "$0")"

# NPM_TOKEN and GITHUB_AUTH_TOKEN are stored in travis secure env

TGZ_OUTPUT=$HOME/prebuilt

GITHUB_BOWER_REPO="polimediaupv/bower-paella"
POLIMEDIA_NAME="Polimedia Team"
POLIMEDIA_EMAIL="polim@upvnet.upv.es"

VERSION=${TRAVIS_TAG}
DEPLOY_FOLDER=`pwd`/build/

if [ ! -z "${TRAVIS_TAG}" ]; then
	./$SCRIPT_FOLDER/npm/publish.sh -v $VERSION -c $NPM_TOKEN -f "$DEPLOY_FOLDER" 
	./$SCRIPT_FOLDER/bower/publish.sh -v $VERSION -f "$DEPLOY_FOLDER" -r $GITHUB_BOWER_REPO -n "$POLIMEDIA_NAME" -e "$POLIMEDIA_EMAIL" -c $GITHUB_AUTH_TOKEN
	./$SCRIPT_FOLDER/tarball/publish.sh -v $VERSION -f "$DEPLOY_FOLDER" -o $TGZ_OUTPUT
fi
