import fastify from 'fastify'

import socketio, { Socket } from 'socket.io'

import fastifyRateLimit from 'fastify-rate-limit'

import routes from './routes'
import authentication from './authentication/jwt'

import { Project } from './entities/project'
import { User } from './entities/user'

import amqp from './amqp'

/**
 * Creates an application.
 */
export default function createApplication() {
    const application = fastify()
    const websocket = socketio(application.server)

    const authenticatedSockets = new Map<string, Socket>()

    /**
     * Handles websocket connections.
     */
    async function handleConnection(socket: Socket) {
        const authorization: string = socket.handshake.headers['authorization']
        if (!authorization) socket.disconnect(true)

        try {
            const { sub }: { sub: string } = application.jwt.verify(authorization)
            const user = await User.findOne(sub, {
                select: { id: true },
            })

            if (user) {
                authenticatedSockets.set(sub, socket)
                socket.emit('ready', { id: user.id })

                socket.on('project/live-build', async (projectID: string) => {
                    const project = await Project.findOne(projectID, {
                        relations: ['owner'],
                    })

                    if (project && project.owner.id === user.id) {
                        socket.join(project.id)
                    }
                })
            } else {
                throw new Error('The ID of the given user does not exists inside the database.')
            }
        } catch (error) {
            socket.disconnect(true)
        }
    }

    application.decorate('websocket', websocket)
    application.decorate('websocketUsers', authenticatedSockets)

    websocket.on('connection', handleConnection)

    application.register(amqp)
    application.register(fastifyRateLimit, {
        global: false,
    })

    application.register(authentication)
    application.register(routes)

    return application
}
