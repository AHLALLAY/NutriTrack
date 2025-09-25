// Middleware pour gérer les sessions et les messages
const gererSession = (req, res, next) => {
    // Passer les données de session aux vues
    res.locals.utilisateur = req.session.utilisateur || null;
    res.locals.erreur = req.session.erreur || null;
    res.locals.succes = req.session.succes || null;
    
    // Nettoyer les messages après utilisation
    delete req.session.erreur;
    delete req.session.succes;
    
    next();
};

module.exports = {
    gererSession
};
