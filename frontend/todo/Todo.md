# CFI-LINK — Tâches à accomplir

> Dernière mise à jour : Juin 2026 — T-01 résolu

---

## 🔴 Priorité haute (bugs / bloquants)

### ~~T-01 · Redirection après connexion~~ ✅
~~**Problème :** L'utilisateur reste sur `/login` après s'être connecté alors que la redirection vers `/dashboard` est déjà configurée — nécessite une actualisation manuelle.~~
- [x] Revoir le flux d'authentification dans `AuthProvider` et `Login.tsx`
- [x] S'assurer que le state `user` est mis à jour synchroniquement après `login()`
- [x] Déclencher la redirection via guard sur la route `/login` dès que `user` est défini
- [x] Cas `PAYMENT_BLOCKED` : `setCurrentUser` déplacé dans le store, `window.location.reload()` supprimé

---

## 🟠 Priorité moyenne (fonctionnalités manquantes)

### ~~T-02 · Gestion de l'emploi du temps par l'admin~~ ✅
- [x] Bouton "Ajouter un créneau" dans la page `Schedule` (visible admin/super_admin uniquement)
- [x] Formulaire modal : jour, heure, matière, salle, professeur (sélection depuis la liste), filière, année
- [x] Fonctions `addScheduleEntry`, `updateScheduleEntry`, `deleteScheduleEntry` dans `schedule-store.ts`
- [x] Boutons Modifier/Supprimer sur chaque événement du tableau pour les admins
- [x] Associer chaque cours à un professeur lors de la création

---

### ~~T-03 · Lecteur vidéo et PDF dans E-Learning~~ ✅
- [x] Lecteur HTML5 `<video>` natif si `file_url` est renseigné, placeholder sinon
- [x] Viewer PDF via `<iframe>` pour les documents
- [x] Champ `file_url` dans l'interface `Lesson`
- [x] Progression mise à jour automatiquement à la fin de la vidéo (`onEnded`)

---

### ~~T-04 · Navigation vers le détail d'un cours~~ ✅
- [x] Page `CourseDetail.tsx` : hero, stats, progression, liste des leçons avec quiz et lecteur vidéo/PDF inline
- [x] Bouton "Voir le cours" sur chaque `CourseCard` dans `Courses.tsx`
- [x] Route `/courses/:id` reliée à `CourseDetail` dans `App.tsx`
- [x] Leçons associées accessibles depuis `CourseDetail` avec quiz interactif

---

### ~~T-05 · Professeurs — Ajout de cours et contenu E-Learning~~ ✅
- [x] Formulaire modal dans `Courses.tsx` (visible prof) : nom, filière, année, option, heures, semestre, description
- [x] Fonctions `addCourse`, `updateCourse`, `deleteCourse` dans `courses-data.ts` (store localStorage)
- [x] Boutons Modifier/Supprimer sur les cours du prof
- [x] Dans `ELearning.tsx` (vue prof), ajout/modif/suppression de leçons : titre, type, durée, URL fichier, verrouillage
- [x] Interface quiz builder : ajout de questions, 4 options, sélection de la bonne réponse
- [x] Lecteur HTML5 `<video>` natif + viewer PDF via `<iframe>` si `file_url` est renseigné

---

### ~~T-06 · Documents — Modèles et prévisualisation~~ ✅
- [x] 4 modèles HTML complets : attestation d'inscription, relevé de notes, certificat de scolarité, attestation de réussite
- [x] Chaque modèle est pré-rempli avec les données réelles de l'utilisateur (nom, filière, année, option, date)
- [x] Fonction `generateDocument(type, user)` dans `document-templates.ts`
- [x] Aperçu du document dans `IonModal` via `<iframe srcDoc>` avant impression
- [x] Boutons "Imprimer" (`window.print()`) et "Télécharger PDF" (nouvel onglet + bouton impression)
- [x] Bouton "Aperçu" ajouté dans la modal de demande de document

---

### ~~T-07 · Révision du système de notes~~ ✅
- [x] Store `grades-store.ts` persistant (localStorage) avec `upsertGrade`, `publishGradesForCourse`, `calcMoyenne`
- [x] Vue professeur : liste des cours → saisie CC/TP/Exam/Coef par étudiant, sauvegarde individuelle
- [x] Statut brouillon/publié par cours, bouton Publier/Dépublier
- [x] Vue étudiant : notes publiées uniquement, moyennes calculées, export PDF + CSV
- [x] Segments semestres dynamiques selon l'année de l'étudiant

---

### ~~T-08 · Révision du système de présences~~ ✅
- [x] Présences liées à l'emploi du temps : créneaux du jour filtrés pour le professeur connecté
- [x] Vue professeur : liste des créneaux du jour + accès manuel à tous les cours
- [x] `upsertAttendance` : modification d'un statut déjà marqué le même jour
- [x] Stats par cours (étudiant) avec alerte si seuil d'absences par matière dépassé
- [x] Alerte automatique globale et par matière si taux < 75%

---

### ~~T-09 · Forum — Réservé aux étudiants, fil de discussion unique~~ ✅
- [x] Accès restreint aux rôles `etudiant_concours` et `etudiant_externe` (page bloquée pour les autres)
- [x] Fil de discussion général unique (`course_id = 'general'`), plus de sélection de cours
- [x] Réponses imbriquées (thread, 1 niveau) via `addNestedReply`
- [x] Pagination : 20 posts au chargement, navigation page suivante/précédente
- [x] Suppression de la sélection de cours en entrée de forum

---

### ~~T-10 · Révision des rôles du personnel administratif~~ ✅
- [x] Type `StaffRole` dans `store.ts` : `secretariat`, `comptable`, `responsable_scolarite`
- [x] Menu latéral adapté selon `staff_role` : comptable → paiements, secrétariat → docs+schedule, responsable → complet
- [x] `ManageUsers.tsx` : sélecteur visuel des 3 sous-rôles dans le formulaire de création
- [x] Badge sous-rôle affiché dans le tableau des administratifs
- [x] `STAFF_ROLE_LABELS` et `STAFF_ROLE_DESCRIPTIONS` exportés depuis `store.ts`

---

## 🟡 Priorité basse (améliorations)

### ~~T-11 · Thème sombre / clair~~ ✅
- [x] `variables.css` complété avec toutes les variables Ionic clair + overrides `.ion-palette-dark`
- [x] `dark.class.css` importé à la place de `dark.system.css` — le toggle manuel fonctionne correctement
- [x] `applyTheme` corrigé : applique `ion-palette-dark` sur `:root` uniquement (plus de `high-contrast` parasite)
- [x] Clé localStorage unifiée : `cfi_theme` (au lieu de `orderdeal-theme`)
- [x] `ThemeProvider` applique le thème dès le `useState` initializer — zéro flash au premier rendu
- [x] `DashboardLayout` : ancien `useEffect` conflictuel supprimé, `--background` sans fallback hardcodé
- [x] `Settings.tsx` branché sur `useTheme()` — toggle paramètres et ThemeProvider parfaitement synchronisés
- [x] Tous les fallbacks `#fff` et `#f4f5f8` remplacés par les variables Ionic dans 25+ fichiers CSS
- [x] `ThemeProvider.tsx` : import `React` ajouté (bug de compilation corrigé)

---

## ✅ Terminé

- [x] **T-10** · Sous-rôles staff — `secretariat`, `comptable`, `responsable_scolarite`, menu adapté, accès restreints
- [x] **T-09** · Forum — réservé aux étudiants, fil unique `general`, threads imbriqués, pagination 20 posts
- [x] **T-08** · Présences — liées à l'emploi du temps, `upsertAttendance`, stats + alertes par cours
- [x] **T-07** · Notes — `grades-store.ts`, saisie prof, vue étudiant, publication/dépublication
- [x] **T-04** · Navigation vers le détail d'un cours — page `CourseDetail`, route `/courses/:id`, bouton "Voir le cours"
- [x] **T-05** · Professeurs — CRUD cours + leçons + quiz builder dans `ELearning`, lecteur vidéo HTML5 + PDF iframe
- [x] **T-06** · Documents — 4 modèles HTML, `generateDocument()`, aperçu iframe dans modal, Imprimer + Télécharger PDF
- [x] **T-03** · E-Learning — lecteur `<video>` HTML5 + `<iframe>` PDF, champ `file_url` sur `Lesson`
- [x] **T-02** · Emploi du temps admin — modal CRUD créneaux, boutons modifier/supprimer, filtre par rôle
- [x] **T-01** · Redirection après connexion — guard sur `/login` et `/register`, `PAYMENT_BLOCKED` géré proprement sans `reload()`
- [x] Toutes les pages admin (ManageUsers, ManageCodes, ManagePayments, ManageSemesters, AdminStats, AuditLog)
- [x] Dashboard par rôle (super_admin, admin, étudiant, professeur, staff)
- [x] Emploi du temps (lecture seule)
- [x] E-Learning (navigation cours → leçons → quiz/vidéo)
- [x] Bibliothèque numérique
- [x] Messagerie avec modals
- [x] Calendrier académique
- [x] Notes (lecture) et Présences (marquage)
- [x] Forum de discussion
- [x] Communauté (fil + annuaire)
- [x] Paiements étudiant + admin
- [x] Paramètres (profil, mot de passe, thème, couleur avatar)
- [x] Documents (avec aperçu modal)
- [x] Authentification, inscription, protection des routes
- [x] Error Boundary global
- [x] Menu latéral responsive avec scrollbar masquée
