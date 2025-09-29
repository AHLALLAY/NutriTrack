const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration des sessions avec stockage en base de données
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-par-defaut',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        table: 'sessions_express',
        createDatabaseTable: true,
        schema: {
            tableName: 'sessions_express',
            columnNames: {
                session_id: 'session_id',
                expires: 'expires',
                data: 'data'
            }
        },
        clearExpired: true,
        checkExpirationInterval: 900000, // 15 minutes
        endConnectionOnClose: true
    }),
    cookie: { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        httpOnly: true
    }
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

// Middleware pour les sessions
const { gererSession } = require('./middleware/session');
const { gererSessionsExpirees, marquerSessionActive } = require('./middleware/sessionManager');

app.use(gererSession);
app.use(gererSessionsExpirees);
app.use(marquerSessionActive);

// Routes
const authentificationRoutes = require('./routes/authentification');
const profilRoutes = require('./routes/profil');
const sessionsRoutes = require('./routes/sessions');

app.use('/', authentificationRoutes);
app.use('/', profilRoutes);
app.use('/', sessionsRoutes);

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
    console.log(`🚀 NutriTrack démarré sur le port ${PORT}`);
    console.log(`📱 Accédez à l'application : http://localhost:${PORT}`);
    console.log(`🔐 Page de connexion : http://localhost:${PORT}/connexion`);
    console.log(`📝 Page d'inscription : http://localhost:${PORT}/inscription`);
    console.log(`💡 Assurez-vous que la base de données est configurée avec le schéma dans base-de-donnees/schema.sql`);
});

module.exports = app;