#!/usr/bin/env bash

NODE_ENV=production
APP_ENV=production


##### Constants
APPLICATION_VERSION=$(jq -r ".version" package.json)
WITH_PUSH=0


for arg in "$@"
do
  case $arg in
    --push*)
      WITH_PUSH=1
      shift
      ;;

    --version=*)
      APPLICATION_VERSION="${arg#*=}"
      shift
      ;;
  esac
done


build_docker()
{
    docker build \
        --file ./Dockerfile \
        --tag plark/plark-spreader:$APPLICATION_VERSION \
        --tag plark/plark-spreader .

    # end of build_docker
}


push_docker()
{
    docker login --username "$DOCKER_USERNAME" --password "$DOCKER_PASSWORD"

    docker push plark/plark-spreader:$APPLICATION_VERSION
    docker push plark/plark-spreader:latest
    # end of push_docker
}

echo " ========= Start building ========= "
build_docker


if [[ $WITH_PUSH = "1" ]]
then
    echo " ========= Start pushing ========= "
    push_docker
fi
