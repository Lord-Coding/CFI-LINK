import api, { initCsrf } from '../api';

export interface LoginResponse {
    user: ApiUser;
    token: string;
    message?: string;
}

export interface ApiUser {
    id: number;
    nom_complet: string;
    email: string;
    role: string;
    is_active: boolean;
    payment_blocked: boolean;
    filiere?: string;
    annee?: string;
    option_lic?: string;
    specialite?: string;
    grade?: string;
    service?: string;
    staff_role?: string;
}

export interface RegisterPayload {
    type: 'concours' | 'externe';
    code: string;
    email: string;
    password: string;
    nom_complet?: string;
    filiere?: string;
    annee?: string;
    option_lic?: string;
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        await initCsrf().catch(() => {}); // CSRF non bloquant pour mobile
        const { data } = await api.post<LoginResponse>('/login', { email, password });
        if (data.token) sessionStorage.setItem('cfi_token', data.token);
        return data;
    },

    async logout(): Promise<void> {
        await api.post('/logout').catch(() => {});
        sessionStorage.removeItem('cfi_token');
    },

    async me(): Promise<ApiUser> {
        const { data } = await api.get<ApiUser>('/me');
        return data;
    },

    async register(payload: RegisterPayload): Promise<{ user: ApiUser; message: string }> {
        const { data } = await api.post('/register', payload);
        return data;
    },
};
