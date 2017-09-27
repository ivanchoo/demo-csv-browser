#! /bin/sh

echo 'Building frontend'

docker-compose run --rm -e NODE_ENV=production frontend webpack -p
