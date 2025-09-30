// Middleware pour gérer les sessions expirées
const SessionController = require('../controllers/sessionController');

// Middleware pour vérifier et nettoyer les sessions expirées
const gererSessionsExpirees = async (req, res, next) => {
    try {
        // Vérifier si la session actuelle est valide
        if (req.sessionID) {
            const sessionValide = await SessionController.verifierSessionValide(req.sessionID);
            
            if (!sessionValide) {
                // Session expirée ou invalide, la détruire
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Erreur lors de la destruction de session expirée:', err);
                    }
                });
                
                // Rediriger vers la page de connexion
                return res.redirect('/connexion?message=session_expiree');
            }
        }
        
        next();
    } catch (error) {
        console.error('Erreur dans le middleware de gestion des sessions:', error);
        next(); // Continuer même en cas d'erreur
    }
};

// Middleware pour marquer une session comme active lors de l'utilisation
const marquerSessionActive = async (req, res, next) => {
    try {
        if (req.sessionID && req.session.utilisateur) {
            // Mettre à jour le timestamp de la session dans la base de données
            const { executerRequete } = require('../base-de-donnees/connexion');
            await executerRequete(
                'UPDATE sessions_express SET updated_at = CURRENT_TIMESTAMP WHERE session_id = ?',
                [req.sessionID]
            );
        }
        next();
    } catch (error) {
        console.error('Erreur lors du marquage de session active:', error);
        next();
    }
};

// Fonction pour nettoyer périodiquement les sessions expirées
const nettoyerSessionsExpirees = async () => {
    try {
        const { executerRequete } = require('../base-de-donnees/connexion');
        
        // Marquer les sessions expirées comme inactives
        const resultat = await executerRequete(`
            UPDATE sessions_express 
            SET is_active = FALSE, reason = 'auto_expired', expired_at = CURRENT_TIMESTAMP
            WHERE expires < ? AND is_active = TRUE
        `, [Date.now()]);
        
        if (resultat.affectedRows > 0) {
            console.log(`🧹 ${resultat.affectedRows} sessions expirées marquées comme inactives automatiquement`);
        }
        
        return resultat.affectedRows;
    } catch (error) {
        console.error('Erreur lors du nettoyage des sessions:', error);
        return 0;
    }
};

// Démarrer le nettoyage périodique (toutes les 15 minutes)
setInterval(nettoyerSessionsExpirees, 15 * 60 * 1000);

module.exports = {
    gererSessionsExpirees,
    marquerSessionActive,
    nettoyerSessionsExpirees
};
