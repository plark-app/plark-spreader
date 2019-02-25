#!/usr/bin/env bash

NODE_ENV=production
APP_ENV=production

export APPLICATION_VERSION=$(jq -r ".version" package.json)

docker build \
    --file ./Dockerfile \
    --tag plark/plark-spreader:$APPLICATION_VERSION \
    --tag plark/plark-spreader .

docker login --username "$DOCKER_USERNAME" --password "$DOCKER_PASSWORD"

docker push plark/plark-spreader:$APPLICATION_VERSION
docker push plark/plark-spreader:latest
