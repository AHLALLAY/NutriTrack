const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Configuration des sessions (mémoire avec améliorations)
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-par-defaut-nutritrack',
    resave: true, // Force la sauvegarde même si non modifiée
    saveUninitialized: true, // Sauvegarde les sessions non initialisées
    cookie: { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        httpOnly: true,
        sameSite: 'lax' // Améliore la compatibilité
    },
    name: 'nutritrack.sid' // Nom personnalisé pour le cookie
}));

// Parser les données
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration EJS
app.use(expressLayouts);
app.set('layout', './layouts/layout.ejs')
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Middleware simple pour les variables de session
app.use((req, res, next) => {
    res.locals.utilisateur = req.session?.utilisateur || null;
    res.locals.erreur = req.session?.erreur || null;
    res.locals.succes = req.session?.succes || null;
    
    // Nettoyer les messages après utilisation
    if (req.session) {
        delete req.session.erreur;
        delete req.session.succes;
    }
    
    next();
});


// Routes
const authentificationRoutes = require('./routes/authentification');
const profilRoutes = require('./routes/profil');
const objectifRoutes = require('./routes/objectif');
const dashboardRoutes = require('./routes/dashboard');
const rapportRoutes = require('./routes/rapports');
const repasRoutes = require('./routes/repas')

app.use('/', authentificationRoutes);
app.use('/', profilRoutes);
app.use('/', objectifRoutes);
app.use('/', dashboardRoutes);
app.use('/', rapportRoutes);
app.use('/', repasRoutes);

// Page d'accueil
app.get('/', (req, res) => {
    res.redirect('/connexion');
});


// Page 404
app.use((req, res) => {
    res.status(404).render('erreur', { 
        titre: 'Page non trouvée',
        message: 'La page que vous recherchez n\'existe pas.' 
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('erreur', { 
        titre: 'Erreur serveur',
        message: 'Une erreur interne s\'est produite.' 
    });
});

// Démarrer l'application
app.listen(PORT, () => {
    console.log(`NutriTrack démarré sur le port ${PORT}`);
    console.log(`Accédez à l'application : http://localhost:${PORT}`);
    console.log(`Page de connexion : http://localhost:${PORT}/connexion`);
    console.log(`Page d'inscription : http://localhost:${PORT}/inscription`);
    console.log(`Assurez-vous que la base de données est configurée avec le schéma dans database/schema.sql`);
});

module.exports = app;