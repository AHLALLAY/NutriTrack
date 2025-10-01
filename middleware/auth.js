// Middleware pour vérifier l'authentification
const verifierAuthentification = (req, res, next) => {
    if (req.session && req.session.utilisateur) {
        next();
    } else {
        if (req.session) {
            req.session.erreur = 'Veuillez vous connecter pour accéder à cette page';
        }
        res.redirect('/connexion');
    }
};

// Middleware pour rediriger si déjà connecté
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
