/**
 * elearning-store.ts
 * Persistance de la progression E-Learning par étudiant.
 * Chaque enregistrement lie un student_id à un lesson_id avec son statut.
 */

const KEY = 'cfi_elearning_progress';

export interface LessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  score?: number;       // pourcentage (0-100) pour quiz/exam
  completed_at?: string; // ISO date
}

function getAll(): LessonProgress[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(records: LessonProgress[]) { localStorage.setItem(KEY, JSON.stringify(records)); }

/** Récupère la progression d'un étudiant pour une leçon donnée. */
export function getLessonProgress(studentId: string, lessonId: string): LessonProgress | undefined {
  return getAll().find(p => p.student_id === studentId && p.lesson_id === lessonId);
}

/** Récupère toutes les progressions d'un étudiant pour un cours donné. */
export function getCourseProgress(studentId: string, courseId: string): LessonProgress[] {
  return getAll().filter(p => p.student_id === studentId && p.course_id === courseId);
}

/** Retourne les IDs de leçons complétées par un étudiant pour un cours. */
export function getCompletedLessonIds(studentId: string, courseId: string): Set<string> {
  return new Set(
    getCourseProgress(studentId, courseId)
      .filter(p => p.completed)
      .map(p => p.lesson_id)
  );
}

/** Calcule le pourcentage de progression d'un étudiant sur un cours. */
export function getCourseProgressPercent(studentId: string, courseId: string, totalLessons: number): number {
  if (totalLessons === 0) return 0;
  const done = getCourseProgress(studentId, courseId).filter(p => p.completed).length;
  return Math.round((done / totalLessons) * 100);
}

/** Marque une leçon comme terminée pour un étudiant. */
export function markLessonComplete(studentId: string, lessonId: string, courseId: string, score?: number): LessonProgress {
  const all = getAll();
  const existing = all.find(p => p.student_id === studentId && p.lesson_id === lessonId);
  if (existing) {
    const updated: LessonProgress = {
      ...existing,
      completed: true,
      score: score ?? existing.score,
      completed_at: new Date().toISOString(),
    };
    saveAll(all.map(p => p.student_id === studentId && p.lesson_id === lessonId ? updated : p));
    return updated;
  }
  const record: LessonProgress = {
    id: crypto.randomUUID(),
    student_id: studentId,
    lesson_id: lessonId,
    course_id: courseId,
    completed: true,
    score,
    completed_at: new Date().toISOString(),
  };
  saveAll([...all, record]);
  return record;
}

/** Réinitialise la progression d'un étudiant sur une leçon (pour re-passer un quiz). */
export function resetLessonProgress(studentId: string, lessonId: string): void {
  saveAll(getAll().filter(p => !(p.student_id === studentId && p.lesson_id === lessonId)));
}
