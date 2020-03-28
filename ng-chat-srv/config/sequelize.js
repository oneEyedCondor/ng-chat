const Sequelize = require('sequelize');

const sequelize = new Sequelize('chat-db', 'root', '', {
    dialect: 'mysql',
    host: 'localhost',
    define: {
        timestamps: false
    }
});
// sequelize.sync({ force: true }).catch(err => console.log(err));

module.exports = { Sequelize, sequelize };