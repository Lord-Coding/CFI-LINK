import React, { useEffect } from 'react';
import { IonContent, IonMenuButton, IonPage } from '../lib/ionic';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../lib/store';
import PaymentBlockedOverlay from './PaymentBlockedOverlay';
import NotificationPanel from './NotificationsPanel';
import '../styles/components/_DashboardLayout.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user } = useAuth();

    const avatarColor = localStorage.getItem('cfi_avatar_color') || '#3880ff';
    const initials    = user?.nom_complet.charAt(0).toUpperCase();

    useEffect(() => {
        const saved = localStorage.getItem('cfi_theme');
        if (saved === 'dark') document.documentElement.classList.add('dark');
    }, []);

    if (!user) return null;

    return (
        <IonPage>
            <IonContent style={{ '--background': 'var(--ion-color-light, #f4f5f8)' } as React.CSSProperties}>
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
                <div className="dashboard-page-body">
                    {children}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default DashboardLayout;
