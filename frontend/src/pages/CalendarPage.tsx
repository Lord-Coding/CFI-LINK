import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonModal, IonInput, IonChip,
    IonSegment, IonSegmentButton, IonLabel,
} from '../lib/ionic';
import {
    calendarOutline, addCircleOutline, trashOutline, timeOutline,
    checkmarkCircleOutline, closeCircleOutline, flagOutline,
    schoolOutline, alertCircleOutline, leafOutline, peopleOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService, type ApiCalendarEvent } from '../lib/services/calendarService';
import { Badge, AlertDialog } from '../components';
import Calendar from '../components/ui/Calendar';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/CalendarPage.css';

type CalendarEvent = ApiCalendarEvent;
const EVENT_TYPE_LABELS: Record<string, string> = {
    exam: 'Examen', deadline: 'Deadline', event: 'Événement', holiday: 'Congé', meeting: 'Réunion',
};
type BadgeVar = 'danger' | 'warning' | 'default' | 'success' | 'info';
const TYPE_BADGE: Record<string, BadgeVar> = {
    exam:     'danger',
    deadline: 'warning',
    event:    'default',
    holiday:  'success',
    meeting:  'info',
};

/* ── Icône par type ── */
const TYPE_ICON: Record<string, string> = {
    exam:     schoolOutline,
    deadline: alertCircleOutline,
    event:    calendarOutline,
    holiday:  leafOutline,
    meeting:  peopleOutline,
};

/* ── Couleur de fond par type ── */
const TYPE_COLOR_CLASS: Record<string, string> = {
    exam:     'cp-event--exam',
    deadline: 'cp-event--deadline',
    event:    'cp-event--event',
    holiday:  'cp-event--holiday',
    meeting:  'cp-event--meeting',
};

/* ── Formater date ── */
function fmt(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
}

function fmtShort(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/* ── Comparer si un événement est sur un jour donné ── */
function isSameDay(iso: string, d: Date): boolean {
    const ev = new Date(iso);
    return ev.getFullYear() === d.getFullYear() &&
           ev.getMonth()    === d.getMonth()    &&
           ev.getDate()     === d.getDate();
}

type TabKey = 'upcoming' | 'all';

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const CalendarPage: React.FC = () => {
    const { user } = useAuth();
    const qc = useQueryClient();

    const [tab,          setTab]          = useState<TabKey>('upcoming');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [modalOpen,    setModalOpen]    = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);

    const [fTitle, setFTitle] = useState('');
    const [fDesc,  setFDesc]  = useState('');
    const [fDate,  setFDate]  = useState('');
    const [fTime,  setFTime]  = useState('');
    const [fType,  setFType]  = useState<CalendarEvent['type']>('event');

    if (!user) return null;

    const canManage = isAdmin(user.role);

    const { data: allEvents = [] } = useQuery({
        queryKey: ['events'],
        queryFn: calendarService.list,
    });

    const now            = new Date().toISOString().slice(0, 10);
    const in30Days       = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const upcomingEvents = allEvents.filter(e => e.date >= now && e.date <= in30Days);
    const dayEvents      = allEvents.filter(e => isSameDay(e.date, selectedDate));
    const displayed      = tab === 'upcoming' ? upcomingEvents : allEvents;

    const addMutation = useMutation({
        mutationFn: calendarService.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); closeModal(); },
    });
    const deleteMutation = useMutation({
        mutationFn: calendarService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); setDeleteTarget(null); },
    });

    const handleAdd = (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!fTitle || !fDate) return;
        addMutation.mutate({ title: fTitle, description: fDesc, date: fDate, time: fTime || undefined, type: fType });
    };

    const closeModal = () => {
        setModalOpen(false);
        setFTitle(''); setFDesc(''); setFDate(''); setFTime(''); setFType('event');
    };

    return (
        <DashboardLayout>

            {/* ── Hero ── */}
            <div className="cp-hero">
                <div className="cp-hero-text">
                    <h1 className="cp-hero-title">Calendrier académique</h1>
                    <p className="cp-hero-sub">Examens, deadlines, événements et congés.</p>
                    <div className="cp-hero-badges">
                        <span className="cp-hero-badge">
                            <IonIcon icon={calendarOutline} />{allEvents.length} événements
                        </span>
                        <span className="cp-hero-badge">
                            <IonIcon icon={timeOutline} />{upcomingEvents.length} à venir (30j)
                        </span>
                    </div>
                </div>
                {canManage && (
                    <div className="cp-hero-action">
                        <IonButton className="cp-hero-btn" fill="outline" onClick={() => setModalOpen(true)}>
                            <IonIcon slot="start" icon={addCircleOutline} />
                            Ajouter
                        </IonButton>
                    </div>
                )}
            </div>

            {/* ── Layout principal : calendrier + liste ── */}
            <div className="cp-layout">

                {/* Panneau gauche : mini-calendrier + événements du jour */}
                <div className="cp-sidebar">
                    <div className="cp-cal-wrap">
                        <Calendar
                            value={selectedDate}
                            onChange={d => setSelectedDate(d)}
                            highlightToday
                        />
                    </div>

                    {/* Événements du jour sélectionné */}
                    <div className="cp-day-events">
                        <h3 className="cp-day-events-title">
                            {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                        {dayEvents.length === 0 ? (
                            <p className="cp-day-events-empty">Aucun événement ce jour.</p>
                        ) : (
                            <div className="cp-day-events-list">
                                {dayEvents.map(e => (
                                    <div key={e.id} className={`cp-day-event ${TYPE_COLOR_CLASS[e.type]}`}>
                                        <IonIcon icon={TYPE_ICON[e.type]} className="cp-day-event-icon" />
                                        <div className="cp-day-event-body">
                                            <p className="cp-day-event-title">{e.title}</p>
                                            {e.time && (
                                                <p className="cp-day-event-time">
                                                    <IonIcon icon={timeOutline} />{e.time}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Panneau droit : liste complète */}
                <div className="cp-main">
                    <div className="cp-list-toolbar">
                        <IonSegment
                            mode="ios"
                            value={tab}
                            className="cp-segment"
                            onIonChange={e => setTab(String(e.detail.value) as TabKey)}
                        >
                            <IonSegmentButton value="upcoming" className="cp-seg-btn">
                                <IonLabel>À venir ({upcomingEvents.length})</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="all" className="cp-seg-btn">
                                <IonLabel>Tous ({allEvents.length})</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                    </div>

                    {displayed.length === 0 ? (
                        <div className="cp-empty">
                            <IonIcon icon={calendarOutline} className="cp-empty-icon" />
                            <p>Aucun événement.</p>
                        </div>
                    ) : (
                        <div className="cp-events-list">
                            {displayed.map(e => (
                                <div
                                    key={e.id}
                                    className={`cp-event ${TYPE_COLOR_CLASS[e.type]}`}
                                    onClick={() => setSelectedDate(new Date(e.date))}
                                >
                                    {/* Date à gauche */}
                                    <div className="cp-event-date">
                                        <span className="cp-event-day">{new Date(e.date).getDate()}</span>
                                        <span className="cp-event-month">
                                            {new Date(e.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                        </span>
                                    </div>

                                    {/* Contenu */}
                                    <div className="cp-event-body">
                                        <div className="cp-event-header">
                                            <h3 className="cp-event-title">{e.title}</h3>
                                            <Badge variant={TYPE_BADGE[e.type]} size="sm">
                                                {EVENT_TYPE_LABELS[e.type]}
                                            </Badge>
                                        </div>
                                        {e.description && (
                                            <p className="cp-event-desc">{e.description}</p>
                                        )}
                                        {e.time && (
                                            <p className="cp-event-time">
                                                <IonIcon icon={timeOutline} />{e.time}
                                            </p>
                                        )}
                                    </div>

                                    {/* Supprimer */}
                                    {canManage && (
                                        <IonButton
                                            fill="clear"
                                            size="small"
                                            color="danger"
                                            className="cp-event-del"
                                            onClick={(ev) => { ev.stopPropagation(); setDeleteTarget(e); }}
                                        >
                                            <IonIcon slot="icon-only" icon={trashOutline} />
                                        </IonButton>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal ajout événement ── */}
            <IonModal isOpen={modalOpen} onDidDismiss={closeModal} className="cp-modal">
                <div className="cp-modal-inner">
                    <div className="cp-modal-header">
                        <div className="cp-modal-header-icon">
                            <IonIcon icon={calendarOutline} />
                        </div>
                        <div>
                            <h2 className="cp-modal-title">Nouvel événement</h2>
                            <p className="cp-modal-subtitle">Ajoutez un événement au calendrier.</p>
                        </div>
                        <IonButton fill="clear" size="small" onClick={closeModal} className="cp-modal-close">
                            <IonIcon slot="icon-only" icon={closeCircleOutline} />
                        </IonButton>
                    </div>

                    <form onSubmit={handleAdd} className="cp-form">

                        {/* Type */}
                        <div className="cp-form-section">
                            <span className="cp-form-section-label">Type d'événement</span>
                            <div className="cp-type-grid">
                                {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                                    <button
                                        key={k}
                                        type="button"
                                        className={`cp-type-card cp-type-card--${k} ${fType === k ? 'cp-type-card--active' : ''}`}
                                        onClick={() => setFType(k as CalendarEvent['type'])}
                                    >
                                        <IonIcon icon={TYPE_ICON[k]} className="cp-type-icon" />
                                        <span className="cp-type-label">{v}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Détails */}
                        <div className="cp-form-section">
                            <span className="cp-form-section-label">Détails</span>
                            <div className="cp-form-grid">
                                <div className="cp-field cp-field--full">
                                    <label className="cp-field-label">
                                        Titre <span className="cp-required">*</span>
                                    </label>
                                    <IonInput
                                        className="cp-field-input"
                                        value={fTitle}
                                        onIonInput={e => setFTitle(String(e.detail.value ?? ''))}
                                        placeholder="Titre de l'événement"
                                        required
                                    />
                                </div>
                                <div className="cp-field cp-field--full">
                                    <label className="cp-field-label">Description</label>
                                    <IonInput
                                        className="cp-field-input"
                                        value={fDesc}
                                        onIonInput={e => setFDesc(String(e.detail.value ?? ''))}
                                        placeholder="Description optionnelle"
                                    />
                                </div>
                                <div className="cp-field">
                                    <label className="cp-field-label">
                                        <IonIcon icon={calendarOutline} className="cp-field-icon" />
                                        Date <span className="cp-required">*</span>
                                    </label>
                                    <IonInput
                                        className="cp-field-input"
                                        type="date"
                                        value={fDate}
                                        onIonInput={e => setFDate(String(e.detail.value ?? ''))}
                                        required
                                    />
                                </div>
                                <div className="cp-field">
                                    <label className="cp-field-label">
                                        <IonIcon icon={timeOutline} className="cp-field-icon" />
                                        Heure
                                    </label>
                                    <IonInput
                                        className="cp-field-input"
                                        type="time"
                                        value={fTime}
                                        onIonInput={e => setFTime(String(e.detail.value ?? ''))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="cp-form-actions">
                            <IonButton expand="block" fill="outline" color="medium" type="button" onClick={closeModal}>
                                Annuler
                            </IonButton>
                            <IonButton expand="block" type="submit" color="primary" disabled={!fTitle || !fDate}>
                                <IonIcon slot="start" icon={checkmarkCircleOutline} />
                                Créer
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
                title="Supprimer l'événement"
                description={`Supprimer "${deleteTarget?.title}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id as number); }}
            />

        </DashboardLayout>
    );
};

export default CalendarPage;
