const express = require('express');
const router = express.Router();
const { listVideos, advancedSearch } = require('../../urlVideo/controllers/urlVideo.controlles');
const { upload } = require('../../../configs/upload');

router.get('/videos', listVideos);

router.get('/videos/advanced', advancedSearch);

module.exports = router;

