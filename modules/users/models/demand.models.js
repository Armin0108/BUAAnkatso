const {DataType, DataTypes}= require('sequelize');
const sequelize = require ('../../../configs/sequelize');

const Demand= sequelize.define('Demand', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    login: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    requestedRole: {
        type: DataTypes.ENUM('admin', 'SuperAdmin'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
    },   
}, {
    tableName: 'demand',
    timestamps: true,
});

module.exports= Demand;