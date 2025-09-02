const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controllers');
const verifyToken = require('../../../middlewares/authentications.middlewares');
const checkRole = require('../../../middlewares/checkRole');

// Créer une nouvelle demande (n’importe quel utilisateur non authentifié ou connecté)
router.post('/create/demand',userController.createDemand);

// Lister toutes les demandes (SuperAdmin uniquement)
router.get('/listdemand', verifyToken, checkRole('SuperAdmin'), userController.listDemands);

// Valider une demande et créer l’utilisateur (SuperAdmin uniquement)
router.post('/demand/approve/:id', verifyToken, checkRole('SuperAdmin'), userController.approveDemand);

// Rejeter une demande (SuperAdmin uniquement)
router.delete('/demand/reject/:id', verifyToken, checkRole('SuperAdmin'), userController.rejectDemand);


// Connexion
router.post('/login',userController.loginUser);



module.exports = router;
