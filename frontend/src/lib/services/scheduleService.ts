import api from '../api';

export interface ApiScheduleEntry {
    id: number;
    day: string;
    hour: string;
    subject: string;
    room?: string;
    teacher?: string;
    teacher_id?: number;
    filiere: string;
    annee: string;
    option_lic?: string;
    color?: string;
}

export const scheduleService = {
    list: (params?: Record<string, string>) =>
        api.get<ApiScheduleEntry[]>('/schedule', { params }).then(r => r.data),
    create: (data: Partial<ApiScheduleEntry>) =>
        api.post<ApiScheduleEntry>('/schedule', data).then(r => r.data),
    update: (id: number, data: Partial<ApiScheduleEntry>) =>
        api.put<ApiScheduleEntry>(`/schedule/${id}`, data).then(r => r.data),
    delete: (id: number) =>
        api.delete(`/schedule/${id}`).then(r => r.data),
};
