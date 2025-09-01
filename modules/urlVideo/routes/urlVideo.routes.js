const express = require('express');
const router = express.Router();
const { listVideos,VideosDetails,advancedSearch,deleteVideo} = require('../../urlVideo/controllers/urlVideo.controlles');
const verifyToken = require('../../../middlewares/authentications.middlewares');

router.get('/videos/:id',verifyToken, VideosDetails);
router.post('/Searchvideos',verifyToken, listVideos);
router.post('/videos/advanced',verifyToken, advancedSearch);
router.delete('/videos/delete/:id',verifyToken, deleteVideo);


module.exports = router;

