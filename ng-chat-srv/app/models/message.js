const { Sequelize, sequelize } = require('../../config/sequelize');

const Message = sequelize.define('message', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    text: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false
    },
    unread: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    }
});

const checkBody = (body) => {
    if(!body.hasOwnProperty('text')) return { message: `field 'text' is required` };
    if(!body.hasOwnProperty('date')) return { message: `field 'date' is required` };
    if(typeof body.text !== 'string') return { message: `field 'text' must be of string type` };
    if(typeof body.date !== 'string')  return { message: `field 'date' must be of string type` };
    return null;
};

module.exports.Message = Message;
module.exports.checkBody = checkBody;