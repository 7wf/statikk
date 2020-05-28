### :zap: Statikk

> :warning: The project is currently under development. See [**#QA**](#QA) section.

A service that build and deploys modern static websites.

#### Servers

- [**API**](/servers/api) - The main server, linked with **Build** and **Static**. (built with [:rocket: **NodeJS**](#technologies) and [:blue_book: **TypeScript**](#technologies))
- [**Build**](/servers/build) - The server that builds websites. (built with [:hamster: **Go**](#technologies), [:snake: **Python**](#technologies) and [:rabbit: **RabbitMQ**](#technologies))
- [**Static**](/servers/static) - The server that serves static files. (built with [:crab: **Rust**](#technologies))

#### Technologies

###### Languages

- :rocket: [**NodeJS**](https://nodejs.org/) - Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine.
- :blue_book: [**TypeScript**](https://typescriptlang.org) - TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.
- :hamster: [**Go**](https://golang.org) - Go is an open source programming language that makes it easy to build simple, reliable, and efficient software.
- :snake: [**Python**](https://python.org) - Python is a programming language that lets you work quickly and integrate systems more effectively.
- :crab: [**Rust**](https://rust-lang.org) - A language empowering everyone to build reliable and efficient software.

###### General Services and Tools

- :whale: [**Docker**](https://docker.com) - Docker is a platform and tool for building, distributing, and running Docker containers.
- :rabbit: [**RabbitMQ**](https://www.rabbitmq.com/) - RabbitMQ is the most widely deployed open source message broker.

#### Use cases of technologies

##### Languages

- [**NodeJS**](#technologies) and [**TypeScript**](#technologies) is used at API server because it is easy to build and mantain applications with typed version of **JavaScript** (aka [**TypeScript**](https://typescriptlang.org)) and the powerfulness of [**NodeJS**](https://nodejs.org).
- [**Go**](#technologies) is used on our [`build`](/servers/build) server to manage [**Docker**](https://docker.com) containers (start builders, destroy and publish logs) from requests of a [**RabbitMQ**](rabbitmq.com) queue. It is also used due to a [*previous episode with Python*](https://github.com/statikksh/statikk/issues/5#issuecomment-633323451) where **I/O blocking** was a problem.
- [**Python**](#technologies) is used to run build scripts inside a [`builder`](/servers/build/builder).

##### General Services and Tools

- [**Docker**](#technologies) is used to build websites inside a isolated environment.
- [**RabbitMQ**](#technologies) is a powerful message broker used to share **persistent** messages between our servers.

#### QA

###### What's the project purpose?

The project was made by [me (@7wf, Itallo Gabriel)](https://github.com/7wf) because I wanted to challenge myself and go deep into some topics like **Message Brokers**, **Docker SDK**, programming languages that I don't have experience at (except **TypeScript**) and **building large applications**.

###### Will the project go live?

**No**, If you want a service like that you can go to [Netlify](https://www.netlify.com/).

###### Why the project is into an organization?

I don't like to keep my large projects into my [main account](https://github.com/7wf).
