const Repas = require("../models/repas");

const RapportController = {
    afficherRapport: async (req, res) => {
        const userId = req.session && req.session.utilisateur ? req.session.utilisateur.id : null;
        const statistiquesJour = await Repas.obtenirStatistiquesJour(userId);
        const statistiquesSemaine = await Repas.obtenirStatistiquesSemaine(userId);
        const ongletActif = req.params.onglet || 'tendances';
        
        res.render('rapports', {
            statistiquesJour,
            statistiquesSemaine,
            titre: 'Rapports - NutriTrack',
            ongletActif,
        });
    },

    // afficherTendances: (req, res) => {
    //     const userId = req.session && req.session.utilisateur ? req.session.utilisateur.id : null;
        
    //     res.render('rapports', {
    //         userId: userId,
    //         titre: 'Rapports - NutriTrack',
    //         ongletActif: 'tendances',
    //     });
    // },

    // afficherRepas: (req, res) => {
    //     const userId = req.session && req.session.utilisateur ? req.session.utilisateur.id : null;
        
    //     res.render('rapports', {
    //         userId: userId,
    //         titre: 'Rapports - NutriTrack',
    //         ongletActif: 'repas',
    //     });
    // },
}

module.exports = RapportController;