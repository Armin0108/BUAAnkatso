const express = require('express');
const router = express.Router();
const { listVideos,VideosDetails,advancedSearch} = require('../../urlVideo/controllers/urlVideo.controlles');
const { upload } = require('../../../configs/upload');

router.get('/videos/:id', VideosDetails);
router.post('/Searchvideos', listVideos);
router.post('/videos/advanced', advancedSearch);

module.exports = router;

