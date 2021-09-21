const {Router} = require('express');
const { check, validationResult, body } = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User} = require('../models')

const router = Router()

router.post('/register', [
    body('fio').notEmpty(),
    body('password').isLength({min: 4, max: 100})
], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const {fio, password} = req.body;
        const candidate = await User.findOne({where: {fio}})

        if (candidate) {
            return res.status(400).json({message: 'Пользователь с таким логином уже существует'})
        }

        const hashPassword = bcrypt.hashSync(password, 7)

        const user = await User.create({
            fio,
            password: hashPassword,
            is_admin: req.body.isAdmin
        })

        return res.json({message: 'Пользователь успешно зарегистрирован'})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Registration error'})
    }
})

router.post('/login', [
    body('fio').notEmpty(),
    body('password').notEmpty(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {fio, password} = req.body

        const user = await User.findOne({where: {fio}})

        if (!user) {
            return res.status(400).json({message: `Пользователь ${fio} не найден`})
        }

        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(400).json({message: 'Неверный пароль'})
        }

        const token = jwt.sign(
            {
                id: user.id,
                isAdmin: user.is_admin
            }, 
            process.env.JWT_SECRET, 
            {expiresIn: process.env.JWT_LIFETIME}
        )

        return res.json({token})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Login error'})
    }
})

module.exports = router