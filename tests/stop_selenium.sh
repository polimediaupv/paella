#!/bin/sh

docker stop paella-test-nginx
docker stop paella-test-selenium

docker rm paella-test-nginx
docker rm paella-test-selenium
