const express = require('express');
const router = express.Router();
const { verifierAuthentification } = require('../middleware/auth');
const analyseController = require('../controllers/analyseController');

// Route pour afficher la page d'analyse
router.get('/analyser', verifierAuthentification, analyseController.afficherAnalyse);

// Route pour traiter l'upload et l'analyse d'une photo
router.post('/analyser/upload', verifierAuthentification, analyseController.uploadPhoto, analyseController.analyserPhoto);

module.exports = router;
