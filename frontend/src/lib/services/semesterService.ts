import api from '../api';

export interface ApiSemester {
    id: number;
    name: string;
    year: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    type: string;
}

export const semesterService = {
    list: () => api.get<ApiSemester[]>('/semesters').then(r => r.data),
    create: (data: Partial<ApiSemester>) => api.post<ApiSemester>('/semesters', data).then(r => r.data),
    update: (id: number, data: Partial<ApiSemester>) => api.put<ApiSemester>(`/semesters/${id}`, data).then(r => r.data),
    activate: (id: number) => api.patch<ApiSemester>(`/semesters/${id}/activate`).then(r => r.data),
    delete: (id: number) => api.delete(`/semesters/${id}`).then(r => r.data),
};
