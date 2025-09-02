const express = require('express');
const router = express.Router();
const { createIntervenant , listAllIntervenant,updateIntervenant} = require('../controllers/intervenants.controllers');
const { uploadImage } = require('../../../configs/upload');
const verifyToken = require('../../../middlewares/authentications.middlewares');

// LISTE ALL OF INTERVENANT
router.get('/intervenant/all', verifyToken, listAllIntervenant);

//CREATION INTERVENANT+ VIDEO POUR UN DOCUMENT APRES CLIC
router.post('/create-intervenant/:documentId', uploadImage.single('imageFile'), verifyToken,createIntervenant);

//UPDATE DE INTERVENANT
router.put("/update-Interveanant/:id", uploadImage.single('image'), verifyToken, updateIntervenant);
module.exports = router;

