/**
 * notifications.ts — Constantes uniquement
 * Les notifications sont gérées par le backend Laravel (NotificationService).
 */
export const NOTIF_TYPE_LABELS: Record<string, string> = {
    annonce:  'Annonce',
    note:     'Note',
    paiement: 'Paiement',
    systeme:  'Système',
    cours:    'Cours',
};
