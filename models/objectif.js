const { executerRequete } = require('../database/connexion');

class Objectif {
    constructor(donnees) {
        this.id = donnees.id;
        this.utilisateurId = donnees.utilisateur_id;
        this.calories = donnees.calories;
        this.proteines = donnees.proteines;
        this.glucides = donnees.glucides;
        this.lipides = donnees.lipides;
        this.hydratationLitres = donnees.hydratation_litres;
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
            INSERT INTO objectifs_nutritionnels (utilisateur_id, calories, proteines, glucides, lipides, hydratation_litres) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await executerRequete(requete, [
            utilisateurId, donnees.calories, donnees.proteines, 
            donnees.glucides, donnees.lipides, donnees.hydratationLitres || 2.0
        ]);
    }

    static async mettreAJour(objectifId, donnees) {
        const requete = `
            UPDATE objectifs_nutritionnels 
            SET calories = ?, proteines = ?, glucides = ?, lipides = ?, hydratation_litres = ?
            WHERE id = ?
        `;
        
        await executerRequete(requete, [
            donnees.calories, donnees.proteines, donnees.glucides, 
            donnees.lipides, donnees.hydratationLitres || 2.0, objectifId
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
            lipides: this.lipides,
            hydratationLitres: this.hydratationLitres
        };
    }
}

module.exports = Objectif;
