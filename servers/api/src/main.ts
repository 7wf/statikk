import fastify from 'fastify'

import setupRoutes from './routes'

/**
 * Creates an application.
 */
export default function createApplication() {
    const application = fastify()
    setupRoutes(application)

    return application
}
