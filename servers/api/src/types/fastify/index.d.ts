import { Server, IncomingMessage, ServerResponse } from 'http'

declare module 'fastify' {
    export interface FastifyInstance<
        HttpServer = Server,
        HttpRequest = IncomingMessage,
        HttpResponse = ServerResponse
    > {
        authenticate: any // JWT authentication decorator
    }
}
