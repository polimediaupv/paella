#!/bin/bash

SCRIPT_FOLDER=$(dirname $0)
SCRIPT_PARENT_FOLDER=$(dirname $SCRIPT_FOLDER)
SCRIPT_FILENAME="$(basename "$0")"

source  $SCRIPT_PARENT_FOLDER/utility.sh
#. _scripts/github.sh

usage() {
    echo "usage: $0 -d"
    echo "                  -v VERSION"
    echo "                 [-f SRC_PAELLA_FOLDER]"
    echo "                 [-r GITHUB_WEBPAGE_REPO]"
    echo "                 [-c GITHUB_WEBPAGE_TOKEN]"
    echo "                 [-n GIT_NAME]"
    echo "                 [-e GIT_EMAIL]"
    echo
}

## MAIN
SRC_PAELLA_FOLDER="."
GIT_EMAIL="travis@travis-ci.org"
GIT_NAME="Travis CI"

while getopts ":du:yu:v:f:r:c:n:e:" opt; do
    case $opt in
        d)
            DEBUG=1
            ;;
        y)
            FORCE=1
            ;;
        v)
            VERSION="$OPTARG"
            ;;
        f)
            SRC_PAELLA_FOLDER="$OPTARG"
            ;;            
        r)
            GITHUB_WEBPAGE_REPO="$OPTARG"
            ;;
        c)
            GITHUB_WEBPAGE_TOKEN="$OPTARG"
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

if [ "${SRC_PAELLA_FOLDER}x" == "x" ]; then
  echo "[ERROR] No source paella folder defined"
  usage
  exit 1
fi

if [ ! -d "${SRC_PAELLA_FOLDER}" ]; then
  echo "[ERROR] Source paella folder does not exists"  
  exit 1
fi

if [ ! -d "${SRC_PAELLA_FOLDER}/build/player" ] ; then
  echo "[ERROR] Paella is not built"  
  exit 1
fi

if [ "${GITHUB_WEBPAGE_REPO}x" == "x" ] ; then
  echo "[ERROR] No git repo for webpage defined"
  exit 1
fi

if [ "${GITHUB_WEBPAGE_TOKEN}x" == "x" ] ; then
  echo "[ERROR] No git token defined"
  exit 1
fi



echo "[INFO] Publishing paella player version=$VERSION to webpage"

TMP_FOLDER=$(mktemp -d -t deploy-player.XXXXXX)
echo "[INFO] Using $TMP_FOLDER as temporal folder"

git clone https://${GITHUB_WEBPAGE_TOKEN}@github.com/${GITHUB_WEBPAGE_REPO}.git --branch gh-pages $TMP_FOLDER
COMMIT_AUTHOR=$(git --no-pager show -s --format='%an <%ae>' ${TRAVIS_COMMIT})

pushd $TMP_FOLDER > /dev/null

    if [ -d "${TMP_FOLDER}/paella/player-${VERSION}" ] ; then
        if [ "${FORCE}x" == "1x" ] ; then
            echo "[INFO] player version ${VERSION} is already installed. Updating..."
            git rm -r paella/player-${VERSION}/*            
        else
            echo "[ERROR] player version ${VERSION} is already installed"
            exit 1
        fi
    fi

    cp -r ${SRC_PAELLA_FOLDER}/build/player ${TMP_FOLDER}/paella/player-${VERSION}
    jq '.standalone.repository = "//repository.paellaplayer.upv.es/"' ${TMP_FOLDER}/paella/player-${VERSION}/config/config.json > ${TMP_FOLDER}/paella/player-${VERSION}/config/config.json.tmp
    mv ${TMP_FOLDER}/paella/player-${VERSION}/config/config.json.tmp ${TMP_FOLDER}/paella/player-${VERSION}/config/config.json
    

    echo "[INFO] Setup git name=$GIT_NAME email=$GIT_EMAIL"
    git config --local user.email "$GIT_EMAIL"
    git config --local user.name "$GIT_NAME"

    git add ./*
    git status    
    GIT_COMMITTER_NAME="${GIT_NAME}" GIT_COMMITTER_EMAIL="${GIT_EMAIL}" git commit --author "${COMMIT_AUTHOR}"  \
        -m "Update paella player ${VERSION}" \
        -m "Triggered by https://github.com/${TRAVIS_REPO_SLUG}/commit/${TRAVIS_COMMIT}" \
    || true




    git push --tags https://${GITHUB_WEBPAGE_TOKEN}@github.com/${GITHUB_WEBPAGE_REPO}.git gh-pages || true  
popd > /dev/null

echo "[INFO] Removing temporal folder"
rm -rf $TMP_FOLDER
echo "[INFO] Done!"