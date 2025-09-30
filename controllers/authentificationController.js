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

    // Afficher le tableau de bord
    afficherTableauDeBord: (req, res) => {
        const kpis = {
            calories: { valeur: 1247, objectif: 1800 },
            hydratation: { valeurLitres: 1.2, objectifLitres: 2 },
            proteines: { valeurGrammes: 45, objectifGrammes: 80 },
            glucides: { valeurGrammes: 142, objectifGrammes: 200 }
        };

        const repasDuJour = [
            { titre: 'Salade de quinoa aux légumes', moment: 'Déjeuner', heure: '13:00', energieKcal: 450 },
            { titre: 'Smoothie protéiné banana', moment: 'Petit-déjeuner', heure: '08:30', energieKcal: 320 },
            { titre: 'Yaourt grec aux fruits', moment: 'Collation', heure: '16:00', energieKcal: 180 }
        ];

        const conseilDuJour = {
            titre: 'Conseil du jour',
            texte: 'Buvez 2 verres d’eau avant votre prochain repas pour améliorer la digestion.'
        };
        
        res.render('dashboard', {
            titre: 'Tableau de Bord - NutriTrack',
            utilisateur: req.session ? req.session.utilisateur : null
        });
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
