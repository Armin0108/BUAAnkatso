const {DataTypes}= require ('sequelize');
const sequelize= require('../../../configs/sequelize');
const { types } = require('pg');

const UrlVideo = sequelize.define('UrlVideo', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
    },
    urlVideo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    duree: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    documentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    intervenantId:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    resume: {
        type: DataTypes.STRING,
        allowNull: true,
    },
},{
    tableName: 'urlvideo',
    timestamps: true,
});

module.exports = UrlVideo;
