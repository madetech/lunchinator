FROM node:12-alpine3.10

RUN apk add build-base bash

RUN apk --no-cache add shadow

ARG UID=1001

# move node user out of the way
RUN groupmod -g ${UID} node \
  && usermod -u ${UID} -g ${UID} node

WORKDIR /app

RUN chown node:node /app

COPY --chown=node:node . .

USER node

RUN yarn install
