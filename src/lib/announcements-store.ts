const KEY = 'cfi_announcements';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  priority: 'normal' | 'important' | 'urgent';
  target_role?: string;
  created_at: string;
  pinned: boolean;
}

function getAll(): Announcement[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(a: Announcement[]) { localStorage.setItem(KEY, JSON.stringify(a)); }

export function getAnnouncements(role?: string): Announcement[] {
  return getAll()
    .filter(a => !a.target_role || a.target_role === 'all' || a.target_role === role)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}

export function addAnnouncement(data: Omit<Announcement, 'id' | 'created_at'>): Announcement {
  const a: Announcement = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  saveAll([...getAll(), a]);
  return a;
}

export function deleteAnnouncement(id: string) {
  saveAll(getAll().filter(a => a.id !== id));
}

export function togglePin(id: string) {
  saveAll(getAll().map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
}

export function initializeAnnouncements() {
  if (getAll().length > 0) return;
  const seeds: Omit<Announcement, 'id' | 'created_at'>[] = [
    { title: "Bienvenue sur CFI-LINK", content: "La plateforme académique du CFI-CIRAS est officiellement en ligne ! Explorez vos cours, notes et ressources. N'hésitez pas à signaler tout problème.", author: "Super Administrateur", priority: "important", target_role: "all", pinned: true },
    { title: "Calendrier des examens S1", content: "Le calendrier des examens du premier semestre est maintenant disponible. Consultez la section Emploi du temps pour plus de détails.", author: "Dr. Michel Fouda", priority: "urgent", target_role: "all", pinned: true },
    { title: "Rappel : paiement de la scolarité", content: "Les étudiants ayant des arriérés de paiement sont priés de régulariser leur situation avant la fin du mois. Passé ce délai, l'accès à la plateforme sera restreint.", author: "Dr. Michel Fouda", priority: "important", target_role: "etudiant_concours", pinned: false },
    { title: "Nouveaux supports de cours disponibles", content: "Les supports du cours d'Algorithmique avancée (chapitres 5 et 6) ont été ajoutés dans la section E-Learning.", author: "Prof. Mbarga", priority: "normal", target_role: "all", pinned: false },
  ];
  seeds.forEach(s => addAnnouncement(s));
}
