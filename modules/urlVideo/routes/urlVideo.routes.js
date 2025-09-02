const express = require('express');
const router = express.Router();
const { listVideos,VideosDetails,advancedSearch,deleteVideo,listAllVideos,updateVideo} = require('../../urlVideo/controllers/urlVideo.controlles');
const verifyToken = require('../../../middlewares/authentications.middlewares');
const checkRole = require('../../../middlewares/checkRole');

//LISTE VIDEO + INTERVENANT + DOCUMENT  POUR FAIRE UPDATE VIDEO SEUL
router.get('/videos/all', verifyToken, listAllVideos);
router.put("/updateVideo/:id", updateVideo);

//=========RECHERCHE ET RESULTAT======//
router.get('/videos/:id',verifyToken, VideosDetails);////pour la détail resultat de recherche
router.post('/Searchvideos',verifyToken, listVideos);
router.post('/videos/advanced',verifyToken, advancedSearch);

//SUPPRESSION D'UNE VIDEO //
router.delete('/videos/delete/:id',verifyToken, checkRole("SuperAdmin"), deleteVideo);



module.exports = router;

