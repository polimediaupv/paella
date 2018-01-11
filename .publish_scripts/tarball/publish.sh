#!/bin/bash

SCRIPT_FOLDER=$(dirname $0)
SCRIPT_PARENT_FOLDER=$(dirname $SCRIPT_FOLDER)
SCRIPT_FILENAME="$(basename "$0")"

source  $SCRIPT_PARENT_FOLDER/utility.sh
#. _scripts/github.sh

usage() {
    echo "usage: $0 -d"
    echo "                  -v VERSION"
    echo "                 [-f FOLDER]"
    echo "                 [-o OUTPUT_FOLDER]"
    echo
}

## MAIN
DEPLOY_FOLDER="."
OUTPUT_FOLDER="."


while getopts ":du:v:f:o:" opt; do
    case $opt in
        d)
            DEBUG=1
            ;;
        v)
            VERSION="$OPTARG"
            ;;
        f)
            DEPLOY_FOLDER="$OPTARG"
            ;;            
        o)
            OUTPUT_FOLDER="$OPTARG"
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

if [ "${DEPLOY_FOLDER}x" == "x" ]; then
  echo "[ERROR] No deploy folder defined"
  usage
  exit 1
fi

if [ ! -d "${DEPLOY_FOLDER}" ]; then
  echo "[ERROR] Deploy folder does not exists"  
  exit 1
fi

mkdir -p ${OUTPUT_FOLDER}
if [ ! -d "${OUTPUT_FOLDER}" ]; then
  echo "[ERROR] Output folder does not exists"  
  exit 1
fi


ret=$( is_proper_version $VERSION )
if [[ ! 0 == $ret ]]; then # it is a proper semver VERSION
  echo "[INFO] Nothing published as version $VERSION is not a proper version format"
  exit 0
fi

echo "[INFO] Publishing tarball package version=$VERSION to $OUTPUT_FOLDER"

tar czf $OUTPUT_FOLDER/paella-prebuilt-${VERSION}.tar.gz -C $DEPLOY_FOLDER .

echo "[INFO] Done!"