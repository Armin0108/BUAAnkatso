const {DataTypes}= require ('sequelize');
const sequelize= require('../../../configs/sequelize');
const { types } = require('pg');

const Document = sequelize.define('Document', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
    },
    Titre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Auteur: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    DateEdition: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    Domaine: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Mention: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    UrlDOC: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    UrlVideo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Resume: {
        type: DataTypes.TEXT,
        allowNull:false,
    },
    IdMotcles:{
        type: DataTypes.STRING,
        allowNull: false,
    },
},{
    tableName: 'documents',
    timestamp: true,
});

module.exports = Document;
