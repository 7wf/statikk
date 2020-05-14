/* eslint-disable @typescript-eslint/camelcase */
import { FastifyInstance, RouteShorthandOptions, FastifyRequest, FastifyReply } from 'fastify'
import { ServerResponse } from 'http'

import fluentSchema from 'fluent-schema'

import { User } from '../entities/user'
import { Project } from '../entities/project'

/**
 * Macro for unauthorized responses.
 */
function throwUnauthorizedError(reply: FastifyReply<ServerResponse>) {
    reply.status(401)
    throw new Error(`You're not unauthorized to access this resource.`)
}

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
 * The shorthand for GET /project/:id.
 */
const showShorthand = (fastify: FastifyInstance): RouteShorthandOptions => ({
    preValidation: fastify.authenticate,
})

/**
 * Displays a project from a user.
 */
async function show(request: FastifyRequest, reply: FastifyReply<ServerResponse>) {
    const user = request.user as { sub: string }
    const project = await Project.findOneOrFail(request.params.id, {
        relations: ['owner'],
        select: {
            owner: {
                id: true,
            },
        },
    })

    if (project.owner.id !== parseInt(user.sub)) {
        return throwUnauthorizedError(reply)
    }

    return Object.assign(project, { owner: undefined }) // hides `owner` field from response
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

    const user = await User.findOneOrFail(userId)
    const project = await Project.create({
        name: name,
        owner: user,
        repository_url: repository,
    })

    await project.save()

    return {
        id: project.id,
        name: project.name,
        owner: project.owner.id,
        repository: project.repository_url,
    }
}

/**
 * The shorthand for DELETE /project/:id.
 */
const removeShorthand = (fastify: FastifyInstance): RouteShorthandOptions => ({
    preValidation: fastify.authenticate,
    schema: {
        body: fluentSchema.object().prop('name', fluentSchema.string().required()),
    },
})

/**
 * Deletes a project.
 */
async function remove(request: FastifyRequest, reply: FastifyReply<ServerResponse>) {
    const userId = (request.user as { sub: string }).sub
    const { name } = request.body

    const project = await Project.findOneOrFail(request.params.id, {
        relations: ['owner'],
        select: {
            owner: {
                id: true,
            },
        },
    })

    if (project.owner.id !== parseInt(userId)) {
        return throwUnauthorizedError(reply)
    }

    if (project.name !== name) {
        reply.status(403) // Forbidden
        throw new Error('The given project name does not match with the original.')
    }

    await project.remove()
    return { deleted: true }
}

/**
 * Setups the project controller.
 */
function setup(fastify: FastifyInstance) {
    fastify.get('/projects', indexShorthand(fastify), index)
    fastify.put('/projects', storeShorthand(fastify), create)

    fastify.get('/project/:id', showShorthand(fastify), show)
    fastify.delete('/project/:id', removeShorthand(fastify), remove)
}

export default { setup }
