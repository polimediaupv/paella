#!/bin/bash

SCRIPT_FOLDER=$(dirname $0)
SCRIPT_PARENT_FOLDER=$(dirname $SCRIPT_FOLDER)
SCRIPT_FILENAME="$(basename "$0")"
VERSION=$1

is_prerelease_version(){
  version="$1"

  if [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(\-[0-9A-Za-z\.\-]+)(\+[0-9A-Za-z\.\-]+)?$ ]]
  then
    echo 0
    return 0
  fi

  echo 1
  return 0
}

ret=$( is_prerelease_version $VERSION )
if [[ ! 0 == $ret ]]; then
  echo false
else
  echo true
fi
