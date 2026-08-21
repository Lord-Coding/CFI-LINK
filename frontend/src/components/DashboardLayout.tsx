import React from 'react';
import { IonContent, IonMenuButton, IonPage } from '../lib/ionic';
import { useAuth } from '../hooks/useAuth';
import { useRealTimeNotifications } from '../hooks/useRealTimeNotifications';
import { ROLE_LABELS } from '../lib/store';
import PaymentBlockedOverlay from './PaymentBlockedOverlay';
import NotificationPanel from './NotificationsPanel';
import OnboardingModal from './OnboardingModal';
import '../styles/components/_DashboardLayout.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user } = useAuth();

    // ── Connexion WebSocket Reverb ────────────────────────────────
    // Le hook s'abonne aux canaux privés de l'utilisateur et invalide
    // automatiquement le cache ['notifications'] à chaque push reçu.
    useRealTimeNotifications({
        userId: user?.id ?? '',
        role:   user?.role ?? '',
    });

    const avatarColor = localStorage.getItem('cfi_avatar_color') || '#3880ff';
    const initials    = user?.nom_complet.charAt(0).toUpperCase();

    if (!user) return null;

    return (
        <IonPage>
            <IonContent style={{ '--background': 'var(--ion-background-color)' } as React.CSSProperties}>
                {/* Header dans le contenu pour qu'il scroll avec la page */}
                <div className="dashboard-inline-header">
                    <div className="dashboard-inline-start">
                        <IonMenuButton className="dashboard-menu-btn" />
                    </div>
                    <div className="dashboard-inline-end">
                        <NotificationPanel />
                        <div className="dashboard-header-user">
                            <span className="dashboard-header-name">{user.nom_complet}</span>
                            <span className="dashboard-header-role">{ROLE_LABELS[user.role]}</span>
                        </div>
                        <div className="dashboard-header-avatar" style={{ backgroundColor: avatarColor }}>
                            {initials}
                        </div>
                    </div>
                </div>

                <PaymentBlockedOverlay />
                <OnboardingModal />
                <div className="dashboard-page-body">
                    {children}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default DashboardLayout;
