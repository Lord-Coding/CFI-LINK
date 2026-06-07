# CFI-LINK — Analyse globale & feuille de route

> Analyse réalisée en Juin 2026 sur la base du code complet du projet.

---

## 📊 État actuel du projet

### Architecture
- **22 routes** actives, protégées par rôle via `ProtectedRoute`
- **13 stores** localStorage (users, codes, paiements, semestres, audit, forum, bibliothèque, schedule, events, messages, attendance, documents, notifications)
- **15+ composants UI** réutilisables (Badge, Card, Avatar, AlertDialog, Calendar, Popover, Skeleton…)
- **6 rôles** : `super_admin`, `admin`, `professeur`, `membre_administratif`, `etudiant_concours`, `etudiant_externe`

### Ce qui est persisté en localStorage ✅
Utilisateurs, codes d'accès, paiements, semestres, présences, forum, bibliothèque, messages, emploi du temps, calendrier, audit, documents demandés, notifications

### Ce qui est mocké / hardcodé ⚠️
| Donnée | Fichier | Impact |
|---|---|---|
| Cours (`allCoursesData`) | `courses-data.ts` | Pas de CRUD, non éditable |
| Notes (Grades) | `Grades.tsx` | Identiques pour tous les étudiants |
| Contenu E-Learning | `ELearning.tsx` | Leçons fixes, progression non sauvegardée |
| Posts Communauté | `Community.tsx` | Perdus au rechargement |
| Questions quiz | `ELearning.tsx` | 3 questions fixes pour tous les quiz |

---

## 🔧 CE QU'IL FAUT MODIFIER

### 1. Sécurité — Mots de passe en clair
**Problème :** Les mots de passe sont stockés en clair dans localStorage.  
**Action :** Hasher avec `crypto.subtle` (SHA-256 ou bcrypt côté serveur lors de la migration backend).  
**Fichiers :** `store.ts` → fonctions `login`, `createUser`, `updateUser`

### 2. Logique de connexion — Redirection après login
**Problème :** L'utilisateur reste sur `/login` après connexion, nécessite un F5.  
**Action :** Dans `Login.tsx`, appeler `history.push('/dashboard')` dès que le login retourne `success: true`. Vérifier que le context `AuthProvider` met bien à jour le state synchroniquement avant le redirect.  
**Fichiers :** `Login.tsx`, `AuthProvider.tsx`

### 3. Cours — Données hardcodées → store persistant
**Problème :** `courses-data.ts` est un fichier statique, les profs et admins ne peuvent pas modifier les cours.  
**Action :** Créer `courses-store.ts` avec CRUD complet (localStorage), migrer `courses-data.ts` comme seed, ajouter fonctions `addCourse`, `updateCourse`, `deleteCourse`, `getCoursesByProfessor`.  
**Fichiers :** Nouveau `lib/courses-store.ts`, `Courses.tsx`, `ELearning.tsx`

### 4. Notes — Données mockées → store persistant
**Problème :** `MOCK_GRADES` dans `Grades.tsx` est identique pour tous les étudiants.  
**Action :** Créer `grades-store.ts` avec `GradeRecord { student_id, course_id, cc, tp, exam, coef, published }`. Les profs saisissent les notes, les étudiants voient les leurs uniquement.  
**Fichiers :** Nouveau `lib/grades-store.ts`, `Grades.tsx`

### 5. E-Learning — Progression non sauvegardée
**Problème :** Marquer une leçon "terminée" ne persiste pas après rechargement.  
**Action :** Créer `elearning-store.ts` avec `LessonProgress { student_id, lesson_id, completed, score?, date }`. Charger/sauvegarder au changement de statut.  
**Fichiers :** Nouveau `lib/elearning-store.ts`, `ELearning.tsx`

### 6. Emploi du temps — Semestre S3-S6 absent
**Problème :** `schedule-store.ts` ne contient que L1 et L2 (S1-S4), L3 est absent.  
**Action :** Ajouter les créneaux L3 (GL et SR) dans `initializeSchedules()`.  
**Fichiers :** `lib/schedule-store.ts`

### 7. Forum — Accessible aux professeurs
**Problème :** La route `/forum` autorise les professeurs, mais le forum doit être réservé aux étudiants selon le client.  
**Action :** Retirer `'professeur'` de `allowedRoles` sur la route `/forum` dans `App.tsx`.  
**Fichiers :** `App.tsx`, menu dans `constants/menu-items.ts`

### 8. Communauté — Posts éphémères
**Problème :** Les posts de `Community.tsx` sont dans un `useState` local, perdus au rechargement.  
**Action :** Créer `community-store.ts` avec `CommunityPost { id, author_id, author_name, content, date, likes: string[] }`. Liker persiste aussi.  
**Fichiers :** Nouveau `lib/community-store.ts`, `Community.tsx`

### 9. Rôles du staff — Un seul rôle générique
**Problème :** Tous les membres admin ont le rôle `membre_administratif` sans distinction.  
**Action :** Ajouter un champ `service_role: 'secretariat' | 'comptable' | 'bibliothequaire' | 'responsable_scolarite'` dans `User`, adapter les menus et accès selon ce sous-rôle.  
**Fichiers :** `lib/store.ts`, `constants/menu-items.ts`, `ManageUsers.tsx`

### 10. Thème sombre — Application partielle
**Problème :** Certaines couleurs sont codées en dur (hero gradients, avatars), ne respectent pas le mode sombre.  
**Action :** Vérifier toutes les pages avec `bg-` ou couleurs hex fixes. Utiliser uniquement `var(--ion-color-*)`. Le hero peut rester en gradient mais les surfaces secondaires doivent s'adapter.  
**Fichiers :** Tous les `.css` des pages

---

## ➕ CE QU'IL FAUT AJOUTER

### Fonctionnalités pédagogiques

**A1 · Détail d'un cours (`/courses/:id`)**
Page dédiée par cours avec : description complète, liste des leçons E-Learning, professeur, planning, documents associés, lien forum du cours.  
*Rôles concernés : tous*

**A2 · Création/modification de cours par les profs**
Formulaire dans `Courses.tsx` visible pour `professeur` : nom, filière, année, heures, semestre, description. Boutons Modifier/Supprimer sur les cours existants.  
*Rôles concernés : professeur, super_admin, admin*

**A3 · Upload de contenu E-Learning par les profs**
Formulaire d'ajout de leçon : titre, type (video/document/quiz), durée, URL/fichier. Pour les quiz : interface de création des questions et réponses.  
*Rôles concernés : professeur*

**A4 · Lecteur vidéo / PDF intégré**
Remplacer le placeholder par un `<video controls>` HTML5 pour les vidéos et une `<iframe>` ou viewer PDF pour les documents. Champ `file_url` dans `Lesson`.  
*Rôles concernés : tous*

**A5 · Saisie des notes par les profs**
Vue dédiée dans `Grades.tsx` pour le prof : sélectionner le cours, sélectionner les étudiants, saisir CC / TP / Examen. Bouton "Publier les notes" (statut brouillon → publié).  
*Rôles concernés : professeur*

**A6 · Gestion de l'emploi du temps par admin**
Boutons Ajouter/Modifier/Supprimer créneau dans `Schedule.tsx`. Modal avec : jour, heure, matière, salle, professeur (liste déroulante), filière, année.  
*Rôles concernés : super_admin, admin*

**A7 · Présences liées à l'emploi du temps**
Au lieu d'une liste de cours statique, les profs voient les créneaux du jour depuis `schedule-store`. Chaque créneau = une séance, bouton "Faire l'appel" sur le créneau actuel.  
*Rôles concernés : professeur*

### Fonctionnalités documents

**A8 · Modèles de documents préremplis**
Fonction `generateDocument(type, user)` qui remplit un template HTML avec les données de l'étudiant. Aperçu modal avant impression. Types : attestation, relevé, certificat, fiche pré-inscription.  
*Rôles concernés : etudiant_concours, etudiant_externe, membre_administratif*

**A9 · Génération de relevé de notes officiel**
Intégrer les données de `grades-store` dans le template du relevé PDF. Signature et cachet visuel CFI-CIRAS.  
*Rôles concernés : etudiant_concours, etudiant_externe*

### Fonctionnalités communication

**A10 · Notifications push (in-app)**
Le clochette dans le header affiche déjà les notifications. Ajouter des déclencheurs automatiques : nouvelle note publiée → notif étudiant, nouvelle absence → notif, paiement confirmé → notif.  
*Rôles concernés : tous*

**A11 · Annonces officielles**
Page `/announcements` pour les admins : créer des annonces avec titre, contenu, date d'expiration, cible (tous / filière / année). Les étudiants voient les annonces actives dans leur dashboard.  
*Rôles concernés : super_admin, admin (créer) ; tous (lire)*

**A12 · Réponses dans le fil Communauté**
Permettre de répondre à un post communautaire (thread). Les posts s'affichent avec leur fil de réponses développable.  
*Rôles concernés : etudiant_concours, etudiant_externe*

### Fonctionnalités admin

**A13 · Export des données (CSV/PDF)**
Bouton export global dans AdminStats : liste des étudiants, état des paiements, journal d'audit. Déjà présent sur Grades et Schedule, à étendre.  
*Rôles concernés : super_admin, admin*

**A14 · Tableau de bord admin enrichi**
Graphiques dans AdminStats : courbe de paiements mensuels, répartition présences/absences par filière, taux de complétion E-Learning. Utiliser `IonProgressBar` ou une lib légère type `chart.js`.  
*Rôles concernés : super_admin, admin*

**A15 · Gestion des inscriptions en ligne**
Étape supplémentaire dans Register : upload de pièces justificatives (simulé), validation par l'admin avant activation du compte. File d'attente dans ManageUsers.  
*Rôles concernés : super_admin, admin*

---

## ➖ CE QU'IL FAUT SUPPRIMER / SIMPLIFIER

**S1 · Route `/community` pour les profs dans le menu**
Le menu prof liste `/forum` et `/messages`, pas `/community`. Mais `community-store.ts` (quand créé) devrait être accessible à tous. À décider selon politique de l'école.

**S2 · Données seed en doublons**
`initializeAttendance` dans `AuthProvider.tsx` est appelé à chaque montage avec des IDs qui peuvent changer entre sessions. À déplacer dans `initializeStore()` pour n'être exécuté qu'une fois.  
**Fichiers :** `AuthProvider.tsx`

**S3 · Interface `Payment` non utilisée dans `store.ts`**
`interface Payment { ... paid, deadline }` est déclarée dans `store.ts` mais jamais utilisée (le vrai système de paiement est dans `payment-store.ts`). À supprimer pour éviter la confusion.  
**Fichiers :** `lib/store.ts`

**S4 · Double route `/` dans `AppRoutes`**
Il y a deux `<Route exact path="/">` dans `AppRoutes`, le second étant redondant. À nettoyer.  
**Fichiers :** `App.tsx`

**S5 · `MOCK_GRADES` dans `Grades.tsx`**
Une fois `grades-store.ts` créé, supprimer le `MOCK_GRADES` hardcodé. Conserver uniquement les helpers de calcul (`calcMoyenne`, `calcMoyenneGenerale`).  
**Fichiers :** `Grades.tsx`

**S6 · Questions quiz hardcodées dans `ELearning.tsx`**
`QUIZ_QUESTIONS` est identique pour tous les quiz. À remplacer par des questions stockées dans `elearning-store.ts` liées à chaque leçon.  
**Fichiers :** `ELearning.tsx`

---

## 🏗️ DETTE TECHNIQUE À ADRESSER

| # | Sujet | Priorité |
|---|---|---|
| D1 | Mots de passe en clair dans localStorage | Haute |
| D2 | `courses-data.ts` non éditable (hardcodé) | Haute |
| D3 | `MOCK_GRADES` identiques pour tous les étudiants | Haute |
| D4 | Progression E-Learning non persistée | Moyenne |
| D5 | `initializeAttendance` appelé à chaque montage | Moyenne |
| D6 | Posts Communauté perdus au rechargement | Moyenne |
| D7 | Interface `Payment` fantôme dans `store.ts` | Basse |
| D8 | Double `<Route path="/">` dans App.tsx | Basse |
| D9 | L3 absent de `schedule-store` (emploi du temps) | Basse |
| D10 | Couleurs hardcodées (hex) dans quelques CSS | Basse |

---

## 🗺️ Ordre d'implémentation recommandé

```
Phase 1 — Corrections critiques
  ├── S4 · Double route App.tsx
  ├── M2 · Redirection après login
  └── D5 · initializeAttendance dans AuthProvider

Phase 2 — Persistance des données
  ├── A3/M3 · courses-store.ts
  ├── M4    · grades-store.ts
  └── M5    · elearning-store.ts

Phase 3 — Fonctionnalités profs
  ├── A2 · Création cours
  ├── A3 · Upload contenu E-Learning
  ├── A4 · Lecteur vidéo/PDF
  └── A5 · Saisie notes

Phase 4 — Fonctionnalités admin
  ├── A6 · Gestion emploi du temps
  ├── A7 · Présences liées EDT
  ├── M9 · Sous-rôles staff
  └── A13 · Export global

Phase 5 — Enrichissement
  ├── A8/A9 · Documents préremplis
  ├── A10   · Notifications automatiques
  ├── A11   · Annonces officielles
  └── A14   · Graphiques AdminStats
```
