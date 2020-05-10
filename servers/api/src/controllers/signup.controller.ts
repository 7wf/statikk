/* eslint-disable @typescript-eslint/camelcase */
import { FastifyInstance, RouteShorthandOptions, FastifyRequest, FastifyReply } from 'fastify'
import { Server, ServerResponse, IncomingMessage } from 'http'

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
            timeWindow: 30 * 60 * 1000,
        },
    },
    schema: {
        body: fluentSchema
            .object()
            .prop('name', fluentSchema.string().required())
            .prop('email', fluentSchema.string().required())
            .prop('password', fluentSchema.string().minLength(6).required())
            .prop('confirm_password', fluentSchema.string().required()),
    },
}

/**
 * Processes a user sign-up request.
 */
async function store(request: FastifyRequest, reply: FastifyReply<ServerResponse>) {
    const { name, email, password, confirm_password } = request.body

    if (password !== confirm_password) {
        reply.status(400) /// Bad Request
        throw new Error(`Passwords don't match.`)
    }

    if (await User.findOne({ where: { email } })) {
        reply.status(422) // Unprocessable Entity
        throw new Error('This user is already registered.')
    }

    const hashedPassword = await bcrypt.hash(password)
    const user = User.create({
        name,
        email,
        password: hashedPassword,
    })

    await user.save()

    return {
        token: await reply.jwtSign({ sub: user.id }),
    }
}

/**
 * Setups the sign-up controller.
 */
function setup(application: FastifyInstance) {
    application.post('/signup', storeShorthand, store)
}

export default { setup }
