import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { ServerResponse } from 'http'

import { APP_SECRET } from '../utils/environment'

import fastifyPlugin from 'fastify-plugin'
import fastifyJWT from 'fastify-jwt'

/**
 * Setups the authentication.
 */
export default fastifyPlugin(async (fastify: FastifyInstance) => {
    fastify.register(fastifyJWT, { secret: APP_SECRET })
    fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
        try {
            await request.jwtVerify()
        } catch (error) {
            reply.send({ error })
        }
    })
})
