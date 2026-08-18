# ANALYSE COMPLÈTE — CFI-LINK

> Document produit dans le cadre de la tâche **1.1 → 1.8** du TODO.md.
> Date : 8 août 2026

---

## Table des matières

1. [Audit des stores localStorage (tâche 1.1)](#1-audit-des-stores-localstorage)
2. [Failles de sécurité (tâche 1.2)](#2-failles-de-sécurité)
3. [Routes frontend et guards de rôles (tâche 1.3)](#3-routes-frontend-et-guards-de-rôles)
4. [Inventaire des composants partagés (tâche 1.4)](#4-inventaire-des-composants-partagés)
5. [Évaluation des performances (tâche 1.5)](#5-évaluation-des-performances)
6. [Compatibilité Capacitor iOS/Android (tâche 1.6)](#6-compatibilité-capacitor-iosandroid)
7. [TODO/FIXME dans le code source (tâche 1.7)](#7-todofixme-dans-le-code-source)
8. [Architecture actuelle — flux de données (tâche 1.8)](#8-architecture-actuelle--flux-de-données)

---

## 1. Audit des stores localStorage

> Tâche 1.1 — Cartographie complète des 18 stores, clés, types et relations.

### Vue d'ensemble

| # | Fichier | Clé localStorage | Entité principale | Relations |
|---|---------|-----------------|-------------------|-----------|
| 1 | `store.ts` | `cfi_users` | `User` | source de tout |
| 2 | `store.ts` | `cfi_current_user` | `User` (session) | → `cfi_users` |
| 3 | `store.ts` | `cfi_concours_codes` | `ConcoursCode` | → `User.id` (used_by) |
| 4 | `store.ts` | `cfi_validation_codes` | `ValidationCode` | → `User.id` (used_by) |
| 5 | `store.ts` | `cfi_payment_codes` | `PaymentCode` | → `User.id` (student_id) |
| 6 | `store.ts` | `cfi_payments` | `Payment` | → `User.id` (student_id) |
| 7 | `store.ts` | `cfi_initialized` | `boolean` | flag de seed |
| 8 | `payment-store.ts` | `cfi_payment_records` | `PaymentRecord` | → `User.id` (student_id) |
| 9 | `grades-store.ts` | `cfi_grades` | `GradeEntry` | → `User.id`, `Course.id` |
| 10 | `attendance-store.ts` | `cfi_attendance` | `AttendanceRecord` | → `User.id`, `Course.id` |
| 11 | `courses-data.ts` | `cfi_courses` | `CourseData` | référencé par grades, attendance |
| 12 | `courses-data.ts` | `cfi_lessons` | `Lesson` | → `Course.id` |
| 13 | `courses-data.ts` | `cfi_courses_initialized` | `boolean` | flag de seed |
| 14 | `elearning-store.ts` | `cfi_elearning_progress` | `LessonProgress` | → `User.id`, `Lesson.id`, `Course.id` |
| 15 | `announcements-store.ts` | `cfi_announcements` | `Announcement` | auteur = nom (string, pas FK) |
| 16 | `schedule-store.ts` | `cfi_schedules` | `ScheduleEntry` | teacher = nom (string, pas FK) |
| 17 | `semester-store.ts` | `cfi_semesters` | `Semester` | indépendant |
| 18 | `semester-store.ts` | `cfi_semesters_v2` | `boolean` | flag de re-seed versionné |
| 19 | `notifications.ts` | `cfi_notifications` | `Notification` | → `User.id` (target_user_id) |
| 20 | `messages-store.ts` | `cfi_messages` | `Message` | → `User.id` (from_id, to_id) |
| 21 | `community-store.ts` | `cfi_community` | `CommunityPost` | → `User.id` (author_id, likes[]) |
| 22 | `forum-store.ts` | `cfi_forum` | `ForumPost` + `ForumReply` | → `User.id`, imbriqué |
| 23 | `library-store.ts` | `cfi_library` | `LibraryItem` | → `User.nom_complet` (added_by) |
| 24 | `documents-store.ts` | `cfi_doc_requests` | `DocumentRequest` | → `User.id`, `User.nom_complet` |
| 25 | `events-store.ts` | `cfi_events` | `CalendarEvent` | → role (string) |
| 26 | `audit-store.ts` | `cfi_audit_log` | `AuditEntry` | → `User.id` (user_id) |
| — | `DashboardLayout.tsx` | `cfi_avatar_color` | `string` (hex) | préférence UI |

**Total : 26 clés localStorage distinctes.**


### Détail des types par store

#### `store.ts` — Le store central (7 clés)

```typescript
User {
  id: string (UUID)           // PK
  email: string
  password: string            // SHA-256 hex 64 chars ⚠️ FAILLE
  nom_complet: string
  role: Role                  // 'super_admin' | 'admin' | 'professeur' | 'membre_administratif' | 'etudiant_concours' | 'etudiant_externe'
  is_active: boolean
  created_at: string (ISO)
  filiere?: 'LIC' | 'LAP'
  annee?: 'L1' | 'L2' | 'L3'
  option?: 'GL' | 'SR'        // LIC L3 seulement
  specialite?: string         // profs
  grade?: string              // profs (ex: "Maître de Conférences")
  service?: string            // staff
  staff_role?: 'secretariat' | 'comptable' | 'responsable_scolarite'
  payment_blocked?: boolean
}

ConcoursCode {
  id: string; code: string (format CONC-XXXXXX)
  nom_complet: string; filiere: Filiere; annee: Annee; option?: OptionLIC
  used: boolean; used_by?: string (FK→User.id); created_at: string
}

ValidationCode {
  id: string; code: string (format EXT-XXXXXX)
  used: boolean; used_by?: string (FK→User.id)
  expires_at: string (ISO); created_at: string
}

PaymentCode {
  id: string; code: string (format PAY-XXXXXX)
  student_id: string (FK→User.id); student_name: string
  month: string; used: boolean; created_at: string
}

Payment { id, student_id, month, amount, paid, paid_at?, deadline }
// Note : Payment (cfi_payments) peu utilisé, PaymentRecord (cfi_payment_records) est le store actif
```

#### `payment-store.ts` (1 clé)

```typescript
PaymentRecord {
  id: string; student_id: string (FK→User.id)
  month: string; amount: number (FCFA, constante MONTHLY_FEE = 25000)
  method: 'cash' | 'mobile_money' | 'card'
  status: 'pending' | 'confirmed' | 'rejected'
  reference?: string; created_at: string; confirmed_at?: string
}
```

#### `grades-store.ts` (1 clé)

```typescript
GradeEntry {
  id: string; student_id: string (FK→User.id); student_name: string
  course_id: string (FK→Course.id); course_name: string
  semestre: string ('S1'–'S6'); filiere: string; annee: string
  cc: number|null; tp: number|null; exam: number|null
  coef: number; status: 'draft' | 'published'
  created_by: string (FK→User.id); updated_at: string
}
// Calculs : moyenne = (cc+tp+exam)/3 (non pondérée par composante)
// Moyenne générale = somme(moy*coef) / somme(coef)
// Publication → addNotification() automatique pour chaque étudiant
```

#### `attendance-store.ts` (1 clé)

```typescript
AttendanceRecord {
  id: string; student_id: string (FK→User.id); student_name: string
  course_id: string (FK→Course.id); course_name: string
  date: string (ISO); status: 'present'|'absent'|'late'|'excused'
  marked_by: string
}
// upsertAttendance() → unicité sur (student_id, course_id, date[0:10])
// Statut absent → addNotification() automatique
// Taux de présence = (present + late) / total * 100
```

#### `courses-data.ts` (3 clés)

```typescript
CourseData {
  id: string; name: string; teacher: string (nom, pas FK)
  filiere: Filiere; annee: Annee; option?: OptionLIC
  hours: number; progress: number (0-100); students: number
  semester: 'S1'|'S2'|'S3'|'S4'|'S5'|'S6'; description?: string
}
// 41 cours seedés couvrant LIC L1, L2, L3-GL, L3-SR, LAP L1, L2, L3

Lesson {
  id: string; courseId: string (FK→Course.id)
  title: string; type: 'video'|'document'|'quiz'|'exam'
  duration: string; file_url?: string
  completed: boolean; locked: boolean; order: number
  quizQuestions?: QuizQuestion[]
}
// 34 leçons seedées sur 3 cours (lic-l2-1, lic-l2-2, lap-l1-1)
```


#### Stores secondaires

```typescript
// elearning-store.ts
LessonProgress { id, student_id(FK), lesson_id(FK), course_id(FK),
                 completed, score?(0-100), completed_at? }
// Unicité sur (student_id, lesson_id) via find+update

// announcements-store.ts
Announcement { id, title, content, author(string, pas FK), priority('normal'|'important'|'urgent'),
               target_role?, created_at, pinned }
// Filtre par target_role ('all' | Role)

// schedule-store.ts
ScheduleEntry { id, day, hour, subject, room, teacher(string, pas FK),
                filiere, annee, option?, color(classe CSS Tailwind) }
// 42 entrées seedées couvrant LIC L1/L2/L3-GL/L3-SR et LAP L1/L2/L3

// semester-store.ts
Semester { id, name, year('2024-2025'), start_date, end_date, is_active, type(SemesterCode) }
// SemesterCode: 'S1'|'S2'|'S3'|'S4'|'S5'|'S6' — 6 semestres seedés pour 2024-2025

// notifications.ts
Notification { id, type('annonce'|'note'|'paiement'|'systeme'|'cours'),
               title, message, date, read, target_role?, target_user_id? }
// Filtre : target_user_id (exact) OU target_role (exact ou 'all')

// messages-store.ts
Message { id, from_id(FK), from_name, to_id(FK), to_name, subject, body, read, date }

// community-store.ts
CommunityPost { id, author_id(FK), author_name, content, date, likes: string[] /* user_ids */ }

// forum-store.ts
ForumPost { id, course_id('general'|courseId), author_id, author_name,
            title, content, date, replies: ForumReply[], pinned }
ForumReply  { id, author_id, author_name, content, date, replies?: ForumReply[] }
// Imbrication 1 niveau max (réponse à une réponse)

// library-store.ts
LibraryItem { id, title, author, category('book'|'article'|'thesis'|'guide'|'manual'),
              filiere?, description, file_type('pdf'|'doc'|'video'), size, downloads, added_at, added_by(nom) }

// documents-store.ts
DocumentRequest { id, student_id(FK), student_name, type(4 types), status(4 états),
                  requested_at, processed_at?, processed_by?, notes? }
// document-templates.ts : génère HTML complet (print/PDF) côté client

// events-store.ts
CalendarEvent { id, title, description, date, time?, type('exam'|'deadline'|'event'|'holiday'|'meeting'),
                target_role?, created_by? }

// audit-store.ts
AuditEntry { id, user_id, user_name, action, details, timestamp,
             category('auth'|'user'|'payment'|'code'|'document'|'system'|'grade') }
// Limité à 500 entrées (FIFO)
```

### Problèmes détectés dans les stores

| Problème | Store | Impact |
|----------|-------|--------|
| `teacher`, `author`, `added_by` sont des strings (noms) au lieu de FKs | schedule, announcements, library, courses | Pas de référencement cohérent, pas de mise à jour en cascade |
| `Payment` (cfi_payments) et `PaymentRecord` (cfi_payment_records) coexistent sans lien clair | store.ts + payment-store.ts | Confusion métier, duplication |
| `GradeEntry.student_name` et `course_name` dénormalisés | grades-store | Risque d'incohérence si l'étudiant/cours est renommé |
| `CommunityPost.likes` est un tableau d'IDs dans le même objet | community-store | Non scalable, pas de table pivot |
| `ForumPost.replies` est une liste imbriquée dans l'objet | forum-store | Pas de pagination, performances O(n) |
| Audit log limité à 500 entrées en mémoire (FIFO) | audit-store | Perte de traçabilité |
| `initializeStore()` est `async` (SHA-256) mais certains stores `initialize*()` ne le sont pas | store.ts | Race condition possible au démarrage |


---

## 2. Failles de sécurité

> Tâche 1.2 — Inventaire complet des failles identifiées.

### 🔴 CRITIQUES

#### SEC-01 — Hachage SHA-256 côté client (store.ts)

```typescript
// store.ts — hashPassword()
export async function hashPassword(plain: string): Promise<string> {
    const buffer = await crypto.subtle.digest('SHA-256', encoded);
    // ...
}
```

**Problème :** SHA-256 sans sel, sans coût adaptable. Un hash de 64 caractères hex est transmis tel quel au "serveur" (localStorage). SHA-256 est cassable en quelques secondes avec des tables arc-en-ciel précalculées. Bcrypt/Argon2 sont les seules options acceptables pour les mots de passe.

**Vecteur :** Tout attaquant qui lit localStorage voit directement le hash, qui est fonctionnellement équivalent au mot de passe pour s'authentifier dans l'app actuelle (le hash est comparé directement).

#### SEC-02 — Données sensibles en clair dans localStorage

Les clés suivantes contiennent des données à ne jamais exposer côté client :

| Clé | Données sensibles |
|-----|-------------------|
| `cfi_users` | Emails, hash de mots de passe, rôles, statuts de blocage |
| `cfi_current_user` | Profil complet de l'utilisateur connecté dont le hash du mot de passe |
| `cfi_payment_records` | Historique financier complet de tous les étudiants |
| `cfi_grades` | Notes de tous les étudiants (brouillons et publiées) |
| `cfi_concours_codes` | Codes d'accès (encore valides ou non) |
| `cfi_validation_codes` | Codes externes avec dates d'expiration |
| `cfi_payment_codes` | Codes de paiement par étudiant |
| `cfi_audit_log` | Journal d'activité interne |

**Vecteur XSS :** tout script injecté dans la page lit l'intégralité de ces données avec `localStorage.getItem()`.

#### SEC-03 — Aucune isolation entre utilisateurs

Tous les utilisateurs d'une même machine partagent le même localStorage. Un étudiant qui se déconnecte laisse toutes les données en clair pour l'utilisateur suivant. Il n'y a aucun mécanisme de purge au logout (seul `cfi_current_user` est effacé).

#### SEC-04 — Absence totale de validation côté serveur

Le backend Laravel n'a qu'une seule route. Toute la validation des formulaires est faite en React. Un appel direct à l'API (Postman, curl) ignore toutes les règles métier.

#### SEC-05 — Token Sanctum inutilisé

Laravel Sanctum est installé mais la seule route existante (`/api/user`) n'est appelée nulle part dans le frontend. L'authentification est 100% localStorage.

### 🟠 HAUTES

#### SEC-06 — Pas de politique de mots de passe

Aucune règle de complexité n'est appliquée côté frontend ni backend. N'importe quel mot de passe est accepté.

#### SEC-07 — Pas de rate limiting sur l'authentification

Aucun mécanisme anti-brute-force. La fonction `login()` côté frontend ne limite pas les tentatives.

#### SEC-08 — Absence de CSRF/CORS configuré

`config/cors.php` n'existe pas dans le projet. Laravel utilise les valeurs par défaut (tous les domaines autorisés en dev, mais non configuré pour la prod).

#### SEC-09 — `crypto.randomUUID()` pour les IDs

`crypto.randomUUID()` est généré côté client. En production avec un backend, les IDs doivent être générés par le serveur pour garantir l'unicité et l'intégrité.

#### SEC-10 — `appId` Capacitor non personnalisé

```typescript
// capacitor.config.ts
appId: 'io.ionic.starter'  // Valeur par défaut Ionic, doit être changé
```

Utiliser l'ID générique Ionic peut causer des conflits sur les stores iOS/Android.

### 🟡 MOYENNES

#### SEC-11 — Génération des documents PDF côté client

`document-templates.ts` génère les documents officiels (attestations, relevés de notes) entièrement en HTML côté client. N'importe qui peut modifier les données dans localStorage et générer un faux document officiel.

#### SEC-12 — `window.open()` pour impression sans sandbox

`printDocument()` et `downloadDocumentAsPdf()` ouvrent un `window.open('', '_blank')` et injectent du HTML dynamique. Si ce HTML contenait du contenu utilisateur non-échappé, cela créerait une faille XSS.


---

## 3. Routes frontend et guards de rôles

> Tâche 1.3 — Inventaire de toutes les routes React Router et vérification des guards.

### Architecture de routage

Le routage est géré dans `App.tsx` avec trois niveaux :

1. **Routes publiques** — `AppRoutes` : `/landing`, `/login`, `/register`
2. **Redirect racine** — `/` → `/dashboard` si connecté, sinon `/landing`
3. **Routes protégées** — `ProtectedApp` (wrappé dans `ProtectedRoute`)

`ProtectedRoute` lit `user` depuis `useAuth()` (qui lit `cfi_current_user` depuis localStorage).

### Tableau complet des routes

| Route | Page | Guard | Rôles autorisés | Problèmes |
|-------|------|-------|-----------------|-----------|
| `/landing` | `Landing` | Aucun | Tous | — |
| `/login` | `Login` | Redirect si connecté | — | — |
| `/register` | `Register` | Redirect si connecté | — | — |
| `/dashboard` | `Dashboard` | `ProtectedRoute` | Tous les rôles connectés | — |
| `/courses` | `Courses` | `ProtectedRoute` | Tous | — |
| `/courses/:id` | `CourseDetail` | `ProtectedRoute` | Tous | — |
| `/elearning` | `ELearning` | `ProtectedRoute` | Tous | ⚠️ Staff/Admin n'ont pas de cours |
| `/schedule` | `Schedule` | `ProtectedRoute` | Tous | — |
| `/library` | `Library` | `ProtectedRoute` | Tous | — |
| `/messages` | `Messages` | `ProtectedRoute` | Tous | — |
| `/calendar` | `CalendarPage` | `ProtectedRoute` | Tous | — |
| `/documents` | `Documents` | `ProtectedRoute` | Tous | — |
| `/settings` | `Settings` | `ProtectedRoute` | Tous | — |
| `/grades` | `Grades` | `ProtectedRoute` | `etudiant_*`, `professeur` | ⚠️ Admin exclu mais peut avoir besoin d'y accéder |
| `/attendance` | `Attendance` | `ProtectedRoute` | `etudiant_*`, `professeur` | — |
| `/forum` | `Forum` | `ProtectedRoute` | `etudiant_*`, `professeur` | ⚠️ Staff exclu |
| `/community` | `Community` | `ProtectedRoute` | `etudiant_*` seulement | ⚠️ Profs exclus |
| `/payments` | `Payments` | `ProtectedRoute` | Tous | ⚠️ Non-étudiants n'ont pas de paiements |
| `/announcements` | `Announcements` | `ProtectedRoute` | Tous | — |
| `/admin/users` | `ManageUsers` | `ProtectedRoute` | `super_admin`, `admin` | ✅ |
| `/admin/codes` | `ManageCodes` | `ProtectedRoute` | `super_admin`, `admin` | ✅ |
| `/admin/payments` | `ManagePayments` | `ProtectedRoute` | `super_admin`, `admin` | ⚠️ Comptable exclu |
| `/admin/semesters` | `ManageSemesters` | `ProtectedRoute` | `super_admin`, `admin` | ✅ |
| `/admin/stats` | `AdminStats` | `ProtectedRoute` | `super_admin`, `admin` | ✅ |
| `/admin/audit` | `AuditLog` | `ProtectedRoute` | `super_admin`, `admin` | ✅ |

### Problèmes de cohérence des guards

| # | Problème | Route concernée |
|---|----------|-----------------|
| G-01 | Le `membre_administratif` de type `comptable` n'a pas accès à `/admin/payments` alors que c'est son rôle principal | `/admin/payments` |
| G-02 | `/elearning`, `/schedule`, `/library` sont accessibles à tous sans filtrage par rôle, y compris admin et staff qui n'ont pas de cursus académique | Plusieurs |
| G-03 | `/payments` est accessible à tous les rôles connectés, alors que seuls les étudiants ont des paiements de scolarité | `/payments` |
| G-04 | `/community` exclut les professeurs mais le forum non — incohérence sur la participation communautaire | `/community` |
| G-05 | Les routes admin redirigent vers `/dashboard` si le rôle est insuffisant (pas de 403 clair) | Toutes `/admin/*` |
| G-06 | `ProtectedRoute.allowedRoles` est optionnel : si omis, tous les rôles passent. Risque d'oubli. | Architecture |

### `useAuth` hook

`useAuth()` lit `cfi_current_user` depuis localStorage via `AuthProvider`. L'état `loading` est `true` pendant 1 tick (useEffect asynchrone), ce qui cause un flash de redirection au chargement.


---

## 4. Inventaire des composants partagés

> Tâche 1.4 — Composants de `src/components/`, duplications et responsabilités.

### Composants principaux

| Composant | Rôle | Dépendances clés | Problèmes |
|-----------|------|-----------------|-----------|
| `DashboardLayout.tsx` | Layout wrapper pour toutes les pages internes. Header inline, notifications, avatar, PaymentBlockedOverlay, OnboardingModal | `useAuth`, `NotificationPanel`, `PaymentBlockedOverlay`, `OnboardingModal` | `cfi_avatar_color` lu depuis localStorage directement (hors store) |
| `SideMenu.tsx` | Menu latéral accordion avec navigation par modules | `useAuth`, `getNavModules()`, `useHistory` | Menu calculé avec `useMemo` sur `user.role` — bien optimisé |
| `ProtectedRoute.tsx` | Guard de route avec `allowedRoles?` | `useAuth` | Flash spinner visible 1 tick au chargement |
| `NotificationsPanel.tsx` | Popover de notifications avec skeleton, marquage lu/suppression | `notifications.ts`, `useAuth`, `useToast` | Polling toutes les 300ms à l'ouverture du popover (setTimeout) — pas de temps réel |
| `PaymentBlockedOverlay.tsx` | Modal bloquante si `user.payment_blocked` | `validatePaymentCode`, `useAuth.refreshUser` | Appelle `validatePaymentCode` depuis `store.ts` — couplage direct localStorage |
| `OnboardingModal.tsx` | Modal first-run pour les nouveaux utilisateurs | localStorage (`cfi_onboarding_done`) | Clé localStorage non documentée dans l'audit |
| `ThemeProvider.tsx` | Gestion du thème clair/sombre | localStorage (clé non auditée) | Clé localStorage non documentée |
| `ThemeToggle.tsx` | Bouton bascule thème | `ThemeProvider` | — |
| `NavLink.tsx` | Lien de navigation stylisé | — | — |
| `NotFound.tsx` | Page 404 | — | — |

### Composants UI (`components/ui/`)

| Composant | Rôle | Observations |
|-----------|------|-------------|
| `Alert.tsx` | Bannière d'alerte (danger/warning/info/success) avec dismiss | Bien générique, utilisé partout |
| `AlertDialog.tsx` | Dialog de confirmation modale | — |
| `Avatar.tsx` | Avatar utilisateur avec initiales / couleur | — |
| `Badge.tsx` | Badge coloré (pill, sizes) | Variants : default/success/warning/danger/info/secondary |
| `Calendar.tsx` | Calendrier mensuel custom (pas de lib externe) | Complexe, ~300 lignes |
| `Card.tsx` | Conteneur carte avec header/content/footer | Variants : default/flat/outlined/elevated/ghost |
| `Popover.tsx` | Popover positionné (custom, pas IonPopover) | — |
| `Skeleton.tsx` | Skeletons de chargement (texte, avatar, carte) | Bien implémenté |

### Duplications de logique identifiées

| # | Duplication | Localisation |
|---|-------------|-------------|
| D-01 | La logique de formatage de date relative (`timeAgo`) est réimplémentée dans `NotificationsPanel.tsx`. Elle devrait être dans un hook `useTimeAgo` ou un utilitaire partagé | `NotificationsPanel.tsx` |
| D-02 | Le pattern `getAll() → saveAll()` est répété identiquement dans les 18 stores. Un `createStore<T>(key)` générique réduirait la duplication | Tous les stores |
| D-03 | La récupération de `user` depuis localStorage + vérification `payment_blocked` est faite à plusieurs endroits (DashboardLayout, PaymentBlockedOverlay, ProtectedRoute) | 3 composants |
| D-04 | Le composant `Card` de `components/ui` et `IonCard` d'Ionic sont utilisés de manière interchangeable selon les pages | Multiple pages |
| D-05 | Plusieurs stores dupliquent les constantes `STATUS_LABELS`, `CATEGORY_LABELS` sans utilitaire centralisé | attendance, audit, documents, library, events |


---

## 5. Évaluation des performances

> Tâche 1.5 — Bundle Vite, lazy loading, images, optimisations.

### Configuration Vite

```typescript
// vite.config.ts
plugins: [react(), legacy()]
// Pas de rollupOptions.output.manualChunks → 1 seul bundle JS
// legacy() ajoute un bundle ES5 de polyfills pour navigateurs anciens
```

**Problèmes identifiés :**

| # | Problème | Impact |
|---|----------|--------|
| P-01 | **Pas de code splitting** : tous les imports de pages sont statiques dans `App.tsx`. L'intégralité de l'app (42 pages + composants) est chargée au premier load | Bundle initial lourd (~800 KB+ estimé avec Ionic) |
| P-02 | **@vitejs/plugin-legacy** génère un bundle ES5 supplémentaire. Sur mobile moderne (Capacitor + WebView Android/iOS >= 2020), ce bundle est inutile mais toujours téléchargé | +10-30% taille bundle |
| P-03 | **Ionic importé via un barrel file** (`lib/ionic.ts`) qui réexporte tout. Tree-shaking partiellement inefficace si certains imports ne sont pas utilisés | Taille bundle |
| P-04 | **Pas de lazy loading des images** : les icônes Ionicons sont inlinées comme SVG, mais les éventuelles images (Landing, hero) ne sont pas `loading="lazy"` | Chargement initial |
| P-05 | **initializeCourseStore() seede 41 cours + 34 leçons** (données statiques en dur). Ces données pourraient être en import statique JSON au lieu d'être sérialisées/désérialisées en localStorage à chaque appel | Performance lecture |
| P-06 | **Pas de memoïsation** dans plusieurs pages qui recalculent des listes filtrées à chaque render (sans `useMemo`) | Rendu UI |
| P-07 | **Forum imbriqué non paginé** : `getRecentPosts(limit=20)` mais les replies sont toujours chargées en entier dans chaque post | Mémoire |

### Recommandations

```typescript
// App.tsx — Ajouter le lazy loading des pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AdminStats = React.lazy(() => import('./pages/admin/AdminStats'));
// etc.

// Wrapper avec Suspense
<Suspense fallback={<IonSpinner />}>
    <Dashboard />
</Suspense>
```

```typescript
// vite.config.ts — Code splitting manuel
build: {
    rollupOptions: {
        output: {
            manualChunks: {
                'ionic': ['@ionic/react', '@ionic/react-router'],
                'admin': ['./src/pages/admin/AdminStats', ...],
            }
        }
    }
}
```

---

## 6. Compatibilité Capacitor iOS/Android

> Tâche 1.6 — APIs web et comportements spécifiques au runtime natif.

### Configuration actuelle

```typescript
// capacitor.config.ts
{ appId: 'io.ionic.starter',  // ⚠️ À changer
  appName: 'CFI-LINK',
  webDir: 'dist' }
// Pas de server.url → app chargée depuis le filesystem (dist/)
// Pas de plugins Capacitor configurés (Camera, Filesystem, etc.)
```

### Analyse par API utilisée

| API | Utilisée dans | Compatibilité WebView | Risque |
|-----|---------------|----------------------|--------|
| `localStorage` | 18 stores | ✅ Android + iOS | ⚠️ Peut être vidé par le système Android si espace insuffisant |
| `crypto.randomUUID()` | Tous les stores | ✅ Android 92+ / iOS 15.4+ | ⚠️ Versions WebView < 92 (vieux Android) : non disponible |
| `crypto.subtle.digest()` (SHA-256) | `store.ts` | ✅ Secure context requis | ✅ Capacitor = secure context par défaut |
| `window.open('', '_blank')` | `document-templates.ts` | ❌ Bloqué sur iOS WebView | 🔴 L'impression/téléchargement PDF ne fonctionnera pas sur mobile |
| `IonPopover.event` | `NotificationsPanel` | ✅ | — |
| `JSON.parse/stringify` | Tous stores | ✅ | — |
| `Date.toLocaleDateString('fr-FR')` | Plusieurs pages | ✅ Android + iOS | ⚠️ Locale `fr-FR` peut ne pas être disponible sur tous les WebViews Android |
| `import()` dynamique | `store.ts` (notifications) | ✅ | — |

### Problèmes spécifiques mobile

| # | Problème | Sévérité |
|---|----------|---------|
| CAP-01 | `window.open('', '_blank')` pour PDF bloqué sur iOS WKWebView. Remplacer par Capacitor `Share` plugin ou `@capacitor/filesystem` | 🔴 Bloquant |
| CAP-02 | `crypto.randomUUID()` non disponible sur Android WebView < 92 (Android 8-9 encore utilisés au Cameroun). Ajouter un polyfill ou fallback `Math.random()` | 🟠 Important |
| CAP-03 | localStorage peut être effacé sur Android en mode "économie de stockage". Utiliser `@capacitor/preferences` (wrapper natif) à la place de localStorage brut | 🟠 Important |
| CAP-04 | `appId: 'io.ionic.starter'` doit être changé en `org.cficiras.cfilink` (ou similaire) avant tout déploiement sur les stores | 🔴 Bloquant pour publish |
| CAP-05 | L'URL de l'API Laravel (localhost:8000) sera inaccessible depuis l'émulateur Android/iOS. Configurer `server.url` dans `capacitor.config.ts` avec l'IP locale ou le domaine | 🔴 Bloquant pour test mobile |
| CAP-06 | Cookies HttpOnly Sanctum (SPA mode) non supportés dans WKWebView iOS. Préférer les **token API** (Bearer token) pour le mode mobile | 🟠 Important |
| CAP-07 | `Date.toLocaleDateString('fr-FR')` : la locale française peut manquer sur certains Android. Utiliser `date-fns` avec la locale FR en import explicite | 🟡 Moyen |


---

## 7. TODO/FIXME dans le code source

> Tâche 1.7 — Relevé de tous les commentaires d'intention non résolus.

### Commentaires identifiés dans le code

| # | Fichier | Ligne approx. | Commentaire | Criticité |
|---|---------|---------------|-------------|-----------|
| T-01 | `store.ts` | Autour de `validatePaymentCode` | Import dynamique `import('./notifications')` utilisé pour éviter la dépendance circulaire entre `store.ts` et `notifications.ts` | 🟠 Architecture — la dépendance circulaire devra être résolue proprement lors de la migration |
| T-02 | `payment-store.ts` | `createPaymentRecord` | `status: data.method === 'cash' ? 'pending' : 'pending'` — code mort, les deux branches retournent `'pending'`. La logique de statut initial n'est pas différenciée selon la méthode de paiement | 🟡 Qualité |
| T-03 | `courses-data.ts` | Fin du fichier | `export const allCoursesData = SEED_COURSES;` marqué `/* Keep backward-compatible export */` — export legacy à supprimer | 🟢 Nettoyage |
| T-04 | `semester-store.ts` | `SEED_KEY = 'cfi_semesters_v2'` | Commentaire `// bump version → force re-seed si déjà initialisé` — pattern de migration fragile, à remplacer par de vraies migrations Laravel | 🟡 Architecture |
| T-05 | `audit-store.ts` | `logAction` | `// Keep only last 500 entries` — limite arbitraire codée en dur, à externaliser en config | 🟢 Nettoyage |
| T-06 | `App.tsx` | `AppErrorBoundary` | Classe `React.Component` utilisée (pas de hook) — seule façon valide pour les Error Boundaries en React 19, pas un problème | ✅ OK |
| T-07 | `messages-store.ts` | `initializeMessages` | `// Seed messages will be created after store init with actual user IDs` — fonction vide, les messages de démo ne sont jamais seedés | 🟡 UX |
| T-08 | `capacitor.config.ts` | — | `appId: 'io.ionic.starter'` — valeur par défaut non changée | 🔴 Critique pour déploiement |
| T-09 | `store.ts` | `login()` | `// fallback for unmigrated` — code de migration legacy toujours présent. À nettoyer une fois toutes les instances migrées | 🟢 Nettoyage |
| T-10 | `App.tsx` | Route `/community` | Commentaire `// Redrection admin` (faute d'orthographe "Redrection" au lieu de "Redirection") | 🟢 Cosmétique |

### Clés localStorage non documentées dans les stores

Ces clés sont utilisées directement dans des composants sans passer par un store centralisé :

| Clé | Utilisée dans | Valeur |
|-----|--------------|--------|
| `cfi_avatar_color` | `DashboardLayout.tsx`, `SideMenu.tsx` | string hex de couleur |
| `cfi_onboarding_done` | `OnboardingModal.tsx` (à confirmer) | boolean |
| Clé thème | `ThemeProvider.tsx` (à confirmer) | `'dark'` ou `'light'` |

Ces clés sont des préférences UI légitimes à garder côté client, mais elles doivent être documentées.


---

## 8. Architecture actuelle — Flux de données

> Tâche 1.8 — Diagramme des flux de données et relations entre stores.

### Diagramme de l'architecture actuelle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React + Ionic)                       │
│                                                                         │
│  ┌─────────────┐   useAuth()   ┌──────────────────────────────────────┐ │
│  │  AuthProvider│ ◄──────────► │  store.ts (cfi_users, cfi_current_   │ │
│  │  (Context)   │              │  user, codes, payments, initialized)  │ │
│  └──────┬───────┘              └──────────────┬───────────────────────┘ │
│         │                                     │ dépendance circulaire   │
│         │                                     ▼                         │
│  ┌──────▼──────────────────────────────────────────────────────────┐    │
│  │                      PAGES & COMPOSANTS                         │    │
│  │                                                                 │    │
│  │  Dashboard ──► store.ts, grades-store, payment-store           │    │
│  │  Grades    ──► grades-store ──► notifications.ts               │    │
│  │  Payments  ──► payment-store + store.ts(PaymentCodes)          │    │
│  │  Attendance──► attendance-store ──► notifications.ts           │    │
│  │  Courses   ──► courses-data.ts                                 │    │
│  │  ELearning ──► courses-data.ts + elearning-store               │    │
│  │  Schedule  ──► schedule-store + store.ts (Filiere)             │    │
│  │  Announcements ► announcements-store + notifications.ts        │    │
│  │  Messages  ──► messages-store                                  │    │
│  │  Documents ──► documents-store + document-templates.ts         │    │
│  │  Library   ──► library-store                                   │    │
│  │  Community ──► community-store                                 │    │
│  │  Forum     ──► forum-store                                     │    │
│  │  Calendar  ──► events-store                                    │    │
│  │  AuditLog  ──► audit-store                                     │    │
│  │  AdminStats──► TOUS les stores (lecture agrégée)               │    │
│  │                                                                 │    │
│  │  PaymentBlockedOverlay ──► store.ts(validatePaymentCode)       │    │
│  │  NotificationsPanel    ──► notifications.ts                    │    │
│  └─────────────────────────────────────────┬───────────────────────┘    │
│                                            │                            │
│                         ┌──────────────────▼────────────────────────┐  │
│                         │           localStorage (navigateur)        │  │
│                         │  26 clés distinctes — ~5 MB max            │  │
│                         │  Aucune isolation utilisateur              │  │
│                         │  Données sensibles en clair                │  │
│                         └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ AUCUNE COMMUNICATION
                                      │ (pas d'appel API)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     BACKEND Laravel (inutilisé)                         │
│                                                                         │
│  routes/api.php : 1 seule route GET /api/user (auth:sanctum)           │
│  Models : User (name, email, password seulement)                        │
│  Migrations : users, cache, jobs, personal_access_tokens               │
│  Controllers : aucun (hors Controller.php vide)                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Relations entre stores (graphe de dépendances)

```
store.ts (central)
    ├── notifications.ts    ← import dynamique (évite dépendance circulaire)
    ├── utilisé par → grades-store.ts
    ├── utilisé par → attendance-store.ts
    ├── utilisé par → schedule-store.ts (types Filiere, Annee, OptionLIC)
    ├── utilisé par → courses-data.ts (types Filiere, Annee, OptionLIC)
    └── utilisé par → document-templates.ts (types User, FILIERE_LABELS)

notifications.ts
    ├── importé par → grades-store.ts (publication notes)
    ├── importé par → attendance-store.ts (absence enregistrée)
    └── importé par → store.ts (validation code paiement) → import dynamique

grades-store.ts
    ├── importé par → document-templates.ts (releveNotes)
    └── dépend → notifications.ts

document-templates.ts
    ├── dépend → store.ts (User, FILIERE_LABELS)
    └── dépend → grades-store.ts (GradeEntry, calculs)

Stores indépendants (pas de dépendances inter-stores) :
  payment-store.ts, elearning-store.ts, announcements-store.ts,
  semester-store.ts, messages-store.ts, community-store.ts,
  forum-store.ts, library-store.ts, documents-store.ts,
  events-store.ts, audit-store.ts
```

### Architecture cible après migration

```
┌───────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Ionic)                         │
│                                                                       │
│  AuthContext ──────────────────────────────────────────────────────  │
│  (token Bearer en mémoire / cookie HttpOnly pour web)                │
│                                                                       │
│  TanStack Query (React Query v5)                                     │
│  ├── useQuery('grades')       ──► GET /api/grades                    │
│  ├── useQuery('payments')     ──► GET /api/payments                  │
│  ├── useQuery('attendance')   ──► GET /api/attendance                │
│  ├── useQuery('courses')      ──► GET /api/courses                   │
│  ├── useQuery('notifications')──► GET /api/notifications             │
│  └── ... (1 hook par domaine)                                        │
│                                                                       │
│  localStorage — uniquement pour :                                    │
│  ├── cfi_avatar_color (préférence UI)                                │
│  ├── cfi_theme (dark/light)                                          │
│  └── cfi_onboarding_done (first-run)                                 │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ Axios + Sanctum Bearer
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       BACKEND Laravel                                │
│                                                                      │
│  Auth : POST /api/login, /api/logout, /api/register, /api/me        │
│  Users : GET/POST/PUT/DELETE /api/users                              │
│  Codes : GET/POST /api/codes/concours, /api/codes/validation        │
│  Grades : GET/POST/PUT /api/grades, /api/grades/publish             │
│  Payments : GET/POST /api/payments, /api/payments/{id}/confirm      │
│  Attendance : GET/POST/PUT /api/attendance                           │
│  Courses + Lessons : GET/POST/PUT/DELETE /api/courses, /api/lessons │
│  Semesters : GET/POST/PUT /api/semesters                            │
│  Schedule : GET/POST/PUT/DELETE /api/schedule                       │
│  Announcements : GET/POST/DELETE /api/announcements                 │
│  Notifications : GET/PUT /api/notifications                         │
│  Messages : GET/POST /api/messages                                  │
│  Documents : GET/POST/PUT /api/document-requests                    │
│  Library : GET/POST/DELETE /api/library                             │
│  Events : GET/POST/DELETE /api/events                               │
│  Community : GET/POST/DELETE /api/community                         │
│  Forum : GET/POST /api/forum, /api/forum/{id}/replies               │
│  Audit : GET /api/audit-logs                                        │
│                                                                      │
│  Base de données : MySQL / PostgreSQL (prod)                         │
│  Cache : Redis (notifications temps réel)                            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Résumé exécutif

| Dimension | État actuel | Priorité de correction |
|-----------|-------------|----------------------|
| **Sécurité** | Critique — SHA-256 client, données sensibles localStorage, 0 validation serveur | 🔴 Immédiate |
| **Backend** | Quasi inexistant — 1 route, modèle User incomplet | 🔴 Immédiate |
| **Performance** | Pas de code splitting, bundle monolithique, 0 lazy loading | 🟠 Court terme |
| **Architecture** | Dépendances circulaires, stores non normalisés, seed côté client | 🟠 Court terme |
| **Compatibilité mobile** | `window.open` bloqué iOS, `crypto.randomUUID` manquant vieux Android, appId non changé | 🟠 Avant déploiement |
| **Qualité code** | Bugs corrigés (SHA-256, async/await), quelques TODO restants, 0 tests | 🟡 Moyen terme |
| **Fonctionnel** | 100% opérationnel en mode démo localStorage | ✅ Fonctionnel |

> L'application est **complète fonctionnellement** pour une démonstration. La migration vers le backend doit commencer par la Phase 1 (authentification + infrastructure) définie dans le TODO.md avant d'exposer l'application à de vrais utilisateurs.
