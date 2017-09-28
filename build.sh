#! /bin/sh

# Runs `frontend` and output production build to server/src/static/lib which
# is mounted via docker-compose.yml

echo 'Building frontend'

docker-compose run --rm -e NODE_ENV=production frontend webpack -p
