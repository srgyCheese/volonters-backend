const { body } = require('express-validator')

const notEmpty = (...params) => params.map(param => body(param).notEmpty())

module.exports = notEmpty