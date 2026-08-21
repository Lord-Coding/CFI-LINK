// @ts-nocheck
import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonModal, IonSearchbar,
    IonSegment, IonSegmentButton, IonLabel, IonTextarea, IonSelect,
    IonSelectOption, IonItem, IonChip,
} from '../lib/ionic';
import {
    mailOutline, sendOutline, arrowBackOutline, trashOutline,
    addCircleOutline, closeCircleOutline, checkmarkCircleOutline,
    checkmarkDoneOutline, personOutline, createOutline,
    notificationsOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService, type ApiMessage } from '../lib/services/messageService';
import { userService } from '../lib/services/userService';
import { ROLE_LABELS } from '../lib/store';
import { Avatar, Badge, AlertDialog } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Messages.css';

type Message = ApiMessage & { from_name?: string; to_name?: string; date?: string };
type TabKey = 'inbox' | 'sent';

/* ── Formatage date ── */
function formatDate(iso: string): string {
    const d    = new Date(iso);
    const now  = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60)         return 'À l\'instant';
    if (diff < 3600)       return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400)      return `Il y a ${Math.floor(diff / 3600)}h`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const Messages: React.FC = () => {
    const { user } = useAuth();
    const qc = useQueryClient();

    const [tab,          setTab]          = useState<TabKey>('inbox');
    const [search,       setSearch]       = useState('');
    const [composeOpen,  setComposeOpen]  = useState(false);
    const [detailMsg,    setDetailMsg]    = useState<Message | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
    const [fToId,        setFToId]        = useState<string>('');
    const [fSubject,     setFSubject]     = useState('');
    const [fBody,        setFBody]        = useState('');

    if (!user) return null;

    const { data: inbox = [] }    = useQuery<any[]>({ queryKey: ['messages', 'inbox'],    queryFn: messageService.inbox });
    const { data: sent  = [] }    = useQuery<any[]>({ queryKey: ['messages', 'sent'],     queryFn: messageService.sent  });
    const { data: contacts = [] } = useQuery<any[]>({ queryKey: ['users', 'contacts'],    queryFn: () => userService.list() });

    const unread   = inbox.filter(m => !m.read).length;
    const allUsers = contacts.filter((u: { id: number }) => u.id !== user.id);

    const sendMutation = useMutation<any,any,any>({
        mutationFn: messageService.send,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['messages'] }); closeCompose(); },
    });

    const markReadMutation = useMutation<any,any,any>({
        mutationFn: messageService.markRead,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', 'inbox'] }),
    });

    const deleteMutation = useMutation<any,any,any>({
        mutationFn: messageService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['messages'] }); setDeleteTarget(null); },
    });

    const q = search.toLowerCase().trim();
    const normalize = (m: Message) => {
        const fromName = m.sender?.nom_complet ?? m.from_name ?? '';
        const toName   = m.recipient?.nom_complet ?? m.to_name ?? '';
        return { ...m, from_name: fromName, to_name: toName, date: m.date ?? m.created_at };
    };
    const inboxNorm = inbox.map(normalize);
    const sentNorm  = sent.map(normalize);

    const filterMsgs = (msgs: Message[]) =>
        msgs.filter(m => !q ||
            m.subject.toLowerCase().includes(q) ||
            (m.from_name ?? '').toLowerCase().includes(q) ||
            (m.to_name ?? '').toLowerCase().includes(q)
        );

    const displayed = filterMsgs(tab === 'inbox' ? inboxNorm : sentNorm);

    const closeCompose = () => {
        setComposeOpen(false);
        setFToId(''); setFSubject(''); setFBody('');
    };

    const handleSelect = (msg: Message) => {
        if (!msg.read && msg.to_id === user.id) {
            markMessageRead(msg.id);
            setRefreshKey(k => k + 1);
        }
        setDetailMsg(msg);
    };

    const handleDelete = (msg: Message) => {
        setDetailMsg(null);
        setDeleteTarget(msg);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        deleteMessage(deleteTarget.id);
        setRefreshKey(k => k + 1);
        setDeleteTarget(null);
    };

    const handleReply = (msg: Message) => {
        setDetailMsg(null);
        setFToId(msg.from_id);
        setFSubject(`Re : ${msg.subject}`);
        setComposeOpen(true);
    };

    return (
        <DashboardLayout>

            {/* ── Hero ── */}
            <div className="mg-hero">
                <div className="mg-hero-text">
                    <h1 className="mg-hero-title">Messagerie</h1>
                    <p className="mg-hero-sub">
                        {unread > 0
                            ? `${unread} message${unread > 1 ? 's' : ''} non lu${unread > 1 ? 's' : ''}`
                            : 'Aucun nouveau message'}
                    </p>
                    <div className="mg-hero-badges">
                        <span className="mg-hero-badge">
                            <IonIcon icon={mailOutline} />{inbox.length} reçus
                        </span>
                        <span className="mg-hero-badge">
                            <IonIcon icon={sendOutline} />{sent.length} envoyés
                        </span>
                        {unread > 0 && (
                            <span className="mg-hero-badge mg-hero-badge--unread">
                                <IonIcon icon={notificationsOutline} />{unread} non lus
                            </span>
                        )}
                    </div>
                </div>
                <div className="mg-hero-action">
                    <IonButton className="mg-hero-btn" fill="outline" onClick={() => setComposeOpen(true)}>
                        <IonIcon slot="start" icon={addCircleOutline} />
                        Nouveau
                    </IonButton>
                </div>
            </div>

            {/* ── Segment + Recherche ── */}
            <div className="mg-toolbar">
                <IonSegment
                    mode="ios"
                    value={tab}
                    className="mg-segment"
                    onIonChange={e => setTab(String(e.detail.value) as TabKey)}
                >
                    <IonSegmentButton value="inbox" className="mg-seg-btn">
                        <IonLabel>
                            Réception
                            {unread > 0 && (
                                <span className="mg-unread-dot">{unread}</span>
                            )}
                        </IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="sent" className="mg-seg-btn">
                        <IonLabel>Envoyés</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                <div className="mg-search-row">
                    <IonSearchbar
                        value={search}
                        onIonInput={e => setSearch(String(e.detail.value ?? ''))}
                        placeholder="Rechercher…"
                        className="mg-searchbar"
                        debounce={200}
                    />
                    <IonChip className="mg-count-chip">{displayed.length}</IonChip>
                </div>
            </div>

            {/* ── Liste messages ── */}
            {displayed.length === 0 ? (
                <div className="mg-empty">
                    <IonIcon icon={mailOutline} className="mg-empty-icon" />
                    <p>{tab === 'inbox' ? 'Aucun message reçu.' : 'Aucun message envoyé.'}</p>
                </div>
            ) : (
                <div className="mg-list">
                    {displayed.map(msg => {
                        const isUnread = !msg.read && msg.to_id === user.id;
                        const initials = (tab === 'inbox' ? msg.from_name : msg.to_name)
                            .charAt(0).toUpperCase();

                        return (
                            <button
                                key={msg.id}
                                className={`mg-item ${isUnread ? 'mg-item--unread' : ''}`}
                                onClick={() => handleSelect(msg)}
                            >
                                <div className="mg-item-avatar">
                                    <div className="mg-avatar">{initials}</div>
                                    {isUnread && <span className="mg-unread-indicator" />}
                                </div>

                                <div className="mg-item-body">
                                    <div className="mg-item-top">
                                        <span className={`mg-item-name ${isUnread ? 'mg-item-name--bold' : ''}`}>
                                            {tab === 'inbox' ? msg.from_name : `À : ${msg.to_name}`}
                                        </span>
                                        <span className="mg-item-date">{formatDate(msg.date)}</span>
                                    </div>
                                    <p className={`mg-item-subject ${isUnread ? 'mg-item-subject--bold' : ''}`}>
                                        {msg.subject}
                                    </p>
                                    <p className="mg-item-preview">
                                        {msg.body.slice(0, 80)}{msg.body.length > 80 ? '…' : ''}
                                    </p>
                                </div>

                                {tab === 'sent' && (
                                    <IonIcon icon={checkmarkDoneOutline} className="mg-sent-icon" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Modal détail message ── */}
            <IonModal
                isOpen={!!detailMsg}
                onDidDismiss={() => setDetailMsg(null)}
                className="mg-detail-modal"
            >
                {detailMsg && (
                    <div className="mg-detail-inner">
                        {/* Header */}
                        <div className="mg-detail-header">
                            <IonButton fill="clear" size="small" onClick={() => setDetailMsg(null)} className="mg-detail-back">
                                <IonIcon slot="icon-only" icon={arrowBackOutline} />
                            </IonButton>
                            <h2 className="mg-detail-title">Message</h2>
                            <div className="mg-detail-header-actions">
                                <IonButton
                                    fill="clear"
                                    size="small"
                                    color="primary"
                                    title="Répondre"
                                    onClick={() => handleReply(detailMsg)}
                                >
                                    <IonIcon slot="icon-only" icon={createOutline} />
                                </IonButton>
                                <IonButton
                                    fill="clear"
                                    size="small"
                                    color="danger"
                                    title="Supprimer"
                                    onClick={() => handleDelete(detailMsg)}
                                >
                                    <IonIcon slot="icon-only" icon={trashOutline} />
                                </IonButton>
                            </div>
                        </div>

                        {/* Contenu */}
                        <div className="mg-detail-content">
                            <h3 className="mg-detail-subject">{detailMsg.subject}</h3>

                            <div className="mg-detail-meta">
                                <div className="mg-detail-meta-row">
                                    <span className="mg-detail-meta-label">De</span>
                                    <div className="mg-detail-meta-person">
                                        <div className="mg-detail-avatar">
                                            {detailMsg.from_name.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{detailMsg.from_name}</span>
                                    </div>
                                </div>
                                <div className="mg-detail-meta-row">
                                    <span className="mg-detail-meta-label">À</span>
                                    <div className="mg-detail-meta-person">
                                        <div className="mg-detail-avatar">
                                            {detailMsg.to_name.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{detailMsg.to_name}</span>
                                    </div>
                                </div>
                                <div className="mg-detail-meta-row">
                                    <span className="mg-detail-meta-label">Date</span>
                                    <span className="mg-detail-meta-date">
                                        {new Date(detailMsg.date).toLocaleDateString('fr-FR', {
                                            day: 'numeric', month: 'long', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="mg-detail-body">
                                <p>{detailMsg.body}</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mg-detail-footer">
                            <IonButton
                                expand="block"
                                fill="outline"
                                color="primary"
                                onClick={() => handleReply(detailMsg)}
                            >
                                <IonIcon slot="start" icon={createOutline} />
                                Répondre
                            </IonButton>
                        </div>
                    </div>
                )}
            </IonModal>

            {/* ── Modal composer ── */}
            <IonModal isOpen={composeOpen} onDidDismiss={closeCompose} className="mg-compose-modal">
                <div className="mg-compose-inner">
                    <div className="mg-compose-header">
                        <div className="mg-compose-header-icon">
                            <IonIcon icon={mailOutline} />
                        </div>
                        <div>
                            <h2 className="mg-compose-title">Nouveau message</h2>
                            <p className="mg-compose-subtitle">Rédigez et envoyez un message.</p>
                        </div>
                        <IonButton fill="clear" size="small" onClick={closeCompose} className="mg-compose-close">
                            <IonIcon slot="icon-only" icon={closeCircleOutline} />
                        </IonButton>
                    </div>

                    <form onSubmit={handleSend} className="mg-compose-form">

                        {/* Destinataire */}
                        <div className="mg-compose-section">
                            <span className="mg-compose-section-label">Destinataire</span>
                            <IonItem className="mg-select-item" lines="none">
                                <IonSelect
                                    value={fToId}
                                    onIonChange={e => setFToId(String(e.detail.value ?? ''))}
                                    interface="action-sheet"
                                    placeholder="Choisir un destinataire"
                                >
                                    {allUsers.map((c: { id: number; nom_complet: string; role: string }) => (
                                        <IonSelectOption key={c.id} value={String(c.id)}>
                                            {c.nom_complet} — {ROLE_LABELS[c.role] ?? c.role}
                                        </IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonItem>
                        </div>

                        {/* Objet */}
                        <div className="mg-compose-section">
                            <span className="mg-compose-section-label">Objet</span>
                            <div className="mg-field">
                                <IonTextarea
                                    className="mg-field-input mg-field-input--subject"
                                    value={fSubject}
                                    onIonInput={e => setFSubject(String(e.detail.value ?? ''))}
                                    placeholder="Objet du message"
                                    rows={1}
                                    autoGrow
                                    required
                                />
                            </div>
                        </div>

                        {/* Corps */}
                        <div className="mg-compose-section">
                            <span className="mg-compose-section-label">Message</span>
                            <div className="mg-field">
                                <IonTextarea
                                    className="mg-field-input mg-field-input--body"
                                    value={fBody}
                                    onIonInput={e => setFBody(String(e.detail.value ?? ''))}
                                    placeholder="Votre message…"
                                    rows={6}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mg-compose-actions">
                            <IonButton expand="block" fill="outline" color="medium" type="button" onClick={closeCompose}>
                                Annuler
                            </IonButton>
                            <IonButton
                                expand="block"
                                type="submit"
                                color="primary"
                                disabled={!fToId || !fSubject || !fBody.trim()}
                            >
                                <IonIcon slot="start" icon={sendOutline} />
                                Envoyer
                            </IonButton>
                        </div>
                    </form>
                </div>
            </IonModal>

            {/* ── Confirmation suppression ── */}
            <AlertDialog
                isOpen={!!deleteTarget}
                onDismiss={() => setDeleteTarget(null)}
                variant="danger"
                title="Supprimer le message"
                description={`Supprimer "${deleteTarget?.subject}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                onConfirm={confirmDelete}
            />

        </DashboardLayout>
    );
};

export default Messages;
