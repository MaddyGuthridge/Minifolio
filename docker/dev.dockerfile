# docker/dev.dockerfile
# =====================
#
# Dockerfile for running the server in dev mode

FROM ghcr.io/pnpm/pnpm:12
RUN pnpm runtime set node 24 -g

# Install Git and SSH
RUN apt update
RUN apt install -y openssh-client git

RUN useradd -m node

# Give pnpm permission to write to its store
RUN mkdir -p /pnpm/store && chown -R node:node /pnpm

USER node

WORKDIR /home/node/app

# Dependencies
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
RUN pnpm ci

# Configuration
COPY vite.config.ts .
COPY tsconfig.json .

# Source code
COPY src src
COPY tests tests
COPY static static

RUN ls -al /home/node/app

RUN ["pnpm", "sync"]

EXPOSE 5096

ENTRYPOINT [ "pnpm", "dev" ]
