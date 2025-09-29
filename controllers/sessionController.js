// Contrôleur pour gérer les sessions
const { executerRequete } = require('../base-de-donnees/connexion');

class SessionController {
    
    // Vérifier et gérer les sessions existantes lors de la connexion
    static async verifierEtGererSession(userId) {
        try {
            // Vérifier s'il y a déjà une session active pour cet utilisateur
            const sessionExistante = await executerRequete(
                'SELECT session_id, expires FROM sessions_express WHERE user_id = ? AND is_active = TRUE',
                [userId]
            );
            
            if (sessionExistante.length > 0) {
                const session = sessionExistante[0];
                const maintenant = Date.now();
                
                // Si la session n'est pas expirée, la laisser passer
                if (session.expires > maintenant) {
                    console.log(`✅ Session existante valide pour l'utilisateur ${userId}`);
                    return { 
                        action: 'keep', 
                        sessionId: session.session_id,
                        message: 'Session existante conservée'
                    };
                } else {
                    // Session expirée, la marquer comme inactive
                    await SessionController.marquerSessionInactive(session.session_id, 'expired');
                    console.log(`🔄 Session expirée marquée comme inactive pour l'utilisateur ${userId}`);
                }
            }
            
            // Vérifier s'il y a d'autres sessions actives non expirées
            const autresSessions = await executerRequete(
                'SELECT session_id, user_id, expires FROM sessions_express WHERE user_id != ? AND is_active = TRUE AND expires > ?',
                [userId, Date.now()]
            );
            
            // Marquer les autres sessions actives comme inactives
            for (const session of autresSessions) {
                await SessionController.marquerSessionInactive(session.session_id, 'replaced');
                console.log(`🔄 Session de l'utilisateur ${session.user_id} remplacée par ${userId}`);
            }
            
            return { 
                action: 'create', 
                message: 'Nouvelle session créée, autres sessions remplacées'
            };
            
        } catch (error) {
            console.error('❌ Erreur lors de la vérification des sessions:', error);
            return { 
                action: 'error', 
                message: 'Erreur lors de la vérification des sessions'
            };
        }
    }
    
    // Marquer une session comme inactive
    static async marquerSessionInactive(sessionId, reason = 'expired') {
        try {
            const resultat = await executerRequete(`
                UPDATE sessions_express 
                SET is_active = FALSE, reason = ?, expired_at = CURRENT_TIMESTAMP
                WHERE session_id = ?
            `, [reason, sessionId]);
            
            if (resultat.affectedRows > 0) {
                console.log(`✅ Session ${sessionId} marquée comme inactive (${reason})`);
            } else {
                console.log(`⚠️ Session ${sessionId} non trouvée`);
            }
            
        } catch (error) {
            console.error('❌ Erreur lors du marquage de session inactive:', error);
            throw error;
        }
    }
    
    // Créer une nouvelle session pour un utilisateur
    static async creerNouvelleSession(sessionId, userId, sessionData) {
        try {
            await executerRequete(`
                INSERT INTO sessions_express 
                (session_id, expires, data, user_id, is_active, reason)
                VALUES (?, ?, ?, ?, TRUE, 'active')
            `, [
                sessionId,
                Date.now() + (24 * 60 * 60 * 1000), // 24 heures
                JSON.stringify(sessionData),
                userId
            ]);
            
            console.log(`✅ Nouvelle session créée pour l'utilisateur ${userId}`);
            
        } catch (error) {
            console.error('❌ Erreur lors de la création de session:', error);
            throw error;
        }
    }
    
    // Vérifier si une session est valide
    static async verifierSessionValide(sessionId) {
        try {
            const session = await executerRequete(
                'SELECT * FROM sessions_express WHERE session_id = ? AND is_active = TRUE AND expires > ?',
                [sessionId, Date.now()]
            );
            
            return session.length > 0 ? session[0] : null;
            
        } catch (error) {
            console.error('❌ Erreur lors de la vérification de session:', error);
            return null;
        }
    }
    
    // Marquer les sessions expirées
    static async marquerSessionsExpirees() {
        try {
            const requete = `
                UPDATE sessions_express 
                SET is_expired = TRUE 
                WHERE expires < UNIX_TIMESTAMP() * 1000 
                AND is_expired = FALSE
            `;
            
            const resultat = await executerRequete(requete);
            console.log(`✅ ${resultat.affectedRows} sessions marquées comme expirées`);
            return resultat.affectedRows;
        } catch (error) {
            console.error('❌ Erreur lors du marquage des sessions expirées:', error);
            throw error;
        }
    }
    
    // Supprimer les sessions expirées (nettoyage complet)
    static async supprimerSessionsExpirees() {
        try {
            const requete = `
                DELETE FROM sessions_express 
                WHERE expires < UNIX_TIMESTAMP() * 1000
            `;
            
            const resultat = await executerRequete(requete);
            console.log(`🗑️ ${resultat.affectedRows} sessions expirées supprimées`);
            return resultat.affectedRows;
        } catch (error) {
            console.error('❌ Erreur lors de la suppression des sessions expirées:', error);
            throw error;
        }
    }
    
    // Obtenir les statistiques des sessions
    static async obtenirStatistiquesSessions() {
        try {
            const requete = `
                SELECT 
                    COUNT(*) as total_sessions,
                    SUM(CASE WHEN is_expired = FALSE THEN 1 ELSE 0 END) as sessions_actives,
                    SUM(CASE WHEN is_expired = TRUE THEN 1 ELSE 0 END) as sessions_expirees,
                    MIN(created_at) as premiere_session,
                    MAX(created_at) as derniere_session
                FROM sessions_express
            `;
            
            const resultat = await executerRequete(requete);
            return resultat[0];
        } catch (error) {
            console.error('❌ Erreur lors de l\'obtention des statistiques:', error);
            throw error;
        }
    }
    
    // Obtenir les sessions actives d'un utilisateur
    static async obtenirSessionsUtilisateur(userId) {
        try {
            const requete = `
                SELECT 
                    session_id,
                    created_at,
                    updated_at,
                    is_expired,
                    expires
                FROM sessions_express 
                WHERE data LIKE ? 
                AND is_expired = FALSE
                ORDER BY created_at DESC
            `;
            
            const resultat = await executerRequete(requete, [`%${userId}%`]);
            return resultat;
        } catch (error) {
            console.error('❌ Erreur lors de l\'obtention des sessions utilisateur:', error);
            throw error;
        }
    }
    
    // Forcer la déconnexion d'un utilisateur (marquer toutes ses sessions comme expirées)
    static async forcerDeconnexionUtilisateur(userId) {
        try {
            const requete = `
                UPDATE sessions_express 
                SET is_expired = TRUE 
                WHERE data LIKE ? 
                AND is_expired = FALSE
            `;
            
            const resultat = await executerRequete(requete, [`%${userId}%`]);
            console.log(`🔒 ${resultat.affectedRows} sessions de l'utilisateur ${userId} marquées comme expirées`);
            return resultat.affectedRows;
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion forcée:', error);
            throw error;
        }
    }
    
    // Vérifier si une session est expirée
    static async verifierSessionExpiree(sessionId) {
        try {
            const requete = `
                SELECT is_expired, expires 
                FROM sessions_express 
                WHERE session_id = ?
            `;
            
            const resultat = await executerRequete(requete, [sessionId]);
            
            if (resultat.length === 0) {
                return { existe: false, expiree: true };
            }
            
            const session = resultat[0];
            const maintenant = Date.now();
            
            return {
                existe: true,
                expiree: session.is_expired || session.expires < maintenant
            };
        } catch (error) {
            console.error('❌ Erreur lors de la vérification de session:', error);
            return { existe: false, expiree: true };
        }
    }
    
    // Mettre à jour le timestamp d'une session
    static async mettreAJourSession(sessionId) {
        try {
            const requete = `
                UPDATE sessions_express 
                SET updated_at = CURRENT_TIMESTAMP 
                WHERE session_id = ?
            `;
            
            await executerRequete(requete, [sessionId]);
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour de session:', error);
        }
    }
}

module.exports = SessionController;
