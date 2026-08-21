import React, { useState } from 'react';
import {
    bookOutline, cardOutline, checkmarkDoneOutline, closeOutline,
    IonButton, IonButtons, IonContent, IonHeader, IonIcon,
    IonItem, IonLabel, IonList, IonPopover, IonText, IonTitle, IonToolbar,
    megaphoneOutline, notificationsOutline, schoolOutline, settingsOutline, trashOutline,
} from '../lib/ionic';
import { NOTIF_TYPE_LABELS } from '../lib/notifications';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, type ApiNotification } from '../lib/services/notificationService';
import "../styles/components/_NotificationPanel.css";
import Badge from './ui/Badge';
import { Skeleton, SkeletonAvatar } from './ui/Skeleton';

type NotificationType = ApiNotification['type'];

const TYPE_ICONS: Record<NotificationType, string> = {
    annonce:  megaphoneOutline,
    note:     schoolOutline,
    paiement: cardOutline,
    systeme:  settingsOutline,
    cours:    bookOutline,
};

const TYPE_BADGE_VARIANT: Record<NotificationType, 'default' | 'success' | 'warning' | 'info' | 'secondary'> = {
    annonce:  'default',
    note:     'success',
    paiement: 'warning',
    systeme:  'secondary',
    cours:    'info',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7)   return `Il y a ${days} j`;
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/* ════════════════════════════════
   Composant principal
════════════════════════════════ */
const NotificationPanel: React.FC = () => {
    const { user }  = useAuth();
    const toast     = useToast();
    const qc        = useQueryClient();

    const [popoverOpen,  setPopoverOpen]  = useState(false);
    const [popoverEvent, setPopoverEvent] = useState<Event | undefined>();

    const { data: notifs = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationService.list,
        // Echo invalide le cache en temps réel — le polling n'est qu'un filet de sécurité
        refetchInterval: 60_000,
        enabled: !!user,
    });

    const unread = notifs.filter((n: ApiNotification) => !n.read).length;

    const markReadMutation = useMutation({
        mutationFn: notificationService.markRead,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const markAllMutation = useMutation({
        mutationFn: notificationService.markAllRead,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Toutes les notifications ont été lues.'); },
    });

    const deleteMutation = useMutation({
        mutationFn: notificationService.delete,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const openPopover = (e: React.MouseEvent) => { setPopoverEvent(e.nativeEvent); setPopoverOpen(true); };
    const handleMarkRead    = (id: number) => markReadMutation.mutate(id);
    const handleMarkAllRead = () => markAllMutation.mutate();
    const handleDelete      = (e: React.MouseEvent, id: number) => { e.stopPropagation(); deleteMutation.mutate(id); };

    return (
        <div className="notif-wrapper">

            {/* ── Cloche ── */}
            <div className="notif-bell-container" onClick={openPopover} role="button" aria-label="Notifications">
                <IonButton fill="clear" shape="round" className="notif-bell-btn">
                    <IonIcon icon={notificationsOutline} slot="icon-only" className="notif-bell-icon" />
                </IonButton>

                {unread > 0 && (
                    <div className="notif-bell-badge">
                        <Badge variant="danger" size="sm" pill className="notif-badge-pill">
                            {unread > 9 ? '9+' : String(unread)}
                        </Badge>
                    </div>
                )}
            </div>

            {/* ── Popover ── */}
            <IonPopover
                isOpen={popoverOpen}
                event={popoverEvent}
                onDidDismiss={() => setPopoverOpen(false)}
                className="notif-popover"
                showBackdrop={true}
                dismissOnSelect={false}
            >
                {/* Header */}
                <IonHeader className="ion-no-border">
                    <IonToolbar className="notif-popover-toolbar">
                        <IonTitle className="notif-popover-title">
                            Notifications
                            {unread > 0 && (
                                <Badge variant="danger" size="sm" pill style={{ marginLeft: '0.4rem' }}>
                                    {unread}
                                </Badge>
                            )}
                        </IonTitle>
                        <IonButtons slot="end">
                            {unread > 0 && !isLoading && (
                                <IonButton
                                    fill="clear"
                                    size="small"
                                    onClick={handleMarkAllRead}
                                    className="notif-mark-all-btn"
                                    shape="round"
                                    title="Tout marquer comme lu"
                                >
                                    <IonIcon icon={checkmarkDoneOutline} slot="start" />
                                    Tout lire
                                </IonButton>
                            )}
                            <IonButton fill="clear" size="small" onClick={() => setPopoverOpen(false)}>
                                <IonIcon icon={closeOutline} slot="icon-only" />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                {/* Contenu */}
                <IonContent className="notif-popover-content">

                    {/* Skeleton chargement */}
                    {isLoading && (
                        <div className="notif-skeleton-list">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="notif-skeleton-item">
                                    <SkeletonAvatar size="md" shape="rounded" />
                                    <div className="notif-skeleton-body">
                                        <Skeleton height="13px" width="70%" radius="5px" />
                                        <Skeleton height="11px" width="90%" radius="5px" style={{ marginTop: '5px' }} />
                                        <Skeleton height="10px" width="40%" radius="5px" style={{ marginTop: '4px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* État vide */}
                    {!isLoading && notifs.length === 0 && (
                        <div className="notif-empty">
                            <IonIcon icon={notificationsOutline} className="notif-empty-icon" />
                            <IonText color="medium">
                                <p className="notif-empty-text">Aucune notification</p>
                            </IonText>
                        </div>
                    )}

                    {/* Liste */}
                    {!isLoading && notifs.length > 0 && (
                        <IonList lines="full" className="notif-list">
                            {notifs.slice(0, 20).map((n: ApiNotification) => (
                                <IonItem key={n.id} button detail={false}
                                    onClick={() => handleMarkRead(n.id)}
                                    className={`notif-item ${!n.read ? 'notif-item--unread' : ''}`}>
                                    <div slot="start" className={`notif-type-icon notif-type-icon--${n.type}`} aria-hidden>
                                        <IonIcon icon={TYPE_ICONS[n.type]} />
                                    </div>
                                    <IonLabel className="notif-item-label">
                                        <div className="notif-item-header">
                                            <span className={`notif-item-title ${!n.read ? 'notif-item-title--bold' : ''}`}>{n.title}</span>
                                            <Badge variant={TYPE_BADGE_VARIANT[n.type]} size="sm" pill className="notif-type-badge">
                                                {NOTIF_TYPE_LABELS[n.type]}
                                            </Badge>
                                            {!n.read && <span className="notif-unread-dot" aria-label="Non lu" />}
                                        </div>
                                        <p className="notif-item-message">{n.message}</p>
                                        <p className="notif-item-time">{timeAgo(n.created_at)}</p>
                                    </IonLabel>
                                    <IonButton slot="end" fill="clear" size="small" color="medium"
                                        className="notif-delete-btn"
                                        onClick={e => handleDelete(e, n.id)}
                                        title="Supprimer" aria-label="Supprimer la notification">
                                        <IonIcon slot="icon-only" icon={trashOutline} />
                                    </IonButton>
                                </IonItem>
                            ))}
                        </IonList>
                    )}

                    {/* Footer — compteur si plus de 20 */}
                    {!isLoading && notifs.length > 20 && (
                        <p className="notif-more-hint">
                            +{notifs.length - 20} notification{notifs.length - 20 > 1 ? 's' : ''} non affichée{notifs.length - 20 > 1 ? 's' : ''}
                        </p>
                    )}
                </IonContent>
            </IonPopover>
        </div>
    );
};

export default NotificationPanel;
