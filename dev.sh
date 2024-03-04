#!/bin/bash

docker rm -f bunelysia

docker compose run --rm bunelysia bun install

docker compose run --rm -p 3000:3000 bunelysia bun --watch --inspect=0.0.0.0:9229 run dev
