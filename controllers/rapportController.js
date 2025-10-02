const Repas = require("../models/repas");

const RapportController = {
    afficherRapport: async (req, res) => {
        const userId = req.session && req.session.utilisateur ? req.session.utilisateur.id : null;
        const statistiquesJour = await Repas.obtenirStatistiquesJour(userId);
        const statistiquesSemaine = await Repas.obtenirStatistiquesSemaine(userId);
        const countChaqueTypeRepasSemaine = await Repas.countChaqueTypeRepasSemaine(userId);
        const ongletActif = req.params.onglet || 'tendances';
        
        res.render('rapports', {
            statistiquesJour,
            statistiquesSemaine,
            countChaqueTypeRepasSemaine,
            titre: 'Rapports - NutriTrack',
            ongletActif,
        });
    },
}

module.exports = RapportController;