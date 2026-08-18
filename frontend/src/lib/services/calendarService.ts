import api from '../api';

export interface ApiCalendarEvent {
    id: number;
    title: string;
    description?: string;
    date: string;
    time?: string;
    type: 'exam' | 'deadline' | 'event' | 'holiday' | 'meeting';
    target_role?: string;
    created_by?: number;
}

export const calendarService = {
    list: (params?: Record<string, string>) =>
        api.get<ApiCalendarEvent[]>('/events', { params }).then(r => r.data),
    create: (data: Partial<ApiCalendarEvent>) =>
        api.post<ApiCalendarEvent>('/events', data).then(r => r.data),
    update: (id: number, data: Partial<ApiCalendarEvent>) =>
        api.put<ApiCalendarEvent>(`/events/${id}`, data).then(r => r.data),
    delete: (id: number) =>
        api.delete(`/events/${id}`).then(r => r.data),
};
