const Objectif = require('../models/objectif');
const Profil = require('../models/profil');

const objectifController = {
    afficherObjectifs: async (req, res) => {
        const utilisateurId = req.session.utilisateur.id;
        const objectif = await Objectif.trouverParUtilisateur(utilisateurId);
        
        res.render('profil', {
            titre: 'Objectifs - NutriTrack',
            objectif: objectif ? objectif.obtenirDonneesPubliques() : null,
            ongletActif: 'objectifs'
        });
    },

    traiterMiseAJourObjectifs: async (req, res) => {
        const utilisateurId = req.session.utilisateur.id;
        const { calories, proteines, glucides, lipides } = req.body;

        const valeurs = {
            calories: parseFloat(calories) || 1800,
            proteines: parseFloat(proteines) || 80,
            glucides: parseFloat(glucides) || 200,
            lipides: parseFloat(lipides) || 65
        };

        try {
            await Objectif.creerOuMettreAJour(utilisateurId, valeurs);
            req.session.succes = 'Objectifs sauvegardés !';
        } catch (erreur) {
            req.session.erreur = 'Erreur lors de la sauvegarde';
        }
        
        res.redirect('/profil/objectifs');
    },

    appliquerRecommandations: async (req, res) => {
        const utilisateurId = req.session.utilisateur.id;
        
        try {
            const profil = await Profil.trouverParUtilisateur(utilisateurId);
            
            if (!profil) {
                req.session.erreur = 'Complétez d\'abord votre profil';
                return res.redirect('/profil');
            }

            const objectifsRecommandes = {
                calories: profil.besoinsCaloriques || 1800,
                proteines: profil.besoinsProteines || 80,
                glucides: profil.besoinsGlucides || 200,
                lipides: profil.besoinsLipides || 65
            };

            await Objectif.creerOuMettreAJour(utilisateurId, objectifsRecommandes);
            req.session.succes = 'Objectifs recommandés appliqués !';
            
        } catch (erreur) {
            req.session.erreur = 'Erreur lors de l\'application des recommandations';
        }
        
        res.redirect('/profil/objectifs');
    }
};

module.exports = objectifController;
