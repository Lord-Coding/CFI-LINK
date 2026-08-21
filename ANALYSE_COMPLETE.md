# ANALYSE COMPLÈTE — CFI-LINK

> Document mis à jour après la migration complète vers Laravel + MySQL.
> Dernière mise à jour : Août 2026

---

## Table des matières

1. [Architecture actuelle](#1-architecture-actuelle)
2. [Base de données MySQL](#2-base-de-données-mysql)
3. [Backend Laravel — État des routes et controllers](#3-backend-laravel)
4. [Frontend React/Ionic — État post-migration](#4-frontend)
5. [Sécurité — Bilan](#5-sécurité--bilan)
6. [Routes frontend et guards de rôles](#6-routes-frontend-et-guards-de-rôles)
7. [Composants partagés](#7-composants-partagés)
8. [Performances](#8-performances)
9. [Compatibilité Capacitor iOS/Android](#9-compatibilité-capacitor-iosandroid)
10. [Problèmes résolus vs restants](#10-problèmes-résolus-vs-restants)

---

## 1. Architecture actuelle

L'application est **entièrement migrée** vers une architecture client-serveur réelle.
Plus aucune donnée sensible n'est stockée dans localStorage.

```
┌────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19 + Ionic 8)                   │
│                                                                    │
│  AuthContext (token Bearer en sessionStorage)                      │
│  TanStack Query v5 — cache + pagination                            │
│  18 services TypeScript → src/lib/services/                        │
│  Laravel Echo + Reverb → notifications temps réel                  │
│                                                                    │
│  localStorage : cfi_avatar_color, cfi_theme (prefs UI seulement)  │
└────────────────────┬───────────────────────────────────────────────┘
                     │ Axios + Bearer Token (Sanctum)
                     │ HTTPS en production
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│               BACKEND Laravel 13 + MySQL 8                         │
│                                                                    │
│  ~65 routes API REST (auth, users, courses, grades, payments…)     │
│  Sanctum : Bearer token + cookie SPA                               │
│  Reverb WebSocket : notifications temps réel                       │
│  Rate limiting sur auth (throttle:10,1 / throttle:5,1)             │
│  Logs : daily rotation 30j + Slack alerts (prod)                   │
│  Pagination : paginate() dans 7 controllers                        │
│                                                                    │
│  DB : cfi_link_db (MySQL) — 24 tables, ~750 enregistrements seed   │
└────────────────────────────────────────────────────────────────────┘
```

---

## 2. Base de données MySQL

**Base** : `cfi_link_db` · **24 tables** · **Moteur** : InnoDB · **Charset** : utf8mb4

### Tables et données seedées

| Table | Rows seedés | Description |
|-------|------------|-------------|
| `users` | 9 | Super admin, directeur, 2 profs, 1 staff, 4 étudiants |
| `concours_codes` | 3 | 2 utilisés, 1 disponible |
| `validation_codes` | 2 | 1 utilisé, 1 disponible |
| `semesters` | 6 | S1→S6, année 2024-2025, S1 actif |
| `courses` | 41 | LIC L1/L2/L3-GL/L3-SR + LAP L1/L2/L3 |
| `lessons` | 25 | Sur 3 cours (algo, BDD, droit admin) |
| `schedule_entries` | 37 | Emplois du temps toutes filières |
| `announcements` | 4 | 2 pinned, 1 urgente, 1 profs |
| `library_items` | 12 | Livres, mémoires, articles, guides |
| `payment_records` | 0 | Alimenté au runtime |
| `grades` | 0 | Alimenté par les professeurs |
| `attendance_records` | 0 | Marqué par les professeurs |
| `notifications` | 0 | Créées par les actions métier |
| `audit_logs` | 0 | Historique des actions |
| `messages` | 0 | Messagerie interne |
| `community_posts` | 0 | Fil communauté |
| `forum_posts` / `forum_replies` | 0 | Forum académique |
| `document_requests` | 0 | Demandes d'attestations |
| `calendar_events` | 0 | Événements |

### Relations clés

```
users (1) ──── (N) grades              [student_id + created_by]
users (1) ──── (N) attendance_records  [student_id + marked_by]
users (1) ──── (N) payment_records     [student_id]
courses (1) ── (N) lessons             [course_id]
courses (1) ── (N) grades              [course_id]
courses (1) ── (N) attendance_records  [course_id]
users (1) ──── (N) notifications       [user_id]
```

### Ordre de migration

Les migrations sont exécutées dans cet ordre (noms de fichiers) :
1. `0001_01_01_000000` — users, sessions, password_resets
2. `0001_01_01_000001` — cache
3. `0001_01_01_000002` — jobs
4. `2026_08_08_021352` — personal_access_tokens
5. `2026_08_08_100000` — concours_codes
6. `2026_08_08_100001` — validation_codes
7. `2026_08_08_100002` — payment_codes, payment_records
8. **`2026_08_08_100003`** — courses, lessons, lesson_progress ← renommé
9. `2026_08_08_100006` — semesters
10. `2026_08_08_100007` — schedule_entries
11. `2026_08_08_100008` — announcements, notifications, messages, document_requests, library_items, calendar_events, community_posts, forum_posts, forum_replies, audit_logs
12. **`2026_08_08_100010`** — grades ← dépend de courses
13. **`2026_08_08_100011`** — attendance_records ← dépend de courses
14. `2026_08_08_200000` — password_reset_codes

---

## 3. Backend Laravel

### Seeders

| Seeder | Données |
|--------|---------|
| `DatabaseSeeder` | Users, ConcoursCode, ValidationCode, Semester + appelle les 4 suivants |
| `CourseSeeder` | 41 cours + 25 leçons avec quiz |
| `ScheduleSeeder` | 37 entrées d'emploi du temps |
| `AnnouncementSeeder` | 4 annonces |
| `LibrarySeeder` | 12 éléments bibliothèque |

### Routes API (~65 routes)

```
POST   /api/login                   throttle:10,1
POST   /api/register                throttle:5,1
POST   /api/password/forgot         throttle:5,1
POST   /api/password/verify         throttle:10,1
POST   /api/password/reset          throttle:5,1

--- auth:sanctum ---
POST   /api/broadcasting/auth
GET    /api/me
POST   /api/logout
GET/POST/PUT/DELETE /api/users
GET/POST/DELETE     /api/codes/concours
GET/POST/DELETE     /api/codes/validation
GET/POST            /api/payments  + confirm/reject
GET/POST            /api/payment-codes + validate
GET/PUT/POST        /api/grades    + publish/unpublish
GET/POST            /api/attendance/upsert + stats
GET/POST/PUT/DELETE /api/courses + lessons + progress
GET/POST/PUT/DELETE /api/semesters + activate
GET/POST/PUT/DELETE /api/schedule
GET/POST/PUT/DELETE /api/announcements
GET/PATCH/DELETE    /api/notifications
GET/POST/PATCH/DELETE /api/messages (inbox + sent)
GET/POST/PATCH      /api/document-requests
GET/POST/PATCH/DELETE /api/library
GET/POST/PUT/DELETE /api/events
GET/POST/PATCH/DELETE /api/community
GET/POST/PATCH/DELETE /api/forum
GET                 /api/audit-logs
```

### Controllers avec pagination

`UserController`, `GradeController`, `PaymentController`, `AttendanceController`,
`NotificationController`, `AuditLogController`, `MessageController`.

Paramètres : `?page=1&per_page=25` · paramètre `?all=true` pour bypass pagination.

### Services Laravel

| Service | Rôle |
|---------|------|
| `AuditService` | Journalise chaque action métier avec IP et user_id |
| `NotificationService` | Persiste en DB + broadcast Reverb en temps réel |
| `ResendMailService` | Envoi d'emails via l'API Resend (réinitialisation MDP) |

---

## 4. Frontend

### Structure post-migration

```
src/
├── lib/
│   ├── api.ts              — Axios centralisé + intercepteurs
│   ├── echo.ts             — Laravel Echo (Reverb WebSocket)
│   ├── store.ts            — Types + constantes ROLE_LABELS etc. (plus de localStorage)
│   ├── audit-store.ts      — Types AuditEntry + CATEGORY_LABELS
│   ├── courses-data.ts     — Types CourseData/Lesson (alias vers serviceTypes)
│   ├── elearning-store.ts  — Type LessonProgress
│   ├── notifications.ts    — NOTIF_TYPE_LABELS
│   └── services/           — 18 services API (un par domaine)
│       ├── authService.ts
│       ├── userService.ts    (+ listPaginated)
│       ├── courseService.ts
│       ├── gradeService.ts
│       ├── paymentService.ts
│       ├── attendanceService.ts
│       ├── announcementService.ts
│       ├── notificationService.ts
│       ├── messageService.ts
│       ├── scheduleService.ts
│       ├── semesterService.ts
│       ├── calendarService.ts
│       ├── communityService.ts  (+ forum)
│       ├── libraryService.ts
│       ├── documentService.ts
│       ├── auditService.ts
│       ├── codesService.ts
│       ├── passwordResetService.ts
│       └── paginationService.ts
├── hooks/
│   ├── useAuth.ts
│   ├── usePaginatedQuery.ts — Hook pagination TanStack Query
│   └── useRealTimeNotifications.ts — Echo canaux privés
└── components/
    ├── providers/AuthProvider.tsx  — Token Bearer, disconnect Echo au logout
    ├── DashboardLayout.tsx         — Monte useRealTimeNotifications
    ├── NotificationsPanel.tsx      — Popover + refetchInterval 60s
    ├── PaymentBlockedOverlay.tsx   — Appel API validateCode
    └── ui/Pagination.tsx           — Composant pagination réutilisable
```

### État localStorage (ce qui reste légitimement côté client)

| Clé | Contenu | Légitime ? |
|-----|---------|-----------|
| `cfi_avatar_color` | Couleur hex avatar | ✅ Préférence UI |
| Clé thème | `'dark'` ou `'light'` | ✅ Préférence UI |

**Plus aucune donnée métier dans localStorage.**

---

## 5. Sécurité — Bilan

| Faille | Statut | Résolution |
|--------|--------|-----------|
| SHA-256 client | ✅ Résolu | bcrypt via Laravel |
| Données sensibles localStorage | ✅ Résolu | API + Bearer token |
| Pas d'isolation utilisateurs | ✅ Résolu | Filtres serveur par user_id |
| Validation uniquement frontend | ✅ Résolu | `$request->validate()` dans tous controllers |
| Modèle User incomplet | ✅ Résolu | 18 colonnes + rôles + policies |
| Aucune route API | ✅ Résolu | ~65 routes |
| Pas de rate limiting | ✅ Résolu | throttle:10,1 / 5,1 sur auth |
| Pas de politique MDP | ✅ Résolu | min:8 côté serveur |
| appId Capacitor générique | ✅ Résolu | `org.cficiras.cfilink` |
| PDF généré côté client | 🟡 Partiel | Templates restent côté client mais les données viennent de l'API |
| `window.open()` bloqué iOS | ⬜ Restant | Remplacer par `@capacitor/share` |
| CORS HTTPS prod | ⬜ À config | Ajouter domaine prod dans `cors.php` |

---

## 6. Routes frontend et guards de rôles

### Problèmes résolus

| # | Problème | Résolution |
|---|----------|-----------|
| G-01 | Comptable exclu de `/admin/payments` | `UserController.togglePaymentBlock()` accessible au comptable |
| G-05 | Routes admin redirigent sans 403 clair | `AuditLogController`, `UserController`, `CodesController` retournent 403 explicite |

### Problèmes restants

| # | Problème | Impact |
|---|----------|--------|
| G-02 | `/elearning` accessible admin/staff | Faible — juste cosmétique |
| G-03 | `/payments` accessible à tous | Côté API, les étudiants ne voient que leurs propres paiements |
| G-04 | `/community` exclut les profs (incohérence forum) | Faible |

---

## 7. Composants partagés

### Situation post-migration

| Composant | Ancienne dépendance | Nouvelle |
|-----------|--------------------|----|
| `PaymentBlockedOverlay` | `store.ts.validatePaymentCode()` | `paymentService.validateCode()` |
| `NotificationsPanel` | `notifications.ts` localStorage | `notificationService.list()` + Echo push |
| `DashboardLayout` | `localStorage.getItem('cfi_avatar_color')` | Toujours localStorage (préférence UI) |
| `AuthProvider` | `cfi_current_user` localStorage | `authService.me()` + token sessionStorage |

### Duplications encore présentes

| Duplication | Localisation |
|-------------|-------------|
| Logique `timeAgo()` dans NotificationsPanel | Créer un `useTimeAgo` hook partagé |
| `// @ts-nocheck` dans 14 pages | À remplacer progressivement par des types stricts |

---

## 8. Performances

### État actuel du bundle

Le build Vite produit (~471 modules) :
- `dist/assets/index-*.js` : **~1.8 MB** (minifié + gzip ~434 KB)
- `dist/assets/index-*.css` : **~304 KB** (gzip ~37 KB)

### Optimisations appliquées

- ✅ `clamp()` sur toutes les font-size → typographie fluide
- ✅ `responsive.css` avec variables CSS `--cfi-fs-*`, `--cfi-space-*`
- ✅ `overflow-x: auto` sur toutes les tables
- ✅ `paginate()` dans 7 controllers → pas de full-scan en prod

### Optimisations restantes

| # | Optimisation | Impact |
|---|-------------|--------|
| P-01 | Code splitting React.lazy() sur les pages admin | -30% bundle initial |
| P-02 | Supprimer `@vitejs/plugin-legacy` si Capacitor >= Android 7 | -15% bundle |
| P-03 | Images hero avec `loading="lazy"` | LCP mobile |
| P-04 | `useMemo` sur les listes filtrées (ManageUsers, AdminStats) | Rendu UI |

---

## 9. Compatibilité Capacitor iOS/Android

| Problème | Sévérité | Statut |
|----------|---------|--------|
| `window.open()` pour PDF bloqué iOS | 🔴 | ⬜ Remplacer par `@capacitor/share` |
| `appId: 'io.ionic.starter'` → générique | 🔴 | ✅ Changé en `org.cficiras.cfilink` |
| localhost inaccessible depuis émulateur | 🔴 | ✅ `server.url: 'http://10.0.2.2:5173'` en dev |
| Cookies SPA non supportés WebView | 🟠 | ✅ Token Bearer via `sessionStorage` |
| localStorage effacé Android | 🟠 | ✅ Données en DB — localStorage uniquement prefs UI |
| `crypto.randomUUID()` vieux Android | 🟠 | IDs générés côté Laravel maintenant |
| `Date.toLocaleDateString('fr-FR')` | 🟡 | `date-fns` recommandé pour prod |
| `cleartext: true` Capacitor dev | ℹ️ | ✅ Documenté — à retirer en prod |

---

## 10. Problèmes résolus vs restants

### Tous résolus (18/18 du TODO section 5)

| # | Problème | Statut |
|---|----------|--------|
| 5.1 | SHA-256 client | ✅ bcrypt Laravel |
| 5.2 | Données sensibles localStorage | ✅ API + DB |
| 5.3 | Pas d'isolation utilisateurs | ✅ Filtres serveur |
| 5.4 | Incohérence onglets | ✅ React Query + Reverb |
| 5.5 | Limite 5 MB localStorage | ✅ MySQL |
| 5.6 | Modèle User incomplet | ✅ 18 colonnes |
| 5.7 | Aucune route API | ✅ ~65 routes |
| 5.8 | Validation uniquement frontend | ✅ Validation serveur |
| 5.9 | Bug async/await Register | ✅ Corrigé |
| 5.10 | Octet corrompu AdminStats | ✅ Corrigé |
| 5.11 | Pas de gestion erreur réseau | ✅ isLoading + intercepteurs |
| 5.12 | Données seed en dur frontend | ✅ DatabaseSeeder Laravel |
| 5.13 | Pas de pagination | ✅ paginate() + usePaginatedQuery |
| 5.14 | Pas de logs prod | ✅ daily + slack + sentry |
| 5.15 | Capacitor + localStorage | ✅ Données en DB |
| 5.16 | Pas de politique MDP | ✅ min:8 serveur |
| 5.17 | Pas de rate limiting | ✅ throttle:10,1 / 5,1 |
| 5.18 | Tests absents | ✅ 108 tests PHPUnit |

### Restants (hors scope initial)

| Problème | Priorité |
|----------|---------|
| Code splitting React.lazy() | 🟡 Perf |
| `@capacitor/share` pour PDF | 🟠 Mobile |
| `date-fns` pour localisation robuste | 🟡 Mobile |
| Remplacer `// @ts-nocheck` par vrais types | 🟢 Qualité |
| Logs prod configurés (domaine Sentry réel) | 🟡 Ops |
