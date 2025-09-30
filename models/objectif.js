const { executerRequete } = require('../database/connexion');

class Objectif {
    constructor(donnees) {
        this.id = donnees.id;
        this.calories = donnees.calories;
        this.proteines = donnees.proteines;
        this.glucides = donnees.glucides;
        this.lipides = donnees.lipides;
    }

    static async creerOuMettreAJour(utilisateurId, donnees) {
        const objectifExistant = await this.trouverParUtilisateur(utilisateurId);
        
        if (objectifExistant) {
            return await this.mettreAJour(objectifExistant.id, donnees);
        } else {
            return await this.creer(utilisateurId, donnees);
        }
    }

    static async creer(utilisateurId, donnees) {
        const requete = `
            INSERT INTO objectifs_nutritionnels (utilisateur_id, calories, proteines, glucides, lipides) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        await executerRequete(requete, [
            utilisateurId, donnees.calories, donnees.proteines, 
            donnees.glucides, donnees.lipides
        ]);
    }

    static async mettreAJour(objectifId, donnees) {
        const requete = `
            UPDATE objectifs_nutritionnels 
            SET calories = ?, proteines = ?, glucides = ?, lipides = ?
            WHERE id = ?
        `;
        
        await executerRequete(requete, [
            donnees.calories, donnees.proteines, donnees.glucides, 
            donnees.lipides, objectifId
        ]);
    }

    static async trouverParUtilisateur(utilisateurId) {
        const requete = `SELECT * FROM objectifs_nutritionnels WHERE utilisateur_id = ? LIMIT 1`;
        const resultats = await executerRequete(requete, [utilisateurId]);
        return resultats[0] ? new Objectif(resultats[0]) : null;
    }

    obtenirDonneesPubliques() {
        return {
            calories: this.calories,
            proteines: this.proteines,
            glucides: this.glucides,
            lipides: this.lipides
        };
    }
}

module.exports = Objectif;
