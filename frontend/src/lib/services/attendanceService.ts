import api from '../api';

export interface ApiAttendance {
    id: number;
    student_id: number;
    student?: { id: number; nom_complet: string };
    course_id: number;
    course?: { id: number; name: string };
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    marked_by?: number;
}

export interface ApiAttendanceStats {
    total: number; present: number; absent: number; late: number; excused: number; rate: number;
}

export const attendanceService = {
    list: (params?: Record<string, string>) =>
        api.get<ApiAttendance[]>('/attendance', { params }).then(r => r.data),

    upsert: (data: { student_id: number; course_id: number; date: string; status: string }) =>
        api.post<ApiAttendance>('/attendance/upsert', data).then(r => r.data),

    stats: (studentId: number) =>
        api.get<ApiAttendanceStats>(`/attendance/stats/${studentId}`).then(r => r.data),
};
