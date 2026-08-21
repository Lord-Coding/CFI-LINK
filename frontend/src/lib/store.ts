/**
 * store.ts — Résidus de compatibilité post-migration
 *
 * Ce fichier ne contient plus de données mockées ni de localStorage.
 * Il exporte uniquement les constantes, types et helpers
 * qui sont encore importés par certaines pages lors de la transition.
 *
 * Les données sont maintenant gérées par Laravel (MySQL) via les services
 * dans src/lib/services/.
 */

// ── Types de rôles ─────────────────────────────────────────────
export type Role =
    | 'super_admin'
    | 'admin'
    | 'professeur'
    | 'membre_administratif'
    | 'etudiant_concours'
    | 'etudiant_externe';

export type Filiere   = 'LIC' | 'LAP';
export type Annee     = 'L1' | 'L2' | 'L3';
export type OptionLIC = 'GL' | 'SR';
export type StaffRole = 'secretariat' | 'comptable' | 'responsable_scolarite';

// ── Interface User (type frontend, alignée sur ApiUser du backend) ──
export interface User {
    id:              string | number;
    email:           string;
    password:        string;
    nom_complet:     string;
    role:            Role;
    is_active:       boolean;
    payment_blocked?: boolean;
    filiere?:        Filiere;
    annee?:          Annee;
    option?:         OptionLIC;   // alias de option_lic
    option_lic?:     OptionLIC;
    specialite?:     string;
    grade?:          string;
    service?:        string;
    staff_role?:     StaffRole;
    created_at:      string;
}

// ── Labels d'affichage ─────────────────────────────────────────
export const ROLE_LABELS: Record<Role | string, string> = {
    super_admin:            'Super Administrateur',
    admin:                  'Directeur',
    professeur:             'Professeur',
    membre_administratif:   'Personnel Administratif',
    etudiant_concours:      'Étudiant (concours)',
    etudiant_externe:       'Étudiant (externe)',
};

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
    secretariat:            'Secrétariat',
    comptable:              'Comptabilité',
    responsable_scolarite:  'Responsable Scolarité',
};

export const STAFF_ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
    secretariat:           'Gestion des documents et de la scolarité',
    comptable:             'Gestion des paiements et de la comptabilité',
    responsable_scolarite: 'Supervision de la scolarité et des emplois du temps',
};

export const FILIERE_LABELS: Record<Filiere | string, string> = {
    LIC: 'Licence Informatique et Communication',
    LAP: 'Licence Administration Publique',
};

// ── Helpers de rôles ───────────────────────────────────────────
export const isStudent     = (role: string) => role === 'etudiant_concours' || role === 'etudiant_externe';
export const isProfessor   = (role: string) => role === 'professeur';
export const isAdmin       = (role: string) => role === 'admin' || role === 'super_admin';
export const isStaff       = (role: string) => role === 'membre_administratif';
export const isStaffComptable = (role: string, staffRole?: string) => role === 'membre_administratif' && staffRole === 'comptable';

// ── Constante financière ───────────────────────────────────────
export const MONTHLY_FEE = 25000; // FCFA
