const { executerRequete } = require('../database/connexion');

class Recommandation {
    constructor(donnees) {
        this.id = donnees.id;
        this.utilisateurId = donnees.utilisateur_id;
        this.typeRecommandation = donnees.type_recommandation;
        this.titre = donnees.titre;
        this.contenu = donnees.contenu;
        this.priorite = donnees.priorite;
        this.lu = donnees.lu;
        this.dateCreation = donnees.date_creation;
        this.dateLecture = donnees.date_lecture;
    }

    static async creer(donneesRecommandation) {
        const requete = `
            INSERT INTO recommandations (
                utilisateur_id, type_recommandation, titre, contenu, priorite
            ) VALUES (?, ?, ?, ?, ?)
        `;
        
        const resultat = await executerRequete(requete, [
            donneesRecommandation.utilisateurId,
            donneesRecommandation.typeRecommandation,
            donneesRecommandation.titre,
            donneesRecommandation.contenu,
            donneesRecommandation.priorite || 'moyenne'
        ]);

        return { id: resultat.insertId, ...donneesRecommandation };
    }

    static async trouverParUtilisateur(utilisateurId, limite = 5) {
        const requete = `
            SELECT * FROM recommandations 
            WHERE utilisateur_id = ? 
            ORDER BY priorite DESC, date_creation DESC 
            LIMIT ?
        `;
        const resultats = await executerRequete(requete, [utilisateurId, limite]);
        return resultats.map(recommandation => new Recommandation(recommandation));
    }

    static async obtenirConseilDuJour(utilisateurId) {
        // Récupérer une recommandation non lue ou la plus récente
        const requete = `
            SELECT * FROM recommandations 
            WHERE utilisateur_id = ? 
            AND type_recommandation = 'general'
            ORDER BY lu ASC, date_creation DESC 
            LIMIT 1
        `;
        const resultats = await executerRequete(requete, [utilisateurId]);
        
        if (resultats.length > 0) {
            return new Recommandation(resultats[0]);
        }
        
        // Si aucune recommandation personnalisée, retourner un conseil par défaut
        return this.obtenirConseilParDefaut();
    }

    static obtenirConseilParDefaut() {
        const conseils = [
            {
                titre: "Hydratation",
                contenu: "Buvez 2 verres d'eau avant votre prochain repas pour améliorer la digestion.",
                typeRecommandation: "hydratation"
            },
            {
                titre: "Équilibre nutritionnel",
                contenu: "Incluez des légumes verts dans au moins 2 de vos repas aujourd'hui.",
                typeRecommandation: "alimentaire"
            },
            {
                titre: "Activité physique",
                contenu: "Prenez 5 minutes pour faire quelques étirements entre vos repas.",
                typeRecommandation: "exercice"
            },
            {
                titre: "Repas équilibré",
                contenu: "Assurez-vous d'inclure des protéines dans votre prochain repas.",
                typeRecommandation: "alimentaire"
            },
            {
                titre: "Sommeil",
                contenu: "Évitez les écrans 1 heure avant le coucher pour un meilleur sommeil.",
                typeRecommandation: "general"
            }
        ];
        
        const conseilAleatoire = conseils[Math.floor(Math.random() * conseils.length)];
        return {
            id: 'default',
            titre: conseilAleatoire.titre,
            contenu: conseilAleatoire.contenu,
            typeRecommandation: conseilAleatoire.typeRecommandation,
            priorite: 'moyenne',
            lu: false
        };
    }

    static async marquerCommeLu(recommandationId, utilisateurId) {
        if (recommandationId === 'default') return;
        
        const requete = `
            UPDATE recommandations 
            SET lu = TRUE, date_lecture = NOW() 
            WHERE id = ? AND utilisateur_id = ?
        `;
        await executerRequete(requete, [recommandationId, utilisateurId]);
    }

    static async genererRecommandationsPersonnalisees(utilisateurId, profil, statistiques) {
        const recommandations = [];

        // Recommandation basée sur les calories
        if (statistiques.total_calories < profil.besoinsCaloriques * 0.7) {
            recommandations.push({
                utilisateurId,
                typeRecommandation: 'alimentaire',
                titre: 'Apport calorique insuffisant',
                contenu: `Vous n'avez consommé que ${statistiques.total_calories} calories aujourd'hui. Votre objectif est de ${profil.besoinsCaloriques} calories.`,
                priorite: 'elevee'
            });
        }

        // Recommandation basée sur les protéines
        if (statistiques.total_proteines < profil.besoinsProteines * 0.6) {
            recommandations.push({
                utilisateurId,
                typeRecommandation: 'alimentaire',
                titre: 'Protéines insuffisantes',
                contenu: `Vous avez consommé ${statistiques.total_proteines}g de protéines. Votre objectif est de ${profil.besoinsProteines}g.`,
                priorite: 'moyenne'
            });
        }

        // Recommandation basée sur l'hydratation (simulée)
        recommandations.push({
            utilisateurId,
            typeRecommandation: 'hydratation',
            titre: 'Hydratation',
            contenu: 'N\'oubliez pas de boire régulièrement de l\'eau tout au long de la journée.',
            priorite: 'moyenne'
        });

        // Créer les recommandations en base
        for (const recommandation of recommandations) {
            await this.creer(recommandation);
        }

        return recommandations;
    }

    obtenirDonneesPubliques() {
        return {
            id: this.id,
            titre: this.titre,
            contenu: this.contenu,
            typeRecommandation: this.typeRecommandation,
            priorite: this.priorite,
            lu: this.lu,
            dateCreation: this.dateCreation,
            icone: this.obtenirIcone()
        };
    }

    obtenirIcone() {
        const icones = {
            'alimentaire': 'fas fa-utensils',
            'hydratation': 'fas fa-tint',
            'exercice': 'fas fa-dumbbell',
            'medical': 'fas fa-heartbeat',
            'general': 'fas fa-lightbulb'
        };
        return icones[this.typeRecommandation] || 'fas fa-info-circle';
    }
}

module.exports = Recommandation;
