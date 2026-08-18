import api from '../api';

export interface ApiAuditLog {
    id: number;
    user_id?: number;
    user?: { id: number; nom_complet: string };
    action: string;
    details?: string;
    category: string;
    ip_address?: string;
    created_at: string;
}

export const auditService = {
    list: (params?: Record<string, string>) =>
        api.get<ApiAuditLog[]>('/audit-logs', { params }).then(r => r.data),
};
