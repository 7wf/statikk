import { FastifyInstance, FastifyRequest, FastifyReply, RouteShorthandOptions } from 'fastify'
import { ServerResponse } from 'http'

import { Project } from '../entities/project'

/**
 * The shorthand options for `run`.
 */
const runShorthand = (fastify: FastifyInstance): RouteShorthandOptions => ({
    preValidation: [fastify.authenticate],
    config: {
        rateLimit: {
            max: 4,
            timeWindow: 30 * 60 * 1000,
        },
    },
})

/**
 * Builds a project.
 */
async function run(request: FastifyRequest, reply: FastifyReply<ServerResponse>) {
    const { sub } = request.user as { sub: number }
    const project = await Project.findOne(request.query.project, {
        relations: ['owner'],
    })

    if (!project) {
        reply.status(404) // Not Found
        throw new Error('Project not found.')
    }

    if (project.owner.id !== sub) {
        reply.status(401) // Unauthorized
        throw new Error("You're not allowed to run builds of this project.")
    }

    await request.amqpChannel.sendToQueue('builds', Buffer.alloc(0), {
        headers: {
            action: 'start',
            repository: project.repository_url,
            'repository-id': project.id,
        },
    })

    return { running: true }
}

/**
 * The shorthand options for `stop`.
 */
const stopShorthand = (fastify: FastifyInstance): RouteShorthandOptions => ({
    preValidation: [fastify.authenticate],
})

/**
 * Stops a running build.
 */
async function stop(request: FastifyRequest, reply: FastifyReply<ServerResponse>) {
    const { sub } = request.user as { sub: number }
    const project = await Project.findOne(request.query.project, {
        relations: ['owner'],
    })

    if (!project) {
        reply.status(404) // Not Found
        throw new Error('Project not found.')
    }

    if (project.owner.id !== sub) {
        reply.status(401) // Unauthorized
        throw new Error("You're not allowed to stop builds of this project.")
    }

    await request.amqpChannel.sendToQueue('builds', Buffer.alloc(0), {
        headers: {
            action: 'stop',
            'repository-id': project.id,
        },
    })

    return { stoped: true } // todo is is building?
}

/**
 * Setups the project builds controller.
 */
function setup(fastify: FastifyInstance) {
    if (fastify.amqpConnection) {
        fastify.post('/build/run', runShorthand(fastify), run)
        fastify.post('/build/stop', stopShorthand(fastify), stop)
    } else {
        const serviceUnavailable = async () => {
            throw new Error('The build service is unavailable')
        }

        fastify.post('/build/run', serviceUnavailable)
        fastify.post('/build/stop', serviceUnavailable)
    }
}

export default { setup }
