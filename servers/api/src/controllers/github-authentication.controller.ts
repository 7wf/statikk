import { FastifyInstance, RouteShorthandOptions, FastifyRequest, FastifyReply } from 'fastify'
import { ServerResponse } from 'http'

/**
 * The URL to GitHub OAuth URL.
 */
let GITHUB_AUTHORIZATION_URL = ''

/**
 * The shorthand options for GET /auth/github.
 */
const generateGithubAuthorizationShorthand = (fastify: FastifyInstance): RouteShorthandOptions => ({
    preValidation: [fastify.authenticate],
})

/**
 * Generates the GitHub authorization link.
 */
async function generateGithubAuthorizationURL(request: FastifyRequest, reply: FastifyReply<ServerResponse>) {
    const { sub } = request.user as { sub: number }
    const stateToken = await reply.jwtSign({ sub }, { expiresIn: '10 minutes' })

    const githubAuthorizationUrlWithState = GITHUB_AUTHORIZATION_URL + stateToken

    return {
        url: githubAuthorizationUrlWithState,
    }
}

/**
 * Setups the GitHub authentication controller.
 */
function setup(fastify: FastifyInstance) {
    GITHUB_AUTHORIZATION_URL = [
        'https://github.com/login/oauth/authorize?',
        `client_id=${process.env.GITHUB_CLIENT_ID}&`,
        'scope=repo,write:repo_hook&',
        'state=',
    ].join('')

    fastify.get('/auth/github', generateGithubAuthorizationShorthand(fastify), generateGithubAuthorizationURL)
}

export default { setup }
