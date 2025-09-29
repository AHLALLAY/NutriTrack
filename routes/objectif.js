const express = require('express');
const router = express.Router();
const objectifController = require('../controllers/objectifController');
const { verifierAuthentification } = require('../middleware/auth');

// Appliquer l'authentification
router.use(verifierAuthentification);

// Routes
router.get('/profil/objectifs', objectifController.afficherObjectifs);
router.post('/profil/objectifs/mise-a-jour', objectifController.traiterMiseAJourObjectifs);
router.post('/profil/objectifs/recommandations', objectifController.appliquerRecommandations);

module.exports = router;
