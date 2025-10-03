const verifierAuthentification = (req, res, next) => {
    if (req.session && req.session.utilisateur) {
        next();
    } else {
        req.session.erreur = 'Veuillez vous connecter pour accéder à cette page';
        res.redirect('/connexion');
    }
};

const redirigerSiConnecte = (req, res, next) => {
    if (req.session && req.session.utilisateur) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};

module.exports = {
    verifierAuthentification,
    redirigerSiConnecte
};
