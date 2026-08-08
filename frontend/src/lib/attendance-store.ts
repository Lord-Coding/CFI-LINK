const KEY = 'cfi_attendance';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  course_id: string;
  course_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: string;
}

function getAll(): AttendanceRecord[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(records: AttendanceRecord[]) { localStorage.setItem(KEY, JSON.stringify(records)); }

export function getAttendanceRecords(): AttendanceRecord[] {
  return getAll().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getStudentAttendance(studentId: string): AttendanceRecord[] {
  return getAll().filter(r => r.student_id === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getCourseAttendance(courseId: string): AttendanceRecord[] {
  return getAll().filter(r => r.course_id === courseId);
}

export function markAttendance(data: Omit<AttendanceRecord, 'id'>): AttendanceRecord {
  const record: AttendanceRecord = { ...data, id: crypto.randomUUID() };
  saveAll([...getAll(), record]);
  return record;
}

import { addNotification } from './notifications';

/** Crée ou met à jour le statut pour un étudiant/cours/date (même jour, tronqué à la date). */
export function upsertAttendance(data: Omit<AttendanceRecord, 'id'>): AttendanceRecord {
  const all = getAll();
  const dateDay = data.date.slice(0, 10); // 'YYYY-MM-DD'
  const existing = all.find(
    r => r.student_id === data.student_id &&
         r.course_id  === data.course_id  &&
         r.date.slice(0, 10) === dateDay
  );
  if (existing) {
    const updated = { ...existing, status: data.status, marked_by: data.marked_by };
    saveAll(all.map(r => r.id === existing.id ? updated : r));
    // Notif si le statut passe à absent (et qu'il ne l'était pas déjà)
    if (data.status === 'absent' && existing.status !== 'absent') {
      addNotification({
        type: 'systeme',
        title: 'Absence enregistrée',
        message: `Une absence a été enregistrée pour le cours "${data.course_name}" le ${new Date(data.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}.`,
        target_user_id: data.student_id,
      });
    }
    return updated;
  }
  const record: AttendanceRecord = { ...data, id: crypto.randomUUID() };
  saveAll([...all, record]);
  // Notif à l'étudiant si absent
  if (data.status === 'absent') {
    addNotification({
      type: 'systeme',
      title: 'Absence enregistrée',
      message: `Une absence a été enregistrée pour le cours "${data.course_name}" le ${new Date(data.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}.`,
      target_user_id: data.student_id,
    });
  }
  return record;
}

export function updateAttendance(id: string, status: AttendanceRecord['status']) {
  saveAll(getAll().map(r => r.id === id ? { ...r, status } : r));
}

export function getAttendanceStats(studentId: string) {
  const records = getStudentAttendance(studentId);
  const total = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const excused = records.filter(r => r.status === 'excused').length;
  const rate = total > 0 ? Math.round((present + late) / total * 100) : 100;
  return { total, present, absent, late, excused, rate };
}

/** Stats de présence pour un étudiant, groupées par cours. */
export function getAttendanceStatsByCourse(studentId: string): Record<string, {
  course_name: string; total: number; present: number; absent: number; late: number; excused: number; rate: number;
}> {
  const records = getStudentAttendance(studentId);
  const map: Record<string, ReturnType<typeof getAttendanceStatsByCourse>[string]> = {};
  for (const r of records) {
    if (!map[r.course_id]) {
      map[r.course_id] = { course_name: r.course_name, total: 0, present: 0, absent: 0, late: 0, excused: 0, rate: 100 };
    }
    const s = map[r.course_id];
    s.total++;
    s[r.status]++;
  }
  for (const s of Object.values(map)) {
    s.rate = s.total > 0 ? Math.round((s.present + s.late) / s.total * 100) : 100;
  }
  return map;
}

/** Retourne le statut déjà marqué aujourd'hui pour un étudiant/cours, ou undefined. */
export function getTodayStatus(studentId: string, courseId: string): AttendanceRecord | undefined {
  const today = new Date().toISOString().slice(0, 10);
  return getAll().find(
    r => r.student_id === studentId && r.course_id === courseId && r.date.slice(0, 10) === today
  );
}

export function initializeAttendance(studentIds: { id: string; name: string }[], courseIds: { id: string; name: string }[]) {
  if (getAll().length > 0) return;
  const statuses: AttendanceRecord['status'][] = ['present', 'present', 'present', 'present', 'absent', 'late', 'present', 'excused'];
  const now = new Date();
  studentIds.forEach(student => {
    courseIds.slice(0, 3).forEach(course => {
      for (let i = 0; i < 8; i++) {
        const date = new Date(now.getTime() - (i * 7 + Math.floor(Math.random() * 3)) * 86400000);
        markAttendance({
          student_id: student.id, student_name: student.name,
          course_id: course.id, course_name: course.name,
          date: date.toISOString(), status: statuses[i % statuses.length], marked_by: 'system',
        });
      }
    });
  });
}

export const STATUS_LABELS: Record<string, string> = {
  present: 'Présent', absent: 'Absent', late: 'En retard', excused: 'Excusé',
};

export const STATUS_COLORS: Record<string, string> = {
  present: 'bg-success/10 text-success', absent: 'bg-destructive/10 text-destructive',
  late: 'bg-warning/10 text-warning', excused: 'bg-info/10 text-info',
};
