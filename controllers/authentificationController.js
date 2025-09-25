const Utilisateur = require('../models/utilisateur');

const authentificationController = {
    // Afficher la page de connexion
    afficherConnexion: (req, res) => {
        res.render('authentification/connexion', {
            titre: 'Connexion - NutriTrack',
            ongletActif: 'connexion'
        });
    },

    // Afficher la page d'inscription
    afficherInscription: (req, res) => {
        res.render('authentification/inscription', {
            titre: 'Inscription - NutriTrack',
            ongletActif: 'inscription'
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
            req.session.utilisateur = {
                id: nouvelUtilisateur.id,
                nomComplet: nouvelUtilisateur.nomComplet,
                email: nouvelUtilisateur.email
            };

            req.session.succes = 'Votre compte a été créé avec succès !';
            
            res.redirect('/tableau-de-bord');

        } catch (erreur) {
            console.error('Erreur lors de l\'inscription:', erreur);
            req.session.erreur = erreur.message;
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
                req.session.erreur = 'Email ou mot de passe incorrect';
                return res.redirect('/connexion');
            }

            // Vérifier le mot de passe
            const motDePasseValide = await utilisateur.verifierMotDePasse(motDePasse);

            if (!motDePasseValide) {
                req.session.erreur = 'Email ou mot de passe incorrect';
                return res.redirect('/connexion');
            }

            // Créer la session
            req.session.utilisateur = utilisateur.obtenirDonneesPubliques();

            req.session.succes = `Bienvenue ${utilisateur.nomComplet} !`;
            res.redirect('/tableau-de-bord');

        } catch (erreur) {
            console.error('Erreur lors de la connexion:', erreur);
            req.session.erreur = 'Une erreur s\'est produite lors de la connexion';
            res.redirect('/connexion');
        }
    },

    // Afficher le tableau de bord
    afficherTableauDeBord: (req, res) => {
        res.render('dashboard', {
            titre: 'Tableau de Bord - NutriTrack',
            utilisateur: req.session.utilisateur
        });
    },

    // Déconnexion
    deconnexion: (req, res) => {
        req.session.destroy((erreur) => {
            if (erreur) {
                console.error('Erreur lors de la déconnexion:', erreur);
                req.session.erreur = 'Erreur lors de la déconnexion';
                return res.redirect('/tableau-de-bord');
            }
            
            res.redirect('/connexion');
        });
    }
};

module.exports = authentificationController;
