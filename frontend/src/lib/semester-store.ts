const KEY      = 'cfi_semesters';
const SEED_KEY = 'cfi_semesters_v2'; // bump version → force re-seed si déjà initialisé

/*
 * Le CFI-CIRAS compte 6 semestres académiques :
 *   L1 → S1, S2
 *   L2 → S3, S4
 *   L3 → S5, S6
 */
export type SemesterCode = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

export const SEMESTER_TO_ANNEE: Record<SemesterCode, 'L1' | 'L2' | 'L3'> = {
  S1: 'L1', S2: 'L1',
  S3: 'L2', S4: 'L2',
  S5: 'L3', S6: 'L3',
};

export const SEMESTER_LABELS: Record<SemesterCode, string> = {
  S1: 'Semestre 1 (L1)', S2: 'Semestre 2 (L1)',
  S3: 'Semestre 3 (L2)', S4: 'Semestre 4 (L2)',
  S5: 'Semestre 5 (L3)', S6: 'Semestre 6 (L3)',
};

export interface Semester {
  id:         string;
  name:       string;   // ex: "Semestre 1"
  year:       string;   // ex: "2024-2025"
  start_date: string;
  end_date:   string;
  is_active:  boolean;
  type:       SemesterCode;
}

function getAll(): Semester[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(semesters: Semester[]) { localStorage.setItem(KEY, JSON.stringify(semesters)); }

export function getSemesters(): Semester[] {
  return getAll().sort((a, b) => {
    // Trier par année décroissante, puis par numéro de semestre croissant
    if (a.year !== b.year) return b.year.localeCompare(a.year);
    return Number(a.type.slice(1)) - Number(b.type.slice(1));
  });
}

export function getActiveSemester(): Semester | undefined {
  return getAll().find(s => s.is_active);
}

export function addSemester(data: Omit<Semester, 'id'>): Semester {
  const sem: Semester = { ...data, id: crypto.randomUUID() };
  saveAll([...getAll(), sem]);
  return sem;
}

export function updateSemester(id: string, data: Partial<Semester>) {
  saveAll(getAll().map(s => s.id === id ? { ...s, ...data } : s));
}

export function setActiveSemester(id: string) {
  saveAll(getAll().map(s => ({ ...s, is_active: s.id === id })));
}

export function deleteSemester(id: string) {
  saveAll(getAll().filter(s => s.id !== id));
}

export function initializeSemesters() {
  // SEED_KEY permet de re-seed si la structure a changé (bump de version)
  if (localStorage.getItem(SEED_KEY)) return;

  // Vider les anciennes données et re-seeder
  localStorage.removeItem(KEY);

  /*
   * Structure académique CFI-CIRAS :
   *   L1 → S1, S2  (même année académique)
   *   L2 → S3, S4  (même année académique)
   *   L3 → S5, S6  (même année académique)
   *
   * Chaque niveau a sa propre cohorte, donc ses propres années académiques.
   * Ici on seed avec la promotion 2024-2025 sur les 3 niveaux.
   */
  const seeds: Omit<Semester, 'id'>[] = [
    // ── L1 (2024-2025) ──
    { name: 'Semestre 1', year: '2024-2025', start_date: '2024-10-01', end_date: '2025-01-31', is_active: true,  type: 'S1' },
    { name: 'Semestre 2', year: '2024-2025', start_date: '2025-02-01', end_date: '2025-06-30', is_active: false, type: 'S2' },

    // ── L2 (2024-2025) ──
    { name: 'Semestre 3', year: '2024-2025', start_date: '2024-10-01', end_date: '2025-01-31', is_active: false, type: 'S3' },
    { name: 'Semestre 4', year: '2024-2025', start_date: '2025-02-01', end_date: '2025-06-30', is_active: false, type: 'S4' },

    // ── L3 (2024-2025) ──
    { name: 'Semestre 5', year: '2024-2025', start_date: '2024-10-01', end_date: '2025-01-31', is_active: false, type: 'S5' },
    { name: 'Semestre 6', year: '2024-2025', start_date: '2025-02-01', end_date: '2025-06-30', is_active: false, type: 'S6' },
  ];

  seeds.forEach(s => addSemester(s));
  localStorage.setItem(SEED_KEY, '1');
}
