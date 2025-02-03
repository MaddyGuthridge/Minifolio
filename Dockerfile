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
COPY static static

RUN ls -al /home/node/app

# Build server
RUN npm run build

EXPOSE 3000

ENTRYPOINT [ "node", "-r", "dotenv/config", "build" ]
