const express = require('express');
const router = express.Router();
const { createIntervenant } = require('../controllers/intervenants.controllers');
const { uploadImage } = require('../../../configs/upload');

router.post('/create-intervenant', uploadImage.single('imageFile'), createIntervenant);

module.exports = router;

