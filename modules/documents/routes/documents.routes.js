const express = require('express');
const router = express.Router();
const { upload } = require('../../../configs/upload');
const {createFullDocument,listAllDocuments} = require('../../documents/controllers/documents.controllers'); // si updateDocument est exporté séparément
const {updateDocument}=require('../../documents/controllers/documents.controllers');
const checkRole = require('../../../middlewares/checkRole');
const verifyToken = require('../../../middlewares/authentications.middlewares');

//LISTE DE TOUS DOCUMENT POUR UPDATE SUPERADMIN
router.get('/documents/all', verifyToken, listAllDocuments);

//CREATION DE DOCUMENT+INTERVENANT+ VIDEO
router.post('/create-documentation', upload, verifyToken, createFullDocument );

//UPDATE DOCUMENT 
router.put("/updateDocument/:id", verifyToken, checkRole("SuperAdmin"), updateDocument);


module.exports = router;
