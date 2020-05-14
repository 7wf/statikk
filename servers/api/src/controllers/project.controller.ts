/* eslint-disable @typescript-eslint/camelcase */
import { FastifyInstance, RouteShorthandOptions, FastifyRequest } from 'fastify'

import fluentSchema from 'fluent-schema'

import { User } from '../entities/user'
import { Project } from '../entities/project'

/**
 * The shorthand for GET /projects.
 */
const indexShorthand = (fastify: FastifyInstance): RouteShorthandOptions => ({
    preValidation: fastify.authenticate,
})

/**
 * Lists all projects from a user.
 */
async function index(request: FastifyRequest) {
    const authorization = request.user as { sub: string }
    const user = await User.findOneOrFail(authorization.sub, {
        relations: ['projects'],
        select: {
            projects: {
                id: true,
                name: true,
                repository_url: true,
            },
        },
    })

    return user.projects
}

/**
 * Shorthand options for `store`.
 */
export const storeShorthand = (fastify: FastifyInstance): RouteShorthandOptions => ({
    preValidation: [fastify.authenticate],
    schema: {
        body: fluentSchema
            .object()
            .prop('name', fluentSchema.string().required())
            .prop('repository', fluentSchema.string().required()),
    },
})

/**
 * Creates a new project.
 */
async function create(request: FastifyRequest) {
    const userId = (request.user as { sub: string }).sub
    const { name, repository } = request.body

    const user = await User.findOne(userId)
    const project = await Project.create({
        name: name,
        owner: user,
        repository_url: repository,
    })

    await project.save()

    return {
        id: project.id,
        name: project.name,
        owner: project.id,
        repository: project.repository_url,
    }
}

/**
 * Setups the project controller.
 */
function setup(fastify: FastifyInstance) {
    fastify.get('/projects', indexShorthand(fastify), index)
    fastify.post('/projects', storeShorthand(fastify), create)
}

export default { setup }
