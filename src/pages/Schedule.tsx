import React, { useState } from 'react';
import { IonButton, IonIcon } from '../lib/ionic';
import {
    calendarOutline, chevronBackOutline, chevronForwardOutline,
    locationOutline, downloadOutline, schoolOutline,
    timeOutline, todayOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { isStudent, isProfessor } from '../lib/store';
import {
    getScheduleForStudent, getScheduleForProfessor, getAllSchedules,
    DAYS, HOURS, ScheduleEntry,
} from '../lib/schedule-store';
import { Badge } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Schedule.css';

/* ── Mapping couleur Tailwind → CSS variable ── */
function resolveColor(color: string): string {
    if (color.includes('primary'))     return 'primary';
    if (color.includes('success'))     return 'success';
    if (color.includes('warning'))     return 'warning';
    if (color.includes('destructive')) return 'danger';
    if (color.includes('info'))        return 'info';
    return 'primary';
}

/* ── Calcul dates de la semaine ── */
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

/* ── Export CSV ── */
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

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const Schedule: React.FC = () => {
    const { user }       = useAuth();
    const [weekOffset, setWeekOffset] = useState(0);

    if (!user) return null;

    /* Entrées selon le rôle */
    const entries: ScheduleEntry[] = isStudent(user.role)
        ? getScheduleForStudent(user.filiere, user.annee, user.option)
        : isProfessor(user.role)
            ? getScheduleForProfessor(user.nom_complet)
            : getAllSchedules();

    /* Map jour-heure → entrées */
    const scheduleMap: Record<string, ScheduleEntry[]> = {};
    entries.forEach(e => {
        const key = `${e.day}-${e.hour}`;
        if (!scheduleMap[key]) scheduleMap[key] = [];
        scheduleMap[key].push(e);
    });

    const dates     = getWeekDates(weekOffset);
    const monthYear = dates[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const today     = new Date().toDateString();

    /* Heures qui ont au moins 1 entrée (pour ne pas afficher les lignes vides) */
    const activeHours = HOURS.filter(h =>
        DAYS.some(d => (scheduleMap[`${d}-${h}`] ?? []).length > 0)
    );
    const displayHours = activeHours.length > 0 ? activeHours : HOURS.slice(0, 6);

    /* Sous-titre contextuel */
    const subtitle = isStudent(user.role) && user.filiere
        ? `${user.filiere} ${user.annee}${user.option ? ` (${user.option})` : ''}`
        : isProfessor(user.role)
            ? user.nom_complet
            : 'Tous les cours';

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
                </div>
            )}

            {/* ── Grille emploi du temps ── */}
            {entries.length > 0 && (
                <div className="sc-grid-wrap">
                    <div className="sc-grid-scroll">
                        <div className="sc-grid">

                            {/* En-tête : colonnes jours ── */}
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

                            {/* Lignes heures ── */}
                            {displayHours.map(hour => (
                                <div key={hour} className="sc-hour-row">
                                    {/* Heure */}
                                    <div className="sc-time-cell">
                                        <span>{hour}</span>
                                    </div>

                                    {/* Cellules jour ── */}
                                    {DAYS.map((day, di) => {
                                        const isToday = dates[di].toDateString() === today;
                                        const events  = scheduleMap[`${day}-${hour}`] ?? [];
                                        return (
                                            <div key={day} className={`sc-cell ${isToday ? 'sc-cell--today' : ''}`}>
                                                {events.map((ev, idx) => {
                                                    const colorKey = resolveColor(ev.color);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`sc-event sc-event--${colorKey}`}
                                                        >
                                                            <p className="sc-event-subject">{ev.subject}</p>
                                                            <div className="sc-event-room">
                                                                <IonIcon icon={locationOutline} />
                                                                <span>{ev.room}</span>
                                                            </div>
                                                            {!isStudent(user.role) && (
                                                                <Badge variant="secondary" size="sm" className="sc-event-badge">
                                                                    {ev.filiere} {ev.annee}
                                                                </Badge>
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

        </DashboardLayout>
    );
};

export default Schedule;
