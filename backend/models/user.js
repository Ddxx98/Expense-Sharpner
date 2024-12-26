const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    password: Sequelize.STRING,
    isPremium: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    totalExpense: {
        type: Sequelize.BIGINT,
        defaultValue: 0
    }
});

module.exports = User;