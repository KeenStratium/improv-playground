FROM node:15.8.0-alpine3.10
WORKDIR /usr/app
COPY package.json .
RUN npm install --global --unsafe-perm exp
COPY . .