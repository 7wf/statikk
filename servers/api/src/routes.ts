import { FastifyInstance } from 'fastify'

import SignUpController from './controllers/signup.controller'
import SessionController from './controllers/session.controller'

import ProjectController from './controllers/project.controller'
import ProjectBuildController from './controllers/project-build.controller'

/**
 * Setups all routes to a `fastify` application.
 */
export default async function setupRoutes(fastify: FastifyInstance) {
    SignUpController.setup(fastify)
    SessionController.setup(fastify)

    ProjectController.setup(fastify)
    ProjectBuildController.setup(fastify)
}
