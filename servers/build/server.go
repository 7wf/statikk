package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"

	docker "github.com/docker/docker/client"
	dotenv "github.com/joho/godotenv"
	amqp "github.com/streadway/amqp"
)

// LogPublisher A io.Writer implementation to write data to a Publisher channel.
type LogPublisher struct {
	Channel    *amqp.Channel
	Repository string
}

func (publisher *LogPublisher) Write(data []byte) (length int, error error) {
	error = publisher.Channel.Publish("statikk.build.logs", "build-logs", false, false, amqp.Publishing{
		Body: data,
		Headers: amqp.Table{
			"repository": publisher.Repository,
		},
	})

	return len(data), error
}

// Consumer a AQMP consumer
type Consumer struct {
	Connection     *amqp.Connection
	Channel        *amqp.Channel
	PublishChannel *amqp.Channel
	Tag            string
	Done           chan error
}

// NewConsumer Creates a new AQMP consumer
func NewConsumer(amqpURL string, consumerTag string) error {
	consumer := &Consumer{
		Connection: nil,
		Channel:    nil,
		Tag:        consumerTag,
	}

	var error error

	log.Printf("Connecting to the RabbitMQ server...\n")
	consumer.Connection, error = amqp.Dial(amqpURL)
	if error != nil {
		return fmt.Errorf("Errored while trying to connect to the RabbitMQ server: %s", error)
	}

	log.Printf("Successfully connected to RabbitMQ server.\n")
	log.Printf("Creating channel connection...\n")
	consumer.Channel, error = consumer.Connection.Channel()
	if error != nil {
		return fmt.Errorf("Errored while creating a channel for consumer %s: %s", consumerTag, error)
	}

	log.Printf("Channel connection has been succesfully done.\n")
	log.Printf("Creating publisher channel connection...\n")
	consumer.PublishChannel, error = consumer.Connection.Channel()
	if error != nil {
		return fmt.Errorf("Errored while creating a channel for publisher %s: %s", consumerTag, error)
	}

	log.Printf("Publsher channel connection has been succesfully done.\n")
	log.Printf("Declaring `builds` queue exchange...\n")
	buildQueue, error := consumer.Channel.QueueDeclare("builds", true, false, false, true, nil)
	if error != nil {
		return fmt.Errorf("Errored while declaring `builds` queue: %s", error)
	}

	log.Printf("The queue `%s` has been declared!\n", buildQueue.Name)

	log.Printf("Declaring `build-logs` exchange for logs...\n")
	exchangeError := consumer.Channel.ExchangeDeclare("statikk.build.logs", "fanout", true, false, false, true, nil)
	if exchangeError != nil {
		return fmt.Errorf("Errored while declaring fanout exchange for `statikk.build.logs`: %s", error)
	}

	log.Printf("Connecting to `%s` queue.\n", buildQueue.Name)
	deliveries, error := consumer.Channel.Consume(buildQueue.Name, consumer.Tag, true, false, true, true, nil)
	if error != nil {
		return fmt.Errorf("Errored while trying consume messages from the `%s` queue: %s", buildQueue.Name, error)
	}

	log.Printf("Ready.")

	go HandleDelivery(consumer, deliveries)

	for consumer.Connection.IsClosed() != true {
	}

	log.Fatal("Connection closed.")

	return nil
}

var dockerClient *docker.Client

// HandleCreateContainer internal for handling build `start` messages.
func HandleCreateContainer(channel *amqp.Channel, repository string, repositoryID string) {
	log.Printf("Build started for %s.\n", repositoryID)

	context := context.Background()
	container, error := dockerClient.ContainerCreate(context, &container.Config{
		Image: "statikk:builder",
		Env:   []string{"REPOSITORY=" + repository},
	}, nil, nil, repositoryID)

	if error != nil {
		log.Printf("Cannot create container %s: %s\n", repositoryID, error.Error())
		return
	}

	if error := dockerClient.ContainerStart(context, container.ID, types.ContainerStartOptions{}); error != nil {
		log.Printf("Cannot start container %s: %s\n", container.ID, error.Error())
		return
	}

	logs, error := dockerClient.ContainerLogs(context, repositoryID, types.ContainerLogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
		Timestamps: true,
	})

	if error != nil {
		log.Printf("Cannot get logs of container %s: %s\n", repositoryID, error)
		return
	}

	logPublisher := LogPublisher{
		Channel:    channel,
		Repository: repositoryID,
	}

	if _, error := io.Copy(&logPublisher, logs); error != nil {
		log.Printf("Cannot publish log output of %s: %s\n", repositoryID, error.Error())
		return
	}
}

// HandleStopContainer internal for handling build `stop` messages
func HandleStopContainer(repositoryID string) {
	log.Printf("Stopping build for %s.\n", repositoryID)

	context := context.Background()
	error := dockerClient.ContainerRemove(context, repositoryID, types.ContainerRemoveOptions{
		Force: true,
	})

	if error != nil {
		log.Printf("Cannot remove container %s: %s\n", repositoryID, error.Error())
	} else {
		log.Printf("Build stoped for %s.\n", repositoryID)
	}
}

// HandleDelivery internal for handling `builds` queue messages
func HandleDelivery(consumer *Consumer, deliveries <-chan amqp.Delivery) {
	for delivery := range deliveries {
		action := delivery.Headers["action"].(string)

		repository := delivery.Headers["repository"]
		repositoryID := delivery.Headers["repository-id"]

		switch action {
		case "start":
			if repository != nil && repositoryID != nil {
				go HandleCreateContainer(consumer.PublishChannel, repository.(string), repositoryID.(string))
			} else {
				log.Printf("Cannot start build: The field `repository` or `repository-id` is missing from message headers.")
			}
		case "stop":
			if repositoryID != nil {
				go HandleStopContainer(repositoryID.(string))
			} else {
				log.Printf("Cannot stop build: The field `repository-id` is missing from message headers.")
			}
		}

	}

	log.Printf("Deliveries channel closed.")
	consumer.Done <- nil
}

func main() {
	// .env
	if error := dotenv.Load(); error != nil {
		panic(error)
	}

	// Docker
	dockerClientConnection, error := docker.NewEnvClient()
	if error != nil {
		panic(fmt.Errorf("Cannot connect to Docker"))
	}

	dockerClient = dockerClientConnection

	// RabbitMQ
	if error := NewConsumer(os.Getenv("AQMP_CONNECTION_URL"), "build-server"); error != nil {
		panic(error)
	}
}
