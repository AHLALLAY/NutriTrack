const multer = require('multer');
const path = require('path');

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'repas-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seules les images sont autorisées'), false);
        }
    }
});

const analyseController = {
    // Afficher la page d'analyse de repas
    afficherAnalyse: async (req, res) => {
        try {
            res.render('analyse', {
                titre: 'Analyser un repas - NutriTrack',
                utilisateur: req.session ? req.session.utilisateur : null,
                message: req.session ? req.session.message : null,
                erreur: req.session ? req.session.erreur : null
            });
            
            // Nettoyer les messages de session
            if (req.session) {
                delete req.session.message;
                delete req.session.erreur;
            }
        } catch (error) {
            console.error('Erreur lors de l\'affichage de la page d\'analyse:', error);
            res.status(500).render('erreur', {
                titre: 'Erreur - NutriTrack',
                message: 'Une erreur est survenue lors du chargement de la page d\'analyse.',
                utilisateur: req.session ? req.session.utilisateur : null
            });
        }
    },

    // Middleware pour l'upload
    uploadPhoto: upload.single('photo'),

    // Analyser une photo de repas
    analyserPhoto: async (req, res) => {
        try {
            // Pour l'instant, simulation de l'analyse
            // TODO: Intégrer avec une API d'IA pour l'analyse d'images
            
            if (!req.file) {
                if (req.session) req.session.erreur = 'Veuillez sélectionner une photo à analyser';
                return res.redirect('/analyser');
            }

            // Simulation des résultats d'analyse
            const resultatsAnalyse = {
                nom: 'Repas analysé',
                description: 'Repas identifié par l\'IA',
                calories: 450,
                proteines: 25,
                glucides: 35,
                lipides: 18,
                fibres: 8,
                sodium: 650,
                sucre: 12,
                hydratationMl: 200,
                imagePath: req.file.path,
                alimentsIdentifies: [
                    { nom: 'Poulet grillé', quantite: '150g', calories: 250 },
                    { nom: 'Riz complet', quantite: '100g', calories: 130 },
                    { nom: 'Légumes verts', quantite: '80g', calories: 70 }
                ]
            };

            if (req.session) {
                req.session.message = 'Repas analysé avec succès !';
                req.session.resultatsAnalyse = resultatsAnalyse;
            }

            res.redirect('/analyser');
            
        } catch (error) {
            console.error('Erreur lors de l\'analyse de la photo:', error);
            if (req.session) req.session.erreur = 'Erreur lors de l\'analyse de la photo';
            res.redirect('/analyser');
        }
    }
};

module.exports = analyseController;
