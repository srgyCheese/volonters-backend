const { body, validationResult } = require('express-validator')

const checkResults = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    next()
}

const notEmpty = (...params) => params.map(param => body(param).notEmpty())

module.exports = {notEmpty, checkResults}