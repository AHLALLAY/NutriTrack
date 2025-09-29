const { executerRequete } = require('../base-de-donnees/connexion');

class Profil {
    constructor(donnees) {
        this.id = donnees.id;
        this.utilisateurId = donnees.utilisateur_id;
        this.typeProfil = donnees.type_profil;
        this.objectif = donnees.objectif;
        this.objectifPoids = donnees.objectif_poids;
        this.poids = donnees.poids;
        this.taille = donnees.taille;
        this.age = donnees.age;
        this.activitePhysique = donnees.activite_physique;
        this.besoinsCaloriques = donnees.besoins_caloriques;
        this.besoinsProteines = donnees.besoins_proteines;
        this.besoinsGlucides = donnees.besoins_glucides;
        this.besoinsLipides = donnees.besoins_lipides;
    }

    static async creerOuMettreAJour(utilisateurId, donneesProfil) {
        const profilExistant = await this.trouverParUtilisateur(utilisateurId);
        
        if (profilExistant) {
            return await this.mettreAJour(profilExistant.id, donneesProfil);
        } else {
            return await this.creer(utilisateurId, donneesProfil);
        }
    }
    static async creer(utilisateurId, donneesProfil) {
        const requete = `
            INSERT INTO profils_nutritionnels (
                utilisateur_id, type_profil, objectif, objectif_poids, poids, taille, age, 
                activite_physique, besoins_caloriques, besoins_proteines, 
                besoins_glucides, besoins_lipides, date_creation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        const resultat = await executerRequete(requete, [
            utilisateurId,
            donneesProfil.typeProfil,
            donneesProfil.objectif,
            donneesProfil.objectifPoids,
            donneesProfil.poids,
            donneesProfil.taille,
            donneesProfil.age,
            donneesProfil.activitePhysique,
            donneesProfil.besoinsCaloriques,
            donneesProfil.besoinsProteines,
            donneesProfil.besoinsGlucides,
            donneesProfil.besoinsLipides
        ]);

        return { id: resultat.insertId, ...donneesProfil };
    }

    static async mettreAJour(profilId, donneesProfil) {
        const requete = `
            UPDATE profils_nutritionnels 
            SET type_profil = ?, objectif = ?, objectif_poids = ?, poids = ?, taille = ?, age = ?, 
                activite_physique = ?, besoins_caloriques = ?, besoins_proteines = ?, 
                besoins_glucides = ?, besoins_lipides = ?, date_modification = NOW()
            WHERE id = ?
        `;
        
        await executerRequete(requete, [
            donneesProfil.typeProfil,
            donneesProfil.objectif,
            donneesProfil.objectifPoids,
            donneesProfil.poids,
            donneesProfil.taille,
            donneesProfil.age,
            donneesProfil.activitePhysique,
            donneesProfil.besoinsCaloriques,
            donneesProfil.besoinsProteines,
            donneesProfil.besoinsGlucides,
            donneesProfil.besoinsLipides,
            profilId
        ]);

        return await this.trouverParId(profilId);
    }

    // Trouver un profil par utilisateur
    static async trouverParUtilisateur(utilisateurId) {
        const requete = `SELECT * FROM profils_nutritionnels WHERE utilisateur_id = ? ORDER BY date_modification DESC LIMIT 1`;
        const resultats = await executerRequete(requete, [utilisateurId]);
        return resultats[0] ? new Profil(resultats[0]) : null;
    }

    static async trouverParId(profilId) {
        const requete = `SELECT * FROM profils_nutritionnels WHERE id = ?`;
        const resultats = await executerRequete(requete, [profilId]);
        return resultats[0] ? new Profil(resultats[0]) : null;
    }

    calculerBMI() {
        if (!this.poids || !this.taille) return null;
        const tailleEnMetres = this.taille / 100;
        const bmi = this.poids / (tailleEnMetres * tailleEnMetres);
        return bmi.toFixed(1);
    }

    calculerProgression() {
        if (!this.poids || !this.objectifPoids) return null;
        
        const poidsActuel = this.poids;
        const poidsObjectif = this.objectifPoids;
        const difference = poidsActuel - poidsObjectif;
        
        let progression = 0;
        if (difference > 0) {
            progression = ((poidsActuel - difference) / poidsActuel) * 100;
        } else if (difference < 0) {
            progression = (Math.abs(difference) / poidsObjectif) * 100;
        } else {
            progression = 100;
        }
        
        return {
            poidsObjectif: poidsObjectif,
            poidsActuel: poidsActuel,
            difference: Math.abs(difference),
            progression: Math.round(progression)
        };
    }

    static async obtenirStatistiques(utilisateurId) {
        const requeteRepas = `SELECT COUNT(*) as total_repas FROM repas WHERE utilisateur_id = ?`;
        const resultatsRepas = await executerRequete(requeteRepas, [utilisateurId]);
        const totalRepas = resultatsRepas[0].total_repas;
        
        return {
            joursConsecutifs: Math.min(totalRepas, 30),
            repasAnalyses: totalRepas
        };
    }

    obtenirDonneesPubliques() {
        return {
            id: this.id,
            utilisateurId: this.utilisateurId,
            typeProfil: this.typeProfil,
            objectif: this.objectif,
            objectifPoids: this.objectifPoids,
            poids: this.poids,
            taille: this.taille,
            age: this.age,
            activitePhysique: this.activitePhysique,
            besoinsCaloriques: this.besoinsCaloriques,
            besoinsProteines: this.besoinsProteines,
            besoinsGlucides: this.besoinsGlucides,
            besoinsLipides: this.besoinsLipides,
            bmi: this.calculerBMI(),
            progression: this.calculerProgression()
        };
    }
}

module.exports = Profil;