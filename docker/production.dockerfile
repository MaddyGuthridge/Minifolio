# docker/production.dockerfile
# =====================
#
# Dockerfile for running the server in production mode.

FROM ghcr.io/pnpm/pnpm:12
RUN pnpm runtime set node 24 -g

# Install Git and SSH
RUN apt update
RUN apt install -y openssh-client git

RUN useradd -m node

# Give pnpm permission to write to its store
RUN mkdir -p /pnpm/store && chown -R node:node /pnpm

# Make volumes be owned by the node user
RUN mkdir /data
RUN chown node:node /data
RUN mkdir /private_data
RUN chown node:node /private_data

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
COPY static static

RUN ls -al /home/node/app

# Build server
RUN pnpm build

EXPOSE 3000

HEALTHCHECK CMD ["curl", "-f", "http://127.0.0.1:3000/-/api/health"]
ENTRYPOINT [ "node", "build" ]
