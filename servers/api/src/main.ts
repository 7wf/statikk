import fastify from 'fastify'

import routes from './routes'

/**
 * Creates an application.
 */
export default function createApplication() {
    const application = fastify()
    application.register(routes)

    return application
}
