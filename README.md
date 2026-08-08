# CFI-LINK — Plateforme Académique du CFI-CIRAS

> Plateforme de gestion académique complète pour le Centre de Formation et d'Insertion (CFI-CIRAS), Cameroun.
> Application web progressive (PWA) et mobile (iOS/Android via Capacitor).

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Fonctionnalités](#2-fonctionnalités)
3. [Architecture technique](#3-architecture-technique)
4. [Structure du projet](#4-structure-du-projet)
5. [Prérequis](#5-prérequis)
6. [Installation et démarrage](#6-installation-et-démarrage)
7. [Comptes de démonstration](#7-comptes-de-démonstration)
8. [Rôles et permissions](#8-rôles-et-permissions)
9. [Filières et niveaux](#9-filières-et-niveaux)
10. [État actuel du projet](#10-état-actuel-du-projet)
11. [Feuille de route](#11-feuille-de-route)

---

## 1. Présentation du projet

CFI-LINK est une application académique tout-en-un conçue pour numériser et centraliser la gestion de l'établissement CFI-CIRAS. Elle couvre l'ensemble du cycle de vie académique : de l'inscription des étudiants jusqu'à la publication des notes et la génération des documents officiels.

L'application est pensée pour fonctionner sur web (navigateur) et sur mobile natif (Android et iOS) depuis une seule base de code.


---

## 2. Fonctionnalités

### Pour les étudiants (concours et externes)
- **Tableau de bord** personnalisé : résumé des notes, présences, paiements, prochains événements
- **Cours** : liste des matières par filière et niveau, fiches détaillées
- **E-Learning** : modules de cours en ligne avec vidéos, documents, quiz et examens ; suivi de progression par leçon
- **Notes** : consultation des résultats publiés (CC, TP, Examen, moyenne pondérée par coefficient)
- **Paiements** : historique des paiements de scolarité, soumission d'un paiement, validation par code
- **Présences** : consultation de son taux de présence par cours et par période
- **Emploi du temps** : planning hebdomadaire filtré par filière, niveau et option
- **Annonces** : fil d'annonces institutionnelles classées par priorité (normale, importante, urgente)
- **Documents administratifs** : demande en ligne d'attestations, relevés de notes, certificats
- **Bibliothèque** : accès à la bibliothèque numérique (livres, articles, mémoires, guides)
- **Messages** : messagerie interne entre membres de l'établissement
- **Communauté** : fil de posts étudiants avec système de likes
- **Forum** : discussions par sujet avec réponses imbriquées
- **Calendrier** : vue mensuelle des examens, deadlines, événements et jours fériés
- **Notifications** : alertes en temps réel (notes publiées, absences, paiements, annonces)

### Pour les professeurs
- Saisie et publication des notes (CC, TP, Examen) par cours
- Marquage des présences par séance
- Gestion des cours et des leçons (contenu E-Learning)
- Envoi de messages aux étudiants
- Publication d'annonces

### Pour le personnel administratif (secrétariat, comptabilité, scolarité)
- Traitement des demandes de documents (selon le rôle : secretariat / responsable_scolarite)
- Gestion des paiements et validation des codes de paiement (comptable)
- Gestion des emplois du temps

### Pour les administrateurs (Directeur, Super Admin)
- **Gestion des utilisateurs** : créer, activer/désactiver, modifier, supprimer tous les comptes
- **Gestion des codes** : codes concours (étudiants admis) et codes de validation (étudiants externes)
- **Gestion des paiements** : vue globale, confirmation/rejet, blocage de comptes
- **Gestion des semestres** : créer et activer les périodes académiques
- **Statistiques** : tableaux de bord analytiques (répartition des étudiants, taux de présence, progression E-Learning, état des notes)
- **Journal d'audit** : historique complet de toutes les actions effectuées sur la plateforme


---

## 3. Architecture technique

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                                                             │
│   React 19 + TypeScript + Ionic 8 + React Router 5         │
│   Vite 5  (bundler)   ·   Capacitor 8 (iOS / Android)      │
│                                                             │
│   État actuel : données métier dans localStorage (18 stores)│
│   Cible       : consommation de l'API Laravel via Axios     │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTP/JSON (REST)
                            │  Auth : Laravel Sanctum
┌───────────────────────────▼─────────────────────────────────┐
│                        SERVEUR                              │
│                                                             │
│   Laravel 13  ·  PHP 8.3  ·  Laravel Sanctum               │
│   Base de données : SQLite (dev) → MySQL/PostgreSQL (prod)  │
│                                                             │
│   État actuel : squelette Laravel (1 route, modèle User)   │
│   Cible       : API complète (auth, users, notes, paiements,│
│                 présences, cours, audit, documents…)        │
└─────────────────────────────────────────────────────────────┘
```

### Stack frontend

| Technologie | Version | Rôle |
|---|---|---|
| React | 19.0.0 | Framework UI |
| TypeScript | ~5.9 | Typage statique |
| Ionic React | ^8.5 | Composants UI mobile-first |
| React Router | ^5.3 | Navigation SPA |
| Capacitor | 8.3.4 | Build iOS / Android natif |
| Vite | ^5.0 | Bundler et dev server |
| Vitest | ^0.34 | Tests unitaires |
| Cypress | ^13.5 | Tests end-to-end |

### Stack backend

| Technologie | Version | Rôle |
|---|---|---|
| Laravel | ^13.8 | Framework PHP |
| PHP | ^8.3 | Langage serveur |
| Laravel Sanctum | ^4.0 | Authentification SPA / API tokens |
| SQLite | — | Base de données (développement) |
| PHPUnit | ^12.5 | Tests backend |


---

## 4. Structure du projet

```
CFI-LINK/
├── frontend/                        # Application React/Ionic
│   ├── src/
│   │   ├── assets/                  # Images, icônes
│   │   ├── components/              # Composants réutilisables (UI)
│   │   ├── constants/               # Constantes globales
│   │   ├── contexts/                # Contextes React (auth, thème…)
│   │   ├── hooks/                   # Custom hooks
│   │   ├── lib/                     # Stores de données (localStorage → API)
│   │   │   ├── store.ts             # Utilisateurs, auth, codes d'accès, paiements
│   │   │   ├── payment-store.ts     # Enregistrements de paiements
│   │   │   ├── grades-store.ts      # Notes et publication
│   │   │   ├── attendance-store.ts  # Présences
│   │   │   ├── courses-data.ts      # Cours et leçons
│   │   │   ├── elearning-store.ts   # Progression E-Learning
│   │   │   ├── announcements-store.ts
│   │   │   ├── schedule-store.ts    # Emplois du temps
│   │   │   ├── semester-store.ts    # Semestres académiques
│   │   │   ├── notifications.ts     # Notifications in-app
│   │   │   ├── messages-store.ts    # Messagerie interne
│   │   │   ├── community-store.ts   # Posts communauté
│   │   │   ├── forum-store.ts       # Forum avec réponses imbriquées
│   │   │   ├── library-store.ts     # Bibliothèque numérique
│   │   │   ├── documents-store.ts   # Demandes de documents admin
│   │   │   ├── events-store.ts      # Événements calendrier
│   │   │   └── audit-store.ts       # Journal d'audit
│   │   ├── pages/
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── admin/               # AdminStats, AuditLog, ManageCodes,
│   │   │   │                        # ManagePayments, ManageSemesters, ManageUsers
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Courses.tsx / CourseDetail.tsx
│   │   │   ├── ELearning.tsx
│   │   │   ├── Grades.tsx
│   │   │   ├── Payments.tsx
│   │   │   ├── Attendance.tsx
│   │   │   ├── Schedule.tsx
│   │   │   ├── Announcements.tsx
│   │   │   ├── Documents.tsx
│   │   │   ├── Library.tsx
│   │   │   ├── Messages.tsx
│   │   │   ├── Community.tsx
│   │   │   ├── Forum.tsx
│   │   │   ├── CalendarPage.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Landing.tsx
│   │   ├── styles/                  # CSS global et thème
│   │   ├── theme/                   # Variables Ionic (couleurs…)
│   │   ├── App.tsx                  # Racine de l'app + routes
│   │   └── main.tsx                 # Point d'entrée React
│   ├── android/                     # Projet Android (Capacitor)
│   ├── ios/                         # Projet iOS (Capacitor)
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                         # API Laravel
    ├── app/
    │   ├── Http/Controllers/        # Controllers (à créer)
    │   ├── Models/                  # Modèles Eloquent
    │   └── Providers/
    ├── database/
    │   ├── migrations/              # Migrations SQL
    │   ├── factories/               # Factories pour les tests
    │   └── seeders/                 # Données de départ
    ├── routes/
    │   └── api.php                  # Routes de l'API REST
    ├── config/
    ├── tests/
    ├── composer.json
    └── .env
```


---

## 5. Prérequis

### Frontend
- **Node.js** >= 20.x
- **npm** >= 10.x

### Backend
- **PHP** >= 8.3
- **Composer** >= 2.x
- **Extension PHP** : pdo, pdo_sqlite (dev), pdo_mysql (prod), mbstring, openssl, tokenizer, xml, ctype, json, bcmath

### Mobile (optionnel)
- **Android Studio** avec SDK Android 35+ (pour le build Android)
- **Xcode** 15+ sur macOS (pour le build iOS)
- **Capacitor CLI** : `npm install -g @capacitor/cli`

---

## 6. Installation et démarrage

### Frontend

```bash
# 1. Se placer dans le dossier frontend
cd frontend

# 2. Installer les dépendances
npm install

# 3. Démarrer le serveur de développement
npm run dev
# L'application est accessible sur http://localhost:5173
```

Pour builder la version de production :

```bash
npm run build
```

Pour construire l'application mobile (après le build) :

```bash
# Synchroniser le build dans les projets natifs
npx cap sync

# Ouvrir dans Android Studio
npx cap open android

# Ouvrir dans Xcode
npx cap open ios
```

### Backend

```bash
# 1. Se placer dans le dossier backend
cd backend

# 2. Installer les dépendances PHP
composer install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Générer la clé d'application
php artisan key:generate

# 5. Créer la base de données SQLite (développement)
touch database/database.sqlite

# 6. Exécuter les migrations
php artisan migrate

# 7. Peupler la base avec des données de départ (quand le seeder sera prêt)
php artisan db:seed

# 8. Démarrer le serveur de développement
php artisan serve
# L'API est accessible sur http://localhost:8000
```

Pour lancer les tests backend :

```bash
php artisan test
```

### Démarrage complet (dev)

Le backend intègre un script `dev` qui lance tous les processus en parallèle :

```bash
cd backend
composer run dev
# Lance : php artisan serve · queue:listen · pail (logs) · vite
```


---

## 7. Comptes de démonstration

> Ces comptes sont créés automatiquement lors de l'initialisation de l'application (actuellement via localStorage, futur : `DatabaseSeeder` Laravel).

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Administrateur | `admin@cfi-ciras.org` | `Lord@123@admin` |
| Directeur (Admin) | `directeur@cfi-ciras.org` | `Dir@2024` |
| Professeur | `owona@cfi-ciras.org` | `Prof@2024` |
| Professeur | `mbarga@cfi-ciras.org` | `Prof@2024` |
| Responsable scolarité | `secretariat@cfi-ciras.org` | `Staff@2024` |
| Étudiant (concours) LIC L1 | `jean.kamga@etud.cfi-ciras.org` | `Etud@2024` |
| Étudiant (concours) LIC L3 GL | `paul.essomba@etud.cfi-ciras.org` | `Etud@2024` |
| Étudiant (externe) LAP L2 | `sophie.ateba@gmail.com` | `Etud@2024` |

### Codes d'accès pour l'inscription

| Type | Code | Disponible |
|------|------|-----------|
| Concours (LIC L1) | `CONC-DEF456` | Oui |
| Validation externe | `EXT-XYZ002` | Oui |

> **Note de sécurité :** Ces identifiants sont uniquement pour l'environnement de développement et de démonstration. Ils doivent être changés avant tout déploiement en production.

---

## 8. Rôles et permissions

L'application distingue 6 rôles, chacun avec un périmètre d'accès différent.

| Rôle | Identifiant | Description |
|------|-------------|-------------|
| Super Administrateur | `super_admin` | Accès total, gestion des admins et de la configuration |
| Directeur | `admin` | Gestion de l'établissement, utilisateurs, codes, statistiques |
| Professeur | `professeur` | Saisie des notes, marquage des présences, gestion de ses cours |
| Membre Administratif | `membre_administratif` | Accès conditionnel selon le sous-rôle (voir ci-dessous) |
| Étudiant (concours) | `etudiant_concours` | Accès via code concours ; inscription nominative |
| Étudiant (externe) | `etudiant_externe` | Accès via code de validation à durée limitée |

### Sous-rôles du personnel administratif

| Sous-rôle | `staff_role` | Accès |
|-----------|-------------|-------|
| Secrétariat | `secretariat` | Documents, emploi du temps |
| Comptabilité | `comptable` | Paiements et finances uniquement |
| Responsable Scolarité | `responsable_scolarite` | Documents, scolarité, emploi du temps |


---

## 9. Filières et niveaux

### LIC — Licence Informatique et Communication

| Niveau | Semestres | Options disponibles |
|--------|-----------|---------------------|
| L1 | S1, S2 | Tronc commun |
| L2 | S3, S4 | Tronc commun |
| L3 | S5, S6 | GL (Génie Logiciel) · SR (Systèmes & Réseaux) |

**Option GL** — Génie Logiciel : architecture logicielle, tests qualité, développement mobile, gestion de projet.

**Option SR** — Systèmes & Réseaux : administration système, sécurité des réseaux, cloud computing, télécommunications.

### LAP — Licence Administration Publique

| Niveau | Semestres | Options disponibles |
|--------|-----------|---------------------|
| L1 | S1, S2 | Tronc commun |
| L2 | S3, S4 | Tronc commun |
| L3 | S5, S6 | Tronc commun |

Chaque filière dispose de son propre emploi du temps, de ses cours, de ses promotions et de ses notes.

### Structure académique

```
Année académique 2024-2025
├── L1  →  Semestre 1 (oct. 2024 – jan. 2025)  [ACTIF]
│          Semestre 2 (fév. 2025 – juin 2025)
├── L2  →  Semestre 3 (oct. 2024 – jan. 2025)
│          Semestre 4 (fév. 2025 – juin 2025)
└── L3  →  Semestre 5 (oct. 2024 – jan. 2025)
           Semestre 6 (fév. 2025 – juin 2025)
```

---

## 10. État actuel du projet

### Ce qui est fonctionnel (démonstration)

L'application est entièrement fonctionnelle en mode démonstration : toutes les données sont stockées localement dans le `localStorage` du navigateur. Cela permet de tester l'intégralité des fonctionnalités sans serveur.

| Module | État |
|--------|------|
| Authentification (login, register, logout) | Fonctionnel (localStorage) |
| Gestion des utilisateurs | Fonctionnel (localStorage) |
| Codes concours et validation | Fonctionnel (localStorage) |
| Notes (saisie, publication, consultation) | Fonctionnel (localStorage) |
| Paiements (suivi, validation par code) | Fonctionnel (localStorage) |
| Présences (marquage, stats) | Fonctionnel (localStorage) |
| Emploi du temps | Fonctionnel (localStorage) |
| E-Learning (cours, quiz, progression) | Fonctionnel (localStorage) |
| Annonces, Notifications | Fonctionnel (localStorage) |
| Messages, Communauté, Forum | Fonctionnel (localStorage) |
| Bibliothèque, Documents, Calendrier | Fonctionnel (localStorage) |
| Audit Log, Statistiques admin | Fonctionnel (localStorage) |
| Semestres | Fonctionnel (localStorage) |

### Ce qui reste à construire

| Module | État |
|--------|------|
| API Laravel (routes, controllers, models) | Non commencé |
| Migrations complètes (18 tables) | Non commencé |
| Tests backend PHPUnit | Non commencé |
| Liaison frontend ↔ API | Non commencé |
| Authentification sécurisée (bcrypt, Sanctum) | Non commencé |
| Upload de fichiers (bibliothèque, documents) | Non commencé |
| Génération PDF (attestations, relevés) | Non commencé |
| Notifications temps réel (broadcasting) | Non commencé |

> Pour le détail complet des tâches restantes, consulter [TODO.md](./TODO.md).


---

## 11. Feuille de route

La migration vers un backend complet se déroulera en 5 phases. Chaque phase livre un ensemble cohérent de fonctionnalités utilisables.

```
Phase 1 — Fondations (🔴 priorité critique)
  ├── Configuration CORS, .env, Sanctum
  ├── Extension du modèle User (tous les champs métier)
  ├── AuthController : login, logout, register, /me
  ├── Service HTTP Axios côté frontend (api.ts)
  └── AuthContext React (remplacement du store localStorage)

Phase 2 — Données critiques (🔴 priorité critique)
  ├── Codes d'accès (concours + validation externe)
  ├── Gestion des utilisateurs (CRUD + policies)
  ├── Notes (saisie, publication, consultation sécurisée)
  ├── Paiements (enregistrements, validation codes, blocage)
  └── Tests PHPUnit pour auth + autorisation

Phase 3 — Liaison frontend (🟠 priorité haute)
  ├── Connexion des pages auth, dashboard, admin
  ├── Connexion des pages notes et paiements
  ├── TanStack Query (cache côté client)
  └── Gestion des états de chargement et d'erreur

Phase 4 — Données secondaires (🟠 → 🟡)
  ├── Présences, emplois du temps, semestres
  ├── Cours, leçons, progression E-Learning
  ├── Annonces, notifications, messages
  ├── Documents administratifs (+ génération PDF)
  └── Bibliothèque, calendrier, audit log

Phase 5 — Qualité & déploiement (🟡 → 🟢)
  ├── Communauté et forum
  ├── Notifications temps réel (Laravel Echo / Pusher)
  ├── Configuration Capacitor pour la prod mobile
  ├── Tests end-to-end Cypress
  └── Configuration CI/CD et déploiement production
```

---

## Licence

Projet développé pour le CFI-CIRAS — usage interne et pédagogique.
