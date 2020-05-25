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
 * Setups the project builds controller.
 */
function setup(fastify: FastifyInstance) {
    fastify.post('/builds', runShorthand(fastify), async (request, reply) => {
        if (fastify.amqpConnection) {
            return run(request, reply)
        } else {
            throw new Error('The build service is disabled.')
        }
    })
}

export default { setup }
