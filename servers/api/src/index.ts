require('dotenv').config()
require('reflect-metadata')

import * as typeorm from 'typeorm'
import path from 'path'

const createApplication = require('./main').default
const environment = require('./utils/environment')

async function main() {
    const application = createApplication()

    await typeorm.createConnection({
        type: 'postgres',

        host: environment.POSTGRES_HOST,
        port: environment.POSTGRES_PORT,

        username: environment.POSTGRES_USER,
        password: environment.POSTGRES_PASSWORD,
        database: environment.POSTGRES_DB,

        synchronize: true,
        entities: [path.resolve(__dirname, 'entities', '*.ts')],
    })

    application.listen(environment.APP_PORT, (error: Error) => {
        if (error) throw error
        console.log(`The application is listening at port ${environment.APP_PORT}.`)
    })
}

main()
