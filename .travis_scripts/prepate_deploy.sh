#!/bin/sh

if [ ! -z "${TRAVIS_TAG}" ]; then
	mkdir ${HOME}/deploy
	tar cvzf ~/deploy/paella-prebuilt-${TRAVIS_TAG}.tgz -C `pwd`/build/ .
	ls -l ${HOME}/deploy
fi