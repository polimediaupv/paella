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
    echo "                 [-r GITHUB_BOWER_REPO]"
    echo "                 [-c GITHUB_BOWER_TOKEN]"
    echo "                 [-n GIT_NAME]"
    echo "                 [-e GIT_EMAIL]"
    echo
}

## MAIN
DEPLOY_FOLDER="."
GIT_EMAIL="travis@travis-ci.org"
GIT_NAME="Travis CI"

while getopts ":du:v:f:r:c:n:e:" opt; do
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
        r)
            GIT_BOWER_REPO="$OPTARG"
            ;;
        c)
            GIT_BOWER_TOKEN="$OPTARG"
            ;;
        n)
            GIT_NAME="$OPTARG"
            ;;
        e)
            GIT_EMAIL="$OPTARG"
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

if [ "${GIT_BOWER_REPO}x" == "x" ] ; then
  echo "[ERROR] No git repo for bower defined"
  exit 1
fi

if [ "${GIT_BOWER_TOKEN}x" == "x" ] ; then
  echo "[ERROR] No git token for bower defined"
  exit 1
fi


ret=$( is_proper_version $VERSION )
if [[ ! 0 == $ret ]]; then # it is a proper semver VERSION
  echo "[INFO] Nothing published as version $VERSION is not a proper version format"
  exit 0
fi


echo "[INFO] Publishing bower package version=$VERSION"

COMMIT_AUTHOR=$(git --no-pager show -s --format='%an <%ae>' ${TRAVIS_COMMIT})

TMP_FOLDER=$(mktemp -d -t deploy-bower.XXXXXX)
echo "[INFO] Using $TMP_FOLDER as temporal folder"

git clone https://${GIT_BOWER_TOKEN}@github.com/${GIT_BOWER_REPO}.git $TMP_FOLDER
rm -rf $TMP_FOLDER/*

cp -r $DEPLOY_FOLDER/ $TMP_FOLDER

if [ -f "$SCRIPT_FOLDER/bower.json" ]; then
  cp $SCRIPT_FOLDER/bower.json $TMP_FOLDER
fi
if [ -f "$SCRIPT_FOLDER/README.md" ]; then
  cp $SCRIPT_FOLDER/README.md $TMP_FOLDER
fi


pushd $TMP_FOLDER > /dev/null

echo "[INFO] Setup git name=$GIT_NAME email=$GIT_EMAIL"
git config --local user.email "$GIT_EMAIL"
git config --local user.name "$GIT_NAME"

git add -A
GIT_COMMITTER_NAME="${GIT_NAME}" GIT_COMMITTER_EMAIL="${GIT_EMAIL}" git commit --author "${COMMIT_AUTHOR}" \
    -m "[automated publishing] version ${VERSION}" \
    -m "Triggered by https://github.com/${TRAVIS_REPO_SLUG}/commit/${TRAVIS_COMMIT}" \
|| true
git tag $VERSION
git push --tags https://${GIT_BOWER_TOKEN}@github.com/${GIT_BOWER_REPO}.git master

popd > /dev/null

echo "[INFO] Removing temporal folder"
rm -rf $TMP_FOLDER
echo "[INFO] Done!"