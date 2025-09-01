const express = require('express');
const router = express.Router();
const { upload } = require('../../../configs/upload');
const {createFullDocument} = require('../../documents/controllers/documents.controllers'); // si updateDocument est exporté séparément
const {updateDocument}=require('../../documents/controllers/documents.controllers');
const checkRole = require('../../../middlewares/checkRole');
const verifyToken = require('../../../middlewares/authentications.middlewares');

router.post('/create-documentation', upload, verifyToken, createFullDocument );
router.put("/:id", verifyToken, checkRole("SuperAdmin"), updateDocument);


module.exports = router;
