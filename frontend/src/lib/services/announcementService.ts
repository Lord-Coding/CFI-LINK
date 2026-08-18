import api from '../api';

export interface ApiAnnouncement {
    id: number;
    title: string;
    content: string;
    author_id?: number;
    author?: { id: number; nom_complet: string };
    priority: 'normal' | 'important' | 'urgent';
    target_role?: string;
    pinned: boolean;
    created_at: string;
}

export const announcementService = {
    list: () => api.get<ApiAnnouncement[]>('/announcements').then(r => r.data),
    create: (data: Partial<ApiAnnouncement>) => api.post<ApiAnnouncement>('/announcements', data).then(r => r.data),
    update: (id: number, data: Partial<ApiAnnouncement>) => api.put<ApiAnnouncement>(`/announcements/${id}`, data).then(r => r.data),
    delete: (id: number) => api.delete(`/announcements/${id}`).then(r => r.data),
};
