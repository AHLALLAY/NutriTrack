-- =====================================================
-- SCRIPT COMPLET D'INITIALISATION NUTRITRACK
-- =====================================================
-- Ce script crée la base de données, toutes les tables,
-- et insère les données de test nécessaires
-- =====================================================

-- Création de la base de données (si elle n'existe pas)
CREATE DATABASE IF NOT EXISTS nutritrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utilisation de la base de données
USE nutritrack;

-- =====================================================
-- CRÉATION DES TABLES
-- =====================================================

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_complet VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des profils nutritionnels
CREATE TABLE IF NOT EXISTS profils_nutritionnels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    type_profil ENUM('diabete', 'hypertension', 'obesite', 'athlete', 'perte_poids', 'prise_masse') NOT NULL,
    objectif TEXT,
    objectif_poids DECIMAL(5,2),
    poids DECIMAL(5,2),
    taille DECIMAL(5,2),
    age INT,
    activite_physique ENUM('sedentaire', 'leger', 'modere', 'intense', 'tres_intense') DEFAULT 'modere',
    besoins_caloriques DECIMAL(8,2),
    besoins_proteines DECIMAL(8,2),
    besoins_glucides DECIMAL(8,2),
    besoins_lipides DECIMAL(8,2),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_utilisateur_profil (utilisateur_id),
    INDEX idx_type_profil (type_profil)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des repas (incluant l'hydratation)
CREATE TABLE IF NOT EXISTS repas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    calories DECIMAL(8,2) NOT NULL,
    proteines DECIMAL(8,2) DEFAULT 0,
    glucides DECIMAL(8,2) DEFAULT 0,
    lipides DECIMAL(8,2) DEFAULT 0,
    fibres DECIMAL(8,2) DEFAULT 0,
    sodium DECIMAL(8,2) DEFAULT 0,
    sucre DECIMAL(8,2) DEFAULT 0,
    hydratation_ml INT DEFAULT 0, -- Quantité d'eau en millilitres
    index_glycemique INT,
    image_url VARCHAR(500),
    type_repas ENUM('petit_dejeuner', 'collation_matin', 'dejeuner', 'collation_apres_midi', 'diner', 'collation_soir') NOT NULL,
    date_repas TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_utilisateur_repas (utilisateur_id),
    INDEX idx_date_repas (date_repas),
    INDEX idx_type_repas (type_repas)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des aliments
CREATE TABLE IF NOT EXISTS aliments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    calories_par_100g DECIMAL(8,2) NOT NULL,
    proteines_par_100g DECIMAL(8,2) DEFAULT 0,
    glucides_par_100g DECIMAL(8,2) DEFAULT 0,
    lipides_par_100g DECIMAL(8,2) DEFAULT 0,
    fibres_par_100g DECIMAL(8,2) DEFAULT 0,
    sodium_par_100g DECIMAL(8,2) DEFAULT 0,
    sucre_par_100g DECIMAL(8,2) DEFAULT 0,
    index_glycemique INT,
    categorie ENUM('legumes', 'fruits', 'cereales', 'proteines', 'produits_laitiers', 'graisses', 'boissons', 'autres') NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nom_aliment (nom),
    INDEX idx_categorie (categorie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des recommandations
CREATE TABLE IF NOT EXISTS recommandations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    type_recommandation ENUM('alimentaire', 'hydratation', 'exercice', 'medical', 'general') NOT NULL,
    titre VARCHAR(255) NOT NULL,
    contenu TEXT NOT NULL,
    priorite ENUM('faible', 'moyenne', 'elevee', 'critique') DEFAULT 'moyenne',
    lu BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_lecture TIMESTAMP NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_utilisateur_recommandation (utilisateur_id),
    INDEX idx_type_recommandation (type_recommandation),
    INDEX idx_priorite (priorite),
    INDEX idx_lu (lu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des rapports hebdomadaires
CREATE TABLE IF NOT EXISTS rapports_hebdomadaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    semaine_debut DATE NOT NULL,
    semaine_fin DATE NOT NULL,
    total_calories DECIMAL(10,2),
    total_proteines DECIMAL(10,2),
    total_glucides DECIMAL(10,2),
    total_lipides DECIMAL(10,2),
    total_fibres DECIMAL(10,2),
    total_sodium DECIMAL(10,2),
    nombre_repas INT DEFAULT 0,
    objectifs_atteints JSON,
    recommandations JSON,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_utilisateur_rapport (utilisateur_id),
    INDEX idx_semaine (semaine_debut, semaine_fin),
    UNIQUE KEY unique_rapport_semaine (utilisateur_id, semaine_debut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des sessions utilisateur (pour le suivi des connexions)
CREATE TABLE IF NOT EXISTS sessions_utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    date_connexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_deconnexion TIMESTAMP NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_utilisateur_session (utilisateur_id),
    INDEX idx_session_id (session_id),
    INDEX idx_date_connexion (date_connexion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des objectifs nutritionnels
CREATE TABLE IF NOT EXISTS objectifs_nutritionnels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    calories DECIMAL(8,2) NOT NULL DEFAULT 1800,
    proteines DECIMAL(8,2) NOT NULL DEFAULT 80,
    glucides DECIMAL(8,2) NOT NULL DEFAULT 200,
    lipides DECIMAL(8,2) NOT NULL DEFAULT 65,
    hydratation_litres DECIMAL(4,2) NOT NULL DEFAULT 2.0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_utilisateur_objectif (utilisateur_id),
    UNIQUE KEY unique_objectif_utilisateur (utilisateur_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table pour gérer toutes les sessions
CREATE TABLE IF NOT EXISTS sessions_express (
    session_id VARCHAR(128) NOT NULL PRIMARY KEY,
    expires BIGINT UNSIGNED NOT NULL,
    data TEXT,
    user_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    reason VARCHAR(100) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expired_at TIMESTAMP NULL,
    INDEX idx_expires (expires),
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active),
    INDEX idx_expired_at (expired_at),
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- =====================================================
-- INSERTION DES DONNÉES DE BASE
-- =====================================================

-- Insertion de quelques aliments de base
INSERT INTO aliments (nom, description, calories_par_100g, proteines_par_100g, glucides_par_100g, lipides_par_100g, fibres_par_100g, sodium_par_100g, sucre_par_100g, index_glycemique, categorie) VALUES
('Pomme', 'Fruit frais', 52, 0.3, 14, 0.2, 2.4, 1, 10.4, 35, 'fruits'),
('Banane', 'Fruit frais', 89, 1.1, 23, 0.3, 2.6, 1, 12.2, 51, 'fruits'),
('Poulet (poitrine)', 'Viande blanche', 165, 31, 0, 3.6, 0, 74, 0, 0, 'proteines'),
('Riz blanc', 'Céréale cuite', 130, 2.7, 28, 0.3, 0.4, 1, 0.1, 73, 'cereales'),
('Brocoli', 'Légume vert', 34, 2.8, 7, 0.4, 2.6, 33, 1.5, 15, 'legumes'),
('Saumon', 'Poisson gras', 208, 25, 0, 12, 0, 44, 0, 0, 'proteines'),
('Avocat', 'Fruit gras', 160, 2, 9, 15, 7, 7, 0.7, 10, 'fruits'),
('Œuf', 'Protéine complète', 155, 13, 1.1, 11, 0, 124, 1.1, 0, 'proteines'),
('Pain complet', 'Céréale', 247, 13, 41, 4.2, 7, 681, 5.7, 71, 'cereales'),
('Lait écrémé', 'Produit laitier', 34, 3.4, 5, 0.2, 0, 42, 5, 32, 'produits_laitiers');

-- =====================================================
-- DONNÉES DE TEST POUR LE DASHBOARD
-- =====================================================

-- Création d'un utilisateur de test (mot de passe: test123)
INSERT INTO utilisateurs (nom_complet, email, mot_de_passe) VALUES
('Utilisateur Test', 'test_nutritrack@gmail.com', '$2a$12$NcLEpF9caACNTN4RK6.XvO/M3cVrp2lFe8U.V/rI1pq5B9XGVZCRy');

-- Création d'un profil de test avec des objectifs réalistes
INSERT INTO profils_nutritionnels (utilisateur_id, type_profil, objectif, poids, taille, age, activite_physique, besoins_caloriques, besoins_proteines, besoins_glucides, besoins_lipides) VALUES
(1, 'perte_poids', 'Perdre 5 kg en 3 mois', 70, 170, 30, 'modere', 2000, 150, 250, 67);

-- Création d'un objectif de test
INSERT INTO objectifs_nutritionnels (utilisateur_id, calories, proteines, glucides, lipides, hydratation_litres) VALUES
(1, 2000, 120, 250, 67, 2.5);

-- Ajout de repas de test pour démontrer le dashboard (incluant l'hydratation)
INSERT INTO repas (utilisateur_id, nom, description, calories, proteines, glucides, lipides, fibres, sodium, sucre, hydratation_ml, type_repas, date_repas) VALUES
(1, 'Salade de quinoa aux légumes', 'Quinoa, tomates, concombres, avocat, vinaigrette légère', 450, 15, 45, 18, 8, 320, 12, 300, 'dejeuner', '2025-09-30 13:00:00'),
(1, 'Smoothie protéiné banane', 'Banane, protéine en poudre, lait d\'amande, épinards', 320, 25, 35, 8, 6, 180, 28, 250, 'petit_dejeuner', '2025-09-30 08:30:00'),
(1, 'Yaourt grec aux fruits', 'Yaourt grec nature, myrtilles, miel, noix', 180, 12, 22, 6, 3, 85, 18, 200, 'collation_apres_midi', '2025-09-30 16:00:00'),
(1, 'Saumon grillé avec légumes', 'Saumon, brocolis, carottes, riz complet', 520, 35, 45, 18, 7, 450, 8, 400, 'diner', '2025-09-30 19:30:00'),
(1, 'Omelette aux épinards', 'Œufs, épinards, fromage de chèvre, pain complet', 280, 18, 15, 16, 4, 380, 3, 250, 'petit_dejeuner', '2025-09-29 09:00:00'),
(1, 'Salade de poulet', 'Poulet grillé, laitue, tomates, avocat, vinaigrette', 380, 28, 12, 22, 6, 420, 8, 300, 'dejeuner', '2025-09-29 12:30:00');


-- Ajout de recommandations personnalisées
INSERT INTO recommandations (utilisateur_id, type_recommandation, titre, contenu, priorite) VALUES
(1, 'alimentaire', 'Augmentez votre apport en protéines', 'Vous êtes en dessous de votre objectif protéique. Ajoutez des sources de protéines à vos repas.', 'moyenne'),
(1, 'hydratation', 'Hydratation optimale', 'Buvez au moins 2.5L d\'eau par jour pour maintenir une bonne hydratation.', 'moyenne'),
(1, 'exercice', 'Activité physique recommandée', '30 minutes d\'exercice modéré par jour vous aideront à atteindre vos objectifs.', 'faible');

-- =====================================================
-- VÉRIFICATION DES DONNÉES
-- =====================================================

-- Affichage des tables créées
SHOW TABLES;

-- Affichage des données de test
SELECT id, nom_complet, email FROM utilisateurs WHERE id = 1;
SELECT besoins_caloriques, besoins_proteines, besoins_glucides, besoins_lipides FROM profils_nutritionnels WHERE utilisateur_id = 1;
SELECT nom, calories, type_repas, date_repas FROM repas WHERE utilisateur_id = 1 ORDER BY date_repas DESC;
SELECT titre, contenu, priorite FROM recommandations WHERE utilisateur_id = 1;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- Le dashboard est maintenant prêt avec des données de test !
-- Connectez-vous avec: test_nutritrack@gmail.com / test123
-- =====================================================
