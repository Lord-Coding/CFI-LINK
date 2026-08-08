import React, { useState, useCallback } from 'react';
import { IonButton, IonIcon } from '../lib/ionic';
import {
    addOutline,
    calendarOutline,
    chevronBackOutline,
    chevronForwardOutline,
    closeOutline,
    createOutline,
    downloadOutline,
    locationOutline,
    schoolOutline,
    timeOutline,
    todayOutline,
    trashOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { isAdmin, isStudent, isProfessor, getUsers, isProfessor as isProfRole, Filiere, Annee, OptionLIC } from '../lib/store';
import {
    getScheduleForStudent, getScheduleForProfessor, getAllSchedules,
    addScheduleEntry, updateScheduleEntry, deleteScheduleEntry,
    DAYS, HOURS, ScheduleEntry,
} from '../lib/schedule-store';
import { Badge } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Schedule.css';

/* ─── Helpers ─── */
function resolveColor(color: string): string {
    if (color.includes('primary'))     return 'primary';
    if (color.includes('success'))     return 'success';
    if (color.includes('warning'))     return 'warning';
    if (color.includes('destructive')) return 'danger';
    if (color.includes('info'))        return 'info';
    return 'primary';
}

const COLOR_OPTIONS = [
    { label: 'Bleu',    value: 'bg-primary/10 border-primary/30 text-primary' },
    { label: 'Vert',    value: 'bg-success/10 border-success/30 text-success' },
    { label: 'Orange',  value: 'bg-warning/10 border-warning/30 text-warning' },
    { label: 'Violet',  value: 'bg-info/10 border-info/30 text-info' },
    { label: 'Rouge',   value: 'bg-destructive/10 border-destructive/30 text-destructive' },
];

const FILIERE_OPTIONS: Filiere[] = ['LIC', 'LAP'];
const ANNEE_OPTIONS: Annee[]     = ['L1', 'L2', 'L3'];
const OPTION_OPTIONS: OptionLIC[]= ['GL', 'SR'];

function getWeekDates(offset: number): Date[] {
    const now    = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
    return DAYS.map((_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

function exportCSV(entries: ScheduleEntry[]) {
    const header = 'Jour,Heure,Matière,Salle,Enseignant,Filière,Année\n';
    const rows   = entries
        .map(e => `${e.day},${e.hour},"${e.subject}","${e.room}","${e.teacher}",${e.filiere},${e.annee}`)
        .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'emploi_du_temps.csv';
    a.click();
    URL.revokeObjectURL(url);
}

/* ─── Types formulaire ─── */
interface FormState {
    day: string;
    hour: string;
    subject: string;
    room: string;
    teacher: string;
    filiere: Filiere;
    annee: Annee;
    option: OptionLIC | '';
    color: string;
}

const EMPTY_FORM: FormState = {
    day: 'Lundi',
    hour: '08:00',
    subject: '',
    room: '',
    teacher: '',
    filiere: 'LIC',
    annee: 'L1',
    option: '',
    color: COLOR_OPTIONS[0].value,
};

/* ─── Modal formulaire ─── */
interface ScheduleFormModalProps {
    initial: FormState;
    professors: string[];
    title: string;
    onSave: (form: FormState) => void;
    onClose: () => void;
}

const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({ initial, professors, title, onSave, onClose }) => {
    const [form, setForm] = useState<FormState>(initial);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
        setForm(f => ({ ...f, [key]: val }));

    const validate = (): boolean => {
        const e: typeof errors = {};
        if (!form.subject.trim()) e.subject = 'Champ requis';
        if (!form.room.trim())    e.room    = 'Champ requis';
        if (!form.teacher.trim()) e.teacher = 'Champ requis';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (validate()) onSave(form);
    };

    const needsOption = form.filiere === 'LIC' && form.annee === 'L3';

    return (
        <div className="sc-modal-backdrop" role="dialog" aria-modal="true">
            <div className="sc-modal">
                <div className="sc-modal-header">
                    <h2 className="sc-modal-title">{title}</h2>
                    <button className="sc-modal-close" onClick={onClose} aria-label="Fermer">
                        <IonIcon icon={closeOutline} />
                    </button>
                </div>

                <div className="sc-modal-body">
                    {/* Jour + Heure */}
                    <div className="sc-form-row">
                        <div className="sc-form-group">
                            <label className="sc-form-label">Jour</label>
                            <select className="sc-form-select" value={form.day} onChange={e => set('day', e.target.value)}>
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="sc-form-group">
                            <label className="sc-form-label">Heure</label>
                            <select className="sc-form-select" value={form.hour} onChange={e => set('hour', e.target.value)}>
                                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Matière */}
                    <div className="sc-form-group">
                        <label className="sc-form-label">Matière <span className="sc-form-required">*</span></label>
                        <input
                            className={`sc-form-input ${errors.subject ? 'sc-form-input--error' : ''}`}
                            value={form.subject}
                            onChange={e => set('subject', e.target.value)}
                            placeholder="Ex: Algorithmique avancée"
                        />
                        {errors.subject && <span className="sc-form-error">{errors.subject}</span>}
                    </div>

                    {/* Salle */}
                    <div className="sc-form-group">
                        <label className="sc-form-label">Salle <span className="sc-form-required">*</span></label>
                        <input
                            className={`sc-form-input ${errors.room ? 'sc-form-input--error' : ''}`}
                            value={form.room}
                            onChange={e => set('room', e.target.value)}
                            placeholder="Ex: Labo Info 1"
                        />
                        {errors.room && <span className="sc-form-error">{errors.room}</span>}
                    </div>

                    {/* Professeur */}
                    <div className="sc-form-group">
                        <label className="sc-form-label">Professeur <span className="sc-form-required">*</span></label>
                        <input
                            className={`sc-form-input ${errors.teacher ? 'sc-form-input--error' : ''}`}
                            value={form.teacher}
                            onChange={e => set('teacher', e.target.value)}
                            placeholder="Nom du professeur"
                            list="sc-professors-list"
                        />
                        <datalist id="sc-professors-list">
                            {professors.map(p => <option key={p} value={p} />)}
                        </datalist>
                        {errors.teacher && <span className="sc-form-error">{errors.teacher}</span>}
                    </div>

                    {/* Filière + Année */}
                    <div className="sc-form-row">
                        <div className="sc-form-group">
                            <label className="sc-form-label">Filière</label>
                            <select
                                className="sc-form-select"
                                value={form.filiere}
                                onChange={e => set('filiere', e.target.value as Filiere)}
                            >
                                {FILIERE_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className="sc-form-group">
                            <label className="sc-form-label">Année</label>
                            <select
                                className="sc-form-select"
                                value={form.annee}
                                onChange={e => set('annee', e.target.value as Annee)}
                            >
                                {ANNEE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Option (LIC L3 uniquement) */}
                    {needsOption && (
                        <div className="sc-form-group">
                            <label className="sc-form-label">Option</label>
                            <select
                                className="sc-form-select"
                                value={form.option}
                                onChange={e => set('option', e.target.value as OptionLIC | '')}
                            >
                                <option value="">Commun (GL + SR)</option>
                                {OPTION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Couleur */}
                    <div className="sc-form-group">
                        <label className="sc-form-label">Couleur</label>
                        <div className="sc-color-picker">
                            {COLOR_OPTIONS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    className={`sc-color-swatch sc-color-swatch--${resolveColor(c.value)} ${form.color === c.value ? 'sc-color-swatch--active' : ''}`}
                                    onClick={() => set('color', c.value)}
                                    aria-label={c.label}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="sc-modal-footer">
                    <IonButton fill="outline" onClick={onClose}>Annuler</IonButton>
                    <IonButton onClick={handleSave}>Enregistrer</IonButton>
                </div>
            </div>
        </div>
    );
};

/* ─── Modal confirmation suppression ─── */
interface ConfirmDeleteProps {
    entry: ScheduleEntry;
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteProps> = ({ entry, onConfirm, onClose }) => (
    <div className="sc-modal-backdrop" role="dialog" aria-modal="true">
        <div className="sc-modal sc-modal--sm">
            <div className="sc-modal-header">
                <h2 className="sc-modal-title">Supprimer ce créneau ?</h2>
                <button className="sc-modal-close" onClick={onClose} aria-label="Fermer">
                    <IonIcon icon={closeOutline} />
                </button>
            </div>
            <div className="sc-modal-body">
                <p className="sc-confirm-text">
                    Vous êtes sur le point de supprimer le créneau <strong>{entry.subject}</strong> le {entry.day} à {entry.hour}.
                    Cette action est irréversible.
                </p>
            </div>
            <div className="sc-modal-footer">
                <IonButton fill="outline" onClick={onClose}>Annuler</IonButton>
                <IonButton color="danger" onClick={onConfirm}>
                    <IonIcon slot="start" icon={trashOutline} />
                    Supprimer
                </IonButton>
            </div>
        </div>
    </div>
);

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const Schedule: React.FC = () => {
    const { user } = useAuth();

    const [weekOffset,  setWeekOffset]  = useState(0);
    const [entries,     setEntries]     = useState<ScheduleEntry[]>(() => {
        if (!user) return [];
        return isStudent(user.role)
            ? getScheduleForStudent(user.filiere, user.annee, user.option)
            : isProfessor(user.role)
                ? getScheduleForProfessor(user.nom_complet)
                : getAllSchedules();
    });

    /* Modals */
    const [showAdd,    setShowAdd]    = useState(false);
    const [editEntry,  setEditEntry]  = useState<ScheduleEntry | null>(null);
    const [deleteEntry,setDeleteEntry]= useState<ScheduleEntry | null>(null);

    if (!user) return null;

    const canEdit = isAdmin(user.role);

    /* Liste des profs depuis le store */
    const professors = getUsers()
        .filter(u => isProfRole(u.role))
        .map(u => u.nom_complet);

    /* Refresh local state */
    const refresh = useCallback(() => {
        const fresh = isStudent(user.role)
            ? getScheduleForStudent(user.filiere, user.annee, user.option)
            : isProfessor(user.role)
                ? getScheduleForProfessor(user.nom_complet)
                : getAllSchedules();
        setEntries(fresh);
    }, [user]);

    /* Handlers CRUD */
    const handleAdd = (form: FormState) => {
        addScheduleEntry({
            day:     form.day,
            hour:    form.hour,
            subject: form.subject.trim(),
            room:    form.room.trim(),
            teacher: form.teacher.trim(),
            filiere: form.filiere,
            annee:   form.annee,
            option:  (form.option || undefined) as OptionLIC | undefined,
            color:   form.color,
        });
        setShowAdd(false);
        refresh();
    };

    const handleEdit = (form: FormState) => {
        if (!editEntry) return;
        updateScheduleEntry(editEntry.id, {
            day:     form.day,
            hour:    form.hour,
            subject: form.subject.trim(),
            room:    form.room.trim(),
            teacher: form.teacher.trim(),
            filiere: form.filiere,
            annee:   form.annee,
            option:  (form.option || undefined) as OptionLIC | undefined,
            color:   form.color,
        });
        setEditEntry(null);
        refresh();
    };

    const handleDelete = () => {
        if (!deleteEntry) return;
        deleteScheduleEntry(deleteEntry.id);
        setDeleteEntry(null);
        refresh();
    };

    /* Construire la map jour-heure */
    const scheduleMap: Record<string, ScheduleEntry[]> = {};
    entries.forEach(e => {
        const key = `${e.day}-${e.hour}`;
        if (!scheduleMap[key]) scheduleMap[key] = [];
        scheduleMap[key].push(e);
    });

    const dates     = getWeekDates(weekOffset);
    const monthYear = dates[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const today     = new Date().toDateString();

    const activeHours = HOURS.filter(h =>
        DAYS.some(d => (scheduleMap[`${d}-${h}`] ?? []).length > 0)
    );
    const displayHours = activeHours.length > 0 ? activeHours : HOURS.slice(0, 6);

    const subtitle = isStudent(user.role) && user.filiere
        ? `${user.filiere} ${user.annee}${user.option ? ` (${user.option})` : ''}`
        : isProfessor(user.role)
            ? user.nom_complet
            : 'Tous les cours';

    /* FormState pour l'édition */
    const editInitial = editEntry
        ? ({
            day:     editEntry.day,
            hour:    editEntry.hour,
            subject: editEntry.subject,
            room:    editEntry.room,
            teacher: editEntry.teacher,
            filiere: editEntry.filiere,
            annee:   editEntry.annee,
            option:  editEntry.option ?? '',
            color:   editEntry.color,
        } as FormState)
        : EMPTY_FORM;

    return (
        <DashboardLayout>

            {/* ── Hero ── */}
            <div className="sc-hero">
                <div className="sc-hero-text">
                    <h1 className="sc-hero-title">Emploi du temps</h1>
                    <p className="sc-hero-sub">{subtitle}</p>
                    <div className="sc-hero-badges">
                        <span className="sc-hero-badge">
                            <IonIcon icon={calendarOutline} />
                            <span className="sc-capitalize">{monthYear}</span>
                        </span>
                        <span className="sc-hero-badge">
                            <IonIcon icon={timeOutline} />
                            {entries.length} créneaux
                        </span>
                    </div>
                </div>

                <div className="sc-hero-actions">
                    {canEdit && (
                        <IonButton
                            size="small"
                            className="sc-add-btn"
                            onClick={() => setShowAdd(true)}
                        >
                            <IonIcon slot="start" icon={addOutline} />
                            Ajouter un créneau
                        </IonButton>
                    )}
                    <IonButton
                        fill="outline"
                        size="small"
                        className="sc-export-btn"
                        onClick={() => exportCSV(entries)}
                        disabled={entries.length === 0}
                    >
                        <IonIcon slot="start" icon={downloadOutline} />
                        CSV
                    </IonButton>
                </div>
            </div>

            {/* ── Navigation semaine ── */}
            <div className="sc-week-nav">
                <IonButton fill="clear" size="small" className="sc-nav-btn" onClick={() => setWeekOffset(w => w - 1)}>
                    <IonIcon slot="icon-only" icon={chevronBackOutline} />
                </IonButton>
                <IonButton fill="outline" size="small" className="sc-today-btn" onClick={() => setWeekOffset(0)}>
                    <IonIcon slot="start" icon={todayOutline} />
                    Aujourd'hui
                </IonButton>
                <IonButton fill="clear" size="small" className="sc-nav-btn" onClick={() => setWeekOffset(w => w + 1)}>
                    <IonIcon slot="icon-only" icon={chevronForwardOutline} />
                </IonButton>
                <span className="sc-week-label sc-capitalize">{monthYear}</span>
            </div>

            {/* ── État vide ── */}
            {entries.length === 0 && (
                <div className="sc-empty">
                    <IonIcon icon={calendarOutline} className="sc-empty-icon" />
                    <p>Aucun cours programmé pour votre profil.</p>
                    {canEdit && (
                        <IonButton size="small" className="sc-empty-add-btn" onClick={() => setShowAdd(true)}>
                            <IonIcon slot="start" icon={addOutline} />
                            Ajouter un créneau
                        </IonButton>
                    )}
                </div>
            )}

            {/* ── Grille emploi du temps ── */}
            {entries.length > 0 && (
                <div className="sc-grid-wrap">
                    <div className="sc-grid-scroll">
                        <div className="sc-grid">

                            {/* En-tête : colonnes jours */}
                            <div className="sc-header-row">
                                <div className="sc-time-cell sc-time-cell--header" />
                                {DAYS.map((day, i) => {
                                    const d       = dates[i];
                                    const isToday = d.toDateString() === today;
                                    return (
                                        <div key={day} className={`sc-day-header ${isToday ? 'sc-day-header--today' : ''}`}>
                                            <span className="sc-day-name">{day.slice(0, 3)}</span>
                                            <span className={`sc-day-num ${isToday ? 'sc-day-num--today' : ''}`}>
                                                {d.getDate()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Lignes heures */}
                            {displayHours.map(hour => (
                                <div key={hour} className="sc-hour-row">
                                    <div className="sc-time-cell">
                                        <span>{hour}</span>
                                    </div>

                                    {DAYS.map((day, di) => {
                                        const isToday = dates[di].toDateString() === today;
                                        const events  = scheduleMap[`${day}-${hour}`] ?? [];
                                        return (
                                            <div key={day} className={`sc-cell ${isToday ? 'sc-cell--today' : ''}`}>
                                                {events.map((ev) => {
                                                    const colorKey = resolveColor(ev.color);
                                                    return (
                                                        <div key={ev.id} className={`sc-event sc-event--${colorKey}`}>
                                                            <p className="sc-event-subject">{ev.subject}</p>
                                                            <div className="sc-event-room">
                                                                <IonIcon icon={locationOutline} />
                                                                <span>{ev.room}</span>
                                                            </div>
                                                            {!isStudent(user.role) && (
                                                                <Badge variant="secondary" size="sm" className="sc-event-badge">
                                                                    {ev.filiere} {ev.annee}{ev.option ? ` (${ev.option})` : ''}
                                                                </Badge>
                                                            )}
                                                            {/* Boutons admin */}
                                                            {canEdit && (
                                                                <div className="sc-event-actions">
                                                                    <button
                                                                        className="sc-event-action-btn sc-event-action-btn--edit"
                                                                        onClick={() => setEditEntry(ev)}
                                                                        aria-label="Modifier"
                                                                        title="Modifier"
                                                                    >
                                                                        <IonIcon icon={createOutline} />
                                                                    </button>
                                                                    <button
                                                                        className="sc-event-action-btn sc-event-action-btn--delete"
                                                                        onClick={() => setDeleteEntry(ev)}
                                                                        aria-label="Supprimer"
                                                                        title="Supprimer"
                                                                    >
                                                                        <IonIcon icon={trashOutline} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}

                        </div>
                    </div>
                </div>
            )}

            {/* ── Modals ── */}
            {showAdd && (
                <ScheduleFormModal
                    title="Ajouter un créneau"
                    initial={EMPTY_FORM}
                    professors={professors}
                    onSave={handleAdd}
                    onClose={() => setShowAdd(false)}
                />
            )}

            {editEntry && (
                <ScheduleFormModal
                    title="Modifier le créneau"
                    initial={editInitial}
                    professors={professors}
                    onSave={handleEdit}
                    onClose={() => setEditEntry(null)}
                />
            )}

            {deleteEntry && (
                <ConfirmDeleteModal
                    entry={deleteEntry}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteEntry(null)}
                />
            )}

        </DashboardLayout>
    );
};

export default Schedule;
