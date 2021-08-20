const {Router} = require('express')
const adminMiddleware = require('../middlewares/admin.middleware')
const {User} = require('../models')

const router = Router()

router.get('/', async (req, res) => {
    const users = await User.findAll({
        attributes: ['fio', 'group', 'photo']
    })

    return res.json({users})
})

router.get('/full', adminMiddleware, async (req, res) => {
    const users = await User.findAll({
        attributes: ['fio', 'group', 'date_birth', 'phone', 'address']
    })

    return res.json({users})
})

module.exports = router