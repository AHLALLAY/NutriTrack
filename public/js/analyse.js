document.addEventListener('DOMContentLoaded', function() {
    const uploadZone = document.getElementById('upload-zone');
    const photoInput = document.getElementById('photo-input');
    const browseBtn = document.getElementById('browse-btn');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const analyzeBtn = document.getElementById('analyze-btn');
    const removeBtn = document.getElementById('remove-btn');
    const saveBtn = document.getElementById('save-btn');
    saveBtn.classList.add('hidden');

    // Vérifier s'il y a des résultats d'analyse à afficher
    checkForAnalysisResults();

    // Gestion du clic sur le bouton "Parcourir"
    browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        photoInput.click();
        console.log('clicked');
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
                    // Reload to show results
                    clearInput();
                    console.log('yes');
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
        clearInput();
    });

    // Fonction pour effacer l'input et réinitialiser l'interface
    function clearInput() {
        photoInput.value = '';
        uploadZone.classList.remove('hidden');
        imagePreview.classList.add('hidden');
        analyzeBtn.innerHTML = '<i class="ri-magic-line mr-2"></i>Analyser';
        analyzeBtn.disabled = false;
        analyzeBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
        
        // Masquer la section d'analyse détaillée
        const detailedAnalysis = document.getElementById('detailed-analysis');
        if (detailedAnalysis) {
            detailedAnalysis.style.display = 'none';
        }
        
        // Réinitialiser les champs d'analyse
        resetAnalysisFields();
    }

    // Fonction pour réinitialiser les champs d'analyse
    function resetAnalysisFields() {
        const descriptionElement = document.getElementById('meal-description');
        if (descriptionElement) {
            descriptionElement.textContent = 'Prenez une photo pour analyser votre repas';
        }

        const ingredientsElement = document.getElementById('meal-ingredients');
        if (ingredientsElement) {
            ingredientsElement.textContent = 'Les ingrédients seront identifiés automatiquement';
        }

        const nutritionElement = document.getElementById('meal-nutrition');
        if (nutritionElement) {
            nutritionElement.textContent = 'Les valeurs nutritionnelles seront calculées';
        }
    }

    // Fonction pour vérifier et afficher les résultats d'analyse
    function checkForAnalysisResults() {
        fetch('/analyser/resultats')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data) {
                    displayAnalysisResults(data.data, data.imagePath);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des résultats:', error);
            });
    }

    // Fonction pour afficher les résultats d'analyse
    function displayAnalysisResults(results, imagePath) {
        // Afficher l'image analysée
        if (imagePath) {
            previewImg.src = `/uploads/${imagePath}`;
            uploadZone.classList.add('hidden');
            imagePreview.classList.remove('hidden');
        }

        // Mettre à jour les détails du repas
        updateMealDetails(results);
        // Hide analyze, show save
        analyzeBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        // Store analysis data for saving
        saveBtn.dataset.analysis = JSON.stringify({ ...results, imagePath });
    }

    // Fonction pour mettre à jour les détails du repas
    function updateMealDetails(results) {
        // Mettre à jour la description
        const descriptionElement = document.getElementById('meal-description');
        if (descriptionElement) {
            descriptionElement.textContent = results.description || 'Description non disponible';
        }

        // Mettre à jour les ingrédients
        const ingredientsElement = document.getElementById('meal-ingredients');
        if (ingredientsElement) {
            const ingredientsList = Array.isArray(results.ingredients) 
                ? results.ingredients.join(', ') 
                : results.ingredients || 'Ingrédients non identifiés';
            ingredientsElement.textContent = ingredientsList;
        }

        // Mettre à jour les valeurs nutritionnelles
        const nutritionElement = document.getElementById('meal-nutrition');
        if (nutritionElement) {
            const nutrition = results.nutritional_values;
            if (nutrition) {
                const nutritionText = `
                    Calories: ${nutrition.calories || 'N/A'} |
                    Protéines: ${nutrition.proteins || 'N/A'}g |
                    Glucides: ${nutrition.carbs || 'N/A'}g |
                    Lipides: ${nutrition.fats || 'N/A'}g |
                    Fibres: ${nutrition.fiber || 'N/A'}g |
                    Sucre: ${nutrition.sugar || 'N/A'}g
                `;
                nutritionElement.textContent = nutritionText;
            } else {
                nutritionElement.textContent = 'Valeurs nutritionnelles non calculées';
            }
        }

        // Mettre à jour les informations supplémentaires
        updateAdditionalInfo(results);
    }

    // Fonction pour mettre à jour les informations supplémentaires
    function updateAdditionalInfo(results) {
        // Afficher la section d'analyse détaillée
        const detailedAnalysis = document.getElementById('detailed-analysis');
        if (detailedAnalysis) {
            detailedAnalysis.style.display = 'block';
        }

        // Mettre à jour le type de repas
        const mealTypeElement = document.getElementById('meal-type');
        if (mealTypeElement) {
            mealTypeElement.textContent = results.meal_type || 'Non déterminé';
        }

        // Mettre à jour la taille de portion
        const portionSizeElement = document.getElementById('portion-size');
        if (portionSizeElement) {
            portionSizeElement.textContent = results.portion_size || 'Non déterminée';
        }

        // Mettre à jour le score de santé
        const healthScoreBar = document.getElementById('health-score-bar');
        const healthScoreText = document.getElementById('health-score-text');
        if (healthScoreBar && healthScoreText) {
            const score = parseInt(results.health_score);
            healthScoreBar.style.width = `${score * 10}%`;
            healthScoreText.textContent = `${score}/10`;
        }

        // Mettre à jour les recommandations
        const recommendationsList = document.getElementById('recommendations-list');
        if (recommendationsList) {
            if (Array.isArray(results.recommendations) && results.recommendations.length > 0) {
                recommendationsList.innerHTML = results.recommendations
                    .map(rec => `<li class="mb-1">• ${rec}</li>`)
                    .join('');
            } else {
                recommendationsList.innerHTML = '<li>• Aucune recommandation disponible</li>';
            }
        }

        // Mettre à jour la section gap_detection
        const gapSection = document.getElementById('gap-detection-section');
        const gapSummary = document.getElementById('gap-detection-summary');
        const gapDetails = document.getElementById('gap-detection-details');
        if (results.gap_detection && (results.gap_detection.summary || (Array.isArray(results.gap_detection.details) && results.gap_detection.details.length > 0))) {
            if (gapSection) gapSection.classList.remove('hidden');
            if (gapSummary) gapSummary.textContent = results.gap_detection.summary || '';
            if (gapDetails) {
                gapDetails.innerHTML = '';
                if (Array.isArray(results.gap_detection.details)) {
                    results.gap_detection.details.forEach(detail => {
                        gapDetails.innerHTML += `<tr>
                            <td class='px-2 py-1'>${detail.nutrient || ''}</td>
                            <td class='px-2 py-1'>${detail.expected || ''}</td>
                            <td class='px-2 py-1'>${detail.actual || ''}</td>
                            <td class='px-2 py-1'>${detail.deviation || ''}</td>
                            <td class='px-2 py-1'>${detail.comment || ''}</td>
                        </tr>`;
                    });
                }
            }
        } else {
            if (gapSection) gapSection.classList.add('hidden');
        }
    }

    // Save button logic
    saveBtn.addEventListener('click', function() {
        const analysis = saveBtn.dataset.analysis ? JSON.parse(saveBtn.dataset.analysis) : null;
        console.log(analysis);
        
        if (!analysis) return;
        fetch('/analyser/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analysis)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                    // clearInput();
                    window.location.reload();
            } else {
                alert('Erreur lors de l\'enregistrement du repas.');
            }
        })
        .catch(() => alert('Erreur lors de l\'enregistrement du repas.'));
    });

});