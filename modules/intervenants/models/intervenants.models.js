const {DataTypes} = require ('sequelize');
const sequelize = require ('../../../configs/sequelize');

const Intervenant = sequelize.define('Intervenant', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
    },
    Nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Prenom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    typeIntervenantId: {  // 👈 clé étrangère
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    Photo: {
        type: DataTypes.STRING,
        allowNull: true,
    },

},{
    tableName: 'intervenants',
    timestamps: true,
});

module.exports = Intervenant;