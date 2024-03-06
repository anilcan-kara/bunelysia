#!/bin/bash

# USER_UID=$(id -u $USER)
# USER_GID=$(id -g $USER)

docker build . -t bunelysia --no-cache --progress plain && docker image prune -f

# docker build \
#   --build-arg USER_NAME=$USER \
#   --build-arg USER_UID=$USER_UID \
#   --build-arg USER_GID=$USER_GID \
#   . -t cronjobs --progress plain

# docker image prune -f
