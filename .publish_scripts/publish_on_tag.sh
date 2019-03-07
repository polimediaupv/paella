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
    echo "                  -v VERSION"
    echo
}

while getopts ":d:v:" opt; do
    case $opt in
        d)
            DEBUG=1
            ;;
        v)
            VERSION="$OPTARG"
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

if [ "${VERSION}x" == "x" ]; then
  echo "[ERROR] No version defined"
  usage
  exit 1
fi


echo "[INFO] Publishing VERSION ${VERSION}"	
./$SCRIPT_FOLDER/webpage/publish_player.sh -v $VERSION -f `pwd` -r $GITHUB_WEBPAGE_REPO -n "$POLIMEDIA_NAME" -e "$POLIMEDIA_EMAIL" -c $GITHUB_AUTH_TOKEN
./$SCRIPT_FOLDER/npm/publish.sh -v $VERSION -c $NPM_TOKEN -f "$DEPLOY_FOLDER" 
./$SCRIPT_FOLDER/bower/publish.sh -v $VERSION -f "$DEPLOY_FOLDER" -r $GITHUB_BOWER_REPO -n "$POLIMEDIA_NAME" -e "$POLIMEDIA_EMAIL" -c $GITHUB_AUTH_TOKEN
./$SCRIPT_FOLDER/tarball/publish.sh -v $VERSION -f "$DEPLOY_FOLDER" -o $TGZ_OUTPUT
