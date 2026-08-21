/**
 * api.ts — Service HTTP centralisé (Axios + Sanctum)
 * Toutes les requêtes API passent par cette instance.
 */
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// ── Intercepteur requête : ajoute le Bearer token si présent (mode Capacitor/mobile) ──
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('cfi_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // En production, forcer HTTPS si la baseURL commence par https
    if (import.meta.env.PROD && config.url && config.baseURL?.startsWith('https')) {
        config.url = config.url.replace(/^http:\/\//, 'https://');
    }
    return config;
});

// ── Intercepteur réponse : gestion globale des erreurs ──
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            // Session expirée — nettoyer et rediriger
            sessionStorage.removeItem('cfi_token');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// ── Helper : initialiser Sanctum CSRF avant login (web SPA) ──
export async function initCsrf(): Promise<void> {
    const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api')
        .replace('/api', '');
    await axios.get(`${base}/sanctum/csrf-cookie`, { withCredentials: true });
}
