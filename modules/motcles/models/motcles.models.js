// modules/motcles/models/motcle.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../../configs/sequelize');

const Motcle = sequelize.define('Motcle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  motcles:{
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'motcles',
  timestamps: true,
});

module.exports = Motcle;
