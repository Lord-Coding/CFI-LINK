export type NotificationType = 'annonce' | 'note' | 'paiement' | 'systeme' | 'cours';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  target_role?: string;   // Role | 'all' — string pour éviter la dépendance circulaire avec store.ts
  target_user_id?: string;
}

const KEY = 'cfi_notifications';

function getAll(): Notification[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAll(notifs: Notification[]) {
  localStorage.setItem(KEY, JSON.stringify(notifs));
}

export function getNotifications(userId?: string, role?: string): Notification[] {
  return getAll().filter(n => {
    if (n.target_user_id && n.target_user_id !== userId) return false;
    if (n.target_role && n.target_role !== 'all' && n.target_role !== role) return false;
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getUnreadCount(userId?: string, role?: string): number {
  return getNotifications(userId, role).filter(n => !n.read).length;
}

export function markAsRead(id: string) {
  saveAll(getAll().map(n => n.id === id ? { ...n, read: true } : n));
}

export function markAllAsRead(userId?: string, role?: string) {
  const all = getAll();
  const userNotifIds = new Set(getNotifications(userId, role).map(n => n.id));
  saveAll(all.map(n => userNotifIds.has(n.id) ? { ...n, read: true } : n));
}

export function addNotification(data: Omit<Notification, 'id' | 'date' | 'read'>): Notification {
  const notif: Notification = {
    ...data,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    read: false,
  };
  saveAll([notif, ...getAll()]);
  return notif;
}

export function deleteNotification(id: string) {
  saveAll(getAll().filter(n => n.id !== id));
}

export function initializeNotifications() {
  if (getAll().length > 0) return;
  const now = new Date();
  const seed: Omit<Notification, 'id' | 'read'>[] = [
    { type: 'annonce', title: 'Bienvenue sur CFI-LINK', message: 'La plateforme académique du CFI-CIRAS est maintenant en ligne. Explorez vos cours et ressources.', date: new Date(now.getTime() - 2 * 86400000).toISOString(), target_role: 'all' },
    { type: 'paiement', title: 'Rappel de scolarité', message: 'La date limite de paiement pour ce mois approche. Veuillez régulariser votre situation.', date: new Date(now.getTime() - 86400000).toISOString(), target_role: 'etudiant_concours' },
    { type: 'paiement', title: 'Rappel de scolarité', message: 'La date limite de paiement pour ce mois approche. Veuillez régulariser votre situation.', date: new Date(now.getTime() - 86400000).toISOString(), target_role: 'etudiant_externe' },
    { type: 'note', title: 'Nouvelles notes disponibles', message: 'Les notes d\'Algorithmique avancée (CC) ont été publiées. Consultez vos résultats.', date: new Date(now.getTime() - 3600000).toISOString(), target_role: 'etudiant_concours' },
    { type: 'note', title: 'Nouvelles notes disponibles', message: 'Les notes d\'Algorithmique avancée (CC) ont été publiées. Consultez vos résultats.', date: new Date(now.getTime() - 3600000).toISOString(), target_role: 'etudiant_externe' },
    { type: 'cours', title: 'Nouveau contenu E-Learning', message: 'Un nouveau chapitre de Base de données a été ajouté au module E-Learning.', date: now.toISOString(), target_role: 'all' },
    { type: 'systeme', title: 'Maintenance prévue', message: 'Une maintenance est prévue ce weekend. La plateforme sera temporairement indisponible samedi de 22h à 2h.', date: new Date(now.getTime() - 4 * 3600000).toISOString(), target_role: 'all' },
    { type: 'annonce', title: '3 comptes en attente d\'activation', message: 'Des étudiants se sont inscrits et attendent l\'activation de leur compte.', date: new Date(now.getTime() - 2 * 3600000).toISOString(), target_role: 'super_admin' },
    { type: 'annonce', title: '3 comptes en attente d\'activation', message: 'Des étudiants se sont inscrits et attendent l\'activation de leur compte.', date: new Date(now.getTime() - 2 * 3600000).toISOString(), target_role: 'admin' },
  ];
  seed.forEach(s => addNotification({ type: s.type, title: s.title, message: s.message, target_role: s.target_role }));
}

export const NOTIF_TYPE_LABELS: Record<NotificationType, string> = {
  annonce: 'Annonce',
  note: 'Note',
  paiement: 'Paiement',
  systeme: 'Système',
  cours: 'Cours',
};
