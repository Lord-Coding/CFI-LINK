import api from '../api';
import type { ApiUser } from './authService';

export const userService = {
    list: (params?: Record<string, string>) =>
        api.get<ApiUser[]>('/users', { params }).then(r => r.data),

    get: (id: number) =>
        api.get<ApiUser>(`/users/${id}`).then(r => r.data),

    create: (data: Partial<ApiUser> & { password: string }) =>
        api.post<ApiUser>('/users', data).then(r => r.data),

    update: (id: number, data: Partial<ApiUser> & { password?: string }) =>
        api.put<ApiUser>(`/users/${id}`, data).then(r => r.data),

    delete: (id: number) =>
        api.delete(`/users/${id}`).then(r => r.data),

    toggleActive: (id: number) =>
        api.patch<ApiUser>(`/users/${id}/toggle-active`).then(r => r.data),

    togglePaymentBlock: (id: number) =>
        api.patch<ApiUser>(`/users/${id}/toggle-payment-block`).then(r => r.data),
};
