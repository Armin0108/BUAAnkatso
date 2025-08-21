const express = require('express');
const router = express.Router();
const documentsController = require('../../documents/controllers/documents.controllers');
const { upload } = require('../../../configs/upload');
router.post(
    '/create-documentation',
    upload,
    documentsController.createFullDocument
  );
  

module.exports = router;
