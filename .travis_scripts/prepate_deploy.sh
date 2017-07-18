#!/bin/sh

if [ ! -z "${TRAVIS_TAG}" ]; then
	mkdir ${HOME}/deploy
	tar czf ~/deploy/paella-prebuilt-${TRAVIS_TAG}.tar.gz -C `pwd`/build/ .
fi