import api from '../api';

export interface ApiMessage {
    id: number;
    from_id: number;
    sender?: { id: number; nom_complet: string };
    to_id: number;
    recipient?: { id: number; nom_complet: string };
    subject: string;
    body: string;
    read: boolean;
    created_at: string;
}

export const messageService = {
    inbox: () => api.get<ApiMessage[]>('/messages/inbox').then(r => r.data),
    sent: () => api.get<ApiMessage[]>('/messages/sent').then(r => r.data),
    send: (data: { to_id: number; subject: string; body: string }) =>
        api.post<ApiMessage>('/messages', data).then(r => r.data),
    markRead: (id: number) => api.patch(`/messages/${id}/read`).then(r => r.data),
    delete: (id: number) => api.delete(`/messages/${id}`).then(r => r.data),
};
