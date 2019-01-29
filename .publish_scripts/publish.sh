#!/bin/bash

SCRIPT_FOLDER=$(dirname $0)
SCRIPT_PARENT_FOLDER=$(dirname $SCRIPT_FOLDER)
SCRIPT_FILENAME="$(basename "$0")"

# NPM_TOKEN and GITHUB_AUTH_TOKEN are stored in travis secure env

TGZ_OUTPUT=$HOME/prebuilt

GITHUB_BOWER_REPO="polimediaupv/bower-paella"
GITHUB_WEBPAGE_REPO="polimediaupv/paellaplayer.upv.es"
POLIMEDIA_NAME="Polimedia Team"
POLIMEDIA_EMAIL="polim@upvnet.upv.es"


DEPLOY_FOLDER=`pwd`/build/

if [ ! "${TRAVIS_PULL_REQUEST}x" == "falsex" ]; then
	echo "[ERROR] This is a pull request. You can not publish a PR"
	exit 1
fi

if [ ! -z "${TRAVIS_TAG}" ]; then
	echo "[INFO] Publishing on TAG ${TRAVIS_TAG}"
	VERSION=${TRAVIS_TAG}
	./$SCRIPT_FOLDER/webpage/publish_player.sh -v $VERSION -f `pwd` -r $GITHUB_WEBPAGE_REPO -n "$POLIMEDIA_NAME" -e "$POLIMEDIA_EMAIL" -c $GITHUB_AUTH_TOKEN
	./$SCRIPT_FOLDER/npm/publish.sh -v $VERSION -c $NPM_TOKEN -f "$DEPLOY_FOLDER" 
	./$SCRIPT_FOLDER/bower/publish.sh -v $VERSION -f "$DEPLOY_FOLDER" -r $GITHUB_BOWER_REPO -n "$POLIMEDIA_NAME" -e "$POLIMEDIA_EMAIL" -c $GITHUB_AUTH_TOKEN
	./$SCRIPT_FOLDER/tarball/publish.sh -v $VERSION -f "$DEPLOY_FOLDER" -o $TGZ_OUTPUT
elif [ ! -z "${TRAVIS_BRANCH}" ]; then
	echo "[INFO] Commit on branch ${TRAVIS_BRANCH} (${TRAVIS_COMMIT})"
    if [[ "$TRAVIS_BRANCH" =~ ^([0-9]+\.[0-9]+\.x)$ ]] ; then
        VERSION=${BASH_REMATCH[1]}        
    elif [[ "${TRAVIS_BRANCH}x" == "developx" ]] ; then
        VERSION=develop
    fi
	if [ -z "${VERSION}" ]; then
		echo "[ERROR] No publication for branch ${TRAVIS_BRANCH}"
	else
		echo "[INFO] Publishing on branch ${TRAVIS_BRANCH} (VERSION=${VERSION})"
		./$SCRIPT_FOLDER/webpage/publish_player.sh -v $VERSION -f `pwd` -r $GITHUB_WEBPAGE_REPO -n "$POLIMEDIA_NAME" -e "$POLIMEDIA_EMAIL" -c $GITHUB_AUTH_TOKEN -y
		./$SCRIPT_FOLDER/webpage/publish_doc.sh -v $VERSION -f `pwd` -r $GITHUB_WEBPAGE_REPO -n "$POLIMEDIA_NAME" -e "$POLIMEDIA_EMAIL" -c $GITHUB_AUTH_TOKEN
	fi
fi
