import fastify from 'fastify'

import fastifyRateLimit from 'fastify-rate-limit'

import routes from './routes'
import authentication from './authentication/jwt'

/**
 * Creates an application.
 */
export default function createApplication() {
    const application = fastify()

    application.register(fastifyRateLimit, {
        global: false,
    })

    application.register(authentication)
    application.register(routes)

    return application
}
