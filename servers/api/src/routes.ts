import { FastifyInstance } from 'fastify'

/**
 * Setups all routes to a `fastify` application.
 */
export default function setupRoutes(fastify: FastifyInstance) {
    fastify.get('/', async () => process.uptime())
}
