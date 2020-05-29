### Statikk API

#### Features

- :lock: Users can create an account and log in.
- :globe_with_meridians: Authenticated users can create, list, view, update, delete, projects (aka websites) with name and git repository URL.
- :gear: Authenticated users can run builds manually.

#### Running

##### Requirements

- :hammer_and_wrench: [**Git**](https://git-scm.com/) - Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.
- :elephant: [**PostgreSQL**](https://www.postgresql.org/download/) *(12.2)* - The PostgreSQL object-relational database system provides reliability and data integrity.
- :rocket: [**NodeJS**](https://nodejs.org/) - Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine.
- :cat: [**Yarn**](https://classic.yarnpkg.com/en/docs/install) - Fast, reliable, and secure dependency management.

###### Optional requirements

- :whale: [**Docker**](https://docker.com) - Docker is a platform and tool for building, distributing, and running Docker containers.
- :rabbit: [**RabbitMQ**](https://www.rabbitmq.com/) - RabbitMQ is the most widely deployed open source message broker.

> :memo: RabbitMQ is optional, the server can run without it, but the **Build System** will not work.

> :memo: With **Docker** you can get **PostgreSQL** and **RabbitMQ** easily by running `docker-compose up -d` inside the API's directory.

> :memo: Write down all credentials of your **PostgreSQL** and **RabbitMQ**, you will need them later.
>
> The fields you will need for **PostgreSQL** is
> - `hostname` and `port`
> - `user` and `password` with read and write access to a `database`
>
> For **RabbitMQ**, you need to create a new user and put inside a AQMP URL like `amqp://user:password@hostname:port/`

##### Getting the source code

After running all [services](#requirements), you're ready to get the source code.

You get it by executing the following command:

```sh
$ git clone https://github.com/statikksh/statikk
```

##### Create API environment file (`.env`)

With the source code in hands, Go into `<source code>/servers/api`.

###### Linux or Git Bash

Execute the following command inside the previously mentioned directory

```sh
$ cp .env.example .env
```

This will copy the contents of `.env.example` into a new file called `.env`

##### Configuring the API server

Open file `.env` inside a text editor and edit all fields with your values.

```ini
# The port on which the application will be listening
APP_PORT=

# The secret phrase for generate JWT tokens.
APP_SECRET=

# The RabbitMQ URL connection.
AMQP_CONNECTION_URL=

# The postgres connection options.
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# NOTE: Don't change `POSTGRES_USER` and `POSTGRES_PASSWORD` when using PostgreSQL on docker.
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=statikk
```

After editing all fields, you're ready to run the API server.

#### Running the API server

```sh
# Inside the <source code>/servers/api:
$ yarn

# Then build and run the server with:
$ yarn build && yarn start
```
