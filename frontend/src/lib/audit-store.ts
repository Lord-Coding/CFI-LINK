/**
 * audit-store.ts — Constantes uniquement (données gérées par le backend)
 */
export const CATEGORY_LABELS: Record<string, string> = {
    auth:     'Authentification',
    user:     'Utilisateur',
    payment:  'Paiement',
    code:     'Code accès',
    document: 'Document',
    system:   'Système',
    grade:    'Note',
};

// Type pour compatibilité avec les pages qui importent AuditEntry
export type AuditEntry = {
    id:          number;
    user_id?:    number;
    user?:       { id: number; nom_complet: string };
    action:      string;
    details?:    string;
    category:    string;
    ip_address?: string;
    created_at:  string;
};
