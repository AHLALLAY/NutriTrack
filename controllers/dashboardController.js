const Profil = require('../models/profil');
const Repas = require('../models/repas');
const Recommandation = require('../models/recommandation');
const Utilisateur = require('../models/utilisateur');
const Objectif = require('../models/objectif');

const dashboardController = {
    // Afficher le tableau de bord principal
    afficherDashboard: async (req, res) => {
        try {
            const utilisateurId = req.session && req.session.utilisateur ? req.session.utilisateur.id : null;
            
            if (!utilisateurId) {
                return res.redirect('/connexion');
            }

            // Récupérer les données nécessaires
            const [profil, objectif, repasDuJour, statistiquesJour, conseilDuJour, utilisateur] = await Promise.all([
                Profil.trouverParUtilisateur(utilisateurId),
                Objectif.trouverParUtilisateur(utilisateurId),
                Repas.trouverRepasDuJour(utilisateurId),
                Repas.obtenirStatistiquesJour(utilisateurId),
                Recommandation.obtenirConseilDuJour(utilisateurId),
                Utilisateur.trouverParId(utilisateurId)
            ]);

            // Récupérer les objectifs nutritionnels
            const objectifsNutritionnels = await obtenirObjectifsNutritionnels(profil, objectif);
            
            // Récupérer les valeurs consommées
            const valeursConsommees = await obtenirValeursConsommees(statistiquesJour);

            // Calculer les KPIs
            const kpis = calculerKPIs(objectifsNutritionnels, valeursConsommees);

            // Formater les données pour la vue
            const donneesDashboard = {
                utilisateur: utilisateur.obtenirDonneesPubliques(),
                profil: profil ? profil.obtenirDonneesPubliques() : null,
                kpis: kpis,
                repasDuJour: repasDuJour.map(repas => repas.obtenirDonneesPubliques()),
                conseilDuJour: conseilDuJour.obtenirDonneesPubliques ? conseilDuJour.obtenirDonneesPubliques() : conseilDuJour,
                statistiquesJour: statistiquesJour
            };

            res.render('dashboard', {
                titre: 'Tableau de Bord - NutriTrack',
                ...donneesDashboard
            });

        } catch (erreur) {
            console.error('Erreur lors du chargement du dashboard:', erreur);
            res.render('dashboard', {
                titre: 'Tableau de Bord - NutriTrack',
                utilisateur: req.session ? req.session.utilisateur : null,
                kpis: {
                    calories: { valeur: 0, objectif: 0, pourcentage: 0 },
                    hydratation: { valeurLitres: 0, objectifLitres: 0, pourcentage: 0 },
                    proteines: { valeurGrammes: 0, objectifGrammes: 0, pourcentage: 0 },
                    glucides: { valeurGrammes: 0, objectifGrammes: 0, pourcentage: 0 }
                },
                repasDuJour: [],
                conseilDuJour: {
                    titre: 'Bienvenue sur NutriTrack',
                    contenu: 'Commencez par ajouter vos premiers repas pour voir vos statistiques nutritionnelles.',
                    icone: 'fas fa-lightbulb'
                },
                erreur: 'Erreur lors du chargement des données'
            });
        }
    },

    // API pour ajouter un repas
    ajouterRepas: async (req, res) => {
        try {
            const utilisateurId = req.session && req.session.utilisateur ? req.session.utilisateur.id : null;
            
            if (!utilisateurId) {
                return res.status(401).json({ erreur: 'Non authentifié' });
            }

            const donneesRepas = {
                utilisateurId,
                nom: req.body.nom,
                description: req.body.description,
                calories: parseFloat(req.body.calories),
                proteines: parseFloat(req.body.proteines) || 0,
                glucides: parseFloat(req.body.glucides) || 0,
                lipides: parseFloat(req.body.lipides) || 0,
                fibres: parseFloat(req.body.fibres) || 0,
                sodium: parseFloat(req.body.sodium) || 0,
                sucre: parseFloat(req.body.sucre) || 0,
                indexGlycemique: parseInt(req.body.indexGlycemique) || null,
                imageUrl: req.body.imageUrl,
                typeRepas: req.body.typeRepas,
                dateRepas: req.body.dateRepas || new Date()
            };

            const nouveauRepas = await Repas.creer(donneesRepas);

            res.json({
                succes: true,
                repas: nouveauRepas.obtenirDonneesPubliques ? nouveauRepas.obtenirDonneesPubliques() : nouveauRepas
            });

        } catch (erreur) {
            console.error('Erreur lors de l\'ajout du repas:', erreur);
            res.status(500).json({ erreur: 'Erreur lors de l\'ajout du repas' });
        }
    },

    // API pour obtenir les statistiques en temps réel
    obtenirStatistiques: async (req, res) => {
        try {
            const utilisateurId = req.session && req.session.utilisateur ? req.session.utilisateur.id : null;
            
            if (!utilisateurId) {
                return res.status(401).json({ erreur: 'Non authentifié' });
            }

            const [profil, objectif, statistiquesJour] = await Promise.all([
                Profil.trouverParUtilisateur(utilisateurId),
                Objectif.trouverParUtilisateur(utilisateurId),
                Repas.obtenirStatistiquesJour(utilisateurId)
            ]);

            // Récupérer les objectifs nutritionnels
            const objectifsNutritionnels = await obtenirObjectifsNutritionnels(profil, objectif);
            
            // Récupérer les valeurs consommées
            const valeursConsommees = await obtenirValeursConsommees(statistiquesJour);

            const kpis = calculerKPIs(objectifsNutritionnels, valeursConsommees);

            res.json({
                succes: true,
                kpis: kpis,
                statistiques: statistiquesJour
            });

        } catch (erreur) {
            console.error('Erreur lors de la récupération des statistiques:', erreur);
            res.status(500).json({ erreur: 'Erreur lors de la récupération des statistiques' });
        }
    },

    // API pour obtenir les repas du jour
    obtenirRepasDuJour: async (req, res) => {
        try {
            const utilisateurId = req.session && req.session.utilisateur ? req.session.utilisateur.id : null;
            
            if (!utilisateurId) {
                return res.status(401).json({ erreur: 'Non authentifié' });
            }

            const repasDuJour = await Repas.trouverRepasDuJour(utilisateurId);

            res.json({
                succes: true,
                repas: repasDuJour.map(repas => repas.obtenirDonneesPubliques())
            });

        } catch (erreur) {
            console.error('Erreur lors de la récupération des repas:', erreur);
            res.status(500).json({ erreur: 'Erreur lors de la récupération des repas' });
        }
    },

    // API pour obtenir les statistiques hebdomadaires
    obtenirStatistiquesHebdomadaires: async (req, res) => {
        try {
            const utilisateurId = req.session && req.session.utilisateur ? req.session.utilisateur.id : null;
            
            if (!utilisateurId) {
                return res.status(401).json({ erreur: 'Non authentifié' });
            }

            const statistiquesSemaine = await Repas.obtenirStatistiquesSemaine(utilisateurId);

            res.json({
                succes: true,
                statistiques: statistiquesSemaine
            });

        } catch (erreur) {
            console.error('Erreur lors de la récupération des statistiques hebdomadaires:', erreur);
            res.status(500).json({ erreur: 'Erreur lors de la récupération des statistiques' });
        }
    }
};

// Fonction pour récupérer les objectifs nutritionnels
async function obtenirObjectifsNutritionnels(profil, objectif) {
    // Priorité 1: Objectifs personnalisés
    if (objectif) {
        return {
            calories: objectif.calories,
            proteines: objectif.proteines,
            glucides: objectif.glucides,
            lipides: objectif.lipides,
            hydratationLitres: objectif.hydratationLitres
        };
    }
    
    // Priorité 2: Besoins calculés du profil
    if (profil) {
        return {
            calories: profil.besoinsCaloriques,
            proteines: profil.besoinsProteines,
            glucides: profil.besoinsGlucides,
            lipides: profil.besoinsLipides,
            hydratationLitres: profil.besoinsHydratationLitres
        };
    }
    
    // Priorité 3: Valeurs par défaut
    return {
        calories: 1800,
        proteines: 80,
        glucides: 200,
        lipides: 65,
        hydratationLitres: 1.5
    };
}

// Fonction pour récupérer les valeurs consommées
async function obtenirValeursConsommees(statistiquesJour) {
    return {
        calories: statistiquesJour.total_calories || 0,
        proteines: statistiquesJour.total_proteines || 0,
        glucides: statistiquesJour.total_glucides || 0,
        lipides: statistiquesJour.total_lipides || 0,
        hydratation: statistiquesJour.total_hydratation_ml || 0 // En millilitres
    };
}

// Fonction utilitaire pour calculer les KPIs
function calculerKPIs(objectifsNutritionnels, valeursConsommees) {
    const caloriesConsommees = valeursConsommees.calories;
    const proteinesConsommees = valeursConsommees.proteines;
    const glucidesConsommes = valeursConsommees.glucides;
    const hydratationConsommeeMl = valeursConsommees.hydratation;
    
    // Conversion ml en litres pour l'affichage
    const hydratationConsommeeLitres = hydratationConsommeeMl / 1000;
    const objectifHydratationLitres = objectifsNutritionnels.hydratationLitres || 1.5;

    return {
        calories: {
            valeur: Math.round(caloriesConsommees),
            objectif: objectifsNutritionnels.calories,
            pourcentage: Math.round((caloriesConsommees / objectifsNutritionnels.calories) * 100)
        },
        hydratation: {
            valeurLitres: Math.round(hydratationConsommeeLitres * 10) / 10,
            objectifLitres: objectifHydratationLitres,
            pourcentage: Math.round((hydratationConsommeeLitres / objectifHydratationLitres) * 100)
        },
        proteines: {
            valeurGrammes: Math.round(proteinesConsommees),
            objectifGrammes: objectifsNutritionnels.proteines,
            pourcentage: Math.round((proteinesConsommees / objectifsNutritionnels.proteines) * 100)
        },
        glucides: {
            valeurGrammes: Math.round(glucidesConsommes),
            objectifGrammes: objectifsNutritionnels.glucides,
            pourcentage: Math.round((glucidesConsommes / objectifsNutritionnels.glucides) * 100)
        }
    };
}

module.exports = dashboardController;
