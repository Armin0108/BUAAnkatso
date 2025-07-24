const express = require('express');
const router = express.Router();
const documentsController= require('../../documents/controllers/documents.controllers');

router.post('/create-documentation',documentsController.createFullDocument );

module.exports = router;
