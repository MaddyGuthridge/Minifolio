# docker/dev.dockerfile
# =====================
#
# Dockerfile for running the server in dev mode

FROM node:22

# Make volumes be owned by the node user
RUN mkdir /data
RUN chown node:node /data
RUN mkdir /private_data
RUN chown node:node /private_data

# Install Git and SSH
RUN apt install -y openssh-client git

USER node

WORKDIR /home/node/app

# Dependencies
COPY .npmrc .
COPY package.json .
COPY package-lock.json .
RUN npm ci

# Configuration
COPY vite.config.ts .
COPY svelte.config.js .
COPY tsconfig.json .

# Source code
COPY src src
COPY tests tests
COPY static static

RUN ls -al /home/node/app

RUN ["npm", "run", "sync"]

EXPOSE 5096

ENTRYPOINT [ "npm", "run", "dev" ]
