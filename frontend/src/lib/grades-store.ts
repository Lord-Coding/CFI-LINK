const KEY = 'cfi_grades';

export type GradeStatus = 'draft' | 'published';

export interface GradeEntry {
  id: string;
  student_id: string;
  student_name: string;
  course_id: string;
  course_name: string;
  semestre: string;        // 'S1' | 'S2' | ...
  filiere: string;
  annee: string;
  cc:   number | null;
  tp:   number | null;
  exam: number | null;
  coef: number;
  status: GradeStatus;
  created_by: string;
  updated_at: string;
}

function getAll(): GradeEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(entries: GradeEntry[]) { localStorage.setItem(KEY, JSON.stringify(entries)); }

/* ── Lecture ── */
export function getAllGrades(): GradeEntry[] { return getAll(); }

export function getGradesForStudent(studentId: string): GradeEntry[] {
  return getAll()
    .filter(g => g.student_id === studentId && g.status === 'published')
    .sort((a, b) => a.semestre.localeCompare(b.semestre));
}

export function getGradesForCourse(courseId: string): GradeEntry[] {
  return getAll()
    .filter(g => g.course_id === courseId)
    .sort((a, b) => a.student_name.localeCompare(b.student_name));
}

export function getGradeForStudentCourse(studentId: string, courseId: string): GradeEntry | undefined {
  return getAll().find(g => g.student_id === studentId && g.course_id === courseId);
}

/* ── CRUD ── */
export function upsertGrade(data: Omit<GradeEntry, 'id' | 'updated_at'>): GradeEntry {
  const all = getAll();
  const existing = all.find(g => g.student_id === data.student_id && g.course_id === data.course_id);
  if (existing) {
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    saveAll(all.map(g => g.id === existing.id ? updated : g));
    return updated;
  }
  const newEntry: GradeEntry = { ...data, id: crypto.randomUUID(), updated_at: new Date().toISOString() };
  saveAll([...all, newEntry]);
  return newEntry;
}

import { addNotification } from './notifications';

export function publishGradesForCourse(courseId: string) {
  const all = getAll();
  // Récupère les brouillons qui vont être publiés pour envoyer les notifs
  const draftsToPublish = all.filter(g => g.course_id === courseId && g.status === 'draft');
  saveAll(all.map(g => g.course_id === courseId ? { ...g, status: 'published', updated_at: new Date().toISOString() } : g));
  // Notif automatique à chaque étudiant dont les notes passent en publié
  draftsToPublish.forEach(g => {
    addNotification({
      type: 'note',
      title: 'Notes publiées',
      message: `Vos notes pour "${g.course_name}" sont maintenant disponibles. Consultez vos résultats dans la section Notes.`,
      target_user_id: g.student_id,
    });
  });
}

export function unpublishGradesForCourse(courseId: string) {
  saveAll(getAll().map(g => g.course_id === courseId ? { ...g, status: 'draft', updated_at: new Date().toISOString() } : g));
}

export function deleteGrade(id: string) { saveAll(getAll().filter(g => g.id !== id)); }

/* ── Calculs ── */
export function calcMoyenne(cc: number | null, tp: number | null, exam: number | null): number | null {
  const notes = [cc, tp, exam].filter((n): n is number => n !== null);
  if (notes.length === 0) return null;
  return notes.reduce((a, b) => a + b, 0) / notes.length;
}

export function calcMoyenneGenerale(entries: GradeEntry[]): number {
  let total = 0, coefs = 0;
  for (const g of entries) {
    const m = calcMoyenne(g.cc, g.tp, g.exam);
    if (m !== null) { total += m * g.coef; coefs += g.coef; }
  }
  return coefs > 0 ? total / coefs : 0;
}

/* ── Stats publication ── */
export function getCourseGradeStatus(courseId: string): { total: number; published: number; draft: number } {
  const entries = getGradesForCourse(courseId);
  const published = entries.filter(g => g.status === 'published').length;
  return { total: entries.length, published, draft: entries.length - published };
}
