FROM node:lts-buster

WORKDIR /www/statikk/sh

COPY . .

RUN yarn
RUN yarn build

CMD [ "yarn", "start" ]
