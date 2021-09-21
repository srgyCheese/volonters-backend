const {Router} = require('express')
const { validationResult } = require('express-validator')
const sequelize = require('sequelize')
const upload = require('../services/upload')
const adminMiddleware = require('../middlewares/admin.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const {Event, User, User_Event} = require('../models')
const {notEmpty} = require('../services/validation')
const fs = require('fs')
const { formatDateString } = require('../services/string-format')

const router = Router()

const JSONParameterToRequestBody = param => (req, res, next) => {
    req.body = {
        ...req.body,
        ...JSON.parse(req.body[param]),
    }

    next()
}

router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll({
            where: {type: 0},
            attributes: [
                'id',
                'address',
                'text', 
                'photo', 
                'members', 
                'reserve', 
                'date_start',
                'date_end'
            ]
        })

        return res.json({events})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Error'})
    }
})

router.post('/',
    adminMiddleware,
    upload.single('photo'),
    JSONParameterToRequestBody('data'),
    notEmpty('address', 'text', 'date', 'members', 'reserve', 'title'),
async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            fs.unlinkSync(__dirname + '\\..\\' + req.file.path)

            return res.status(400).json({ errors: errors.array() })
        }
        
        const {address, text, date, members, reserve, title} = req.body

        if (!date.match(/\d{2}\.\d{2}\.\d{4} \- \d{2}\.\d{2}\.\d{4}/)) {
            return res.status(400).json({message: 'Формат даты должен быть "дд.мм.гггг - дд.мм.гггг"'})
        }

        const dates = date.split(' - ').map(d => formatDateString(d))
        
        const event = await Event.create({
            address,
            title,
            text,
            date_start: dates[0],
            date_end: dates[1],
            members,
            reserve,
            type: 0,
            photo: req?.file?.path 
        })

        return res.json({message: 'Мероприятие успешно создано'})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Error'})
    }
})

router.post('/outofcollege',
    authMiddleware,
    upload.single('photo'),
    adminMiddleware,
    JSONParameterToRequestBody('data'),
    notEmpty('address', 'text', 'date', 'title'), 
async (req, res) => {
    try {
        const errors = validationResult(req)
    
        if (!errors.isEmpty()) {
            fs.unlinkSync(__dirname + '\\..\\' + req.file.path)
    
            return res.status(400).json({ errors: errors.array() })
        }
    
        const {address, text, date, title} = req.body

        
        if (!date.match(/\d{2}\.\d{2}\.\d{4} \- \d{2}\.\d{2}\.\d{4}/)) {
            return res.status(400).json({message: 'Формат даты должен быть в виде "дд.мм.гггг - дд.мм.гггг"'})
        }

        const dates = date.split(' - ').map(d => formatDateString(d))
    
        const event = await Event.create({
            address,
            title,
            date_start: dates[0],
            date_end: dates[1],
            text,
            type: 1,
            photo: req?.file?.path
        })
    
        return res.json({
            message: 'Мероприятие успешно создано'
        })
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Error'})
    }
})

router.delete('/:id', adminMiddleware, async (req, res) => {
    try {
        const event = await Event.findOne({where: {id: req.params.id}})

        if (!event) {
            return res.status(400).json({message: 'Мероприятие не найдено'})
        }

        fs.unlinkSync(__dirname + '\\..\\' + event.photo)

        await event.destroy()

        return res.json({message: 'Мероприятие успешно удалено'})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Error'})
    }
})

router.post('/:id/enter', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findOne({where: {id: req.params.id}})

        if (!event) {
            return res.status(400).json({message: 'Мероприятие не найдено'})
        }

        const userEvent = await req.user.getEvents({where: {id: req.params.id}})

        if (userEvent.length > 0) {
            return res.status(400).json({message: 'Вы уже записались на мероприятие'})
        }

        await req.user.addEvent(event)

        return res.json({message: 'Вы успешно записались на мероприятие'})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Error'})
    }
})

router.post('/:id/quit', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findOne({where: {id: req.params.id}})

        if (!event) {
            return res.status(400).json({message: 'Мероприятие не найдено'})
        }

        const userEvent = await req.user.getEvents({where: {id: req.params.id}})

        if (userEvent.length == 0) {
            return res.status(400).json({message: 'Вас нет на этом мероприятии'})
        }

        await req.user.removeEvent(event)

        return res.json({message: 'Вы успешно вышли с мероприятия'})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Error'})
    }
})

router.post('/remove-user', adminMiddleware, async (req, res) => {
    try {
        const {userId, eventId} = req.query

        const user = await User.findOne({where: {id: userId}})

        if (!user) {
            return res.status(400).json({message: 'Пользователь не найден'})
        }

        const userEvent = await req.user.getEvents({where: {id: eventId}})

        if (userEvent.length === 0) {
            return res.status(400).json({message: 'Мероприятие не найдено'})
        }

        const eventConfirm = await User_Event.findOne({where: {eventId: userEvent[0].id}, userId: user.id})

        await eventConfirm.destroy()

        return res.json({message: 'Пользователь удалён с мероприятия'})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Error'})
    }
})

router.post('/confirm-user', adminMiddleware, async (req, res) => {
    try {
        const {userId, eventId} = req.query

        const user = await User.findOne({where: {id: userId}})

        if (!user) {
            return res.status(400).json({message: 'Пользователь не найден'})
        }

        const userEvent = await req.user.getEvents({where: {id: eventId}})

        if (userEvent.length === 0) {
            return res.status(400).json({message: 'Мероприятие не найдено'})
        }

        const eventConfirm = await User_Event.findOne({where: {eventId: userEvent[0].id}, userId: user.id})

        await eventConfirm.update({
            confirmed: true
        })

        return res.json({message: 'Участие в мероприятии подтверждено'})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Error'})
    }
})


router.get('/:id/info', adminMiddleware, async (req, res) => {
    try {
        const event = await Event.findOne({
            where: {id: req.params.id},
            include: [{
                model: User,
                attributes: ['FIO'],
                through: {
                    attributes: ['confirmed']
                }
            }]
        })

        return res.json({event})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Error'})        
    }
})

module.exports = router