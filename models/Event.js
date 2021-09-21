const { Model, DataTypes } = require('sequelize')

class Event extends Model {}

module.exports = sequelize => {
    Event.init({
        address: DataTypes.STRING,
        title: DataTypes.STRING,
        text: DataTypes.TEXT,
        date_start: {
            type: DataTypes.DATE,
        },
        date_end: DataTypes.DATE,
        members: DataTypes.INTEGER,
        photo: DataTypes.STRING,
        reserve: DataTypes.INTEGER,
        type: DataTypes.INTEGER
    }, { sequelize, modelName: 'event' })

    return Event
}