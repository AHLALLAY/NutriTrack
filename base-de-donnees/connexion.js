const mysql = require('mysql2/promise');

// Configuration de la connexion à la base de données
const configDB = {
    host: process.env.DB_HOST || '',
    user: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Création du pool de connexions
const pool = mysql.createPool(configDB);

// Fonction pour tester la connexion
const testerConnexion = async () => {
    try {
        const connexion = await pool.getConnection();
        console.log('✅ Connexion à la base de données réussie');
        connexion.release();
        return true;
    } catch (erreur) {
        console.error('❌ Erreur de connexion à la base de données:', erreur.message);
        return false;
    }
};

// Fonction pour exécuter une requête
const executerRequete = async (requete, parametres = []) => {
    try {
        const [resultats] = await pool.execute(requete, parametres);
        return resultats;
    } catch (erreur) {
        console.error('❌ Erreur lors de l\'exécution de la requête:', erreur.message);
        throw erreur;
    }
};

// Fonction pour obtenir une connexion
const obtenirConnexion = async () => {
    try {
        return await pool.getConnection();
    } catch (erreur) {
        console.error('❌ Erreur lors de l\'obtention d\'une connexion:', erreur.message);
        throw erreur;
    }
};

module.exports = {
    pool,
    testerConnexion,
    executerRequete,
    obtenirConnexion
};
