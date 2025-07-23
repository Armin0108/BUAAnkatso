const {DataType, DataTypes}= require('sequelize');
const sequelize = require ('../../../configs/sequelize');

const User= sequelize.define('User', {
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
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [6,100],
                msg: 'Le mot de passa doit contenir au moins 6 caractères.',
            },
        },
    },
}, {
    tableName: 'users',
    timestamps: true,
});

module.exports= User;