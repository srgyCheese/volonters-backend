const {Router} = require('express')
const authMiddleware = require('../middlewares/auth.middleware')
const {User} = require('../models')

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
    const user = JSON.parse(JSON.stringify(req.user))

    Object.keys(user).forEach(k => {
        if (['createdAt', 'updatedAt', 'password'].includes(k)) {
            delete user[k]
        }
    })

    return res.json({user})
})

router.post('/change', authMiddleware, async (req, res) => {
    try {
        const changes = {};
        
        ['photo', 'group', 'date_birth', 'registation', 'phone', 'address'].forEach(p => {
            if (req.body[p] !== undefined) {
                changes[p] = req.body[p] 
            }
        })
    
        await req.user.update(changes)
    
        return res.json({message: 'Данные изменены'})
    } catch (e) {
        console.log(e)
        return res.status(400).json({message: 'Error'})
    }
})

module.exports = router