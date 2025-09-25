const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration des sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-par-defaut',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 heures
}));

// Middleware pour parser les données
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'vues'));

// Assets statiques
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour gérer les sessions
const { gererSession } = require('./middleware/session');
app.use(gererSession);

// Import des routes
const authentificationRoutes = require('./routes/authentification');

// Utilisation des routes
app.use('/', authentificationRoutes);

// Route par défaut
app.get('/', (req, res) => {
    res.redirect('/connexion');
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).render('erreur', { 
        titre: 'Page non trouvée',
        message: 'La page que vous recherchez n\'existe pas.' 
    });
});

// Gestion des erreurs serveur
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('erreur', { 
        titre: 'Erreur serveur',
        message: 'Une erreur interne s\'est produite.' 
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 NutriTrack démarré sur le port ${PORT}`);
    console.log(`📱 Accédez à l'application : http://localhost:${PORT}`);
    console.log(`🔐 Page de connexion : http://localhost:${PORT}/connexion`);
    console.log(`📝 Page d'inscription : http://localhost:${PORT}/inscription`);
});

module.exports = app;
