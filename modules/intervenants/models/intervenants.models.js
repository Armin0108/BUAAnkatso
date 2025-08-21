const {DataTypes} = require ('sequelize');
const sequelize = require ('../../../configs/sequelize');

const Intervenant = sequelize.define('Intervenant', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    prenom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    typeIntervenantId: {  // 👈 clé étrangère
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    
},{
    tableName: 'intervenants',
    timestamps: true,
});

module.exports = Intervenant;