const validateUsername = (username, allUsernames) => {
    let error = ''
    if (allUsernames.find(currentUsername => currentUsername === username)) {
        error = 'Username already in use'
    } else if (!username.trim()) {
        error = 'Username can not be empty'
    }
    return error
}

const validateMessage = message => {
    let error = ''
    if (!message.trim()) {
        error = 'Message can not be empty'
    }

    return error
}
module.exports = {
    validateUsername,
    validateMessage,
}
