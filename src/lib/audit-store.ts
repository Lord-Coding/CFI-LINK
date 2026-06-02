const KEY = 'cfi_audit_log';

export interface AuditEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
  category: 'auth' | 'user' | 'payment' | 'code' | 'document' | 'system' | 'grade';
}

function getAll(): AuditEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(entries: AuditEntry[]) { localStorage.setItem(KEY, JSON.stringify(entries)); }

export function getAuditLog(limit = 100): AuditEntry[] {
  return getAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
}

export function getAuditByCategory(category: AuditEntry['category']): AuditEntry[] {
  return getAuditLog(500).filter(e => e.category === category);
}

export function logAction(data: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
  const entry: AuditEntry = { ...data, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
  const all = getAll();
  all.push(entry);
  // Keep only last 500 entries
  if (all.length > 500) all.splice(0, all.length - 500);
  saveAll(all);
  return entry;
}

export function initializeAuditLog() {
  if (getAll().length > 0) return;
  const now = new Date();
  const seeds: Omit<AuditEntry, 'id' | 'timestamp'>[] = [
    { user_id: 'system', user_name: 'Système', action: 'Initialisation', details: 'Plateforme CFI-LINK initialisée', category: 'system' },
    { user_id: 'admin', user_name: 'Super Administrateur', action: 'Connexion', details: 'Connexion réussie depuis le panneau admin', category: 'auth' },
    { user_id: 'admin', user_name: 'Dr. Michel Fouda', action: 'Création code concours', details: 'Code CONC-ABC123 créé pour Jean Kamga', category: 'code' },
    { user_id: 'admin', user_name: 'Dr. Michel Fouda', action: 'Activation compte', details: 'Compte de Jean Kamga activé', category: 'user' },
    { user_id: 'admin', user_name: 'Mme. Ngo Bassa', action: 'Traitement document', details: 'Attestation d\'inscription générée pour Paul Essomba', category: 'document' },
    { user_id: 'prof', user_name: 'Prof. Mbarga', action: 'Publication notes', details: 'Notes CC Algorithmique avancée L2 publiées', category: 'grade' },
    { user_id: 'admin', user_name: 'Super Administrateur', action: 'Blocage paiement', details: 'Compte de Boris Ndongo bloqué pour impayé', category: 'payment' },
  ];
  seeds.forEach((s, i) => {
    const entry: AuditEntry = { ...s, id: crypto.randomUUID(), timestamp: new Date(now.getTime() - (seeds.length - i) * 3600000).toISOString() };
    const all = getAll(); all.push(entry); saveAll(all);
  });
}

export const CATEGORY_LABELS: Record<string, string> = {
  auth: 'Authentification', user: 'Utilisateurs', payment: 'Paiements',
  code: 'Codes', document: 'Documents', system: 'Système', grade: 'Notes',
};

export const CATEGORY_COLORS: Record<string, string> = {
  auth: 'bg-primary/10 text-primary', user: 'bg-success/10 text-success',
  payment: 'bg-warning/10 text-warning', code: 'bg-info/10 text-info',
  document: 'bg-accent text-accent-foreground', system: 'bg-muted text-muted-foreground',
  grade: 'bg-destructive/10 text-destructive',
};
