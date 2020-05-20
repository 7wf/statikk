from pathlib import Path
from os import getcwd

from docker.errors import BuildError

# Builds the `builder` image
BUILDER_PATH = Path(getcwd()).joinpath("builder")
BUILDER_IMAGE_TAG = "statikk:builder"

# Builds the builder image.
def prepare_builder_image(docker_client):
    print("Building image {}...".format(BUILDER_IMAGE_TAG))

    try:
        docker_client.images.build(
            path = str(BUILDER_PATH),
            tag = BUILDER_IMAGE_TAG
        )
        print("Build finished. {} is ready.".format(BUILDER_IMAGE_TAG))
    except (BuildError) as exception:
        print("Docker could not build {}, {}", BUILDER_IMAGE_TAG, exception.msg)
        exit(1)

# Builds a project from a git repository
def build_project(docker_client, repository):
    return docker_client.containers.run(BUILDER_IMAGE_TAG, environment = {
        "REPOSITORY": repository
    }, detach=True)
