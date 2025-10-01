// Dashboard JavaScript pour les interactions dynamiques
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.startAutoRefresh();
        this.initialiserBarresProgression();
    }

    bindEvents() {
        // Bouton "Ajouter un repas"
        const btnAjouterRepas = document.querySelector('button[type="button"]');
        if (btnAjouterRepas && btnAjouterRepas.textContent.includes('Ajouter un repas')) {
            btnAjouterRepas.addEventListener('click', () => this.afficherModalAjoutRepas());
        }

        // Bouton "Analyser un repas"
        const btnAnalyserRepas = document.querySelector('button:has(.fa-camera)');
        if (btnAnalyserRepas) {
            btnAnalyserRepas.addEventListener('click', () => this.analyserRepas());
        }

        // Bouton "Modifier objectifs"
        const btnModifierObjectifs = document.querySelector('button:has(.fa-sliders)');
        if (btnModifierObjectifs) {
            btnModifierObjectifs.addEventListener('click', () => this.modifierObjectifs());
        }

        // Bouton "Voir rapports"
        const btnVoirRapports = document.querySelector('button:has(.fa-chart-line)');
        if (btnVoirRapports) {
            btnVoirRapports.addEventListener('click', () => this.voirRapports());
        }
    }

    startAutoRefresh() {
        // Actualiser les statistiques toutes les 5 minutes
        setInterval(() => {
            this.actualiserStatistiques();
        }, 5 * 60 * 1000);
    }

    initialiserBarresProgression() {
        // Appliquer les largeurs des barres de progression depuis les data-width
        const barres = document.querySelectorAll('[data-width]');
        barres.forEach(barre => {
            const largeur = barre.getAttribute('data-width');
            barre.style.width = largeur + '%';
        });
    }

    async actualiserStatistiques() {
        try {
            const response = await fetch('/dashboard/statistiques');
            const data = await response.json();

            if (data.succes) {
                this.mettreAJourKPIs(data.kpis);
            }
        } catch (error) {
            console.error('Erreur lors de l\'actualisation des statistiques:', error);
        }
    }

    mettreAJourKPIs(kpis) {
        // Mettre à jour les cartes KPIs
        this.mettreAJourCarteKPI('calories', kpis.calories);
        this.mettreAJourCarteKPI('hydratation', kpis.hydratation);
        this.mettreAJourCarteKPI('proteines', kpis.proteines);
        this.mettreAJourCarteKPI('glucides', kpis.glucides);
    }

    mettreAJourCarteKPI(type, donnees) {
        const cartes = document.querySelectorAll('.bg-white.rounded-\\[16px\\]');
        cartes.forEach(carte => {
            const span = carte.querySelector('span.text-sm.text-gray-600');
            if (span) {
                const typeCarte = this.determinerTypeCarte(span.textContent);
                if (typeCarte === type) {
                    this.actualiserContenuCarte(carte, type, donnees);
                }
            }
        });
    }

    determinerTypeCarte(texte) {
        if (texte.includes('Calories')) return 'calories';
        if (texte.includes('Hydratation')) return 'hydratation';
        if (texte.includes('Protéines')) return 'proteines';
        if (texte.includes('Glucides')) return 'glucides';
        return null;
    }

    actualiserContenuCarte(carte, type, donnees) {
        const valeurElement = carte.querySelector('.text-2xl.font-bold');
        const pourcentageElement = carte.querySelector('.text-xs.text-gray-500');
        const barreElement = carte.querySelector('.h-2.rounded');

        if (valeurElement) {
            if (type === 'calories') {
                valeurElement.textContent = `${donnees.valeur}/${donnees.objectif}`;
            } else if (type === 'hydratation') {
                valeurElement.textContent = `${donnees.valeurLitres}L / ${donnees.objectifLitres}L`;
            } else {
                valeurElement.textContent = `${donnees.valeurGrammes}g / ${donnees.objectifGrammes}g`;
            }
        }

        if (pourcentageElement) {
            pourcentageElement.textContent = `${donnees.pourcentage}% de l'objectif`;
        }

        if (barreElement) {
            barreElement.style.width = `${Math.min(donnees.pourcentage, 100)}%`;
        }
    }

    afficherModalAjoutRepas() {
        // Créer un modal simple pour ajouter un repas
        const modal = this.creerModalAjoutRepas();
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    creerModalAjoutRepas() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 class="text-lg font-semibold mb-4">Ajouter un repas</h3>
                <form id="form-ajout-repas">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nom du repas</label>
                        <input type="text" name="nom" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                        <input type="number" name="calories" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Type de repas</label>
                        <select name="typeRepas" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="petit_dejeuner">Petit-déjeuner</option>
                            <option value="collation_matin">Collation matin</option>
                            <option value="dejeuner">Déjeuner</option>
                            <option value="collation_apres_midi">Collation après-midi</option>
                            <option value="diner">Dîner</option>
                            <option value="collation_soir">Collation soir</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50" onclick="this.closest('.fixed').remove()">
                            Annuler
                        </button>
                        <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            Ajouter
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Gérer la soumission du formulaire
        const form = modal.querySelector('#form-ajout-repas');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.ajouterRepas(new FormData(form));
            modal.remove();
        });

        return modal;
    }

    async ajouterRepas(formData) {
        try {
            const repasData = {
                nom: formData.get('nom'),
                calories: parseFloat(formData.get('calories')),
                typeRepas: formData.get('typeRepas'),
                description: '',
                proteines: 0,
                glucides: 0,
                lipides: 0
            };

            const response = await fetch('/dashboard/repas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(repasData)
            });

            const data = await response.json();

            if (data.succes) {
                this.afficherNotification('Repas ajouté avec succès !', 'success');
                this.actualiserListeRepas();
                this.actualiserStatistiques();
            } else {
                this.afficherNotification('Erreur lors de l\'ajout du repas', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout du repas:', error);
            this.afficherNotification('Erreur lors de l\'ajout du repas', 'error');
        }
    }

    async actualiserListeRepas() {
        try {
            const response = await fetch('/dashboard/repas');
            const data = await response.json();

            if (data.succes) {
                this.mettreAJourListeRepas(data.repas);
            }
        } catch (error) {
            console.error('Erreur lors de l\'actualisation de la liste des repas:', error);
        }
    }

    mettreAJourListeRepas(repas) {
        const listeRepas = document.getElementById('liste-repas');
        if (!listeRepas) return;

        if (repas.length === 0) {
            listeRepas.innerHTML = `
                <li class="py-4 text-center text-gray-500">
                    <i class="fas fa-utensils text-2xl mb-2"></i>
                    <p class="text-sm">Aucun repas enregistré aujourd'hui</p>
                </li>
            `;
            return;
        }

        listeRepas.innerHTML = repas.map(repas => `
            <li class="py-3 flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-800">${repas.nom}</p>
                    <p class="text-xs text-gray-500">${repas.heureFormatee} • ${repas.typeRepasFormate}</p>
                </div>
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">${repas.calories} kcal</span>
            </li>
        `).join('');
    }

    analyserRepas() {
        this.afficherNotification('Fonctionnalité d\'analyse IA en cours de développement', 'info');
    }

    modifierObjectifs() {
        window.location.href = '/profil/objectifs';
    }

    voirRapports() {
        this.afficherNotification('Fonctionnalité de rapports en cours de développement', 'info');
    }

    afficherNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Supprimer la notification après 3 secondes
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialiser le dashboard quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
