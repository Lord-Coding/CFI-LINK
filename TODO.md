# CFI-LINK — TODO & Feuille de route

> Système de priorités :
> - 🔴 **CRITIQUE** — bloquant, à faire en premier
> - 🟠 **HAUTE** — important pour la stabilité ou la sécurité
> - 🟡 **MOYENNE** — amélioration significative
> - 🟢 **BASSE** — nice-to-have, polish

---

## 1. ANALYSE COMPLÈTE DU PROJET

> Avant tout développement majeur, cartographier précisément l'état actuel du code.

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 1.1 | Auditer les 18 stores localStorage et documenter chaque clé, type de données, relations entre entités | 🔴 CRITIQUE | ⬜ |
| 1.2 | Identifier les failles de sécurité : mots de passe SHA-256 côté client, données sensibles exposées dans localStorage, absence de CSRF/XSS | 🔴 CRITIQUE | ⬜ |
| 1.3 | Recenser toutes les routes frontend (React Router) et vérifier la cohérence avec les guards de rôles | 🟠 HAUTE | ⬜ |
| 1.4 | Inventorier les composants partagés (components/) et identifier les duplications de logique entre pages | 🟡 MOYENNE | ⬜ |
| 1.5 | Évaluer les performances : taille du bundle Vite, lazy loading des pages, images non optimisées | 🟡 MOYENNE | ⬜ |
| 1.6 | Vérifier la compatibilité Capacitor (iOS/Android) avec les APIs web utilisées (crypto.subtle, localStorage) | 🟠 HAUTE | ⬜ |
| 1.7 | Relever les TODO/FIXME dans le code source et les classer par criticité | 🟢 BASSE | ⬜ |
| 1.8 | Documenter l'architecture actuelle (diagramme de flux de données, relations entre stores) | 🟡 MOYENNE | ⬜ |


---

## 2. MIGRATION localStorage → LARAVEL (Backend)

> Objectif : que Laravel soit la source de vérité unique. Le frontend ne stocke plus rien de sensible.

### 2.1 — Infrastructure & Configuration (🔴 CRITIQUE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.1.1 | Configurer CORS dans Laravel (`config/cors.php`) pour autoriser le frontend Vite (localhost:5173) et le domaine de prod | 🔴 CRITIQUE | ⬜ |
| 2.1.2 | Configurer `.env` : `DB_*`, `APP_URL`, `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DRIVER=cookie` | 🔴 CRITIQUE | ⬜ |
| 2.1.3 | Créer un service HTTP centralisé côté frontend (`src/lib/api.ts`) avec Axios + intercepteurs (token Sanctum, gestion 401/403/422) | 🔴 CRITIQUE | ⬜ |
| 2.1.4 | Mettre en place la gestion globale des erreurs API côté frontend (toast d'erreur, redirection si 401) | 🟠 HAUTE | ⬜ |

### 2.2 — Authentification & Sessions (🔴 CRITIQUE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.2.1 | Étendre la migration `users` : ajouter `nom_complet`, `role`, `is_active`, `filiere`, `annee`, `option`, `specialite`, `grade`, `service`, `staff_role`, `payment_blocked` | 🔴 CRITIQUE | ⬜ |
| 2.2.2 | Mettre à jour `User.php` : fillable, casts, scopes de rôles | 🔴 CRITIQUE | ⬜ |
| 2.2.3 | Créer `AuthController` : `login()`, `logout()`, `me()`, `register()` avec validation complète | 🔴 CRITIQUE | ⬜ |
| 2.2.4 | Implémenter Sanctum SPA (cookie-based) pour le web + token API pour Capacitor mobile | 🔴 CRITIQUE | ⬜ |
| 2.2.5 | Remplacer `login()` / `logout()` / `getCurrentUser()` dans `store.ts` par des appels à l'API Laravel | 🔴 CRITIQUE | ⬜ |
| 2.2.6 | Supprimer le hachage SHA-256 côté frontend — Laravel gère bcrypt/argon2 | 🔴 CRITIQUE | ⬜ |
| 2.2.7 | Créer un `AuthContext` React qui wrappe l'utilisateur courant (remplacement de `getCurrentUser()` depuis localStorage) | 🔴 CRITIQUE | ⬜ |
| 2.2.8 | Implémenter la réinitialisation de mot de passe (`/forgot-password`, `/reset-password`) | 🟡 MOYENNE | ⬜ |


### 2.3 — Codes d'accès (🔴 CRITIQUE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.3.1 | Migration `concours_codes` : `id`, `code`, `nom_complet`, `filiere`, `annee`, `option`, `used`, `used_by` (FK users), `created_at` | 🔴 CRITIQUE | ⬜ |
| 2.3.2 | Migration `validation_codes` : `id`, `code`, `used`, `used_by` (FK users), `expires_at`, `created_at` | 🔴 CRITIQUE | ⬜ |
| 2.3.3 | Créer `ConcoursCode` et `ValidationCode` models avec relations | 🔴 CRITIQUE | ⬜ |
| 2.3.4 | Créer `CodesController` : CRUD codes concours, CRUD codes validation, validation à l'inscription | 🔴 CRITIQUE | ⬜ |
| 2.3.5 | Migrer `ManageCodes.tsx` pour consommer l'API à la place de localStorage | 🔴 CRITIQUE | ⬜ |

### 2.4 — Gestion des utilisateurs (🔴 CRITIQUE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.4.1 | Créer `UserController` : liste, création, mise à jour, suppression, activation/désactivation de compte | 🔴 CRITIQUE | ⬜ |
| 2.4.2 | Créer des policies Laravel : `UserPolicy` (seul super_admin/admin peut gérer les users) | 🔴 CRITIQUE | ⬜ |
| 2.4.3 | Migrer `ManageUsers.tsx` pour consommer l'API | 🔴 CRITIQUE | ⬜ |
| 2.4.4 | Créer un `DatabaseSeeder` complet avec les utilisateurs seed (super_admin, admin, profs, staff, étudiants) | 🟠 HAUTE | ⬜ |

### 2.5 — Paiements (🔴 CRITIQUE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.5.1 | Migration `payment_codes` : `id`, `code`, `student_id` (FK), `month`, `used`, `created_at` | 🔴 CRITIQUE | ⬜ |
| 2.5.2 | Migration `payment_records` : `id`, `student_id` (FK), `month`, `amount`, `method`, `status`, `reference`, `confirmed_at` | 🔴 CRITIQUE | ⬜ |
| 2.5.3 | Créer `PaymentController` : créer un enregistrement, confirmer, rejeter, liste par étudiant, liste globale admin | 🔴 CRITIQUE | ⬜ |
| 2.5.4 | Implémenter la logique de blocage/déblocage (`payment_blocked`) côté Laravel lors de la validation d'un code paiement | 🔴 CRITIQUE | ⬜ |
| 2.5.5 | Migrer `Payments.tsx` et `ManagePayments.tsx` pour consommer l'API | 🔴 CRITIQUE | ⬜ |


### 2.6 — Notes (🔴 CRITIQUE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.6.1 | Migration `grades` : `id`, `student_id` (FK), `course_id` (FK), `semestre`, `filiere`, `annee`, `cc`, `tp`, `exam`, `coef`, `status`, `created_by` (FK), `updated_at` | 🔴 CRITIQUE | ⬜ |
| 2.6.2 | Créer `GradeController` : upsert, publication par cours, dépublication, liste par étudiant, liste par cours | 🔴 CRITIQUE | ⬜ |
| 2.6.3 | Policy : seul un professeur ou admin peut créer/modifier des notes ; un étudiant ne voit que ses notes publiées | 🔴 CRITIQUE | ⬜ |
| 2.6.4 | Migrer `Grades.tsx` et la logique de saisie prof pour consommer l'API | 🔴 CRITIQUE | ⬜ |

### 2.7 — Présences (🟠 HAUTE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.7.1 | Migration `attendance_records` : `id`, `student_id` (FK), `course_id` (FK), `date`, `status`, `marked_by` (FK) | 🟠 HAUTE | ⬜ |
| 2.7.2 | Créer `AttendanceController` : marquer/mettre à jour, stats par étudiant, stats par cours, liste globale | 🟠 HAUTE | ⬜ |
| 2.7.3 | Migrer `Attendance.tsx` pour consommer l'API | 🟠 HAUTE | ⬜ |

### 2.8 — Cours & Leçons (🟠 HAUTE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.8.1 | Migration `courses` : `id`, `name`, `teacher_id` (FK), `filiere`, `annee`, `option`, `hours`, `semester`, `description` | 🟠 HAUTE | ⬜ |
| 2.8.2 | Migration `lessons` : `id`, `course_id` (FK), `title`, `type`, `duration`, `file_url`, `locked`, `order`, `quiz_data` (JSON) | 🟠 HAUTE | ⬜ |
| 2.8.3 | Migration `lesson_progress` : `id`, `student_id` (FK), `lesson_id` (FK), `course_id` (FK), `completed`, `score`, `completed_at` | 🟠 HAUTE | ⬜ |
| 2.8.4 | Créer `CourseController`, `LessonController`, `LessonProgressController` | 🟠 HAUTE | ⬜ |
| 2.8.5 | Migrer `Courses.tsx`, `CourseDetail.tsx`, `ELearning.tsx` pour consommer l'API | 🟠 HAUTE | ⬜ |

### 2.9 — Semestres (🟠 HAUTE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.9.1 | Migration `semesters` : `id`, `name`, `year`, `start_date`, `end_date`, `is_active`, `type` | 🟠 HAUTE | ⬜ |
| 2.9.2 | Créer `SemesterController` : CRUD, activer/désactiver | 🟠 HAUTE | ⬜ |
| 2.9.3 | Migrer `ManageSemesters.tsx` pour consommer l'API | 🟠 HAUTE | ⬜ |


### 2.10 — Emplois du temps (🟠 HAUTE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.10.1 | Migration `schedule_entries` : `id`, `day`, `hour`, `subject`, `room`, `teacher`, `filiere`, `annee`, `option`, `color` | 🟠 HAUTE | ⬜ |
| 2.10.2 | Créer `ScheduleController` : CRUD, filtre par filière/année/option, filtre par professeur | 🟠 HAUTE | ⬜ |
| 2.10.3 | Migrer `Schedule.tsx` pour consommer l'API | 🟠 HAUTE | ⬜ |

### 2.11 — Annonces & Notifications (🟡 MOYENNE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.11.1 | Migration `announcements` : `id`, `title`, `content`, `author_id` (FK), `priority`, `target_role`, `pinned`, `created_at` | 🟡 MOYENNE | ⬜ |
| 2.11.2 | Migration `notifications` : `id`, `user_id` (FK), `type`, `title`, `message`, `read`, `target_role`, `date` | 🟡 MOYENNE | ⬜ |
| 2.11.3 | Créer `AnnouncementController` et `NotificationController` | 🟡 MOYENNE | ⬜ |
| 2.11.4 | Utiliser les Notifications Laravel (broadcast ou polling) pour pousser les notifs en temps réel (optionnel : Pusher/Laravel Echo) | 🟢 BASSE | ⬜ |
| 2.11.5 | Migrer `Announcements.tsx` et le panneau de notifications pour consommer l'API | 🟡 MOYENNE | ⬜ |

### 2.12 — Messages internes (🟡 MOYENNE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.12.1 | Migration `messages` : `id`, `from_id` (FK), `to_id` (FK), `subject`, `body`, `read`, `created_at` | 🟡 MOYENNE | ⬜ |
| 2.12.2 | Créer `MessageController` : envoyer, liste inbox/sent, marquer lu, supprimer | 🟡 MOYENNE | ⬜ |
| 2.12.3 | Migrer `Messages.tsx` pour consommer l'API | 🟡 MOYENNE | ⬜ |

### 2.13 — Documents administratifs (🟡 MOYENNE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.13.1 | Migration `document_requests` : `id`, `student_id` (FK), `type`, `status`, `requested_at`, `processed_at`, `processed_by` (FK), `notes` | 🟡 MOYENNE | ⬜ |
| 2.13.2 | Créer `DocumentRequestController` : créer demande, lister, traiter (approuver/rejeter/prêt), générer PDF (via DomPDF ou Browsershot) | 🟡 MOYENNE | ⬜ |
| 2.13.3 | Migrer `Documents.tsx` pour consommer l'API | 🟡 MOYENNE | ⬜ |


### 2.14 — Bibliothèque (🟡 MOYENNE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.14.1 | Migration `library_items` : `id`, `title`, `author`, `category`, `filiere`, `description`, `file_type`, `size`, `downloads`, `added_by` (FK) | 🟡 MOYENNE | ⬜ |
| 2.14.2 | Créer `LibraryController` : CRUD, recherche, incrémenter téléchargements, upload de fichiers (Laravel Storage) | 🟡 MOYENNE | ⬜ |
| 2.14.3 | Migrer `Library.tsx` pour consommer l'API | 🟡 MOYENNE | ⬜ |

### 2.15 — Calendrier & Événements (🟡 MOYENNE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.15.1 | Migration `calendar_events` : `id`, `title`, `description`, `date`, `time`, `type`, `target_role`, `created_by` (FK) | 🟡 MOYENNE | ⬜ |
| 2.15.2 | Créer `CalendarEventController` : CRUD, filtre par rôle, événements à venir | 🟡 MOYENNE | ⬜ |
| 2.15.3 | Migrer `CalendarPage.tsx` pour consommer l'API | 🟡 MOYENNE | ⬜ |

### 2.16 — Communauté & Forum (🟢 BASSE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.16.1 | Migration `community_posts` : `id`, `author_id` (FK), `content`, `likes` (JSON ou table pivot `post_likes`), `created_at` | 🟢 BASSE | ⬜ |
| 2.16.2 | Migration `forum_posts` + `forum_replies` : relations parent/enfant, `pinned` | 🟢 BASSE | ⬜ |
| 2.16.3 | Créer `CommunityController` et `ForumController` | 🟢 BASSE | ⬜ |
| 2.16.4 | Migrer `Community.tsx` et `Forum.tsx` pour consommer l'API | 🟢 BASSE | ⬜ |

### 2.17 — Audit Log (🟠 HAUTE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.17.1 | Migration `audit_logs` : `id`, `user_id` (FK nullable), `action`, `details`, `category`, `ip_address`, `created_at` | 🟠 HAUTE | ⬜ |
| 2.17.2 | Créer un `AuditService` Laravel (appelé dans les controllers via Observer ou manuellement) | 🟠 HAUTE | ⬜ |
| 2.17.3 | Créer `AuditLogController` : lecture seule, filtres par catégorie/date | 🟠 HAUTE | ⬜ |
| 2.17.4 | Migrer `AuditLog.tsx` pour consommer l'API | 🟠 HAUTE | ⬜ |

### 2.18 — Nettoyage final localStorage (🔴 CRITIQUE)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 2.18.1 | Supprimer tous les appels `localStorage.getItem/setItem` dans les 18 stores une fois migrés | 🔴 CRITIQUE | ⬜ |
| 2.18.2 | Supprimer les fonctions `initialize*()` de seed côté frontend (remplacées par `DatabaseSeeder` Laravel) | 🔴 CRITIQUE | ⬜ |
| 2.18.3 | Vérifier qu'aucune donnée sensible ne reste en localStorage (token d'auth, infos user, notes, paiements) | 🔴 CRITIQUE | ⬜ |
| 2.18.4 | Mettre en place React Query ou SWR pour le cache côté client (remplacement du cache localStorage) | 🟡 MOYENNE | ⬜ |


---

## 3. TESTS BACKEND (Laravel)

### 3.1 — Mise en place de l'environnement de test

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 3.1.1 | Créer `.env.testing` avec une base SQLite en mémoire (`DB_DATABASE=:memory:`) | 🔴 CRITIQUE | ⬜ |
| 3.1.2 | Configurer `phpunit.xml` : activer `RefreshDatabase`, `WithFaker` | 🔴 CRITIQUE | ⬜ |
| 3.1.3 | Vérifier que `php artisan test` fonctionne sur l'environnement de dev | 🔴 CRITIQUE | ⬜ |
| 3.1.4 | Créer les factories manquantes : `ConcoursCodeFactory`, `GradeFactory`, `CourseFactory`, `PaymentFactory`, etc. | 🟠 HAUTE | ⬜ |

### 3.2 — Tests d'authentification

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 3.2.1 | Test : connexion réussie avec identifiants valides → retourne token + user | 🔴 CRITIQUE | ⬜ |
| 3.2.2 | Test : connexion échouée → 401 avec message d'erreur | 🔴 CRITIQUE | ⬜ |
| 3.2.3 | Test : compte inactif → 403 avec message approprié | 🔴 CRITIQUE | ⬜ |
| 3.2.4 | Test : compte bloqué paiement → retour spécifique `PAYMENT_BLOCKED` | 🔴 CRITIQUE | ⬜ |
| 3.2.5 | Test : inscription étudiant concours avec code valide → compte créé | 🟠 HAUTE | ⬜ |
| 3.2.6 | Test : inscription avec code déjà utilisé → 422 | 🟠 HAUTE | ⬜ |
| 3.2.7 | Test : logout → token révoqué | 🟠 HAUTE | ⬜ |

### 3.3 — Tests des routes protégées (autorisation)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 3.3.1 | Test : un étudiant ne peut pas accéder aux routes admin → 403 | 🔴 CRITIQUE | ⬜ |
| 3.3.2 | Test : un professeur ne peut saisir que les notes de ses propres cours → 403 sur autre cours | 🔴 CRITIQUE | ⬜ |
| 3.3.3 | Test : un étudiant ne voit que ses propres notes publiées (pas les brouillons) | 🔴 CRITIQUE | ⬜ |
| 3.3.4 | Test : seul le comptable/admin peut accéder aux routes de paiement | 🟠 HAUTE | ⬜ |
| 3.3.5 | Test : requête non authentifiée sur route protégée → 401 | 🟠 HAUTE | ⬜ |

### 3.4 — Tests métier

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 3.4.1 | Test : publication de notes → déclenche une notification pour chaque étudiant concerné | 🟠 HAUTE | ⬜ |
| 3.4.2 | Test : validation d'un code paiement → débloque le compte étudiant | 🟠 HAUTE | ⬜ |
| 3.4.3 | Test : code de validation expiré → 422 | 🟠 HAUTE | ⬜ |
| 3.4.4 | Test : calcul de moyenne (CC, TP, Exam avec coefficients) | 🟡 MOYENNE | ⬜ |
| 3.4.5 | Test : upsert présence → même étudiant/cours/jour met à jour le statut existant | 🟡 MOYENNE | ⬜ |
| 3.4.6 | Test : progression e-learning → marquer leçon complète, calcul du pourcentage | 🟡 MOYENNE | ⬜ |

### 3.5 — Tests de validation des données

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 3.5.1 | Test : création user avec email déjà existant → 422 | 🟠 HAUTE | ⬜ |
| 3.5.2 | Test : note en dehors de [0, 20] → 422 | 🟠 HAUTE | ⬜ |
| 3.5.3 | Test : filière invalide (hors LIC/LAP) → 422 | 🟡 MOYENNE | ⬜ |
| 3.5.4 | Test : champs obligatoires manquants sur chaque endpoint → 422 avec messages | 🟡 MOYENNE | ⬜ |


---

## 4. LIAISON FRONTEND ↔ BACKEND

### 4.1 — Service API centralisé

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 4.1.1 | Créer `src/lib/api.ts` : instance Axios avec `baseURL` depuis `import.meta.env.VITE_API_URL`, credentials, token Sanctum | 🔴 CRITIQUE | ⬜ |
| 4.1.2 | Ajouter intercepteur de requête : attacher automatiquement le token Bearer | 🔴 CRITIQUE | ⬜ |
| 4.1.3 | Ajouter intercepteur de réponse : si 401 → logout + redirect `/login`, si 403 → toast erreur | 🔴 CRITIQUE | ⬜ |
| 4.1.4 | Créer les services TypeScript par domaine : `authService.ts`, `userService.ts`, `gradeService.ts`, etc. | 🟠 HAUTE | ⬜ |
| 4.1.5 | Créer un fichier `.env.local` avec `VITE_API_URL=http://localhost:8000/api` | 🔴 CRITIQUE | ⬜ |

### 4.2 — Contexte d'authentification React

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 4.2.1 | Créer `src/contexts/AuthContext.tsx` : état global `currentUser`, `isLoading`, fonctions `login`, `logout`, `refreshUser` | 🔴 CRITIQUE | ⬜ |
| 4.2.2 | Wrapper l'application avec `<AuthProvider>` dans `main.tsx` | 🔴 CRITIQUE | ⬜ |
| 4.2.3 | Adapter les guards de routes (PrivateRoute) pour utiliser `AuthContext` au lieu de `getCurrentUser()` | 🔴 CRITIQUE | ⬜ |
| 4.2.4 | Supprimer `cfi_current_user` de localStorage — l'état auth vit dans le contexte React (token en cookie HttpOnly ou mémoire) | 🔴 CRITIQUE | ⬜ |

### 4.3 — Gestion du cache et de l'état serveur

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 4.3.1 | Installer et configurer TanStack Query (React Query) v5 pour le cache des données serveur | 🟠 HAUTE | ⬜ |
| 4.3.2 | Remplacer chaque store localStorage par un hook `useQuery` (ex : `useGrades`, `usePayments`, `useAttendance`) | 🟠 HAUTE | ⬜ |
| 4.3.3 | Implémenter les mutations (`useMutation`) pour les opérations d'écriture avec invalidation du cache | 🟠 HAUTE | ⬜ |
| 4.3.4 | Gérer les états de chargement et d'erreur dans chaque page avec des composants `<Skeleton>` et `<ErrorBoundary>` | 🟡 MOYENNE | ⬜ |

### 4.4 — Connexion des pages une par une

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 4.4.1 | Connecter `Login.tsx` et `Register.tsx` à l'API d'authentification | 🔴 CRITIQUE | ⬜ |
| 4.4.2 | Connecter `Dashboard.tsx` : données de l'utilisateur connecté depuis l'API | 🔴 CRITIQUE | ⬜ |
| 4.4.3 | Connecter `ManageUsers.tsx` et `ManageCodes.tsx` (admin) | 🔴 CRITIQUE | ⬜ |
| 4.4.4 | Connecter `Grades.tsx` (étudiant) et la saisie de notes (prof) | 🔴 CRITIQUE | ⬜ |
| 4.4.5 | Connecter `Payments.tsx` et `ManagePayments.tsx` | 🔴 CRITIQUE | ⬜ |
| 4.4.6 | Connecter `Attendance.tsx` | 🟠 HAUTE | ⬜ |
| 4.4.7 | Connecter `Schedule.tsx` et `ManageSemesters.tsx` | 🟠 HAUTE | ⬜ |
| 4.4.8 | Connecter `Courses.tsx`, `CourseDetail.tsx`, `ELearning.tsx` | 🟠 HAUTE | ⬜ |
| 4.4.9 | Connecter `Announcements.tsx`, `Documents.tsx`, `Library.tsx` | 🟡 MOYENNE | ⬜ |
| 4.4.10 | Connecter `Messages.tsx`, `CalendarPage.tsx`, `AdminStats.tsx`, `AuditLog.tsx` | 🟡 MOYENNE | ⬜ |
| 4.4.11 | Connecter `Community.tsx` et `Forum.tsx` | 🟢 BASSE | ⬜ |

### 4.5 — Mobile (Capacitor)

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 4.5.1 | Configurer l'URL de l'API dans `capacitor.config.ts` pour les builds Android/iOS (remplacer localhost par IP ou domaine) | 🟠 HAUTE | ⬜ |
| 4.5.2 | Tester la gestion des cookies Sanctum sur mobile (cookie HttpOnly non supporté dans certains webviews) → envisager token API classique | 🟠 HAUTE | ⬜ |
| 4.5.3 | Gérer le mode offline basique : afficher un message d'erreur si pas de réseau | 🟡 MOYENNE | ⬜ |


---

## 5. PROBLÈMES IDENTIFIÉS À COMBLER

> Cette section liste les bugs, failles et manques détectés lors de l'analyse du code existant.

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 5.1 | **Sécurité critique** : les mots de passe sont hachés avec SHA-256 en JavaScript côté client. N'importe qui avec accès au réseau peut voir le hash. SHA-256 n'est pas un algorithme de hachage de mots de passe (pas de sel, pas de coût adaptable). Doit être remplacé par bcrypt/argon2 côté Laravel. | Sécurité critique | 🔴 CRITIQUE |
| 5.2 | **Sécurité critique** : toutes les données (notes, paiements, rôles, codes d'accès) sont stockées en clair dans localStorage, accessible par n'importe quel script JS (XSS). | Sécurité critique | 🔴 CRITIQUE |
| 5.3 | **Pas d'isolation des données** : tous les utilisateurs partagent le même localStorage du navigateur. Sur une machine partagée, les données d'un utilisateur sont visibles par l'autre. | Sécurité critique | 🔴 CRITIQUE |
| 5.4 | **Incohérence des données** : deux onglets/fenêtres du même navigateur peuvent avoir des états localStorage désynchronisés. | Fiabilité | 🟠 HAUTE |
| 5.5 | **Limite de stockage** : localStorage est limité à ~5 MB. Avec la croissance des données (notes, présences, messages), cette limite sera atteinte. | Scalabilité | 🟠 HAUTE |
| 5.6 | **Modèle User Laravel incomplet** : le modèle n'a que `name`, `email`, `password`. Tous les champs métier (role, filiere, annee, etc.) manquent. | Fonctionnel | 🔴 CRITIQUE |
| 5.7 | **Aucune route API définie** : le backend Laravel n'a qu'une seule route `/api/user` protégée par Sanctum. Rien n'est implémenté. | Fonctionnel | 🔴 CRITIQUE |
| 5.8 | **Absence de validation des formulaires côté serveur** : toute la validation est uniquement frontend. Un appel API direct (Postman, curl) contournerait toutes les règles. | Sécurité | 🔴 CRITIQUE |
| 5.9 | **`Register.tsx` utilisait `await` dans une fonction non-async** (bug corrigé, mais symptôme d'un manque de rigueur sur les async/await). | Qualité code | 🟡 MOYENNE |
| 5.10 | **`AdminStats.tsx` contenait un octet corrompu `0x07`** dans le code source, probablement une erreur de copier-coller ou d'encodage. | Qualité code | 🟡 MOYENNE |
| 5.11 | **Pas de gestion d'erreur réseau** : aucun store ne gère le cas où l'API serait indisponible. Il faudra ajouter des states `isLoading` / `error` partout. | UX | 🟠 HAUTE |
| 5.12 | **Données seed en dur dans le frontend** : les utilisateurs, cours, horaires sont tous seedés via `initialize*()` dans le JS du client. Ces fonctions doivent migrer en `DatabaseSeeder` Laravel. | Architecture | 🟠 HAUTE |
| 5.13 | **Pas de pagination** : tous les stores retournent l'intégralité des données sans limite. À l'échelle, les listes d'utilisateurs, notes, présences seront lentes. | Performance | 🟡 MOYENNE |
| 5.14 | **Pas de logs d'erreurs serveur** : Laravel Pail est en dev-only. Il faudra configurer les logs pour la prod (Sentry, Logtail ou fichier rotatif). | Ops | 🟡 MOYENNE |
| 5.15 | **Capacitor + localStorage** : sur Android WebView, localStorage peut être effacé par le système si l'espace est insuffisant. Les données de l'app peuvent être perdues sans avertissement. | Fiabilité mobile | 🟠 HAUTE |
| 5.16 | **Pas de politique de mots de passe** : le frontend accepte n'importe quel mot de passe. Aucune règle de complexité n'est appliquée. | Sécurité | 🟠 HAUTE |
| 5.17 | **Pas de rate limiting** : les endpoints d'auth (login, register) ne sont pas protégés contre le brute-force. Laravel Sanctum inclut throttle, mais il faut l'activer explicitement. | Sécurité | 🟠 HAUTE |
| 5.18 | **Tests absents** : aucun test unitaire ni d'intégration n'existe (ni frontend avec Vitest, ni backend avec PHPUnit). | Qualité | 🟠 HAUTE |

---

## 6. RÉCAPITULATIF PAR ORDRE D'EXÉCUTION SUGGÉRÉ

```
Phase 1 (Fondations)       : 1.1, 1.2, 2.1.1-4, 2.2.1-7, 3.1.1-3
Phase 2 (Données critiques) : 2.3, 2.4, 2.5, 2.6, 3.2, 3.3
Phase 3 (Liaison frontend)  : 4.1, 4.2, 4.3, 4.4.1-5
Phase 4 (Données secondaires): 2.7-2.13, 4.4.6-10, 3.4, 3.5
Phase 5 (Qualité & polish)  : 2.14-2.16, 4.4.11, 4.5, 5.*
```
