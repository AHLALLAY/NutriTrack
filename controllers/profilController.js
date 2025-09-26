const Profil = require('../models/profil');
const Utilisateur = require('../models/utilisateur');

const profilController = {
    // Afficher la page de profil
    afficherProfil: async (req, res) => {
        try {
            const utilisateurId = req.session.utilisateur.id;
            const profil = await Profil.trouverParUtilisateur(utilisateurId);
            const statistiques = await Profil.obtenirStatistiques(utilisateurId);
            const utilisateur = await Utilisateur.trouverParId(utilisateurId);
            
            res.render('profil', {
                titre: 'Profil & Objectifs - NutriTrack',
                utilisateur: utilisateur.obtenirDonneesPubliques(),
                profil: profil ? profil.obtenirDonneesPubliques() : null,
                statistiques: statistiques,
                ongletActif: 'profil'
            });
        } catch (erreur) {
            console.error('Erreur lors de l\'affichage du profil:', erreur);
            req.session.erreur = 'Erreur lors du chargement du profil';
            res.redirect('/tableau-de-bord');
        }
    },

    // Traiter de maj
    traiterMiseAJourProfil: async (req, res) => {
        try {
            const utilisateurId = req.session.utilisateur.id;
            const {
                typeProfil,
                objectif,
                objectifPoids,
                poids,
                taille,
                age,
                activitePhysique
            } = req.body;

            if (!poids || !taille || !age) {
                req.session.erreur = 'Veuillez remplir tous les champs obligatoires';
                return res.redirect('/profil');
            }

            if (poids <= 0 || taille <= 0 || age <= 0) {
                req.session.erreur = 'Les valeurs doivent être positives';
                return res.redirect('/profil');
            }

            if (age < 10 || age > 120) {
                req.session.erreur = 'L\'âge doit être entre 10 et 120 ans';
                return res.redirect('/profil');
            }

            // Calculer les besoins nutritionnels basiques
            const besoins = calculerBesoinsNutritionnels(poids, taille, age, activitePhysique);

            // l'objectif basé sur le poids objectif
            const objectifComplet = objectifPoids ? `Atteindre ${objectifPoids}kg` : (objectif || '');
            const donneesProfil = {
                typeProfil: typeProfil || 'perte_poids',
                objectif: objectifComplet,
                poids: parseFloat(poids),
                taille: parseFloat(taille),
                age: parseInt(age),
                activitePhysique: activitePhysique || 'modere',
                besoinsCaloriques: besoins.calories,
                besoinsProteines: besoins.proteines,
                besoinsGlucides: besoins.glucides,
                besoinsLipides: besoins.lipides,
                objectifPoids: objectifPoids ? parseFloat(objectifPoids) : null
            };

            // Créer ou majr de profil
            const profil = await Profil.creerOuMettreAJour(utilisateurId, donneesProfil);

            req.session.succes = 'Profil mis à jour avec succès !';
            res.redirect('/profil');

        } catch (erreur) {
            console.error('Erreur lors de la mise à jour du profil:', erreur);
            req.session.erreur = 'Erreur lors de la mise à jour du profil';
            res.redirect('/profil');
        }
    },
    // Afficher les objectifs
    afficherObjectifs: async (req, res) => {
        try {
            const utilisateurId = req.session.utilisateur.id;
            const profil = await Profil.trouverParUtilisateur(utilisateurId);
            const statistiques = await Profil.obtenirStatistiques(utilisateurId);
            const utilisateur = await Utilisateur.trouverParId(utilisateurId);
            
            res.render('profil', {
                titre: 'Objectifs - NutriTrack',
                utilisateur: utilisateur.obtenirDonneesPubliques(),
                profil: profil ? profil.obtenirDonneesPubliques() : null,
                statistiques: statistiques,
                ongletActif: 'objectifs'
            });
        } catch (erreur) {
            console.error('Erreur lors de l\'affichage des objectifs:', erreur);
            req.session.erreur = 'Erreur lors du chargement des objectifs';
            res.redirect('/tableau-de-bord');
        }
    },

    // Afficher les préférences
    afficherPreferences: async (req, res) => {
        try {
            const utilisateurId = req.session.utilisateur.id;
            const profil = await Profil.trouverParUtilisateur(utilisateurId);
            const statistiques = await Profil.obtenirStatistiques(utilisateurId);
            const utilisateur = await Utilisateur.trouverParId(utilisateurId);
            
            res.render('profil', {
                titre: 'Préférences - NutriTrack',
                utilisateur: utilisateur.obtenirDonneesPubliques(),
                profil: profil ? profil.obtenirDonneesPubliques() : null,
                statistiques: statistiques,
                ongletActif: 'preferences'
            });
        } catch (erreur) {
            console.error('Erreur lors de l\'affichage des préférences:', erreur);
            req.session.erreur = 'Erreur lors du chargement des préférences';
            res.redirect('/tableau-de-bord');
        }
    },

    // Afficher les suivis
    afficherSuivis: async (req, res) => {
        try {
            const utilisateurId = req.session.utilisateur.id;
            
            // Récupérer le profil de l'utilisateur
            const profil = await Profil.trouverParUtilisateur(utilisateurId);
            
            // Récupérer les statistiques
            const statistiques = await Profil.obtenirStatistiques(utilisateurId);
            
            // Récupérer les informations utilisateur
            const utilisateur = await Utilisateur.trouverParId(utilisateurId);
            
            res.render('profil', {
                titre: 'Suivis - NutriTrack',
                utilisateur: utilisateur.obtenirDonneesPubliques(),
                profil: profil ? profil.obtenirDonneesPubliques() : null,
                statistiques: statistiques,
                ongletActif: 'suivis'
            });
        } catch (erreur) {
            console.error('Erreur lors de l\'affichage des suivis:', erreur);
            req.session.erreur = 'Erreur lors du chargement des suivis';
            res.redirect('/tableau-de-bord');
        }
    }
};

// Fonction pour calculer les besoins nutritionnels
function calculerBesoinsNutritionnels(poids, taille, age, activitePhysique) {
    // Calcul du métabolisme de base (formule de Harris-Benedict)
    let bmr;
    if (age <= 18) {
        // Formule pour adolescents
        bmr = 17.5 * poids + 651;
    } else {
        // Formule pour adultes
        bmr = 10 * poids + 6.25 * taille - 5 * age + 5;
    }

    // Facteurs d'activité physique
    const facteursActivite = {
        'sedentaire': 1.2,
        'leger': 1.375,
        'modere': 1.55,
        'intense': 1.725,
        'tres_intense': 1.9
    };

    const facteur = facteursActivite[activitePhysique] || 1.55;
    const calories = Math.round(bmr * facteur);

    // Répartition des macronutriments
    const proteines = Math.round(poids * 1.6); // 1.6g par kg de poids
    const lipides = Math.round(calories * 0.25 / 9); // 25% des calories en lipides
    const glucides = Math.round((calories - (proteines * 4) - (lipides * 9)) / 4);

    return {
        calories: calories,
        proteines: proteines,
        glucides: glucides,
        lipides: lipides
    };
}

module.exports = profilController;
