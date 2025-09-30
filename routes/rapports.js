const express = require('express');
const router = express.Router();

const { verifierAuthentification } = require('../middleware/auth');
const RapportController = require('../controllers/rapportController');


router.get('/rapports', verifierAuthentification, RapportController.afficherRapport);

module.exports = router;