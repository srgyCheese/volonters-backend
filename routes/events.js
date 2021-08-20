const {Router} = require('express')
const { check, validationResult, body } = require('express-validator')
const upload = require('../services/upload')
const adminMiddleware = require('../middlewares/admin.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const {Event, User, User_Event} = require('../models')
const notEmpty = require('../services/notEmpty')
const fs = require('fs')

const router = Router()

const JSONParameterToRequestBody = (req, res, next) => {
    req.body = {
        ...req.body,
        ...JSON.parse(req.body.data),
    }

    next()
}

router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll({
            where: {type: 0},
            attributes: ['id', 'address', 'text', 'photo', 'members', 'reserve', 'date']
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
    JSONParameterToRequestBody,
    notEmpty('address', 'text', 'date', 'members', 'reserve', 'title'),
async (req, res) => {
    try {
        console.log(req.file);
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            fs.unlinkSync(__dirname + '\\..\\' + req.file.path)

            return res.status(400).json({ errors: errors.array() })
        }
        
        const {address, text, date, members, reserve, title} = req.body

        const event = await Event.create({
            address,
            title,
            text,
            date,
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
    JSONParameterToRequestBody,
    notEmpty('address', 'text', 'date', 'title'), 
async (req, res) => {
    try {
        const errors = validationResult(req)
    
        if (!errors.isEmpty()) {
            fs.unlinkSync(__dirname + '\\..\\' + req.file.path)
    
            return res.status(400).json({ errors: errors.array() })
        }
    
        const {address, text, date, title} = req.body
    
        const event = await Event.create({
            address,
            title,
            text,
            date,
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

router.post('/enter/:id', authMiddleware, async (req, res) => {
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

router.post('/confirm', adminMiddleware, async (req, res) => {
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

module.exports = router