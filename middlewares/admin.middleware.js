const authMiddleware = require("./auth.middleware")

const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            const message = await authMiddleware(req, res)

            if (message) {
                return message
            }
        }

        if (!req.user.is_admin) {
            return res.status(403).json({message: 'Недостаточно прав'})
        }

        next()
    } catch (e) {
        console.log(e)
        return res.status(403).json({message: "Пользователь не авторизован"})
    }
}

module.exports = adminMiddleware