/**
 * useRealTimeNotifications.ts
 *
 * Hook React qui :
 * 1. S'abonne au canal privé Reverb  →  private-notifications.{userId}
 * 2. S'abonne au canal de rôle       →  private-role.{role}
 * 3. Invalide le cache TanStack Query ['notifications'] à chaque événement reçu
 *    → NotificationsPanel se met à jour automatiquement
 * 4. Se déconnecte proprement au démontage du composant
 */
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getEcho, disconnectEcho } from '../lib/echo';
import type { ApiNotification } from '../lib/services/notificationService';

interface UseRealTimeNotificationsOptions {
    /** ID de l'utilisateur connecté */
    userId: number | string;
    /** Rôle de l'utilisateur (pour écouter le canal de rôle) */
    role: string;
    /** Callback optionnel appelé à chaque nouvelle notification */
    onNotification?: (notif: ApiNotification) => void;
}

export function useRealTimeNotifications({
    userId,
    role,
    onNotification,
}: UseRealTimeNotificationsOptions): void {
    const qc            = useQueryClient();
    const subscribedRef = useRef(false);

    useEffect(() => {
        if (subscribedRef.current) return;
        subscribedRef.current = true;

        const echo = getEcho();

        // ── Canal personnel ───────────────────────────────────────
        echo
            .private(`notifications.${userId}`)
            .listen('.notification.new', (notif: ApiNotification) => {
                // Invalider le cache → useQuery(['notifications']) se relance
                qc.invalidateQueries({ queryKey: ['notifications'] });
                onNotification?.(notif);
            });

        // ── Canal de rôle ─────────────────────────────────────────
        // Les admins reçoivent aussi les notifs broadcast à leur rôle
        const roleChannel = `role.${role}`;
        echo
            .private(roleChannel)
            .listen('.notification.new', (notif: ApiNotification) => {
                qc.invalidateQueries({ queryKey: ['notifications'] });
                onNotification?.(notif);
            });

        // ── Nettoyage au démontage ────────────────────────────────
        return () => {
            try {
                echo.leave(`notifications.${userId}`);
                echo.leave(roleChannel);
            } catch {
                // silencieux si déjà déconnecté
            }
            subscribedRef.current = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, role]);
}
