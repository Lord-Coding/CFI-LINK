const KEY = 'cfi_events';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  type: 'exam' | 'deadline' | 'event' | 'holiday' | 'meeting';
  target_role?: string;
  created_by?: string;
}

function getAll(): CalendarEvent[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(events: CalendarEvent[]) { localStorage.setItem(KEY, JSON.stringify(events)); }

export function getEvents(): CalendarEvent[] {
  return getAll().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getUpcomingEvents(days = 30): CalendarEvent[] {
  const now = new Date();
  const limit = new Date(now.getTime() + days * 86400000);
  return getEvents().filter(e => {
    const d = new Date(e.date);
    return d >= now && d <= limit;
  });
}

export function addEvent(data: Omit<CalendarEvent, 'id'>): CalendarEvent {
  const event: CalendarEvent = { ...data, id: crypto.randomUUID() };
  saveAll([...getAll(), event]);
  return event;
}

export function deleteEvent(id: string) {
  saveAll(getAll().filter(e => e.id !== id));
}

export function initializeEvents() {
  if (getAll().length > 0) return;
  const now = new Date();
  const seed: Omit<CalendarEvent, 'id'>[] = [
    { title: "Examen Algorithmique avancée", description: "Examen final S1 - LIC L2", date: new Date(now.getTime() + 14 * 86400000).toISOString(), time: "08:00", type: "exam" },
    { title: "Remise projet tutoré", description: "Date limite de soumission du projet tutoré", date: new Date(now.getTime() + 7 * 86400000).toISOString(), type: "deadline" },
    { title: "Journée portes ouvertes", description: "Visite du campus et présentation des filières", date: new Date(now.getTime() + 21 * 86400000).toISOString(), time: "09:00", type: "event" },
    { title: "Congé - Fête nationale", description: "Jour férié", date: new Date(now.getTime() + 30 * 86400000).toISOString(), type: "holiday" },
    { title: "Conseil de classe L1", description: "Bilan du premier semestre", date: new Date(now.getTime() + 10 * 86400000).toISOString(), time: "14:00", type: "meeting" },
    { title: "Deadline paiement Février", description: "Date limite de paiement de la scolarité", date: new Date(now.getTime() + 5 * 86400000).toISOString(), type: "deadline", target_role: "etudiant_concours" },
    { title: "Examen Base de données", description: "Examen final S1 - LIC L2", date: new Date(now.getTime() + 16 * 86400000).toISOString(), time: "10:00", type: "exam" },
    { title: "Soutenance PFE L3", description: "Présentation des projets de fin d'études", date: new Date(now.getTime() + 45 * 86400000).toISOString(), time: "08:00", type: "exam" },
  ];
  seed.forEach(s => addEvent(s));
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  exam: 'Examen', deadline: 'Deadline', event: 'Événement', holiday: 'Congé', meeting: 'Réunion',
};

export const EVENT_TYPE_COLORS: Record<string, string> = {
  exam: 'bg-destructive/10 text-destructive border-destructive/30',
  deadline: 'bg-warning/10 text-warning border-warning/30',
  event: 'bg-primary/10 text-primary border-primary/30',
  holiday: 'bg-success/10 text-success border-success/30',
  meeting: 'bg-info/10 text-info border-info/30',
};
