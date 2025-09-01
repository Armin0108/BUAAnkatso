const express = require('express');
const router = express.Router();
const { createIntervenant } = require('../controllers/intervenants.controllers');
const { uploadImage } = require('../../../configs/upload');
const verifyToken = require('../../../middlewares/authentications.middlewares');

router.post('/create-intervenant', uploadImage.single('imageFile'), verifyToken,createIntervenant);

module.exports = router;

