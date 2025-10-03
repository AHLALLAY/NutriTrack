const validerInscription = (req, res, next) => {
    const { nomComplet, email, motDePasse } = req.body;
    const erreurs = [];

    if (!nomComplet || nomComplet.trim().length < 2) {
        erreurs.push('Le nom complet doit contenir au moins 2 caractères');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        erreurs.push('Veuillez saisir un email valide');
    }

    if (!motDePasse || motDePasse.length < 6) {
        erreurs.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (erreurs.length > 0) {
        req.session.erreur = erreurs.join(', ');
        return res.redirect('/inscription');
    }

    next();
};

const validerConnexion = (req, res, next) => {
    const { email, motDePasse } = req.body;
    const erreurs = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        erreurs.push('Veuillez saisir un email valide');
    }

    if (!motDePasse) {
        erreurs.push('Veuillez saisir votre mot de passe');
    }

    if (erreurs.length > 0) {
        req.session.erreur = erreurs.join(', ');
        return res.redirect('/connexion');
    }

    next();
};

module.exports = {
    validerInscription,
    validerConnexion
};
