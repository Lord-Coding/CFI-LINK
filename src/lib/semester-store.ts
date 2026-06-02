const KEY = 'cfi_semesters';

export interface Semester {
  id: string;
  name: string;
  year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  type: 'S1' | 'S2';
}

function getAll(): Semester[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(semesters: Semester[]) { localStorage.setItem(KEY, JSON.stringify(semesters)); }

export function getSemesters(): Semester[] {
  return getAll().sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
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
  if (getAll().length > 0) return;
  const seeds: Omit<Semester, 'id'>[] = [
    { name: "Semestre 1", year: "2024-2025", start_date: "2024-10-01", end_date: "2025-02-28", is_active: true, type: "S1" },
    { name: "Semestre 2", year: "2024-2025", start_date: "2025-03-01", end_date: "2025-07-31", is_active: false, type: "S2" },
    { name: "Semestre 1", year: "2023-2024", start_date: "2023-10-01", end_date: "2024-02-29", is_active: false, type: "S1" },
    { name: "Semestre 2", year: "2023-2024", start_date: "2024-03-01", end_date: "2024-07-31", is_active: false, type: "S2" },
  ];
  seeds.forEach(s => addSemester(s));
}
