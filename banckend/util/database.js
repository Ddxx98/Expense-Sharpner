const Sequelize = require('sequelize');

const sequelize = new Sequelize('expense', 'root', 'deexith2024', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;