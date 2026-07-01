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

### T-02 · Gestion de l'emploi du temps par l'admin
**À faire :**
- [ ] Ajouter un bouton "Ajouter un créneau" dans la page `Schedule` (visible admin/super_admin uniquement)
- [ ] Créer un formulaire modal : jour, heure, matière, salle, professeur (sélection depuis la liste), filière, année
- [ ] Ajouter les fonctions `addScheduleEntry`, `updateScheduleEntry`, `deleteScheduleEntry` dans `schedule-store.ts`
- [ ] Afficher les boutons Modifier/Supprimer sur chaque événement du tableau pour les admins
- [ ] Associer chaque cours à un professeur lors de la création

---

### T-03 · Lecteur vidéo et PDF dans E-Learning
**À faire :**
- [ ] Remplacer le placeholder vidéo par un vrai player HTML5 (`<video>`) avec les contrôles natifs
- [ ] Intégrer un viewer PDF (iframe ou `react-pdf`) pour les documents de type `pdf`
- [ ] Ajouter un champ `file_url` dans l'interface `Lesson` pour stocker le chemin ou l'URL du fichier
- [ ] Gérer l'état "en cours de lecture" et mettre à jour la progression automatiquement

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

### T-07 · Révision du système de notes
**À faire :**
- [ ] Permettre aux professeurs de saisir/modifier les notes CC, TP, Examen pour chaque étudiant
- [ ] Créer un store `grades-store.ts` persistant (localStorage) à la place des données mockées
- [ ] Formulaire de saisie des notes par cours et par étudiant (vue prof dans `Grades.tsx`)
- [ ] Vue étudiant : afficher uniquement ses propres notes, calculer les moyennes automatiquement
- [ ] Gérer la publication des notes (statut "brouillon" → "publié")

---

### T-08 · Révision du système de présences
**À faire :**
- [ ] Lier les présences à l'emploi du temps : un créneau = une séance = un appel
- [ ] Vue professeur : liste des créneaux du jour avec bouton "Faire l'appel"
- [ ] Permettre la modification d'un statut déjà marqué
- [ ] Statistiques de présence par cours (pas seulement globales)
- [ ] Alerte automatique si un étudiant dépasse un seuil d'absences par matière

---

### T-09 · Forum — Réservé aux étudiants, fil de discussion unique
**À faire :**
- [ ] Restreindre l'accès au forum aux rôles `etudiant_concours` et `etudiant_externe` uniquement
- [ ] Remplacer la structure par cours par un fil de discussion général (timeline unique)
- [ ] Chaque post peut recevoir des réponses imbriquées (thread)
- [ ] Ajouter la pagination ou le chargement progressif (les 20 derniers posts au chargement)
- [ ] Supprimer la sélection de cours en entrée de forum

---

### T-10 · Révision des rôles du personnel administratif
**À faire :**
- [ ] Ajouter des sous-rôles dans `store.ts` : `secretariat`, `comptable`, `responsable_scolarite`
- [ ] Adapter le menu latéral (`SideMenu.tsx`) selon le sous-rôle du staff
- [ ] Restreindre les accès : comptable → paiements uniquement, secrétariat → documents + emploi du temps, etc.
- [ ] Mettre à jour `ROLE_LABELS` et le formulaire de création dans `ManageUsers.tsx`
- [ ] Formulaire d'inscription : exposer le champ "Service" avec les sous-rôles disponibles

---

## 🟡 Priorité basse (améliorations)

### T-11 · Thème sombre / clair
**À faire :**
- [ ] Vérifier que toutes les pages utilisent les variables CSS Ionic (`--ion-color-*`) sans couleurs codées en dur
- [ ] Tester le basculement dark/light sur chaque page et corriger les incohérences
- [ ] S'assurer que `localStorage.setItem('cfi_theme', ...)` est bien lu au démarrage dans `DashboardLayout`
- [ ] Appliquer la classe `.dark` sur `document.documentElement` dès le premier rendu (pas seulement après action utilisateur)
- [ ] Vérifier le hero gradient, les cards, les tableaux et les modals en mode sombre

---

## ✅ Terminé

- [x] **T-04** · Navigation vers le détail d'un cours — page `CourseDetail`, route `/courses/:id`, bouton "Voir le cours"
- [x] **T-05** · Professeurs — CRUD cours + leçons + quiz builder dans `ELearning`, lecteur vidéo HTML5 + PDF iframe
- [x] **T-06** · Documents — 4 modèles HTML, `generateDocument()`, aperçu iframe dans modal, Imprimer + Télécharger PDF
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
