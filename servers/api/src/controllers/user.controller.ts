import { FastifyInstance, FastifyRequest, RouteShorthandOptions } from 'fastify'

import { User } from '../entities/user'

/**
 * The shorthand options for GET /profile.
 */
const showProfileShorthand = (fastify: FastifyInstance): RouteShorthandOptions => ({
    preValidation: [fastify.authenticate],
})

/**
 * Shows the profile of the authenticated user.
 */
async function showProfile(request: FastifyRequest) {
    const { sub } = request.user as { sub: number }
    const user = User.findOneOrFail(sub, {
        select: {
            id: true,
            name: true,
        },
    })

    return user
}

/**
 * Setups the user controller.
 */
function setup(fastify: FastifyInstance) {
    fastify.get('/profile', showProfileShorthand(fastify), showProfile)
}

export default { setup }
