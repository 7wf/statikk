/* eslint-disable @typescript-eslint/camelcase */
import { FastifyInstance, RouteShorthandOptions, FastifyRequest, FastifyReply } from 'fastify'
import { ServerResponse } from 'http'

import { GitHubUser } from '../entities/user-github'

import axios from 'axios'

/**
 * The URL to exchange `code` for a `access_token` inside GitHub.
 */
const GITHUB_TOKEN_EXCHANGE = 'https://github.com/login/oauth/access_token'

/**
 * The URL to GitHub OAuth URL.
 */
let GITHUB_AUTHORIZATION_URL = ''

// The JWT verify options for `handleAuthorization`
const verifyOptions = {
    extractToken: (request: FastifyRequest) => request.query.state,
}

/**
 * Handle users authorization request.
 */
async function handleAuthorization(request: FastifyRequest) {
    const { code, state } = request.query

    if (!state || !code) throw new Error('Missing `state` or `code` inside query parameters.')

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const { sub } = (await request.jwtVerify(verifyOptions)) as { sub: number }

    const exchangeResponse = await axios
        .post(GITHUB_TOKEN_EXCHANGE, {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code,
            state,
        })
        .then((response) => response.data)

    if (!exchangeResponse.access_token) throw new Error('The access token was not provided by GitHub.')
    const githubUser = await GitHubUser.findOne(sub)

    if (!githubUser) {
        const githubUserData = {
            id: sub,
            token: exchangeResponse.access_token,
        }

        await GitHubUser.create(githubUserData).save()
    } else {
        await GitHubUser.update(githubUser.id, { token: exchangeResponse.access_token })
    }

    return { success: true }
}

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
    fastify.get('/auth/github/callback', handleAuthorization)
}

export default { setup }
