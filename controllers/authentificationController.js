const Utilisateur = require('../models/utilisateur');

const authentificationController = {
    // Afficher la page de connexion
    afficherConnexion: (req, res) => {
        res.render('auth/connexion', {
            titre: 'Connexion - NutriTrack',
            ongletActif: 'connexion',
            layout: 'layouts/auth-layout'
        });
    },

    // Afficher la page d'inscription
    afficherInscription: (req, res) => {
        res.render('auth/inscription', {
            titre: 'Inscription - NutriTrack',
            ongletActif: 'inscription',
            layout: 'layouts/auth-layout'
        });
    },

    // Traiter l'inscription
    traiterInscription: async (req, res) => {
        try {
            const { nomComplet, email, motDePasse } = req.body;

            // Créer l'utilisateur
            const nouvelUtilisateur = await Utilisateur.creer({
                nomComplet: nomComplet.trim(),
                email: email.toLowerCase().trim(),
                motDePasse
            });

            // Créer la session
            if (req.session) {
                req.session.utilisateur = {
                    id: nouvelUtilisateur.id,
                    nomComplet: nouvelUtilisateur.nomComplet,
                    email: nouvelUtilisateur.email
                };
                req.session.succes = 'Votre compte a été créé avec succès !';
            }
            
            res.redirect('/dashboard');

        } catch (erreur) {
            console.error('Erreur lors de l\'inscription:', erreur);
            if (req.session) {
                req.session.erreur = erreur.message;
            }
            res.redirect('/inscription');
        }
    },

    // Traiter la connexion
    traiterConnexion: async (req, res) => {
        try {
            const { email, motDePasse } = req.body;

            // Trouver l'utilisateur
            const utilisateur = await Utilisateur.trouverParEmail(email.toLowerCase().trim());

            if (!utilisateur) {
                if (req.session) {
                    req.session.erreur = 'Email ou mot de passe incorrect';
                }
                return res.redirect('/connexion');
            }

            // Vérifier le mot de passe
            const motDePasseValide = await utilisateur.verifierMotDePasse(motDePasse);

            if (!motDePasseValide) {
                if (req.session) {
                    req.session.erreur = 'Email ou mot de passe incorrect';
                }
                return res.redirect('/connexion');
            }

            // Créer la session Express
            if (req.session) {
                req.session.utilisateur = utilisateur.obtenirDonneesPubliques();
                req.session.succes = `Bienvenue ${utilisateur.nomComplet} !`;
            }
            res.redirect('/dashboard');

        } catch (erreur) {
            console.error('Erreur lors de la connexion:', erreur);
            if (req.session) {
                req.session.erreur = 'Une erreur s\'est produite lors de la connexion';
            }
            res.redirect('/connexion');
        }
    },

    // Afficher le tableau de bord (redirige vers le nouveau contrôleur)
    afficherTableauDeBord: (req, res) => {
        // Rediriger vers le nouveau contrôleur dashboard
        const dashboardController = require('./dashboardController');
        return dashboardController.afficherDashboard(req, res);
    },

    // Déconnexion
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
