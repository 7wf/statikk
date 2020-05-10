import { FastifyInstance } from 'fastify'

import SignUpController from './controllers/signup.controller'

/**
 * Setups all routes to a `fastify` application.
 */
export default async function setupRoutes(fastify: FastifyInstance) {
    SignUpController.setup(fastify)
}
