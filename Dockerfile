FROM node:12-alpine3.10

RUN apk add build-base bash

RUN apk --no-cache add shadow

ARG UID=1000

# move node user out of the way
RUN groupmod -g ${UID} node \
  && usermod -u ${UID} -g ${UID} node

WORKDIR /app

RUN chown node:node /app

USER node

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node . .

