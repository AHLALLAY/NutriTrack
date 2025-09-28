const express = require('express');
const router = express.Router();
const profilController = require('../controllers/profilController');
const { verifierAuthentification } = require('../middleware/auth');

// Page de profil
router.get('/profil', verifierAuthentification, profilController.afficherProfil);

// Page des objectifs
router.get('/profil/objectifs', verifierAuthentification, profilController.afficherObjectifs);

// Mise à jour du profil
router.post('/profil/mise-a-jour', verifierAuthentification, profilController.traiterMiseAJourProfil);

module.exports = router;