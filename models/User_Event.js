const { Model, DataTypes } = require('sequelize')

class UserEvent extends Model {}

module.exports = sequelize => {
    UserEvent.init({
        confirmed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        }
    }, { sequelize, modelName: 'user_event' })

    return UserEvent
}