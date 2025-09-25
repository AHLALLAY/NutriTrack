const express = require('express');
const router = express.Router();
const authentificationController = require('../controllers/authentificationController');
const { redirigerSiConnecte, verifierAuthentification } = require('../middleware/auth');
const { validerInscription, validerConnexion } = require('../middleware/validation');

// Routes d'authentification

// Page de connexion
router.get('/connexion', 
    redirigerSiConnecte,
    authentificationController.afficherConnexion
);

// Page d'inscription
router.get('/inscription', 
    redirigerSiConnecte,
    authentificationController.afficherInscription
);

// Traitement de l'inscription
router.post('/inscription', 
    validerInscription,
    authentificationController.traiterInscription
);

// Traitement de la connexion
router.post('/connexion', 
    validerConnexion,
    authentificationController.traiterConnexion
);

// Tableau de bord
router.get('/tableau-de-bord', 
    verifierAuthentification,
    authentificationController.afficherTableauDeBord
);

// Déconnexion
router.post('/deconnexion', authentificationController.deconnexion);
router.get('/deconnexion', authentificationController.deconnexion);

module.exports = router;
