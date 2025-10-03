document.addEventListener('DOMContentLoaded', function() {
    const uploadZone = document.getElementById('upload-zone');
    const photoInput = document.getElementById('photo-input');
    const browseBtn = document.getElementById('browse-btn');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const analyzeBtn = document.getElementById('analyze-btn');
    const removeBtn = document.getElementById('remove-btn');

    // Vérification de débogage
    console.log('Éléments trouvés:', {
        uploadZone: !!uploadZone,
        photoInput: !!photoInput,
        browseBtn: !!browseBtn,
        imagePreview: !!imagePreview,
        previewImg: !!previewImg,
        analyzeBtn: !!analyzeBtn,
        removeBtn: !!removeBtn
    });

    // Fonction pour ouvrir le sélecteur de fichiers
    function openFileSelector() {
        photoInput.click();
    }

    // Gestion du clic sur le bouton "Parcourir"
    browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openFileSelector();
    });

    // Gestion du drag & drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('border-green-400', 'bg-green-100');
    });

    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('border-green-400', 'bg-green-100');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('border-green-400', 'bg-green-100');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Gestion de la sélection de fichier
    photoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Fonction pour gérer le fichier sélectionné
    function handleFile(file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                uploadZone.classList.add('hidden');
                imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            alert('Veuillez sélectionner une image valide.');
        }
    }

    // Bouton analyser
    analyzeBtn.addEventListener('click', () => {
        if (photoInput.files.length > 0) {
            // Créer un formulaire et soumettre
            const formData = new FormData();
            formData.append('photo', photoInput.files[0]);
            
            // Afficher un indicateur de chargement
            analyzeBtn.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Analyse en cours...';
            analyzeBtn.disabled = true;
            
            // Soumettre le formulaire
            fetch('/analyser/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    window.location.reload();
                } else {
                    throw new Error('Erreur lors de l\'analyse');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                analyzeBtn.innerHTML = '<i class="ri-magic-line mr-2"></i>Analyser';
                analyzeBtn.disabled = false;
                alert('Erreur lors de l\'analyse de la photo');
            });
        }
    });

    // Bouton supprimer
    removeBtn.addEventListener('click', () => {
        photoInput.value = '';
        uploadZone.classList.remove('hidden');
        imagePreview.classList.add('hidden');
    });
});