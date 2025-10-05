const { GoogleGenerativeAI } = require("@google/generative-ai");
const { StructuredOutputParser } = require("langchain/output_parsers");
const { z } = require('zod');

const fs = require('fs');
const path = require('path');
const Profil = require('../models/profil');
const Repas = require('../models/repas');
const multer = require('multer');

// Configuration de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'repas-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Seules les images sont autorisées'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Initialisation du modèle Gemini via Langchain
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
    }
});

// Parser JSON structuré
const parser = StructuredOutputParser.fromZodSchema(z.object({
    description: z.string(),
    ingredients: z.array(z.string()),
    nutritional_values: z.object({
        calories: z.number(),
        proteins: z.number(),
        carbs: z.number(),
        fats: z.number(),
        fiber: z.number(),
        sodium: z.number(),
        sugar: z.number(),
        hydratationMl: z.number()
    }),
    health_score: z.number(),
    recommendations: z.array(z.string()),
    meal_type: z.string(),
    portion_size: z.string(),
    gap_detection: z.object({
        summary: z.string(),
        details: z.array(z.object({
            nutrient: z.string(),
            expected: z.string(),
            actual: z.union([z.string(), z.number()]),
            deviation: z.string(),
            comment: z.string()
        }))
    })
}));

// Afficher la page d'analyse
const afficherAnalyse = async (req, res) => {
    res.render('analyse', {
        titre: 'Analyser un repas',
        message: req.session.message,
        erreur: req.session.erreur
    });
    delete req.session.message;
    delete req.session.erreur;
};

// Fonction principale d'analyse
const analyserRepas = async (req, res) => {
    try {
        if (!req.file) throw new Error('Aucune image fournie');

        const userId = req.session.utilisateur.id;
        const profil = await Profil.trouverParUtilisateur(userId);

        const analysedRepas = await analyserRepasWithLangchain(req.file, profil);
        console.log('repas: ', analysedRepas);
        
        if (!analysedRepas) throw new Error('Erreur lors du parsing JSON du modèle');

        // Sauvegarder dans la session
        req.session.analysisResult = analysedRepas;
        req.session.imagePath = req.file.filename;
        req.session.message = 'Analyse terminée avec succès !';
        res.redirect('/analyser');

    } catch (error) {
        console.error('Erreur lors de l\'analyse:', error);
        req.session.erreur = 'Erreur lors de l\'analyse: ' + error.message;
        res.redirect('/analyser');
    }
};

// Fonction qui appelle le modèle Langchain
const analyserRepasWithLangchain = async (image, profil) => {
    const imageBuffer = fs.readFileSync(image.path);
    const mimeType = image.mimetype;
    const base64Image = imageBuffer.toString('base64');

    const prompt = `Analysez cette image de repas et fournissez un JSON structuré valide :
    {
        "description": "2 phrases maximum",
        "ingredients": ["ingrédient1", "ingrédient2"],
        "nutritional_values": {
            "calories": number,
            "proteins": number,
            "carbs": number,
            "fats": number,
            "fiber": number,
            "sodium": number,
            "sugar": number,
            "hydratationMl": number
        },
        "health_score": number, // nombre entre 0 et 10
        "recommendations": ["recommandation1", "recommandation2"],
        "meal_type": "choisir un type: Petit-déjeuner, Déjeuner, Collation, Dîner",
        "portion_size": "taille de portion",
        "gap_detection": {
            "summary": "Résumé des écarts nutritionnels par rapport au profil utilisateur: ${profil.typeProfil}",
            "details": [
                {
                    "nutrient": "proteins",
                    "expected": "quantité recommandée selon le profil",
                    "actual": "quantité réelle dans ce repas",
                    "deviation": "trop faible / trop élevé / correct",
                    "comment": "explication de l'écart"
                }
            ]
        }
    }

    Répondez uniquement en JSON complet et valide. Ne tronquez pas la réponse.`;

    // Appel du modèle
    const content = [
        {
            text: prompt
        },
        {
            inlineData: {
                mimeType,
                data: base64Image
            }
        }
    ];

    const result = await model.generateContent(content);
    const response = result.response;

    const responseText = response.text();
    console.log('Contenu de la réponse:', responseText);
    

    if(!responseText) {
        console.error("Le modèle n'a pas renvoyé de texte");
        return null;
    }
    const cleanedText = responseText.replace(/```(json)?\n?/g, '').replace(/```$/, '').trim();
    
    try {
        const structured = await parser.parse(cleanedText);
        return structured;
    } catch (error) {
        console.error('Erreur parsing JSON:', error);
        return null;
    }
};

// Obtenir les résultats
const obtenirResultats = (req, res) => {
    if (req.session.analysisResult) {
        res.json({
            success: true,
            data: req.session.analysisResult,
            imagePath: req.session.imagePath
        });
    } else {
        res.json({ success: false, message: 'Aucun résultat d\'analyse disponible' });
    }
};

// Sauvegarder le repas analysé
const sauvegarderRepas = async (req, res) => {
    try {
        const userId = req.session.utilisateur.id;
        const data = req.body;
        const nutrition = data.nutritional_values || {};

        const repasData = {
            utilisateurId: userId,
            nom: data.meal_type,
            description: data.description,
            calories: Number(nutrition.calories) || 0,
            proteines: Number(nutrition.proteins) || 0,
            glucides: Number(nutrition.carbs) || 0,
            lipides: Number(nutrition.fats) || 0,
            fibres: Number(nutrition.fiber) || 0,
            sodium: Number(nutrition.sodium) || 0,
            sucre: Number(nutrition.sugar) || 0,
            hydratationMl: Number(nutrition.hydratationMl) || 0,
            indexGlycemique: null,
            imageUrl: data.imagePath ? `/uploads/${data.imagePath}` : null,
            typeRepas: data.meal_type || null,
            dateRepas: new Date(),
        };

        await Repas.creer(repasData);
        delete req.session.analysisResult;
        delete req.session.imagePath;
        delete req.session.message;
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        res.json({ success: false, message: error.message });
    }
};

module.exports = {
    afficherAnalyse,
    analyserRepas,
    obtenirResultats,
    upload,
    sauvegarderRepas
};
