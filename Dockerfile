FROM oven/bun:latest

RUN apt-get update && apt-get install -y curl vim

SHELL ["/bin/bash", "--login", "-c"]

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
RUN nvm install --lts
RUN nvm use --lts

WORKDIR /home/bun/app
