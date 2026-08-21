# CFI-LINK — Inventaire des données mockées (localStorage)

> Ce document liste toutes les données statiques (seed) qui existaient côté frontend
> avant la migration vers Laravel. Elles sont maintenant gérées par le `DatabaseSeeder`
> Laravel et les tables MySQL/SQLite.
>
> **Statut** : toutes ces données sont migrées en base via `DatabaseSeeder.php`.
> Les fonctions `initialize*()` frontend ne sont plus appelées dans les pages migrées.

---

## 1. Utilisateurs — `store.ts` → `initializeStore()`

**Clé localStorage** : `cfi_users` · **9 enregistrements**

| # | Email | Nom complet | Rôle | Filière / Année | Actif |
|---|-------|-------------|------|-----------------|-------|
| 1 | `admin@cfi-ciras.org` | Super Administrateur | `super_admin` | — | ✅ |
| 2 | `directeur@cfi-ciras.org` | Dr. Michel Fouda | `admin` | — | ✅ |
| 3 | `owona@cfi-ciras.org` | Dr. Owona | `professeur` | — · Spé : Informatique | ✅ |
| 4 | `mbarga@cfi-ciras.org` | Prof. Mbarga | `professeur` | — · Spé : Algorithmique | ✅ |
| 5 | `secretariat@cfi-ciras.org` | Mme. Ngo Bassa | `membre_administratif` | — · Staff : responsable_scolarite | ✅ |
| 6 | `jean.kamga@etud.cfi-ciras.org` | Jean Kamga | `etudiant_concours` | LIC / L1 | ✅ |
| 7 | `paul.essomba@etud.cfi-ciras.org` | Paul Essomba | `etudiant_concours` | LIC / L3 GL | ✅ |
| 8 | `sophie.ateba@gmail.com` | Sophie Ateba | `etudiant_externe` | LAP / L2 | ✅ |
| 9 | `boris.ndongo@gmail.com` | Boris Ndongo | `etudiant_externe` | LIC / L2 | ❌ inactif |

**Mots de passe (SHA-256 en mock, bcrypt en prod)** : `Lord@123@admin`, `Dir@2024`, `Prof@2024` × 2, `Staff@2024`, `Etud@2024` × 4.

---

## 2. Codes concours — `store.ts`

**Clé localStorage** : `cfi_concours_codes` · **3 enregistrements**

| Code | Étudiant ciblé | Filière | Année | Option | Utilisé |
|------|---------------|---------|-------|--------|---------|
| `CONC-ABC123` | Jean Kamga | LIC | L1 | — | ✅ (par user 6) |
| `CONC-DEF456` | Marie Nkoulou | LAP | L1 | — | ❌ disponible |
| `CONC-GHI789` | Paul Essomba | LIC | L3 | GL | ✅ (par user 7) |

---

## 3. Codes de validation externe — `store.ts`

**Clé localStorage** : `cfi_validation_codes` · **2 enregistrements**

| Code | Utilisé | Utilisé par |
|------|---------|-------------|
| `EXT-XYZ001` | ✅ | Sophie Ateba (user 8) |
| `EXT-XYZ002` | ❌ | — · expire dans 30 j |

---

## 4. Cours — `courses-data.ts` → `initializeCourseStore()`

**Clé localStorage** : `cfi_courses` · **41 enregistrements**

### LIC — Informatique (27 cours)

| ID | Nom | Professeur | Année | Semestre | Heures |
|----|-----|-----------|-------|---------|--------|
| `lic-l1-1` | Introduction à l'informatique | Dr. Owona | L1 | S1 | 40 |
| `lic-l1-2` | Algorithmique & Programmation C | Prof. Mbarga | L1 | S1 | 50 |
| `lic-l1-3` | Mathématiques pour l'informatique | Dr. Talla | L1 | S1 | 45 |
| `lic-l1-4` | Anglais technique | Mme. Fotso | L1 | S1 | 25 |
| `lic-l1-5` | Architecture des ordinateurs | Prof. Essomba | L1 | S2 | 35 |
| `lic-l1-6` | Programmation Web (HTML/CSS) | M. Tabi | L1 | S2 | 35 |
| `lic-l1-7` | Statistiques & Probabilités | Dr. Fouda | L1 | S2 | 30 |
| `lic-l2-1` | Algorithmique avancée | Prof. Mbarga | L2 | S3 | 45 |
| `lic-l2-2` | Base de données | Dr. Nkoulou | L2 | S3 | 40 |
| `lic-l2-3` | Réseaux informatiques | Prof. Essomba | L2 | S3 | 50 |
| `lic-l2-4` | Programmation Orientée Objet (Java) | Dr. Owona | L2 | S3 | 45 |
| `lic-l2-5` | Systèmes d'exploitation | Prof. Manga | L2 | S4 | 40 |
| `lic-l2-6` | Programmation Web (JS/PHP) | M. Tabi | L2 | S4 | 40 |
| `lic-l2-7` | Analyse numérique | Dr. Talla | L2 | S4 | 30 |
| `lic-l3-gl-1` | Génie Logiciel | Prof. Manga | L3 GL | S5 | 60 |
| `lic-l3-gl-2` | Conception UML & Design Patterns | Dr. Owona | L3 GL | S5 | 45 |
| `lic-l3-gl-3` | Développement Mobile | M. Tabi | L3 GL | S6 | 40 |
| `lic-l3-gl-4` | Tests & Qualité logicielle | Prof. Manga | L3 GL | S6 | 35 |
| `lic-l3-gl-5` | Projet de fin d'études | Prof. Manga | L3 GL | S6 | 80 |
| `lic-l3-sr-1` | Administration système | Dr. Owona | L3 SR | S5 | 55 |
| `lic-l3-sr-2` | Sécurité des réseaux | Prof. Essomba | L3 SR | S5 | 50 |
| `lic-l3-sr-3` | Cloud & Virtualisation | Dr. Owona | L3 SR | S6 | 40 |
| `lic-l3-sr-4` | Télécommunications | Prof. Essomba | L3 SR | S6 | 45 |
| `lic-l3-sr-5` | Projet de fin d'études | Prof. Essomba | L3 SR | S6 | 80 |
| `lic-l3-s-1` | Intelligence Artificielle | Dr. Nkoulou | L3 | S5 | 40 |
| `lic-l3-s-2` | Droit du numérique | Me. Atangana | L3 | S6 | 25 |

### LAP — Administration Publique (15 cours)

| ID | Nom | Professeur | Année | Semestre | Heures |
|----|-----|-----------|-------|---------|--------|
| `lap-l1-1` | Droit administratif | Me. Atangana | L1 | S1 | 40 |
| `lap-l1-2` | Introduction au management | Dr. Fouda | L1 | S1 | 35 |
| `lap-l1-3` | Économie générale | M. Biya | L1 | S1 | 30 |
| `lap-l1-4` | Anglais administratif | Mme. Fotso | L1 | S2 | 25 |
| `lap-l1-5` | Sociologie des organisations | Dr. Fouda | L1 | S2 | 30 |
| `lap-l2-1` | Gestion des organisations | Dr. Fouda | L2 | S3 | 35 |
| `lap-l2-2` | Comptabilité publique | M. Biya | L2 | S3 | 40 |
| `lap-l2-3` | Droit constitutionnel | Me. Atangana | L2 | S3 | 35 |
| `lap-l2-4` | Gestion des ressources humaines | Dr. Fouda | L2 | S4 | 30 |
| `lap-l2-5` | Finances publiques | M. Biya | L2 | S4 | 35 |
| `lap-l3-1` | Administration publique | Me. Atangana | L3 | S5 | 45 |
| `lap-l3-2` | Politique économique | M. Biya | L3 | S5 | 40 |
| `lap-l3-3` | Droit des marchés publics | Me. Atangana | L3 | S6 | 35 |
| `lap-l3-4` | Management stratégique | Dr. Fouda | L3 | S6 | 40 |
| `lap-l3-5` | Projet de fin d'études | Dr. Fouda | L3 | S6 | 80 |

---

## 5. Leçons — `courses-data.ts`

**Clé localStorage** : `cfi_lessons` · **25 enregistrements** · sur 3 cours seulement

### Cours `lic-l2-1` — Algorithmique avancée (11 leçons)

| ID | Titre | Type | Durée | Quiz |
|----|-------|------|-------|------|
| `ll-1` | Introduction aux structures avancées | video | 45 min | — |
| `ll-2` | Supports de cours — Chapitre 1 | document | 15 min | — |
| `ll-3` | Arbres binaires de recherche | video | 50 min | — |
| `ll-4` | Quiz — Arbres & Graphes | quiz | 20 min | 3 questions |
| `ll-5` | Graphes : parcours & plus courts chemins | video | 55 min | — |
| `ll-6` | Tables de hachage | video | 40 min | — |
| `ll-7` | Programmation dynamique | video | 60 min | — |
| `ll-8` | Quiz — Programmation dynamique | quiz | 25 min | 1 question |
| `ll-9` | Algorithmes de tri avancés | video | 50 min | — |
| `ll-10` | Complexité NP | video | 55 min | — 🔒 |
| `ll-11` | Examen final — Algorithmique | exam | 2h | — 🔒 |

### Cours `lic-l2-2` — Base de données (7 leçons)

| ID | Titre | Type | Durée |
|----|-------|------|-------|
| `lb-1` | Modèle relationnel | video | 40 min |
| `lb-2` | SQL — Les fondamentaux | video | 50 min |
| `lb-3` | Quiz — SQL Basics | quiz | 15 min |
| `lb-4` | Jointures et sous-requêtes | video | 45 min |
| `lb-5` | Normalisation (1NF-3NF) | video | 55 min |
| `lb-6` | Supports — Normalisation | document | 20 min |
| `lb-7` | Examen final — BDD | exam | 2h 🔒 |

### Cours `lap-l1-1` — Droit administratif (7 leçons)

| ID | Titre | Type | Durée |
|----|-------|------|-------|
| `ld-1` | Introduction au droit administratif | video | 35 min |
| `ld-2` | L'organisation administrative | video | 45 min |
| `ld-3` | Les actes administratifs | video | 50 min |
| `ld-4` | Quiz — Actes administratifs | quiz | 15 min |
| `ld-5` | Le service public | video | 40 min |
| `ld-6` | Le contentieux administratif | video | 55 min |
| `ld-7` | Examen final — Droit admin | exam | 2h 🔒 |

---

## 6. Emplois du temps — `schedule-store.ts` → `initializeSchedules()`

**Clé localStorage** : `cfi_schedules` · **~42 entrées** couvrant LIC L1, LIC L2, LIC L3 GL/SR, LAP L1, LAP L2, LAP L3.

Structure de chaque entrée :
```
{ id, day, hour, subject, room, teacher, filiere, annee, option?, color }
```

Jours couverts : Lundi → Vendredi.
Horaires : 07h30 → 18h00 par tranche d'1h à 2h.
Professeurs référencés : Dr. Owona, Prof. Mbarga, Dr. Nkoulou, Prof. Essomba, M. Tabi, Dr. Talla, Me. Atangana, Dr. Fouda, M. Biya, Mme. Fotso, Prof. Manga.

---

## 7. Annonces — `announcements-store.ts` → `initializeAnnouncements()`

**Clé localStorage** : `cfi_announcements` · **4 enregistrements**

| Titre | Priorité | Ciblé | Auteur |
|-------|----------|-------|--------|
| Bienvenue sur CFI-LINK ! | `normal` | all | Administration |
| Début des cours — Semestre 1 2024/2025 | `important` | all | Direction |
| Rappel : Paiement de la scolarité | `urgent` | `etudiant_concours` | Comptabilité |
| Réunion pédagogique — Professeurs | `normal` | `professeur` | Direction |

---

## 8. Semestres — `semester-store.ts` → seed via `cfi_semesters_v2`

**Clé localStorage** : `cfi_semesters` · **6 enregistrements** pour l'année 2024-2025

| Nom | Code | Période | Actif |
|-----|------|---------|-------|
| Semestre 1 | S1 | Oct 2024 → Jan 2025 | ✅ actif |
| Semestre 2 | S2 | Fév 2025 → Juin 2025 | ❌ |
| Semestre 3 | S3 | Oct 2024 → Jan 2025 | ❌ |
| Semestre 4 | S4 | Fév 2025 → Juin 2025 | ❌ |
| Semestre 5 | S5 | Oct 2024 → Jan 2025 | ❌ |
| Semestre 6 | S6 | Fév 2025 → Juin 2025 | ❌ |

---

## 9. Bibliothèque — `library-store.ts` → `initializeLibrary()`

**Clé localStorage** : `cfi_library` · **~12 enregistrements** (livres, articles, mémoires, guides)

Catégories : `book`, `article`, `thesis`, `guide`, `manual`.
Filtres filière : LIC, LAP, ou général.
Champs : `title`, `author`, `category`, `filiere?`, `description?`, `file_type`, `size`, `downloads`, `added_by`.

---

## 10. Constante financière

**Fichier** : `payment-store.ts`

```ts
const MONTHLY_FEE = 25000; // FCFA — frais mensuels de scolarité
```

---

## 11. Données non seedées (CRUD pur)

Ces stores n'ont pas de données initiales — ils démarrent vides et sont alimentés par les actions utilisateurs :

| Store | Données |
|-------|---------|
| `grades-store.ts` | Notes (CC, TP, Examen) |
| `attendance-store.ts` | Enregistrements de présence |
| `payment-store.ts` | Paiements soumis par les étudiants |
| `notifications.ts` | Notifications in-app |
| `messages-store.ts` | Messages inbox/sent |
| `community-store.ts` | Posts communauté + likes |
| `forum-store.ts` | Posts forum + réponses |
| `documents-store.ts` | Demandes de documents admin |
| `events-store.ts` | Événements calendrier |
| `elearning-store.ts` | Progression e-learning par étudiant |
| `audit-store.ts` | Journal d'audit (actions) |

---

## 12. Correspondance Frontend → Base Laravel

| Données mock | Table Laravel | Seeder |
|---|---|---|
| 9 utilisateurs | `users` | `DatabaseSeeder::run()` |
| 3 codes concours | `concours_codes` | `DatabaseSeeder::run()` |
| 2 codes validation | `validation_codes` | `DatabaseSeeder::run()` |
| 6 semestres | `semesters` | `DatabaseSeeder::run()` |
| 41 cours | `courses` | à ajouter dans `DatabaseSeeder` |
| 25 leçons | `lessons` | à ajouter dans `DatabaseSeeder` |
| 42 emplois du temps | `schedule_entries` | à ajouter dans `DatabaseSeeder` |
| 4 annonces | `announcements` | à ajouter dans `DatabaseSeeder` |
| 12 livres | `library_items` | à ajouter dans `DatabaseSeeder` |
| Frais 25 000 FCFA | config ou table `settings` | à créer |
