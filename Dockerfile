FROM node:12-alpine3.10

RUN apk add build-base bash

#ARG UID=1001

#RUN addgroup -g ${UID} -S appgroup && \
#  adduser -u ${UID} -S appuser -G appgroup

WORKDIR /app
#RUN chown appuser:appgroup /app

#COPY --chown=appuser:appgroup . .

COPY . .

RUN yarn install
