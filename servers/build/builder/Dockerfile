FROM node:lts-buster

WORKDIR /www/statikk/sh

# Updates the system
RUN apt-get upgrade -y && apt-get update -y

# Copies the source files
COPY src src

# Creates a user that will run the build script
RUN useradd --home-dir /www/statikk/sh builder && \
    chown -hR builder /www/statikk/sh && \
    chmod -R 755 /www/statikk/sh

USER builder

# Runs the builder
CMD [ "python3", "-u", "src/build.py" ]
