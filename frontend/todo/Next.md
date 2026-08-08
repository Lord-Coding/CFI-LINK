# CFI-LINK — Tâches restantes

> Mise à jour : Juillet 2026 — **Toutes les tâches sont terminées.**

---

## ✅ Toutes les tâches accomplies

| Tâche | Description |
|-------|-------------|
| C1 | Hashage mots de passe SHA-256 via `crypto.subtle`, migration automatique |
| C2 | Double route `/` supprimée dans `App.tsx` |
| C3 | `initializeAttendance` corrigé dans `AuthProvider` |
| F1 | Progression E-Learning par étudiant (`elearning-store.ts`) |
| F2 | Posts Communauté persistés + likes par userId (`community-store.ts`) |
| F3 | Relevé de notes connecté à `grades-store` |
| F4 | Notifications auto : notes publiées, absences, paiements |
| F5 | Page Annonces + widget dashboard étudiant |
| E1 | Graphiques AdminStats : présences/filière, E-Learning, inscriptions, notes |
| E2 | Export CSV dans AdminStats et ManageUsers |
| E3 | Onglet "En attente" dans ManageUsers + notif à l'activation |

---

## Notes techniques — C1 · Hashage mots de passe

- **Algorithme :** SHA-256 via `crypto.subtle.digest` (Web Crypto API, disponible sur tous les navigateurs modernes)
- **Format stocké :** hex 64 caractères minuscules
- **Détection :** `isHashed(value)` → `/^[0-9a-f]{64}$/`
- **Migration :** `migratePasswords()` appelée dans `initializeStore()` — convertit tous les mots de passe en clair existants en localStorage au premier démarrage
- **Fallback login :** si un mot de passe n'a pas encore été migré, la comparaison en clair reste possible le temps de la migration
- **`createUser`** → async, hashe avant stockage
- **`login`** → async, compare `hashPassword(input)` avec le hash stocké
- **`handleChangePassword`** (Settings) → async, compare et stocke les hashes
- **`AuthContextType.login`** → retourne `Promise<{success, error?}>`
- **Impact :** `Login.tsx` (déjà async, ajout `await`), `Register.tsx` (ajout `await`), `ManageUsers.tsx` (handleCreate async)
