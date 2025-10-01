const RapportController = {
    afficherRapport: (req, res) => {
        res.render('rapports', {
            titre: 'Rapports - NutriTrack',
            ongletActif: 'tendances',
        });
    },

    afficherRepas: (req, res) => {
        res.render('rapports', {
            titre: 'Rapports - NutriTrack',
            ongletActif: 'repas',
        });
    }
}

module.exports = RapportController;