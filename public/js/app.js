// Fonction pour fermer les messages de notification
function fermerMessage(id) {
    const message = document.getElementById(id);
    if (message) {
        message.style.opacity = '0';
        message.style.transform = 'translateX(100%)';
        setTimeout(() => {
            message.remove();
        }, 300);
    }
}

// Fonction pour afficher/masquer le mot de passe
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Fonction pour valider un email
function validerEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Fonction pour valider un mot de passe
function validerMotDePasse(motDePasse) {
    return motDePasse.length >= 6;
}

// Fonction pour afficher une notification
function afficherNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 notification ${
        type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
        type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
        'bg-blue-100 border border-blue-400 text-blue-700'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle'
            } mr-2"></i>
            <span>${message}</span>
            <button onclick="fermerMessage('${notification.id}')" class="ml-4 text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    notification.id = 'notification-' + Date.now();
    document.body.appendChild(notification);
    
    // Fermer automatiquement après 5 secondes
    setTimeout(() => {
        fermerMessage(notification.id);
    }, 5000);
}

// Fonction pour formater une date
function formaterDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('fr-FR', options);
}

// Fonction pour formater un nombre
function formaterNombre(nombre, decimales = 0) {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales
    }).format(nombre);
}

// Fonction pour copier du texte dans le presse-papiers
async function copierTexte(texte) {
    try {
        await navigator.clipboard.writeText(texte);
        afficherNotification('Texte copié dans le presse-papiers', 'success');
    } catch (err) {
        console.error('Erreur lors de la copie:', err);
        afficherNotification('Erreur lors de la copie', 'error');
    }
}

// Fonction pour télécharger un fichier
function telechargerFichier(contenu, nomFichier, typeMime = 'text/plain') {
    const blob = new Blob([contenu], { type: typeMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Fonction pour faire défiler vers le haut
function defilerVersHaut() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Fonction pour détecter si l'utilisateur est en bas de page
function estEnBasDePage() {
    return (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
}

// Fonction pour ajouter un effet de chargement à un bouton
function ajouterChargement(bouton, texte = 'Chargement...') {
    const texteOriginal = bouton.innerHTML;
    bouton.innerHTML = `
        <div class="loading mr-2"></div>
        ${texte}
    `;
    bouton.disabled = true;
    
    return () => {
        bouton.innerHTML = texteOriginal;
        bouton.disabled = false;
    };
}

// Fonction pour valider un formulaire
function validerFormulaire(formulaire) {
    const champs = formulaire.querySelectorAll('[required]');
    let valide = true;
    
    champs.forEach(champ => {
        if (!champ.value.trim()) {
            champ.classList.add('border-red-500');
            valide = false;
        } else {
            champ.classList.remove('border-red-500');
        }
    });
    
    return valide;
}

// Fonction pour réinitialiser un formulaire
function reinitialiserFormulaire(formulaire) {
    formulaire.reset();
    const champs = formulaire.querySelectorAll('.border-red-500');
    champs.forEach(champ => {
        champ.classList.remove('border-red-500');
    });
}

// Fonction pour afficher/masquer un élément
function toggleElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.toggle('hidden');
    }
}

// Fonction pour ajouter une classe avec animation
function ajouterClasseAvecAnimation(element, classe, duree = 300) {
    element.classList.add(classe);
    setTimeout(() => {
        element.classList.remove(classe);
    }, duree);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter des animations aux éléments
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Gérer les formulaires
    const formulaires = document.querySelectorAll('form');
    formulaires.forEach(formulaire => {
        formulaire.addEventListener('submit', function(e) {
            if (!validerFormulaire(this)) {
                e.preventDefault();
                afficherNotification('Veuillez remplir tous les champs obligatoires', 'error');
            }
        });
    });
    
    // Gérer les inputs avec validation en temps réel
    const inputs = document.querySelectorAll('input[type="email"]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validerEmail(this.value)) {
                this.classList.add('border-red-500');
                afficherNotification('Veuillez saisir un email valide', 'error');
            } else {
                this.classList.remove('border-red-500');
            }
        });
    });
    
    // Gérer les inputs de mot de passe
    const inputsMotDePasse = document.querySelectorAll('input[type="password"]');
    inputsMotDePasse.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validerMotDePasse(this.value)) {
                this.classList.add('border-red-500');
                afficherNotification('Le mot de passe doit contenir au moins 6 caractères', 'error');
            } else {
                this.classList.remove('border-red-500');
            }
        });
    });
});

// Fonction pour gérer les erreurs AJAX
function gererErreurAjax(xhr, status, error) {
    console.error('Erreur AJAX:', error);
    afficherNotification('Une erreur s\'est produite. Veuillez réessayer.', 'error');
}

// Fonction pour faire une requête AJAX
async function requeteAjax(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        gererErreurAjax(null, 'error', error.message);
        throw error;
    }
}

// Export des fonctions pour utilisation globale
window.NutriTrack = {
    fermerMessage,
    togglePassword,
    validerEmail,
    validerMotDePasse,
    afficherNotification,
    formaterDate,
    formaterNombre,
    copierTexte,
    telechargerFichier,
    defilerVersHaut,
    estEnBasDePage,
    ajouterChargement,
    validerFormulaire,
    reinitialiserFormulaire,
    toggleElement,
    ajouterClasseAvecAnimation,
    requeteAjax
};
