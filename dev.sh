#!/bin/bash

docker compose run --rm --name bunelysia -p 3000:3000 -p 6499:6499 bunelysia bun run dev
