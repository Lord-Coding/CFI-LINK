// @ts-nocheck
import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonProgressBar, IonChip,
} from '../lib/ionic';
import {
    checkmarkCircleOutline, closeCircleOutline, timeOutline,
    documentTextOutline, peopleOutline, clipboardOutline,
    arrowBackOutline, alertCircleOutline, schoolOutline,
    shieldCheckmarkOutline, calendarOutline, barChartOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../lib/services/attendanceService';
import { courseService } from '../lib/services/courseService';
import { isStudent } from '../lib/store';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Attendance.css';

/* ── Helpers ── */
type BadgeVar = 'success' | 'danger' | 'warning' | 'info';
const STATUS_BADGE: Record<string, BadgeVar> = {
    present: 'success', absent: 'danger', late: 'warning', excused: 'info',
};
const STATUS_LABELS: Record<string, string> = {
    present: 'Présent', absent: 'Absent', late: 'En retard', excused: 'Excusé',
};
const MARK_ACTIONS = [
    { status: 'present' as const, label: 'Présent',   icon: checkmarkCircleOutline, color: 'success' },
    { status: 'absent'  as const, label: 'Absent',    icon: closeCircleOutline,     color: 'danger'  },
    { status: 'late'    as const, label: 'En retard', icon: timeOutline,            color: 'warning' },
    { status: 'excused' as const, label: 'Excusé',    icon: documentTextOutline,    color: 'medium'  },
];
const TODAY_DAY = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][new Date().getDay()];
const TODAY_ISO = new Date().toISOString().slice(0, 10);

/* ════════════════════════════════
   Vue Étudiant
════════════════════════════════ */
const StudentAttendanceView: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;

    const { data: records = [], isLoading } = useQuery<any[]>({ queryKey: ['attendance', 'student', user.id],
        queryFn: () => attendanceService.list({ student_id: String(user.id) }),
    });

    const { data: stats = { total: 0, present: 0, absent: 0, late: 0, excused: 0, rate: 100 } } = useQuery<any[]>({ queryKey: ['attendance', 'stats', user.id],
        queryFn: () => attendanceService.stats(user.id),
    });

    // Regrouper par cours
    const byCourse: Record<string, { course_name: string; present: number; absent: number; late: number; excused: number; rate: number }> = {};
    records.forEach(r => {
        const name = r.course?.name ?? String(r.course_id);
        if (!byCourse[String(r.course_id)]) byCourse[String(r.course_id)] = { course_name: name, present: 0, absent: 0, late: 0, excused: 0, rate: 0 };
        byCourse[String(r.course_id)][r.status as 'present'|'absent'|'late'|'excused']++;
    });
    Object.values(byCourse).forEach(c => {
        const total = c.present + c.absent + c.late + c.excused;
        c.rate = total > 0 ? Math.round((c.present + c.late) / total * 100) : 100;
    });

    const ALERT_THRESHOLD = 75;
    const coursesBelow = Object.values(byCourse).filter(c => c.rate < ALERT_THRESHOLD);

    const statCards = [
        { icon: shieldCheckmarkOutline, label: 'Taux global',   value: `${stats.rate}%`,  color: 'primary', showBar: true },
        { icon: checkmarkCircleOutline, label: 'Présences',     value: stats.present,      color: 'success' },
        { icon: closeCircleOutline,     label: 'Absences',      value: stats.absent,       color: 'danger'  },
        { icon: timeOutline,            label: 'En retard',     value: stats.late,         color: 'warning' },
        { icon: documentTextOutline,    label: 'Excusés',       value: stats.excused,      color: 'info'    },
    ];

    return (
        <>
            <div className="at-hero">
                <div className="at-hero-text">
                    <h1 className="at-hero-title">Mes présences</h1>
                    <p className="at-hero-sub">Suivi de votre assiduité sur l'ensemble des cours.</p>
                    <div className="at-hero-badges">
                        <span className={`at-hero-badge ${stats.rate < ALERT_THRESHOLD ? 'at-hero-badge--danger' : 'at-hero-badge--success'}`}>
                            <IonIcon icon={shieldCheckmarkOutline} />{stats.rate}% de présence
                        </span>
                        <span className="at-hero-badge">
                            <IonIcon icon={clipboardOutline} />{stats.total} séances enregistrées
                        </span>
                    </div>
                </div>
            </div>

            {/* Alerte globale */}
            {stats.rate < ALERT_THRESHOLD && (
                <div className="at-alert">
                    <IonIcon icon={alertCircleOutline} className="at-alert-icon" />
                    <p>Attention : votre taux de présence global est inférieur à {ALERT_THRESHOLD}%. Vous risquez l'exclusion aux examens.</p>
                </div>
            )}

            {/* Alertes par matière */}
            {coursesBelow.length > 0 && (
                <div className="at-alerts-by-course">
                    {coursesBelow.map(c => (
                        <div key={c.course_name} className="at-alert at-alert--warn">
                            <IonIcon icon={alertCircleOutline} className="at-alert-icon" />
                            <p><strong>{c.course_name}</strong> — taux de présence : {c.rate}% ({c.absent} absence{c.absent > 1 ? 's' : ''})</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats globales */}
            <div className="at-stats-row">
                {statCards.map(s => (
                    <div key={s.label} className="at-stat-card">
                        <div className={`at-stat-icon at-stat-icon--${s.color}`}><IonIcon icon={s.icon} /></div>
                        <p className="at-stat-value">{s.value}</p>
                        <p className="at-stat-label">{s.label}</p>
                        {s.showBar && (
                            <IonProgressBar value={stats.rate / 100} className={`at-stat-bar ${stats.rate >= ALERT_THRESHOLD ? 'at-stat-bar--ok' : 'at-stat-bar--warn'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Stats par cours */}
            {Object.keys(byCourse).length > 0 && (
                <Card variant="default" className="at-table-card" style={{ marginBottom: '1rem' }}>
                    <CardHeader className="at-table-card-header">
                        <CardTitle>Présences par cours</CardTitle>
                        <IonIcon icon={barChartOutline} style={{ fontSize: '1.1rem', color: 'var(--ion-color-medium)' }} />
                    </CardHeader>
                    <CardContent padding="sm">
                        <div className="at-course-stats-list">
                            {Object.entries(byCourse).map(([courseId, cs]) => (
                                <div key={courseId} className="at-course-stat-row">
                                    <div className="at-course-stat-name">
                                        <IonIcon icon={schoolOutline} className="at-course-stat-icon" />
                                        <span>{cs.course_name}</span>
                                        {cs.rate < ALERT_THRESHOLD && (
                                            <IonIcon icon={alertCircleOutline} className="at-course-stat-warn" title="Seuil d'absences dépassé" />
                                        )}
                                    </div>
                                    <div className="at-course-stat-right">
                                        <span className={`at-course-stat-rate ${cs.rate < ALERT_THRESHOLD ? 'at-course-stat-rate--danger' : 'at-course-stat-rate--ok'}`}>{cs.rate}%</span>
                                        <div className="at-course-stat-bar-wrap">
                                            <IonProgressBar value={cs.rate / 100} className={`at-stat-bar ${cs.rate >= ALERT_THRESHOLD ? 'at-stat-bar--ok' : 'at-stat-bar--warn'}`} />
                                        </div>
                                        <span className="at-course-stat-detail">{cs.present}P · {cs.absent}A · {cs.late}R · {cs.excused}E</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Historique */}
            <Card variant="default" className="at-table-card">
                <CardHeader className="at-table-card-header">
                    <CardTitle>Historique des séances</CardTitle>
                    <IonChip className="at-count-chip">{records.length}</IonChip>
                </CardHeader>
                <CardContent padding="sm">
                    <div className="at-table-scroll">
                        {records.length === 0 ? (
                            <div className="at-empty">
                                <IonIcon icon={clipboardOutline} className="at-empty-icon" />
                                <p>Aucun enregistrement de présence.</p>
                            </div>
                        ) : (
                            <table className="at-table">
                                <thead>
                                    <tr className="at-thead-tr">
                                        <th className="at-th">Date</th>
                                        <th className="at-th">Cours</th>
                                        <th className="at-th">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.slice(0, 30).map(r => (
                                        <tr key={r.id} className="at-tr">
                                            <td className="at-td at-td--date">
                                                {new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="at-td at-td--course">{r.course_name}</td>
                                            <td className="at-td">
                                                <Badge variant={STATUS_BADGE[r.status]} size="sm" dot>{STATUS_LABELS[r.status]}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

/* ════════════════════════════════
   Vue Professeur — Appel par créneau
   (Utilise l'API pour upsert présence)
════════════════════════════════ */
interface SessionCallProps {
    slot: { id: number | string; day: string; hour: string; subject: string; room?: string; filiere: string; annee: string; option_lic?: string };
    course: { id: number; name: string; filiere: string; annee: string; option_lic?: string };
    students: { id: number; nom_complet: string; filiere?: string; annee?: string; option_lic?: string }[];
    onBack: () => void;
}

const SessionCall: React.FC<SessionCallProps> = ({ slot, course, students, onBack }) => {
    const { user } = useAuth();
    const qc = useQueryClient();
    const [localStatus, setLocalStatus] = useState<Record<number, string>>({});

    if (!user) return null;

    const courseStudents = students.filter(s =>
        s.filiere === slot.filiere && s.annee === slot.annee &&
        (!slot.option_lic || !s.option_lic || s.option_lic === slot.option_lic)
    );

    const upsertMutation = useMutation<any,any,any>({
        mutationFn: attendanceService.upsert,
        onSuccess: (_, vars) => setLocalStatus(prev => ({ ...prev, [vars.student_id]: vars.status })),
    });

    const { data: existingRecords = [] } = useQuery<any[]>({ queryKey: ['attendance', 'course', course.id, TODAY_ISO],
        queryFn: () => attendanceService.list({ course_id: String(course.id) }),
    });

    const getTodayStatus = (studentId: number) =>
        localStatus[studentId] ?? existingRecords.find(r => r.student_id === studentId && r.date?.startsWith(TODAY_ISO))?.status;

    const handleMark = (studentId: number, status: string) => {
        upsertMutation.mutate({ student_id: studentId, course_id: course.id, date: TODAY_ISO, status });
    };

    const markedToday = courseStudents.filter(s => !!getTodayStatus(s.id)).length;

    return (
        <div>
            <div className="at-marking-header">
                <IonButton fill="clear" size="small" onClick={onBack} className="at-back-btn">
                    <IonIcon slot="start" icon={arrowBackOutline} />Retour
                </IonButton>
                <div className="at-marking-info">
                    <h2 className="at-marking-title">{course.name}</h2>
                    <p className="at-marking-date"><IonIcon icon={calendarOutline} /> {slot.day} {slot.hour}{slot.room ? ` — Salle ${slot.room}` : ''}</p>
                </div>
                <IonChip className="at-count-chip">{markedToday}/{courseStudents.length} marqués</IonChip>
            </div>

            <Card variant="default" className="at-table-card">
                <CardContent padding="sm">
                    <div className="at-table-scroll">
                        {courseStudents.length === 0 ? (
                            <div className="at-empty"><IonIcon icon={peopleOutline} className="at-empty-icon" /><p>Aucun étudiant dans cette classe.</p></div>
                        ) : (
                            <table className="at-table">
                                <thead><tr className="at-thead-tr">
                                    <th className="at-th">Étudiant</th>
                                    <th className="at-th at-th--hide-mobile">Filière</th>
                                    <th className="at-th">Statut</th>
                                    <th className="at-th at-th--actions">Marquer</th>
                                </tr></thead>
                                <tbody>
                                    {courseStudents.map(s => {
                                        const existing = getTodayStatus(s.id);
                                        return (
                                            <tr key={s.id} className={`at-tr ${existing ? 'at-tr--marked' : ''}`}>
                                                <td className="at-td at-td--student">
                                                    <div className="at-student-cell">
                                                        <div className="at-student-avatar">{s.nom_complet.charAt(0).toUpperCase()}</div>
                                                        <span className="at-student-name">{s.nom_complet}</span>
                                                    </div>
                                                </td>
                                                <td className="at-td at-td--hide-mobile at-td--meta">{s.filiere} {s.annee}</td>
                                                <td className="at-td">
                                                    {existing
                                                        ? <Badge variant={STATUS_BADGE[existing] ?? 'secondary'} size="sm" dot>{STATUS_LABELS[existing] ?? existing}</Badge>
                                                        : <span className="at-unmarked">—</span>
                                                    }
                                                </td>
                                                <td className="at-td at-td--actions">
                                                    <div className="at-mark-btns">
                                                        {MARK_ACTIONS.map(a => (
                                                            <IonButton key={a.status} fill={existing === a.status ? 'solid' : 'outline'} size="small" color={a.color}
                                                                className="at-mark-btn" title={a.label}
                                                                onClick={() => handleMark(s.id, a.status)}>
                                                                <IonIcon slot="icon-only" icon={a.icon} />
                                                            </IonButton>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

/* ════════════════════════════════
   Vue Professeur — Créneaux du jour
════════════════════════════════ */
const ProfessorAttendanceView: React.FC = () => {
    const { user } = useAuth();
    const [activeSlot, setActiveSlot] = useState<{ slot: SessionCallProps['slot']; course: SessionCallProps['course'] } | null>(null);
    if (!user) return null;

    const { data: courses = [] } = useQuery<any[]>({ queryKey: ['courses', 'professor'], queryFn: courseService.list });
    const { data: schedule = [] } = useQuery<any[]>({ queryKey: ['schedule'], queryFn: () => import('../lib/services/scheduleService').then(m => m.scheduleService.list()) });
    const { data: allStudents = [] } = useQuery<any[]>({ queryKey: ['users', 'all-students'], queryFn: () => import('../lib/services/userService').then(m => m.userService.list({ role: 'etudiant_concours' })) });

    const todaySlots = schedule.filter(s => s.day === TODAY_DAY).map(s => {
        const course = courses.find(c => c.filiere === s.filiere && c.annee === s.annee);
        return course ? { slot: { ...s, option_lic: s.option_lic }, course } : null;
    }).filter((x): x is NonNullable<typeof x> => !!x);

    const students = allStudents.map(u => ({ ...u, option_lic: u.option_lic ?? undefined }));

    if (activeSlot) {
        return <SessionCall slot={activeSlot.slot} course={activeSlot.course} students={students} onBack={() => setActiveSlot(null)} />;
    }

    return (
        <>
            <div className="at-hero">
                <div className="at-hero-text">
                    <h1 className="at-hero-title">Gestion des présences</h1>
                    <p className="at-hero-sub">Créneaux du jour — {TODAY_DAY}</p>
                    <div className="at-hero-badges">
                        <span className="at-hero-badge"><IonIcon icon={calendarOutline} />{todaySlots.length} créneau{todaySlots.length !== 1 ? 'x' : ''} aujourd'hui</span>
                        <span className="at-hero-badge"><IonIcon icon={schoolOutline} />{courses.length} cours</span>
                    </div>
                </div>
            </div>

            {todaySlots.length === 0 ? (
                <div className="at-empty-day">
                    <IonIcon icon={calendarOutline} className="at-empty-icon" />
                    <p>Aucun créneau dans l'emploi du temps pour aujourd'hui ({TODAY_DAY}).</p>
                </div>
            ) : (
                <div className="at-slots-list">
                    <h3 className="at-slots-title">Créneaux à appeler aujourd'hui</h3>
                    {todaySlots.map(({ slot, course }) => {
                        const courseStudents = students.filter(s => s.filiere === slot.filiere && s.annee === slot.annee);
                        return (
                            <button key={String(slot.id)} className="at-slot-card" onClick={() => setActiveSlot({ slot, course })}>
                                <div className="at-slot-card-left">
                                    <div className="at-slot-icon"><IonIcon icon={clipboardOutline} /></div>
                                    <div>
                                        <p className="at-slot-course">{course.name}</p>
                                        <p className="at-slot-meta">{slot.hour} — {slot.filiere} {slot.annee}</p>
                                    </div>
                                </div>
                                <div className="at-slot-card-right">
                                    <IonChip>{courseStudents.length} étudiants</IonChip>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="at-all-courses-section">
                <h3 className="at-slots-title">Tous mes cours</h3>
                <div className="at-courses-grid">
                    {courses.length === 0 ? (
                        <div className="at-empty"><IonIcon icon={clipboardOutline} className="at-empty-icon" /><p>Aucun cours assigné.</p></div>
                    ) : courses.map(c => {
                        const slot = { id: c.id, day: TODAY_DAY, hour: '08:00', filiere: c.filiere, annee: c.annee, option_lic: c.option_lic };
                        const courseStudents = students.filter(s => s.filiere === c.filiere && s.annee === c.annee);
                        return (
                            <button key={c.id} className="at-course-card" onClick={() => setActiveSlot({ slot, course: c })}>
                                <div className="at-course-card-icon"><IonIcon icon={clipboardOutline} /></div>
                                <div className="at-course-card-body">
                                    <h3 className="at-course-card-name">{c.name}</h3>
                                    <p className="at-course-card-meta">{c.filiere} {c.annee}{c.option_lic ? ` (${c.option_lic})` : ''} • {courseStudents.length} étudiants</p>
                                </div>
                                <IonIcon icon={arrowBackOutline} className="at-course-card-arrow" style={{ transform: 'rotate(180deg)' }} />
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const Attendance: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;
    return (
        <DashboardLayout>
            <div className="at-page">
                {isStudent(user.role) ? <StudentAttendanceView /> : <ProfessorAttendanceView />}
            </div>
        </DashboardLayout>
    );
};

export default Attendance;

