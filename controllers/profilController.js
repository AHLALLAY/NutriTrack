const Profil = require('../models/profil');
const Utilisateur = require('../models/utilisateur');
const Objectif = require('../models/objectif');

const profilController = {
    afficherProfil: async (req, res) => {
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
    },
    afficherObjectifs: async (req, res) => {
        const utilisateurId = req.session.utilisateur.id;
        const objectif = await Objectif.trouverParUtilisateur(utilisateurId);
        const utilisateur = await Utilisateur.trouverParId(utilisateurId);
        
        res.render('profil', {
            titre: 'Objectifs - NutriTrack',
            utilisateur: utilisateur.obtenirDonneesPubliques(),
            objectif: objectif ? objectif.obtenirDonneesPubliques() : null,
            ongletActif: 'objectifs'
        });
    },

    traiterMiseAJourProfil: async (req, res) => {
        const utilisateurId = req.session.utilisateur.id;
        const { typeProfil, objectifPoids, poids, taille, age, activitePhysique } = req.body;

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

        const besoins = calculerBesoinsNutritionnels(poids, taille, age, activitePhysique, typeProfil, objectifPoids);

        const donneesProfil = {
            typeProfil: typeProfil || 'perte_poids',
            objectif: objectifPoids ? `Atteindre ${objectifPoids}kg` : '',
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

        // Sauvegarder
        await Profil.creerOuMettreAJour(utilisateurId, donneesProfil);

        req.session.succes = 'Profil mis à jour avec succès !';
        res.redirect('/profil');
    }
};

function calculerBesoinsNutritionnels(poids, taille, age, activitePhysique, typeProfil, objectifPoids) {
    let metabolismeBase;
    if (age <= 18) {
        metabolismeBase = 17.5 * poids + 651;
    } else {
        metabolismeBase = 10 * poids + 6.25 * taille - 5 * age + 5;
    }

    let facteurActivite = 1.55; 
    if (activitePhysique === 'sedentaire') facteurActivite = 1.2;
    if (activitePhysique === 'leger') facteurActivite = 1.375;
    if (activitePhysique === 'modere') facteurActivite = 1.55;
    if (activitePhysique === 'intense') facteurActivite = 1.725;
    if (activitePhysique === 'tres_intense') facteurActivite = 1.9;

    let calories = Math.round(metabolismeBase * facteurActivite);

    if (typeProfil === 'perte_poids') {
        calories = calories - 300;
    }
    if (typeProfil === 'prise_masse') {
        calories = calories + 300;
    }
    if (typeProfil === 'obesite') {
        calories = calories - 500;
    }
    if (typeProfil === 'athlete') {
        calories = calories + 200;
    }

    if (calories < 1200) {
        calories = 1200;
    }
  
    const proteines = Math.round(poids * 1.6);
    const lipides = Math.round(calories * 0.25 / 9);
    const glucides = Math.round(calories * 0.55 / 4);

    return {
        calories: calories,
        proteines: proteines,
        glucides: glucides,
        lipides: lipides
    };
}

module.exports = profilController;