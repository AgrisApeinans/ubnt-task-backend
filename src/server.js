const express = require('express')
const app = express()
const server = app.listen(3000)
const io = require('socket.io')(server)
const logger = require('./logger')
const constants = require('./constants')
const validators = require('./validators')
let tempChatStorage = {
    usernames: ['Server'],
}
const shutDown = () => {
    logger.info('Shut down server')
    io.close()
    server.close()
}

io.on('connection', socket => {
    logger.info('New socket connection')
    let timeout

    socket.on('NEW_USER_LOGIN', data => {
        logger.info('Socket on NEW_USER_LOGIN, data:', data)
        const usernameError = validators.validateUsername(data.username, tempChatStorage.usernames)
        if (usernameError) {
            socket.emit('NEW_USER_LOGIN_ERROR', { error: usernameError })
            logger.info('Socket emit NEW_USER_LOGIN_ERROR, error:', { error: usernameError })
        } else {
            socket.username = data.username
            tempChatStorage.usernames.push(data.username)
            socket.emit('NEW_USER_LOGIN_SUCCESS')
            logger.info('Socket emit NEW_USER_LOGIN_SUCCESS, tempChatStorage:', tempChatStorage)
            timeout = setTimeout(() => {
                socket.disconnect()
                logger.info('Socket disconnected due to timeout')
            }, constants.INACTIVE_TIMEOUT)

            socket.on('NEW_MESSAGE', data => {
                logger.info('Socket on NEW_MESSAGE, data:', data)
                const messageError = validators.validateMessage(data.message)
                if (messageError) {
                    io.sockets.emit('NEW_MESSAGE_ERROR', { error: messageError })
                    logger.info('Socket emit NEW_MESSAGE_ERROR, data:', { error: messageError })
                } else {
                    io.sockets.emit('NEW_MESSAGE', { message: data.message, username: socket.username })
                    logger.info('Socket emit NEW_MESSAGE, data:', { message: data.message, username: socket.username })
                }
                clearTimeout(timeout)
                timeout = setTimeout(() => {
                    socket.disconnect()
                    logger.info('Socket disconnected due to timeout')
                }, constants.INACTIVE_TIMEOUT)
            })

            socket.on('disconnect', reason => {
                logger.info('Socket on disconnect, reason:', reason)
                if (reason === 'server namespace disconnect') {
                    const message = {
                        message: `${socket.username} was disconnected due to inactivity`,
                        username: 'Server',
                    }
                    io.sockets.emit('NEW_MESSAGE', message)
                    logger.info('Socket emit NEW_MESSAGE, message:', message)
                } else if (reason === 'client namespace disconnect') {
                    const message = {
                        message: `${socket.username} left the chat, connection lost`,
                        username: 'Server',
                    }
                    io.sockets.emit('NEW_MESSAGE', message)
                    logger.info('Socket emit NEW_MESSAGE, message:', message)
                }
                clearTimeout(timeout)
                tempChatStorage.usernames = tempChatStorage.usernames.filter(username => username !== socket.username)
            })
        }
    })
})
process.on('SIGTERM', shutDown)
process.on('SIGINT', shutDown)
