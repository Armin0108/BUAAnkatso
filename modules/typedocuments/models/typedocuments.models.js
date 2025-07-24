const { DataTypes } = require('sequelize');
const sequelize = require('../../../configs/sequelize');

const TypeDocument = sequelize.define('TypeDocument', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  typeDocuments: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'typedocuments',
  timestamps: false
});

module.exports = TypeDocument;
