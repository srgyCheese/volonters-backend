const { Model, DataTypes } = require('sequelize')

class User extends Model {}

module.exports = sequelize => {
    User.init({
        fio: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        group: {
            type: DataTypes.STRING
        },
        date_birth: {
            type: DataTypes.DATE
        },
        registration: DataTypes.STRING,
        photo: DataTypes.STRING,
        phone: {
            type: DataTypes.STRING
        },
        address: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        is_admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        },
    }, { sequelize, modelName: 'user' })

    return User
}