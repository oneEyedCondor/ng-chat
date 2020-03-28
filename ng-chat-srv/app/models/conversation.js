const { Sequelize, sequelize } = require('../../config/sequelize');
const { Message } = require('./message');

const Conversation = sequelize.define('conversation', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    user1Id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    user2Id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});
Conversation.hasMany(Message, { onDelete: 'cascade' });
Message.belongsTo(Conversation);

module.exports.Conversation = Conversation;