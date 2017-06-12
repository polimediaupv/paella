#!/bin/sh

docker pull nginx:alpine
docker pull selenium/standalone-chrome:3.3.0

docker run -d --name paella-test-nginx -v `pwd`/build:/usr/share/nginx/html:ro nginx:alpine
docker run -d --name paella-test-selenium --link paella-test-nginx:paella -p 4444:4444 selenium/standalone-chrome:3.3.0