// modules/motcles/models/motcle.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../../configs/sequelize');

const Motcle = sequelize.define('Motcle', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Mocles:{
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'motcles',
  timestamps: true,
});

module.exports = Motcle;
