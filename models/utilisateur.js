const bcrypt = require('bcryptjs');
const { executerRequete } = require('../database/connexion');

class Utilisateur {
    constructor(donnees) {
        this.id = donnees.id;
        this.nomComplet = donnees.nom_complet || donnees.nomComplet;
        this.email = donnees.email;
        this.motDePasse = donnees.mot_de_passe || donnees.motDePasse;
        this.dateCreation = donnees.date_creation || donnees.dateCreation;
    }

    static async creer(donneesUtilisateur) {
        try {
            const requeteVerification = `
                SELECT COUNT(*) as count
                FROM utilisateurs 
                WHERE email = ?
            `;
            const resultatsVerification = await executerRequete(requeteVerification, [donneesUtilisateur.email]);
            
            if (resultatsVerification[0].count > 0) {
                throw new Error('Cet email est déjà utilisé');
            }

            const motDePasseHashe = await bcrypt.hash(donneesUtilisateur.motDePasse, 12);

            const requeteCreation = `
                INSERT INTO utilisateurs (nom_complet, email, mot_de_passe, date_creation)
                VALUES (?, ?, ?, NOW())
            `;
            const resultat = await executerRequete(requeteCreation, [
                donneesUtilisateur.nomComplet,
                donneesUtilisateur.email,
                motDePasseHashe
            ]);

            return {
                id: resultat.insertId,
                nomComplet: donneesUtilisateur.nomComplet,
                email: donneesUtilisateur.email
            };

        } catch (erreur) {
            throw new Error(`Erreur lors de la création de l'utilisateur: ${erreur.message}`);
        }
    }

    static async trouverParEmail(email) {
        try {
            const requete = `
                SELECT id, nom_complet, email, mot_de_passe, date_creation
                FROM utilisateurs 
                WHERE email = ?
            `;
            const resultats = await executerRequete(requete, [email]);
            return resultats[0] ? new Utilisateur(resultats[0]) : null;
        } catch (erreur) {
            throw new Error(`Erreur lors de la recherche de l'utilisateur: ${erreur.message}`);
        }
    }

    static async trouverParId(id) {
        try {
            const requete = `
                SELECT id, nom_complet, email, date_creation
                FROM utilisateurs 
                WHERE id = ?
            `;
            const resultats = await executerRequete(requete, [id]);
            return resultats[0] ? new Utilisateur(resultats[0]) : null;
        } catch (erreur) {
            throw new Error(`Erreur lors de la recherche de l'utilisateur: ${erreur.message}`);
        }
    }

    async verifierMotDePasse(motDePasse) {
        try {
            return await bcrypt.compare(motDePasse, this.motDePasse);
        } catch (erreur) {
            throw new Error(`Erreur lors de la vérification du mot de passe: ${erreur.message}`);
        }
    }

    obtenirDonneesPubliques() {
        return {
            id: this.id,
            nomComplet: this.nomComplet,
            email: this.email,
            dateCreation: this.dateCreation
        };
    }
}

module.exports = Utilisateur;
