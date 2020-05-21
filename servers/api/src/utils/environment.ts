/**
 * The port on which the application will be listening
 */
export const APP_PORT = process.env.APP_PORT || 1337

/**
 * The port on which the application will be listening
 */
export const APP_SECRET = process.env.APP_SECRET || 'secret'

/**
 * The AQMP connection URL.
 */
export const AMQP_CONNECTION_URL = process.env.AMQP_CONNECTION_URL

/**
 * The PostgreSQL hostname.
 */
export const POSTGRES_HOST = process.env.POSTGRES_HOST

/**
 * The PostgreSQL password.
 */
export const POSTGRES_PORT = process.env.POSTGRES_PORT

/**
 * The user that will consume data from PostgreSQL.
 */
export const POSTGRES_USER = process.env.POSTGRES_USER

/**
 * The password of the POSTGRES_USER.
 */
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD

/**
 * The target PostgreSQL database.
 */
export const POSTGRES_DB = process.env.POSTGRES_DB || 'statikk'
