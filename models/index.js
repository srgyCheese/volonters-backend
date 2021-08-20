const sequelize = require('./db')
const fs = require('fs')

const models = {}

fs.readdirSync('./models').forEach(file => {
    if (file == 'index.js' || file == 'db.js') {
        return 
    }

    models[file.substring(0, file.length - 3)] = require('./' + file)(sequelize)
})

models.Event.belongsToMany(models.User, { through: models.User_Event })
models.User.belongsToMany(models.Event, { through: models.User_Event })

module.exports = models