const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Requests = sequelize.define('ForgotPasswordRequests', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4, 
        allowNull: false,
        primaryKey: true
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Requests;
