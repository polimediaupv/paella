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
    echo "                 [-c NPM_TOKEN]"
    echo "                 [-t NPM_TAG]"
    echo
}

## MAIN
DEPLOY_FOLDER="."
NPM_TAG="latest"


while getopts ":du:v:f:t:c:" opt; do
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
        t)
            NPM_TAG="$OPTARG"
            ;;
        c)
            NPM_TOKEN="$OPTARG"
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

if [ "${NPM_TOKEN}x" == "x" ] ; then
  echo "[ERROR] No npm token defined"
  usage
  exit 1
fi



ret=$( is_proper_version $VERSION )
if [[ ! 0 == $ret ]]; then # it is a proper semver VERSION
  echo "[INFO] Nothing published as version $VERSION is not a proper version format"
  exit 0
fi

TMP_FOLDER=$(mktemp -d -t deploy-npm.XXXXXX)
echo "[INFO] Using $TMP_FOLDER as temporal folder"

cp -r $DEPLOY_FOLDER/ $TMP_FOLDER

if [ -f "package.json" ]; then
  cp package.json $TMP_FOLDER
fi
if [ -f "$SCRIPT_FOLDER/package.json" ]; then
  cp $SCRIPT_FOLDER/package.json $TMP_FOLDER
fi

if [ -f "README.md" ]; then
  cp README.md $TMP_FOLDER
fi
if [ -f "$SCRIPT_FOLDER/README.md" ]; then
  cp $SCRIPT_FOLDER/README.md $TMP_FOLDER
fi
replaceJsonProp "$TMP_FOLDER/package.json" "version" ".*" "$VERSION"

cat > "$TMP_FOLDER/.npmrc" <<EOF
//registry.npmjs.org/:_authToken=$NPM_TOKEN
EOF
cat > "$TMP_FOLDER/.npmignore" <<EOF
.npmrc
EOF

pushd $TMP_FOLDER > /dev/null
echo "[INFO] Publishing npm package version=$VERSION tag=$NPM_TAG"
npm publish --tag $NPM_TAG
popd > /dev/null

echo "[INFO] Removing temporal folder"
rm -rf $TMP_FOLDER
echo "[INFO] Done!"