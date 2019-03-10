const path = require('path')
const bunyan = require('bunyan')
const level = process.env.NODE_LOGGING_LEVEL || 'info'
const logger = bunyan.createLogger({
    name: 'ubnt-task-backend',
    streams: [
        {
            level,
            stream: process.stdout,
        },
        {
            level,
            path: path.resolve(__dirname, '..', 'logs/', 'logs.json'),
        },
    ],
})

module.exports = logger
