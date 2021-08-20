require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./models/db')
const {Event} = require('./models')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static('uploads'))

app.use('/auth', require('./routes/auth'))
app.use('/users', require('./routes/users'))
app.use('/events', require('./routes/events'))
app.use('/profile', require('./routes/profile'))

const start = async () => {
    try {
        await sequelize.authenticate()
    } catch (e) {
        console.log('Ошибка подключения к БД: ', e)
    }

    await sequelize.sync()

    app.listen(process.env.PORT, () => console.log(`App listening at port ${process.env.PORT}`))
}

start()