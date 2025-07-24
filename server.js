require('dotenv').config();
const express=require('express');
const sequelize= require ('./configs/sequelize');
const cors = require ('cors');

const app= express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const documentsRoutes= require('./modules/documents/routes/documents.routes');
const intervenantsRoutes= require('./modules/intervenants/routes/intervenants.routes');
const userRoutes= require('./modules/users/routes/users.routes');
const motcleRoutes = require('./modules/motcles/routes/motcles.routes');
const typedocumentsRoutes= require('./modules/typedocuments/routes/typedocuments.routes');
const typeintervenantsRoutes= require('./modules/typeintervenants/routes/typeintervenants.routes');


app.use('/api/documents', documentsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/intervenants', intervenantsRoutes);
app.use('/api/motcles', motcleRoutes);
app.use('/api/typedocuments',typedocumentsRoutes);
app.use('/api/typeintervenants',typeintervenantsRoutes);

app.use((req,res)=>{
  res.status(404).json({message: 'Route introuvable'});
});

app.use((err,req,res,next)=>{
  console.error('Erreur du serveur:', err.stack);
  res.status(500).json({
    message: 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && {error: err.message})
  });
});


const PORT = process.env.PORT;
(async()=>{
  try{
    await sequelize.authenticate();
    console.log('Connexion au DB avec succes');

    require('./modules/intervenants/models/intervenants.models');
    require('./modules/users/models/users.models');
    require('./modules/documents/models/documents.models');
    require('./modules/motcles/models/motcles.models');
    require('./modules/typedocuments/models/typedocuments.models');
    require('./modules/typeintervenants/models/typeintervenants.models');
    require('./modules/association/association');
    await sequelize.sync({
      alter: process.env.NODE_ENV === 'development',
      force: false
    });
    console.log('Modèles synchronisés');

    app.listen(PORT, ()=>{
      console.log(`Serveur lancé sur http://localhost:${PORT}`);
      console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
    });

  }catch (error){
    console.error('Erreur de démarrage:', error.message);
    process.exit(1);
  }

}) ();

process.on('SIGTERM', ()=>{
  console.log('Fermeture propre du serveur');
  sequelize.close().then(()=>process.exit(0));
});