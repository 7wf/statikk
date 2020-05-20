FROM node:lts-buster

WORKDIR /www/statikk/sh

# Updates the system
RUN apt-get upgrade -y && apt-get update -y

# Copies the source files
COPY src src

# Runs the builder
CMD [ "python3", "src/build.py" ]
