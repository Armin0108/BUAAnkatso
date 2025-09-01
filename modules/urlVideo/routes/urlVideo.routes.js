const express = require('express');
const router = express.Router();
const { listVideos,VideosDetails,advancedSearch,deleteVideo} = require('../../urlVideo/controllers/urlVideo.controlles');

router.get('/videos/:id', VideosDetails);
router.post('/Searchvideos', listVideos);
router.post('/videos/advanced', advancedSearch);
router.delete('/videos/delete/:id', deleteVideo);


module.exports = router;

