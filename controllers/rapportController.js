const RapportController = {
    afficherRapport: (req, res) => {
        res.render('rapports', {
            titre: 'Rapports - NutriTrack',
            ongletActif: 'rapports',
            metrics: []
        });
    }
}

module.exports = RapportController;