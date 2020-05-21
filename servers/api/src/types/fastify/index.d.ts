import { Server, IncomingMessage, ServerResponse } from 'http'
import { Socket, Server as SocketIOServer } from 'socket.io'

declare module 'fastify' {
    export interface FastifyInstance<
        HttpServer = Server,
        HttpRequest = IncomingMessage,
        HttpResponse = ServerResponse
    > {
        authenticate: any // JWT authentication decorator

        websocket: SocketIOServer
        websocketUsers: Map<string, Socket>
    }
}
