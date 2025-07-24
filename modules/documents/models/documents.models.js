const {DataTypes}= require ('sequelize');
const sequelize= require('../../../configs/sequelize');
const { types } = require('pg');

const Document = sequelize.define('Document', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
    },
    typeDocumentId: {  // 👈 clé étrangère
        type: DataTypes.INTEGER,
        allowNull: false,
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
    
},{
    tableName: 'documents',
    timestamps: true,
});

module.exports = Document;
