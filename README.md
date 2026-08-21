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

**Technologies principales :**
- Frontend : React 19 + Ionic 8 + TypeScript + TanStack Query v5
- Backend : Laravel 13 + Sanctum + Reverb (WebSocket)
- Base de données : MySQL 8 (cfi_link_db)
- Notifications temps réel : Laravel Reverb + Laravel Echo

---

## 2. Fonctionnalités

### Pour les étudiants (concours et externes)

- **Tableau de bord** : résumé des notes, présences, paiements, événements
- **Cours** : liste par filière/niveau, fiches détaillées
- **E-Learning** : vidéos, documents, quiz, examens ; suivi de progression
- **Notes** : consultation des résultats publiés (CC, TP, Examen, moyenne pondérée)
- **Paiements** : historique, soumission, validation par code
- **Présences** : taux de présence par cours
- **Emploi du temps** : planning filtré par filière/niveau/option
- **Annonces** : fil institutionnel (normale / importante / urgente)
- **Documents** : demande d'attestations, relevés, certificats
- **Bibliothèque** : livres, articles, mémoires, guides
- **Messages** : messagerie interne
- **Communauté** : fil de posts étudiants
- **Forum** : discussions avec réponses imbriquées
- **Calendrier** : examens, deadlines, événements
- **Notifications temps réel** : via Laravel Reverb (WebSocket)

### Pour les professeurs

- Saisie et publication des notes
- Marquage des présences (appel en salle)
- Gestion des cours et leçons
- Envoi de messages, annonces

### Pour le personnel administratif

- Traitement des demandes de documents
- Gestion des paiements (comptabilité)
- Emplois du temps

### Pour les administrateurs

- **Gestion des utilisateurs** : CRUD complet, activation/désactivation
- **Codes d'accès** : codes concours + codes validation externe
- **Paiements** : vue globale, confirmation/rejet, blocage de comptes
- **Semestres** : création et activation
- **Statistiques** : agrégats sur tous les domaines
- **Journal d'audit** : historique de toutes les actions

---

## 3. Architecture technique

```
┌───────────────────────────────────────────────────────────────┐
│                CLIENT (React + Ionic)                         │
│  React 19 · TypeScript · Ionic 8 · TanStack Query v5         │
│  Vite 5 · Capacitor 8 (iOS/Android)                          │
│  Laravel Echo + Reverb → notifications temps réel             │
│  Token Bearer en sessionStorage · 0 donnée sensible en LS    │
└──────────────────────────┬────────────────────────────────────┘
                           │ HTTPS + Axios + Bearer Token
                           ▼
┌───────────────────────────────────────────────────────────────┐
│                SERVER (Laravel 13)                            │
│  ~65 routes REST · Sanctum auth · Reverb WS                   │
│  Rate limiting · Pagination · Logging (daily + Slack)         │
│  AuditService · NotificationService · ResendMailService       │
└──────────────────────────┬────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  MySQL 8    │
                    │ cfi_link_db │
                    │  24 tables  │
                    └─────────────┘
```

### Stack

| Layer | Technologie | Version |
|-------|-------------|---------|
| UI Framework | React | 19.0 |
| Mobile UI | Ionic React | 8.5 |
| Language | TypeScript | ~5.9 |
| Build | Vite | 5.4 |
| State/Cache | TanStack Query | v5 |
| HTTP Client | Axios | ^1.7 |
| WebSocket | Laravel Echo + Reverb | — |
| Mobile | Capacitor | 8.3 |
| Backend | Laravel | 13.8 |
| Auth | Laravel Sanctum | 4.0 |
| DB | MySQL | 8.x |
| WebSocket server | Laravel Reverb | 1.x |
| Email | Resend API | — |
| Tests | PHPUnit | 12.5 |

---

## 4. Structure du projet

```
CFI-LINK/
├── frontend/                     # Application React/Ionic
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts            # Axios centralisé
│   │   │   ├── echo.ts           # Laravel Echo (Reverb)
│   │   │   ├── store.ts          # Types + ROLE_LABELS
│   │   │   └── services/         # 18 services API
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePaginatedQuery.ts
│   │   │   └── useRealTimeNotifications.ts
│   │   ├── components/
│   │   │   ├── providers/AuthProvider.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ui/Pagination.tsx
│   │   ├── pages/                # 27 pages
│   │   ├── styles/               # 44 fichiers CSS
│   │   │   └── responsive.css    # Variables clamp() globales
│   │   └── App.tsx
│   ├── capacitor.config.ts       # appId: org.cficiras.cfilink
│   └── .env.local
│
└── backend/                      # API Laravel
    ├── app/
    │   ├── Http/Controllers/     # 18 controllers
    │   ├── Models/               # 22 modèles Eloquent
    │   ├── Services/             # AuditService, NotificationService, ResendMailService
    │   ├── Events/               # CfiNotificationSent (broadcast)
    │   └── Policies/             # UserPolicy
    ├── database/
    │   ├── migrations/           # 14 migrations (ordre corrigé)
    │   ├── seeders/              # DatabaseSeeder + 4 seeders spécialisés
    │   └── factories/            # 9 factories (tests)
    ├── routes/
    │   ├── api.php               # ~65 routes
    │   └── channels.php          # Canaux Reverb privés
    ├── config/
    │   ├── cors.php              # HTTP + HTTPS
    │   ├── broadcasting.php      # Reverb driver
    │   └── logging.php           # daily + slack + sentry
    └── tests/                    # 108 tests PHPUnit
        ├── Feature/
        │   ├── Auth/             # 20 tests
        │   ├── Authorization/    # 10 tests
        │   ├── Business/         # 19 tests
        │   ├── Performance/      # 9 tests
        │   ├── Security/         # 18 tests
        │   └── Validation/       # 12 tests
        └── Unit/                 # 20 tests
```

---

## 5. Prérequis

### Frontend
- Node.js >= 20.x
- npm >= 10.x

### Backend
- PHP >= 8.3
- Composer >= 2.x
- MySQL >= 8.x
- Extensions PHP : pdo, pdo_mysql, mbstring, openssl, tokenizer, xml, bcmath

### Mobile (optionnel)
- Android Studio + SDK Android 35+
- Xcode 15+ (macOS uniquement)
- `npm install -g @capacitor/cli`

---

## 6. Installation et démarrage

### Frontend

```bash
cd frontend
npm install
npm run dev
# Accessible sur http://localhost:5173
```

Build production :
```bash
npm run build
```

Build mobile :
```bash
npx cap sync
npx cap open android   # ou ios
```

### Backend

```bash
cd backend

# 1. Dépendances
composer install

# 2. Environnement
cp .env.example .env
php artisan key:generate

# 3. Base de données MySQL
# Créer la base : cfi_link_db
# Configurer DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD dans .env

# 4. Migrations + Seed
php artisan migrate:fresh --seed
# → Crée toutes les tables ET insère les données de démo

# 5. Serveur de développement
php artisan serve
# API accessible sur http://localhost:8000

# 6. WebSocket Reverb (optionnel, pour notifications temps réel)
php artisan reverb:start
```

### Lancer tous les services en même temps

```bash
cd backend
composer run dev
# Lance simultanément : php artisan serve + queue:listen + pail (logs)
```

---

## 7. Comptes de démonstration

> Créés automatiquement par `php artisan migrate:fresh --seed`

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Administrateur | `admin@cfi-ciras.org` | `Lord@123@admin` |
| Directeur (Admin) | `directeur@cfi-ciras.org` | `Dir@2024` |
| Professeur | `owona@cfi-ciras.org` | `Prof@2024` |
| Professeur | `mbarga@cfi-ciras.org` | `Prof@2024` |
| Responsable scolarité | `secretariat@cfi-ciras.org` | `Staff@2024` |
| Étudiant LIC L1 | `jean.kamga@etud.cfi-ciras.org` | `Etud@2024` |
| Étudiant LIC L3 GL | `paul.essomba@etud.cfi-ciras.org` | `Etud@2024` |
| Étudiant LAP L2 | `sophie.ateba@gmail.com` | `Etud@2024` |

### Codes d'accès disponibles pour l'inscription

| Type | Code | Disponible |
|------|------|-----------|
| Concours (LAP L1) | `CONC-DEF456` | ✅ |
| Validation externe | `EXT-XYZ002` | ✅ |

> **Sécurité :** Ces identifiants sont pour le développement/démo uniquement. Les changer en production.

---

## 8. Rôles et permissions

| Rôle | `role` | Description |
|------|--------|-------------|
| Super Administrateur | `super_admin` | Accès total via Gate::before |
| Directeur | `admin` | Gestion complète de l'établissement |
| Professeur | `professeur` | Notes, présences, cours |
| Personnel Administratif | `membre_administratif` | Selon sous-rôle |
| Étudiant (concours) | `etudiant_concours` | Accès via code concours |
| Étudiant (externe) | `etudiant_externe` | Accès via code validation |

### Sous-rôles du personnel administratif

| Sous-rôle | `staff_role` | Accès |
|-----------|-------------|-------|
| Secrétariat | `secretariat` | Documents, emploi du temps |
| Comptabilité | `comptable` | Paiements, codes paiement |
| Responsable Scolarité | `responsable_scolarite` | Scolarité, documents |

---

## 9. Filières et niveaux

### LIC — Licence Informatique et Communication (26 cours)

| Niveau | Semestres | Options |
|--------|-----------|---------|
| L1 | S1, S2 | Tronc commun (7 cours) |
| L2 | S3, S4 | Tronc commun (7 cours) |
| L3 | S5, S6 | **GL** (Génie Logiciel, 5 cours) · **SR** (Systèmes & Réseaux, 5 cours) · Commun (2 cours) |

### LAP — Licence Administration Publique (15 cours)

| Niveau | Semestres |
|--------|-----------|
| L1 | S1, S2 (5 cours) |
| L2 | S3, S4 (5 cours) |
| L3 | S5, S6 (5 cours) |

---

## 10. État actuel du projet

### ✅ Entièrement fonctionnel

| Module | Backend | Frontend | DB |
|--------|---------|----------|-----|
| Authentification | ✅ | ✅ | ✅ |
| Gestion utilisateurs | ✅ | ✅ | ✅ |
| Codes d'accès | ✅ | ✅ | ✅ |
| Notes | ✅ | ✅ | ✅ |
| Paiements | ✅ | ✅ | ✅ |
| Présences | ✅ | ✅ | ✅ |
| Cours + E-Learning | ✅ | ✅ | ✅ |
| Emploi du temps | ✅ | ✅ | ✅ |
| Annonces | ✅ | ✅ | ✅ |
| Notifications temps réel | ✅ Reverb | ✅ Echo | ✅ |
| Messages | ✅ | ✅ | ✅ |
| Documents admin | ✅ | ✅ | ✅ |
| Bibliothèque | ✅ | ✅ | ✅ |
| Calendrier | ✅ | ✅ | ✅ |
| Communauté + Forum | ✅ | ✅ | ✅ |
| Audit Log | ✅ | ✅ | ✅ |
| Réinitialisation MDP | ✅ Resend | ✅ | ✅ |
| Semestres | ✅ | ✅ | ✅ |
| Tests backend | ✅ 108 tests | — | — |
| Responsivité CSS | — | ✅ clamp() | — |
| Pagination | ✅ | ✅ | — |
| Rate limiting | ✅ | — | — |
| Logs production | ✅ | — | — |

---

## 11. Feuille de route

```
✅ Phase 1 — Fondations          : CORS, .env, auth, migrations
✅ Phase 2 — Données critiques   : codes, users, notes, paiements
✅ Phase 3 — Liaison front/back  : services API, AuthContext, React Query
✅ Phase 4 — Données secondaires : présences, planning, annonces, messages…
✅ Phase 5 — Qualité & polish    : pagination, logs, tests, responsivité

🔄 Prochaines étapes :
  → Code splitting React.lazy() — réduire le bundle initial
  → @capacitor/share — impression PDF sur iOS
  → date-fns fr-FR — localisation robuste sur Android
  → Domaine production + HTTPS + SSL
  → CI/CD GitHub Actions
```

---

## Licence

Projet développé pour le CFI-CIRAS — usage interne et pédagogique.
