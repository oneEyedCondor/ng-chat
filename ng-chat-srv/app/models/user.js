const { Sequelize, sequelize } = require('../../config/sequelize');
const { Conversation } = require('./conversation');
const { Message } = require('./message');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    login: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
User.hasMany(Message, { onDelete: 'cascade' });
Message.belongsTo(User);
User.belongsToMany(Conversation, {through: Message});
Conversation.belongsToMany(User, {through: Message});

const checkBody = (body) => {
    if(!body.hasOwnProperty('name')) return { message: `field 'name' is required` };
    if(!body.hasOwnProperty('login')) return { message: `field 'login' is required` };
    if(!body.hasOwnProperty('password')) return { message: `field 'password' is required` };
    if(typeof body.name !== 'string') return { message: `field 'name' must be of string type` };
    if(typeof body.login !== 'string')  return { message: `field 'login' must be of string type` };
    if(typeof body.password !== 'string') return { message: `field 'password' must be of string type` };
    return null;
};

module.exports.User = User;
module.exports.checkBody = checkBody;