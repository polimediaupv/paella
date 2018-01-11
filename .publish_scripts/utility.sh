#!/bin/bash

# decides whether it is proper semver
is_proper_version(){
  version="$1"

  if [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(\-[0-9A-Za-z\.\-]+)?(\+[0-9A-Za-z\.\-]+)?$ ]]
  then
    echo 0
    return 0
  fi

  echo 1
  return 0
}


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

# copied from https://github.com/angular/angular.js/blob/master/scripts/utils.inc
# replaceInFile file findPattern replacePattern
replaceInFile() {
  sed -i.tmp -E "s/$2/$3/" $1
  rm $1.tmp
}

# copied from https://github.com/angular/angular.js/blob/master/scripts/utils.inc
# replaceJsonProp jsonFile propertyRegex valueRegex replacePattern
# - note: propertyRegex will be automatically placed into a
#   capturing group! -> all other groups start at index 2!
replaceJsonProp() {
  replaceInFile $1 '"('$2')"[ ]*:[ ]*"'$3'"' '"\1": "'$4'"'
}
