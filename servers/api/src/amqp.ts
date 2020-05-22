import { FastifyInstance } from 'fastify'

import aqmp, { ConsumeMessage } from 'amqplib'

import { AMQP_CONNECTION_URL } from './utils/environment'

const LOGS_QUEUE = 'build-logs'
const LOGS_EXCHANGE = 'logs'

export default async function amqp(fastify: FastifyInstance) {
    if (AMQP_CONNECTION_URL) {
        const aqmpConnection = await aqmp.connect(AMQP_CONNECTION_URL)
        const channel = await aqmpConnection.createChannel()

        console.log('Successfully connected to RabbitMQ.')

        fastify.decorate('amqpConnection', aqmpConnection)
        fastify.decorateRequest('amqpChannel', channel)

        await channel.assertExchange(LOGS_EXCHANGE, 'fanout', { durable: false })

        const queue = await channel.assertQueue(LOGS_QUEUE, { exclusive: true })
        await channel.bindQueue(queue.queue, LOGS_EXCHANGE, '')

        await channel.consume('build-logs', (message: ConsumeMessage | null) => {
            if (!message || !message.content) return
            const repository = message.properties.headers['repository']

            channel.ack(message)

            fastify.websocket.in(repository).emit('project/build-message', message.content)
        })
    } else {
        console.log('The AMQP connection URL was not provided.')
        console.log('The application will still run, but the following services will not work.')
        console.log('  - Repository builds, Build logs.')
    }
}
