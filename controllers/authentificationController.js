const Utilisateur = require('../models/utilisateur');

const authentificationController = {
    
    afficherConnexion: (req, res) => {
        res.render('auth/connexion', {
            titre: 'Connexion - NutriTrack',
            ongletActif: 'connexion',
            layout: 'layouts/auth-layout'
        });
    },

    afficherInscription: (req, res) => {
        res.render('auth/inscription', {
            titre: 'Inscription - NutriTrack',
            ongletActif: 'inscription',
            layout: 'layouts/auth-layout'
        });
    },
    
    traiterInscription: async (req, res) => {
        try {
            const { nomComplet, email, motDePasse } = req.body;

            const nouvelUtilisateur = await Utilisateur.creer({
                nomComplet: nomComplet.trim(),
                email: email.toLowerCase().trim(),
                motDePasse
            });

            req.session.utilisateur = {
                id: nouvelUtilisateur.id,
                nomComplet: nouvelUtilisateur.nomComplet,
                email: nouvelUtilisateur.email
            };
            req.session.succes = 'Votre compte a été créé avec succès !';
            
            res.redirect('/dashboard');

        } catch (erreur) {
            console.error('Erreur lors de l\'inscription:', erreur);
            req.session.erreur = erreur.message;
            res.redirect('/inscription');
        }
    },
    
    traiterConnexion: async (req, res) => {
        try {
            const { email, motDePasse } = req.body;

            const utilisateur = await Utilisateur.trouverParEmail(email.toLowerCase().trim());

            if (!utilisateur) {
                req.session.erreur = 'Email ou mot de passe incorrect';
                return res.redirect('/connexion');
            }

            const motDePasseValide = await utilisateur.verifierMotDePasse(motDePasse);

            if (!motDePasseValide) {
                req.session.erreur = 'Email ou mot de passe incorrect';
                return res.redirect('/connexion');
            }

            req.session.utilisateur = {
                id: utilisateur.id,
                nomComplet: utilisateur.nomComplet,
                email: utilisateur.email
            };
            req.session.succes = `Bienvenue ${utilisateur.nomComplet} !`;
            
            res.redirect('/dashboard');

        } catch (erreur) {
            console.error('Erreur lors de la connexion:', erreur);
            req.session.erreur = 'Une erreur s\'est produite lors de la connexion';
            res.redirect('/connexion');
        }
    },
    
    afficherTableauDeBord: (req, res) => {
        const dashboardController = require('./dashboardController');
        return dashboardController.afficherDashboard(req, res);
    },
    
    deconnexion: (req, res) => {
        if (req.session) {
            req.session.destroy((erreur) => {
                if (erreur) {
                    console.error('Erreur lors de la déconnexion:', erreur);
                }
                res.redirect('/connexion');
            });
        } else {
            res.redirect('/connexion');
        }
    }
};

module.exports = authentificationController;
