const express = require('express');
const router = express.Router();
const { verifierAuthentification } = require('../middleware/auth');
const analyseController = require('../controllers/analyseController');

// Route pour afficher la page d'analyse
router.get('/analyser', verifierAuthentification, analyseController.afficherAnalyse);

// Route pour traiter l'upload et l'analyse d'une photo
router.post('/analyser/upload', verifierAuthentification, analyseController.upload.single('photo'), analyseController.analyserRepas);

// Route pour obtenir les résultats d'analyse
router.get('/analyser/resultats', verifierAuthentification, analyseController.obtenirResultats);

// Route pour sauvegarder un repas analysé
router.post('/analyser/save', verifierAuthentification, analyseController.sauvegarderRepas);

module.exports = router;
