import api from '../api';

export interface ApiPaymentRecord {
    id: number;
    student_id: number;
    student?: { id: number; nom_complet: string; filiere?: string; annee?: string };
    month: string;
    amount: number;
    method: 'cash' | 'mobile_money' | 'card';
    status: 'pending' | 'confirmed' | 'rejected';
    reference?: string;
    created_at: string;
    confirmed_at?: string;
}

export interface ApiPaymentCode {
    id: number;
    code: string;
    student_id: number;
    student?: { id: number; nom_complet: string };
    month: string;
    used: boolean;
    created_at: string;
}

export const paymentService = {
    list: () => api.get<ApiPaymentRecord[]>('/payments').then(r => r.data),

    create: (data: { month: string; amount: number; method: string; reference?: string }) =>
        api.post<ApiPaymentRecord>('/payments', data).then(r => r.data),

    confirm: (id: number) =>
        api.patch<ApiPaymentRecord>(`/payments/${id}/confirm`).then(r => r.data),

    reject: (id: number) =>
        api.patch<ApiPaymentRecord>(`/payments/${id}/reject`).then(r => r.data),

    listCodes: () => api.get<ApiPaymentCode[]>('/payment-codes').then(r => r.data),

    generateCode: (student_id: number, month: string) =>
        api.post<ApiPaymentCode>('/payment-codes', { student_id, month }).then(r => r.data),

    validateCode: (code: string) =>
        api.post<{ message: string }>('/payment-codes/validate', { code }).then(r => r.data),
};
