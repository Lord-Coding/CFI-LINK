import { Filiere, Annee, OptionLIC } from "./store";

const KEY = 'cfi_schedules';

export interface ScheduleEntry {
  id: string;
  day: string;
  hour: string;
  subject: string;
  room: string;
  teacher: string;
  filiere: Filiere;
  annee: Annee;
  option?: OptionLIC;
  color: string;
}

const COLORS = [
  'bg-primary/10 border-primary/30 text-primary',
  'bg-success/10 border-success/30 text-success',
  'bg-warning/10 border-warning/30 text-warning',
  'bg-info/10 border-info/30 text-info',
  'bg-destructive/10 border-destructive/30 text-destructive',
];

function getAll(): ScheduleEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(entries: ScheduleEntry[]) { localStorage.setItem(KEY, JSON.stringify(entries)); }

export function getScheduleForStudent(filiere?: Filiere, annee?: Annee, option?: OptionLIC): ScheduleEntry[] {
  if (!filiere || !annee) return getAll();
  return getAll().filter(e => {
    if (e.filiere !== filiere) return false;
    if (e.annee !== annee) return false;
    if (e.option && e.option !== option) return false;
    return true;
  });
}

export function getScheduleForProfessor(teacherName: string): ScheduleEntry[] {
  return getAll().filter(e => e.teacher.toLowerCase().includes(teacherName.toLowerCase()));
}

export function getAllSchedules(): ScheduleEntry[] { return getAll(); }

export function addScheduleEntry(entry: Omit<ScheduleEntry, 'id'>): ScheduleEntry {
  const newEntry: ScheduleEntry = { ...entry, id: crypto.randomUUID() };
  saveAll([...getAll(), newEntry]);
  return newEntry;
}

export function updateScheduleEntry(id: string, updates: Partial<Omit<ScheduleEntry, 'id'>>): void {
  saveAll(getAll().map(e => e.id === id ? { ...e, ...updates } : e));
}

export function deleteScheduleEntry(id: string): void {
  saveAll(getAll().filter(e => e.id !== id));
}

export function initializeSchedules() {
  if (getAll().length > 0) return;
  const entries: Omit<ScheduleEntry, 'id'>[] = [
    // LIC L1
    { day: "Lundi", hour: "08:00", subject: "Introduction à l'informatique", room: "Amphi A", teacher: "Dr. Owona", filiere: "LIC", annee: "L1", color: COLORS[0] },
    { day: "Lundi", hour: "10:00", subject: "Algorithmique & Prog C", room: "Labo Info 1", teacher: "Prof. Mbarga", filiere: "LIC", annee: "L1", color: COLORS[1] },
    { day: "Mardi", hour: "08:00", subject: "Mathématiques", room: "Salle A2", teacher: "Dr. Talla", filiere: "LIC", annee: "L1", color: COLORS[2] },
    { day: "Mardi", hour: "14:00", subject: "Anglais technique", room: "Salle B1", teacher: "Mme. Fotso", filiere: "LIC", annee: "L1", color: COLORS[3] },
    { day: "Mercredi", hour: "08:00", subject: "Architecture des ordinateurs", room: "Labo Info 2", teacher: "Prof. Essomba", filiere: "LIC", annee: "L1", color: COLORS[4] },
    { day: "Jeudi", hour: "10:00", subject: "Programmation Web", room: "Labo Info 1", teacher: "M. Tabi", filiere: "LIC", annee: "L1", color: COLORS[0] },
    { day: "Vendredi", hour: "08:00", subject: "Statistiques", room: "Salle A3", teacher: "Dr. Fouda", filiere: "LIC", annee: "L1", color: COLORS[1] },
    // LIC L2
    { day: "Lundi", hour: "08:00", subject: "Algorithmique avancée", room: "Salle A1", teacher: "Prof. Mbarga", filiere: "LIC", annee: "L2", color: COLORS[0] },
    { day: "Lundi", hour: "10:00", subject: "Base de données", room: "Labo Info", teacher: "Dr. Nkoulou", filiere: "LIC", annee: "L2", color: COLORS[1] },
    { day: "Mardi", hour: "08:00", subject: "POO Java", room: "Labo Info 2", teacher: "Dr. Owona", filiere: "LIC", annee: "L2", color: COLORS[2] },
    { day: "Mardi", hour: "14:00", subject: "Réseaux informatiques", room: "Labo Réseau", teacher: "Prof. Essomba", filiere: "LIC", annee: "L2", color: COLORS[3] },
    { day: "Mercredi", hour: "10:00", subject: "Systèmes d'exploitation", room: "Salle B2", teacher: "Prof. Manga", filiere: "LIC", annee: "L2", color: COLORS[4] },
    { day: "Jeudi", hour: "08:00", subject: "Programmation Web JS/PHP", room: "Labo Info 1", teacher: "M. Tabi", filiere: "LIC", annee: "L2", color: COLORS[0] },
    { day: "Vendredi", hour: "10:00", subject: "Analyse numérique", room: "Salle A2", teacher: "Dr. Talla", filiere: "LIC", annee: "L2", color: COLORS[1] },
    // LAP L1
    { day: "Lundi", hour: "08:00", subject: "Droit administratif", room: "Salle C1", teacher: "Me. Atangana", filiere: "LAP", annee: "L1", color: COLORS[2] },
    { day: "Lundi", hour: "10:00", subject: "Introduction au management", room: "Salle C2", teacher: "Dr. Fouda", filiere: "LAP", annee: "L1", color: COLORS[3] },
    { day: "Mardi", hour: "08:00", subject: "Économie générale", room: "Salle C1", teacher: "M. Biya", filiere: "LAP", annee: "L1", color: COLORS[4] },
    { day: "Mercredi", hour: "10:00", subject: "Anglais administratif", room: "Salle B3", teacher: "Mme. Fotso", filiere: "LAP", annee: "L1", color: COLORS[0] },
    { day: "Jeudi", hour: "14:00", subject: "Sociologie des organisations", room: "Salle C2", teacher: "Dr. Fouda", filiere: "LAP", annee: "L1", color: COLORS[1] },
    // LAP L2
    { day: "Lundi", hour: "14:00", subject: "Gestion des organisations", room: "Salle C1", teacher: "Dr. Fouda", filiere: "LAP", annee: "L2", color: COLORS[0] },
    { day: "Mardi", hour: "10:00", subject: "Comptabilité publique", room: "Salle C3", teacher: "M. Biya", filiere: "LAP", annee: "L2", color: COLORS[1] },
    { day: "Mercredi", hour: "08:00", subject: "Droit constitutionnel", room: "Salle C1", teacher: "Me. Atangana", filiere: "LAP", annee: "L2", color: COLORS[2] },
    { day: "Jeudi", hour: "10:00", subject: "GRH", room: "Salle C2", teacher: "Dr. Fouda", filiere: "LAP", annee: "L2", color: COLORS[3] },
    { day: "Vendredi", hour: "08:00", subject: "Finances publiques", room: "Salle C3", teacher: "M. Biya", filiere: "LAP", annee: "L2", color: COLORS[4] },
    // ── LIC L3 — Tronc commun (S5-S6) ──
    { day: "Lundi", hour: "08:00", subject: "Génie logiciel", room: "Salle A1", teacher: "Dr. Owona", filiere: "LIC", annee: "L3", color: COLORS[0] },
    { day: "Lundi", hour: "10:00", subject: "Intelligence artificielle", room: "Labo Info 1", teacher: "Prof. Mbarga", filiere: "LIC", annee: "L3", color: COLORS[1] },
    { day: "Mardi", hour: "08:00", subject: "Cryptographie & Sécurité", room: "Salle A2", teacher: "Dr. Nkoulou", filiere: "LIC", annee: "L3", color: COLORS[2] },
    { day: "Mercredi", hour: "10:00", subject: "Gestion de projet SI", room: "Salle B1", teacher: "M. Tabi", filiere: "LIC", annee: "L3", color: COLORS[3] },
    // ── LIC L3 GL — Génie Logiciel ──
    { day: "Mardi", hour: "14:00", subject: "Architecture logicielle", room: "Labo Info 2", teacher: "Dr. Owona", filiere: "LIC", annee: "L3", option: "GL", color: COLORS[4] },
    { day: "Jeudi", hour: "08:00", subject: "Tests & Qualité logicielle", room: "Salle A3", teacher: "Prof. Mbarga", filiere: "LIC", annee: "L3", option: "GL", color: COLORS[0] },
    { day: "Jeudi", hour: "10:00", subject: "Développement mobile", room: "Labo Info 1", teacher: "M. Tabi", filiere: "LIC", annee: "L3", option: "GL", color: COLORS[1] },
    { day: "Vendredi", hour: "08:00", subject: "Stage & Projet GL", room: "Salle A1", teacher: "Dr. Owona", filiere: "LIC", annee: "L3", option: "GL", color: COLORS[2] },
    // ── LIC L3 SR — Systèmes & Réseaux ──
    { day: "Mardi", hour: "14:00", subject: "Administration réseaux avancée", room: "Labo Réseau", teacher: "Prof. Essomba", filiere: "LIC", annee: "L3", option: "SR", color: COLORS[3] },
    { day: "Jeudi", hour: "08:00", subject: "Cloud computing & Virtualisation", room: "Labo Info 2", teacher: "Dr. Nkoulou", filiere: "LIC", annee: "L3", option: "SR", color: COLORS[4] },
    { day: "Jeudi", hour: "10:00", subject: "Sécurité des réseaux", room: "Labo Réseau", teacher: "Prof. Essomba", filiere: "LIC", annee: "L3", option: "SR", color: COLORS[0] },
    { day: "Vendredi", hour: "08:00", subject: "Stage & Projet SR", room: "Salle A2", teacher: "Prof. Essomba", filiere: "LIC", annee: "L3", option: "SR", color: COLORS[1] },
    // ── LAP L3 (S5-S6) ──
    { day: "Lundi", hour: "14:00", subject: "Management stratégique", room: "Salle C1", teacher: "Dr. Fouda", filiere: "LAP", annee: "L3", color: COLORS[2] },
    { day: "Mardi", hour: "08:00", subject: "Droit du travail", room: "Salle C2", teacher: "Me. Atangana", filiere: "LAP", annee: "L3", color: COLORS[3] },
    { day: "Mercredi", hour: "08:00", subject: "Fiscalité et budget de l'État", room: "Salle C3", teacher: "M. Biya", filiere: "LAP", annee: "L3", color: COLORS[4] },
    { day: "Jeudi", hour: "14:00", subject: "Mémoire & Projet professionnel", room: "Salle C1", teacher: "Dr. Fouda", filiere: "LAP", annee: "L3", color: COLORS[0] },
    { day: "Vendredi", hour: "10:00", subject: "Séminaire de recherche", room: "Amphi A", teacher: "Me. Atangana", filiere: "LAP", annee: "L3", color: COLORS[1] },
  ];
  entries.forEach(e => {
    saveAll([...getAll(), { ...e, id: crypto.randomUUID() }]);
  });
}

export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
export const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
