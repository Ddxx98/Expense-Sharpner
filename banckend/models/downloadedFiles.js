const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Download = sequelize.define('download', {
  url : Sequelize.STRING,
});

module.exports = Download;