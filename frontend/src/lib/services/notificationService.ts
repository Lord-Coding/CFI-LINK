import api from '../api';

export interface ApiNotification {
    id: number;
    user_id?: number;
    target_role?: string;
    type: 'annonce' | 'note' | 'paiement' | 'systeme' | 'cours';
    title: string;
    message: string;
    read: boolean;
    created_at: string;
}

export const notificationService = {
    list: () => api.get<ApiNotification[]>('/notifications').then(r => r.data),
    markRead: (id: number) => api.patch(`/notifications/${id}/read`).then(r => r.data),
    markAllRead: () => api.patch('/notifications/read-all').then(r => r.data),
    delete: (id: number) => api.delete(`/notifications/${id}`).then(r => r.data),
};
