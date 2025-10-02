const { executerRequete } = require('../database/connexion');

class Repas {
    constructor(donnees) {
        this.id = donnees.id;
        this.utilisateurId = donnees.utilisateur_id;
        this.nom = donnees.nom;
        this.description = donnees.description;
        this.calories = donnees.calories;
        this.proteines = donnees.proteines;
        this.glucides = donnees.glucides;
        this.lipides = donnees.lipides;
        this.fibres = donnees.fibres;
        this.sodium = donnees.sodium;
        this.sucre = donnees.sucre;
        this.hydratationMl = donnees.hydratation_ml;
        this.indexGlycemique = donnees.index_glycemique;
        this.imageUrl = donnees.image_url;
        this.typeRepas = donnees.type_repas;
        this.dateRepas = donnees.date_repas;
        this.dateCreation = donnees.date_creation;
    }

    static async creer(donneesRepas) {
        const requete = `
            INSERT INTO repas (
                utilisateur_id, nom, description, calories, proteines, glucides, 
                lipides, fibres, sodium, sucre, hydratation_ml, index_glycemique, image_url, 
                type_repas, date_repas
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const resultat = await executerRequete(requete, [
            donneesRepas.utilisateurId,
            donneesRepas.nom,
            donneesRepas.description,
            donneesRepas.calories,
            donneesRepas.proteines,
            donneesRepas.glucides,
            donneesRepas.lipides,
            donneesRepas.fibres,
            donneesRepas.sodium,
            donneesRepas.sucre,
            donneesRepas.hydratationMl || 0,
            donneesRepas.indexGlycemique,
            donneesRepas.imageUrl,
            donneesRepas.typeRepas,
            donneesRepas.dateRepas || new Date()
        ]);

        return { id: resultat.insertId, ...donneesRepas };
    }

    static async trouverParUtilisateur(utilisateurId, limite = 10) {
        const requete = `
            SELECT * FROM repas 
            WHERE utilisateur_id = ? 
            ORDER BY date_repas DESC 
            LIMIT ?
        `;
        const resultats = await executerRequete(requete, [utilisateurId, limite]);
        return resultats.map(repas => new Repas(repas));
    }

    static async trouverRepasDuJour(utilisateurId, date = null) {
        const dateRecherche = date || new Date().toISOString().split('T')[0];
        const requete = `
            SELECT * FROM repas 
            WHERE utilisateur_id = ? 
            AND DATE(date_repas) = ?
            ORDER BY date_repas ASC
        `;
        const resultats = await executerRequete(requete, [utilisateurId, dateRecherche]);
        return resultats.map(repas => new Repas(repas));
    }

    static async obtenirStatistiquesJour(utilisateurId) {
        const requete = `
            SELECT 
                SUM(calories) as total_calories,
                SUM(proteines) as total_proteines,
                SUM(glucides) as total_glucides,
                SUM(lipides) as total_lipides,
                SUM(hydratation_ml) as total_hydratation_ml,
                COUNT(*) as nombre_repas
            FROM repas 
            WHERE utilisateur_id = ? 
            AND DATE(date_repas) = CURDATE()
        `;
        const resultats = await executerRequete(requete, [utilisateurId]);
        return resultats[0] || {
            total_calories: 0,
            total_proteines: 0,
            total_glucides: 0,
            total_lipides: 0,
            total_hydratation_ml: 0,
            nombre_repas: 0
        };
    }

    static async obtenirStatistiquesSemaine(utilisateurId) {
        const requete = `
            SELECT 
                DATE_FORMAT(date_repas, '%Y-%m-%d') as date,
                SUM(calories) as calories,
                SUM(proteines) as proteines,
                SUM(glucides) as glucides,
                SUM(lipides) as lipides,
                SUM(hydratation_ml) as hydratation_ml,
                COUNT(*) as nombre_repas
            FROM repas 
            WHERE utilisateur_id = ? 
            AND DATE(date_repas) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY date
            ORDER BY date ASC
        `;
        const resultats = await executerRequete(requete, [utilisateurId]);
        return resultats;
    }

    obtenirDonneesPubliques() {
        return {
            id: this.id,
            nom: this.nom,
            description: this.description,
            calories: this.calories,
            proteines: this.proteines,
            glucides: this.glucides,
            lipides: this.lipides,
            fibres: this.fibres,
            sodium: this.sodium,
            sucre: this.sucre,
            hydratationMl: this.hydratationMl,
            indexGlycemique: this.indexGlycemique,
            imageUrl: this.imageUrl,
            typeRepas: this.typeRepas,
            dateRepas: this.dateRepas,
            heureFormatee: this.obtenirHeureFormatee(),
            typeRepasFormate: this.obtenirTypeRepasFormate()
        };
    }

    obtenirHeureFormatee() {
        if (!this.dateRepas) return '';
        const date = new Date(this.dateRepas);
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    obtenirTypeRepasFormate() {
        const types = {
            'petit_dejeuner': 'Petit-déjeuner',
            'dejeuner': 'Déjeuner',
            'collation': 'Collation',
            'diner': 'Dîner',
        };
        return types[this.typeRepas] || this.typeRepas;
    }
}

module.exports = Repas;
