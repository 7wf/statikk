import fastify from 'fastify'

import routes from './routes'
import authentication from './authentication/jwt'

/**
 * Creates an application.
 */
export default function createApplication() {
    const application = fastify()

    application.register(authentication)
    application.register(routes)

    return application
}
