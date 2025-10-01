const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifierAuthentification } = require('../middleware/auth');

// Route principale du dashboard
router.get('/dashboard', verifierAuthentification, dashboardController.afficherDashboard);

// Routes API pour les actions du dashboard
router.post('/dashboard/repas', verifierAuthentification, dashboardController.ajouterRepas);
router.get('/dashboard/statistiques', verifierAuthentification, dashboardController.obtenirStatistiques);
router.get('/dashboard/repas', verifierAuthentification, dashboardController.obtenirRepasDuJour);
router.get('/dashboard/statistiques/semaine', verifierAuthentification, dashboardController.obtenirStatistiquesHebdomadaires);

module.exports = router;
