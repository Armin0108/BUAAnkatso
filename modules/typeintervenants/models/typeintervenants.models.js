const { DataTypes } = require('sequelize');
const sequelize = require('../../../configs/sequelize');

const TypeIntervenant = sequelize.define('TypeIntervenant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  typeIntervenants: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'typeintervenants',
  timestamps: false
});

module.exports = TypeIntervenant;
