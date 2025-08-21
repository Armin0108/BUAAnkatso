const {DataTypes}= require ('sequelize');
const sequelize= require('../../../configs/sequelize');
const { types } = require('pg');

const Document = sequelize.define('Document', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
    },
    typeDocumentId: {  // 👈 clé étrangère
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    titre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    datepub: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    domaine: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    auteur: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    urlLivre:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    mention: {
        type: DataTypes.STRING,
        allowNull: true,
    },
   
},{
    tableName: 'documents',
    timestamps: true,
});

module.exports = Document;
