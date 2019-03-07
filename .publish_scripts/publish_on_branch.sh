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



usage() {
    echo "usage: $0 -d"
    echo "                  -b branch"
    echo
}

while getopts ":d:b:" opt; do
    case $opt in
        d)
            DEBUG=1
            ;;
        b)
            BRANCH="$OPTARG"
            ;;
        \?)
            set +x
            echo "Invalid option: -$OPTARG" >&2
            usage
            exit 1
            ;;
        :)
            set +x
            echo "Option -$OPTARG requires an argument." >&2
            usage
            exit 1
            ;;
    esac
done

if [ "${DEBUG:-}" == "1" ]; then
  echo "[INFO] Debug Enabled"
  set -x
fi

set -e

if [ "${BRANCH}x" == "x" ]; then
  echo "[ERROR] No branch defined"
  usage
  exit 1
fi


echo "[INFO] Commit on branch ${BRANCH}"
if [[ "$BRANCH" =~ ^([0-9]+\.[0-9]+\.x)$ ]] ; then
    VERSION=${BASH_REMATCH[1]}        
elif [[ "${BRANCH}x" == "developx" ]] ; then
    VERSION=develop
fi
if [ -z "${VERSION}" ]; then
    echo "[ERROR] No publication for branch ${BRANCH}"
else
    echo "[INFO] Publishing on branch ${BRANCH} (VERSION=${VERSION})"
    ./$SCRIPT_FOLDER/webpage/publish_player.sh -v $VERSION -f `pwd` -r $GITHUB_WEBPAGE_REPO -n "$POLIMEDIA_NAME" -e "$POLIMEDIA_EMAIL" -c $GITHUB_AUTH_TOKEN -y
    ./$SCRIPT_FOLDER/webpage/publish_doc.sh -v $VERSION -f `pwd` -r $GITHUB_WEBPAGE_REPO -n "$POLIMEDIA_NAME" -e "$POLIMEDIA_EMAIL" -c $GITHUB_AUTH_TOKEN
fi