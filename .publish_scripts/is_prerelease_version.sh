#!/bin/bash

SCRIPT_FOLDER=$(dirname $0)
SCRIPT_PARENT_FOLDER=$(dirname $SCRIPT_FOLDER)
SCRIPT_FILENAME="$(basename "$0")"
VERSION=$1

source  $SCRIPT_FOLDER/utility.sh

ret=$( is_draft_version $VERSION )
if [[ ! 0 == $ret ]]; then # it is a proper semver VERSION
  echo false
else
  echo true
fi
