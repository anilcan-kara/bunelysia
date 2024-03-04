#!/bin/bash

docker rm -f bunelysia

docker compose run --rm -i -t bunelysia bun install
