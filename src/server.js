const express = require('express')
const cors = require('cors')
// const mongoose = require('mongoose')
const bodyParser = require('body-parser')
// const io = require('socket.io')
const app = express()

app.use(bodyParser.json())
app.use(cors())

server = app.listen(3000)

//socket.io instantiation
const io = require('socket.io')(server)

io.on('connection', socket => {
    console.log('New user connected')

    socket.on('NEW_USER_LOGIN', data => {
        console.log('NEW_USER_LOGIN', data.username)
        socket.username = data.username
    })

    socket.on('NEW_MESSAGE', data => {
        console.log('NEW_MESSAGE', data.message)

        io.sockets.emit('NEW_MESSAGE', { message: data.message, username: socket.username })
    })
})
