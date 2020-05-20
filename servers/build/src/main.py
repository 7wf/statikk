from datetime import datetime
from os import environ as env

import pika
import docker

import utils

# Environment variables
RABBITMQ_CONNECTION_PARAMETERS = pika.URLParameters(env.get("RABBITMQ_CONNECTION_URL"))

# Connect to Docker and builds the `builder` image.
docker_client = docker.from_env()
utils.prepare_builder_image(docker_client)

# Connect to RabbitMQ
print("Connecting to RabbitMQ...")
connection = pika.BlockingConnection(RABBITMQ_CONNECTION_PARAMETERS)
channel = connection.channel()

print("Successfully connected to RabbitMQ.")

# Declares a fanout exchange for `logs`
channel.exchange_declare(exchange = "logs", exchange_type = "fanout")

# Called when a message is sended inside the `build` channel.
def on_message(channel, method_frame, header_frame, body):
    started_at = datetime.now()
    repository = header_frame.headers["repository"]

    # Acknowledge the build message.
    channel.basic_ack(delivery_tag = method_frame.delivery_tag)
    print("Build started for {}.".format(repository))

    # Run builder and send logs through a Publish/Subscriber log channel.
    container = utils.build_project(docker_client, repository)
    container_logs = container.logs(
        stream = True,
        timestamps = True,
        follow = True,
        since = started_at
    )

    for line in container_logs:
        channel.basic_publish(
            exchange = 'logs',
            routing_key = 'build-logs',
            body = line,
            properties = pika.spec.BasicProperties(headers = {
                "repository": repository
            })
        )

    print("Build finished for {}.".format(repository))

# Start by consuming events from `build` queue
channel.queue_declare("build", durable = True)
channel.basic_consume("build", on_message_callback = on_message)
print("Waiting for build events...")

try: channel.start_consuming()
except KeyboardInterrupt: channel.stop_consuming()

connection.close()
