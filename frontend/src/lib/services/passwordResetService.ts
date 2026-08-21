import api from '../api';

export const passwordResetService = {
    /** Étape 1 — demander l'envoi du code */
    requestReset: (email: string) =>
        api.post<{ message: string }>('/password/forgot', { email }).then(r => r.data),

    /** Étape 2 — vérifier le code (optionnel, appelé au submit du code) */
    verifyCode: (email: string, code: string) =>
        api.post<{ valid: boolean; message: string }>('/password/verify', { email, code }).then(r => r.data),

    /** Étape 3 — soumettre le nouveau mot de passe */
    resetPassword: (email: string, code: string, password: string, password_confirmation: string) =>
        api.post<{ message: string }>('/password/reset', {
            email, code, password, password_confirmation,
        }).then(r => r.data),
};
