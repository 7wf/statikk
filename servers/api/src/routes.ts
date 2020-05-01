import { FastifyInstance } from 'fastify'

/**
 * Setups all routes to a `fastify` application.
 */
export default async function setupRoutes(fastify: FastifyInstance) {
    fastify.get('/', async () => process.uptime())
}
