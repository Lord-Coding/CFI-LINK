import React, { useCallback, useEffect, useState } from 'react';
import { bookOutline, cardOutline, checkmarkDoneOutline, closeOutline, IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPopover, IonText, IonTitle, IonToolbar, megaphoneOutline, notificationsOutline, schoolOutline, settingsOutline } from '../lib/ionic';
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead, NotificationType, Notification, NOTIF_TYPE_LABELS } from '../lib/notifications';
import { useAuth } from '../hooks/useAuth';
import "../styles/components/_NotificationPanel.css";
import Badge from './ui/Badge';
import Avatar from './ui/Avatar';
import { SkeletonAvatar, Skeleton } from './ui/Skeleton';

const TYPE_ICONS: Record<NotificationType, string> = {
  annonce: megaphoneOutline,
  note: schoolOutline,
  paiement: cardOutline,
  systeme: settingsOutline,
  cours: bookOutline,
};

const TYPE_BADGE_VARIANT: Record<NotificationType, "default" | "success" | "warning" | "info" | "secondary"> = {
  annonce: "default",
  note: "success",
  paiement: "warning",
  systeme: "secondary",
  cours: "info",
};

const TYPE_AVATAR_COLOR: Record<NotificationType, string> = {
  annonce:  "var(--ion-color-primary)",
  note: "var(--ion-color-success)",
  paiement: "var(--ion-color-warning)",
  systeme:"var(--ion-color-medium)",
  cours: "var(--ion-color-tertiary, #5260ff)",
};

const NOTIF_TYPES_LABELS: Record<NotificationType, string> = {
  annonce: "Annonce",
  note: "Note",
  paiement: "Paiement",
  systeme: "Systeme",
  cours: "Cours",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

const NotificationPanel: React.FC = () => {
  const { user } = useAuth();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<Event | undefined>();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!user) return;
    setNotifs(getNotifications(user.id, user.role));
    setUnread(getUnreadCount(user.id, user.role));
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { 
    if (!popoverOpen) return;
    setIsLoading(true);
    const t = setTimeout(() => {
      refresh();
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(t); 
  }, [popoverOpen, refresh]);

  const openPopover = (e: React.MouseEvent) => {
    setPopoverEvent(e.nativeEvent);
    setPopoverOpen(true);
  };

  const handleMarkRead = (id: string) => {
    markAsRead(id);
    refresh();
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    markAllAsRead(user.id, user.role);
    refresh();
  };

  return (
    <div className="notif-wrapper">

      <div className="notif-bell-container" onClick={openPopover}>
        <IonButton fill="clear" shape="round" className="notif-bell-btn">
          <IonIcon icon={notificationsOutline} slot="icon-only" className="notif-bell-icon" />
        </IonButton>

        {unread > 0 && (
          <div className="notif-bell-badge">
            <Badge variant="danger" size="sm" pill className="notif-badge-pill">
              {unread > 9 ? "9+" : String(unread)}
            </Badge>
          </div>
        )}
      </div>

      <IonPopover
        isOpen={popoverOpen}
        event={popoverEvent}
        onDidDismiss={() => setPopoverOpen(false)}
        className="notif-popover"
        showBackdrop={true}
        dismissOnSelect={false}
      >
        <IonHeader className="ion-no-border">
          <IonToolbar className="notif-popover-toolbar">
            <IonTitle className="notif-popover-title">
              Notifications
              {unread > 0 && (
                <Badge variant="danger" size="sm" pill style={{ marginLeft: "0.5rem" }}>
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

        <IonContent className="notif-popover-content">

          {isLoading && (
            <div className="notif-skeleton-list">
              {[1, 2, 3].map(i => (
                <div key={i} className="notif-skeleton-item">
                  <SkeletonAvatar size="md" shape="rounded" />
                  <div className="notif-skeleton-body">
                    <Skeleton height="13px" width="70%" radius="5px" />
                    <Skeleton height="11px" width="90%" radius="5px" style={{ marginTop: "5px" }} />
                    <Skeleton height="10px" width="40%" radius="5px" style={{ marginTop: "4px" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && notifs.length === 0 && (
            <div className="notif-empty">
              <IonIcon icon={notificationsOutline} className="notif-empty-icon" />
              <IonText color="medium">
                <p className="notif-empty-text">Aucune notification</p>
              </IonText>
            </div>
          )}

          {!isLoading && notifs.length > 0 && (
            <IonList lines="full" className="notif-list">
              {notifs.slice(0, 20).map((n) => (
                <IonItem
                  key={n.id}
                  button
                  detail={false}
                  onClick={() => handleMarkRead(n.id)}
                  className={`notif-item ${!n.read ? "notif-item--unread" : ""}`}
                >
                  <Avatar
                    slot="start"
                    fallback=""
                    size="sm"
                    shape="rounded"
                    color={TYPE_AVATAR_COLOR[n.type]}
                    className="notif-type-avatar"
                    style={{ marginRight: "0.75rem", marginTop: "0.1rem" }}
                  >
                  </Avatar>
                  <div
                    slot="start"
                    className={`notif-type-icon notif-type-icon--${n.type}`}
                    aria-hidden
                  >
                    <IonIcon icon={TYPE_ICONS[n.type]} />
                  </div>

                  <IonLabel className="notif-item-label">
                    <div className="notif-item-header">
                      <span className={`notif-item-title ${!n.read ? "notif-item-title--bold" : ""}`}>
                        {n.title}
                      </span>
                      <Badge
                        variant={TYPE_BADGE_VARIANT[n.type]}
                        size="sm"
                        pill
                        className="notif-type-badge"
                      >
                        {NOTIF_TYPE_LABELS[n.type]}
                      </Badge>
                      {!n.read && <span className="notif-unread-dot" aria-label="Non lu" />}
                    </div>
                    <p className="notif-item-message">{n.message}</p>
                    <p className="notif-item-time">{timeAgo(n.date)}</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          )}
        </IonContent>
      </IonPopover>
    </div>
  );
};

export default NotificationPanel;
