import { ReactNode, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/authContext";
import { authService, type ApiUser } from "../../lib/services/authService";
import { disconnectEcho, refreshEchoAuth } from "../../lib/echo";
import type { User } from "../../lib/store";

/** Adapte ApiUser (backend) → User (frontend) pour maintenir la compatibilité. */
function adapt(u: ApiUser): User {
    return {
        id:              String(u.id),
        email:           u.email,
        password:        '',            // jamais exposé côté client
        nom_complet:     u.nom_complet,
        role:            u.role as User['role'],
        is_active:       u.is_active,
        payment_blocked: u.payment_blocked,
        filiere:         (u.filiere ?? undefined) as User['filiere'],
        annee:           (u.annee   ?? undefined) as User['annee'],
        option:          (u.option_lic ?? undefined) as User['option'],
        specialite:      u.specialite,
        grade:           u.grade,
        service:         u.service,
        staff_role:      (u.staff_role ?? undefined) as User['staff_role'],
        created_at:      new Date().toISOString(),
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user,    setUser]    = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Restaurer la session depuis le token stocké
    useEffect(() => {
        const token = sessionStorage.getItem('cfi_token');
        if (!token) { setLoading(false); return; }

        authService.me()
            .then(apiUser => setUser(adapt(apiUser)))
            .catch(() => sessionStorage.removeItem('cfi_token'))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await authService.login(email, password);

            if (res.message === 'PAYMENT_BLOCKED') {
                setUser(adapt(res.user));
                return { success: true, error: 'PAYMENT_BLOCKED' };
            }

            setUser(adapt(res.user));
            return { success: true };
        } catch (err: unknown) {
            const status  = (err as { response?: { status: number; data?: { message?: string } } })?.response?.status;
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;

            if (status === 403) return { success: false, error: message ?? "Compte inactif." };
            return { success: false, error: message ?? "Email ou mot de passe incorrect." };
        }
    };

    const logout = async () => {
        await authService.logout().catch(() => {});
        disconnectEcho();   // couper la connexion WebSocket Reverb
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const apiUser = await authService.me();
            setUser(adapt(apiUser));
            refreshEchoAuth(); // recrée Echo avec le token à jour si besoin
        } catch { /* silencieux */ }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout: () => { void logout(); }, refreshUser: () => { void refreshUser(); } }}>
            {children}
        </AuthContext.Provider>
    );
}
