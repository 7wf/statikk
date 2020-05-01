require('dotenv').config()

const createApplication = require('./main').default
const environment = require('./utils/environment')

const application = createApplication()

application.listen(environment.APP_PORT, (error: Error) => {
    if (error) throw error
    console.log(`The application is listening at port ${environment.APP_PORT}.`)
})
