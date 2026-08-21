/**
 * echo.ts — Instance Laravel Echo partagée à travers toute l'application.
 *
 * Utilise le driver Reverb (compatible API Pusher) :
 *   - Connexion WebSocket via ws:// (ou wss:// en production)
 *   - Authentification des canaux privés via /api/broadcasting/auth
 *   - Bearer token Sanctum attaché automatiquement
 */
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Rendre Pusher disponible globalement (requis par Laravel Echo)
(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

let echoInstance: Echo<'reverb'> | null = null;

/**
 * Initialise (ou retourne l'instance existante) de Laravel Echo.
 * Doit être appelé après que l'utilisateur soit authentifié
 * afin que le token Sanctum soit disponible dans sessionStorage.
 */
export function getEcho(): Echo<'reverb'> {
    if (echoInstance) return echoInstance;

    const token = sessionStorage.getItem('cfi_token');

    echoInstance = new Echo({
        broadcaster: 'reverb',
        key:         import.meta.env.VITE_REVERB_APP_KEY  ?? 'cfi-link-key',
        wsHost:      import.meta.env.VITE_REVERB_HOST     ?? '127.0.0.1',
        wsPort:      Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
        wssPort:     Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
        forceTLS:    (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
        enabledTransports: ['ws', 'wss'],

        // Authentification des canaux privés
        authEndpoint: `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                Accept: 'application/json',
            },
        },
    });

    return echoInstance;
}

/**
 * Déconnecte et supprime l'instance Echo (à appeler au logout).
 */
export function disconnectEcho(): void {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
}

/**
 * Rafraîchit le token d'auth dans l'instance Echo existante.
 * À appeler si le token Sanctum change sans rechargement de page.
 */
export function refreshEchoAuth(): void {
    disconnectEcho();
    // getEcho() recrée l'instance avec le nouveau token au prochain appel
}
