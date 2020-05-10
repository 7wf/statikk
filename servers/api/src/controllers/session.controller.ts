import { FastifyInstance, RouteShorthandOptions, FastifyRequest, FastifyReply } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'

import fluentSchema from 'fluent-schema'

import { User } from '../entities/user'

import bcrypt from '../authentication/bcrypt'

/**
 * The shorthand options for `store`.
 */
const storeShorthand: RouteShorthandOptions<Server, IncomingMessage, ServerResponse> = {
    config: {
        rateLimit: {
            max: 6,
            timeWindow: 10 * 60 * 1000, // 10 minutes
        },
    },
    schema: {
        body: fluentSchema
            .object()
            .prop('email', fluentSchema.string().required())
            .prop('password', fluentSchema.string().required()),
    },
}

/**
 * Macro for replying requests with "401 Unauthorized".
 */
function throwUnauthorizedError(reply: FastifyReply<ServerResponse>) {
    reply.status(401)
    throw new Error('Invalid credentials.')
}

/**
 * Stores a new user session.
 */
async function store(request: FastifyRequest, reply: FastifyReply<ServerResponse>) {
    const { email, password } = request.body
    const user = await User.findOne({
        where: { email },
    })

    if (!user) {
        return throwUnauthorizedError(reply)
    }

    const passwordMatch = await bcrypt.check(user.password, password)
    if (!passwordMatch) {
        return throwUnauthorizedError(reply)
    }

    const token = await reply.jwtSign({ sub: user.id }, { expiresIn: '28 days' })
    return { token }
}

/**
 * Setups the session controller.
 */
function setup(application: FastifyInstance) {
    application.post('/signin', storeShorthand, store)
}

export default { setup }
