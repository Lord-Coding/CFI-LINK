import React, { useState, useMemo } from 'react';
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
import { getUsers, isStudent } from '../lib/store';
import { getCoursesForProfessor, CourseData } from '../lib/courses-data';
import { getAllSchedules, ScheduleEntry } from '../lib/schedule-store';
import {
    getStudentAttendance, upsertAttendance, getTodayStatus,
    getAttendanceStats, getAttendanceStatsByCourse,
    getCourseAttendance, STATUS_LABELS, AttendanceRecord,
} from '../lib/attendance-store';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Attendance.css';

/* ── Helpers ── */
type BadgeVar = 'success' | 'danger' | 'warning' | 'info';
const STATUS_BADGE: Record<string, BadgeVar> = {
    present: 'success', absent: 'danger', late: 'warning', excused: 'info',
};
const MARK_ACTIONS: { status: AttendanceRecord['status']; label: string; icon: string; color: string }[] = [
    { status: 'present', label: 'Présent',   icon: checkmarkCircleOutline, color: 'success' },
    { status: 'absent',  label: 'Absent',    icon: closeCircleOutline,     color: 'danger'  },
    { status: 'late',    label: 'En retard', icon: timeOutline,            color: 'warning' },
    { status: 'excused', label: 'Excusé',    icon: documentTextOutline,    color: 'medium'  },
];

const TODAY_DAY = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][new Date().getDay()];
const TODAY_ISO = new Date().toISOString();

/* ════════════════════════════════
   Vue Étudiant
════════════════════════════════ */
const StudentAttendanceView: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;

    const stats      = getAttendanceStats(user.id);
    const byCourse   = getAttendanceStatsByCourse(user.id);
    const records    = getStudentAttendance(user.id);
    const ALERT_THRESHOLD = 75;

    // Cours sous le seuil
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
════════════════════════════════ */
interface SessionCallProps {
    slot:     ScheduleEntry;
    course:   CourseData;
    students: ReturnType<typeof getUsers>;
    onBack:   () => void;
}

const SessionCall: React.FC<SessionCallProps> = ({ slot, course, students, onBack }) => {
    const { user } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);
    if (!user) return null;

    const courseStudents = students.filter(s =>
        s.filiere === slot.filiere && s.annee === slot.annee &&
        (!slot.option || !s.option || s.option === slot.option)
    );

    const handleMark = (studentId: string, studentName: string, status: AttendanceRecord['status']) => {
        upsertAttendance({
            student_id:   studentId,
            student_name: studentName,
            course_id:    course.id,
            course_name:  course.name,
            date:         TODAY_ISO,
            status,
            marked_by:    user.id,
        });
        setRefreshKey(k => k + 1);
    };

    // Compteur marked aujourd'hui
    const markedToday = courseStudents.filter(s => !!getTodayStatus(s.id, course.id)).length;

    // Stats globales pour ce cours
    const courseRecords = getCourseAttendance(course.id);
    const totalSessions = [...new Set(courseRecords.map(r => r.date.slice(0, 10)))].length;

    return (
        <div key={refreshKey}>
            <div className="at-marking-header">
                <IonButton fill="clear" size="small" onClick={onBack} className="at-back-btn">
                    <IonIcon slot="start" icon={arrowBackOutline} />Retour
                </IonButton>
                <div className="at-marking-info">
                    <h2 className="at-marking-title">{course.name}</h2>
                    <p className="at-marking-date">
                        <IonIcon icon={calendarOutline} /> {slot.day} {slot.hour} — Salle {slot.room}
                    </p>
                </div>
                <IonChip className="at-count-chip">{markedToday}/{courseStudents.length} marqués</IonChip>
            </div>

            {/* Stats du cours */}
            {totalSessions > 0 && (
                <div className="at-course-session-stats">
                    <span className="at-session-stat"><IonIcon icon={calendarOutline} />{totalSessions} séances tenues</span>
                    <span className="at-session-stat"><IonIcon icon={peopleOutline} />{courseRecords.filter(r => r.status === 'present').length} présences totales</span>
                    <span className="at-session-stat danger"><IonIcon icon={closeCircleOutline} />{courseRecords.filter(r => r.status === 'absent').length} absences</span>
                </div>
            )}

            <Card variant="default" className="at-table-card">
                <CardContent padding="sm">
                    <div className="at-table-scroll">
                        {courseStudents.length === 0 ? (
                            <div className="at-empty">
                                <IonIcon icon={peopleOutline} className="at-empty-icon" />
                                <p>Aucun étudiant dans cette classe.</p>
                            </div>
                        ) : (
                            <table className="at-table">
                                <thead>
                                    <tr className="at-thead-tr">
                                        <th className="at-th">Étudiant</th>
                                        <th className="at-th at-th--hide-mobile">Filière</th>
                                        <th className="at-th">Statut</th>
                                        <th className="at-th at-th--actions">Marquer / Modifier</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courseStudents.map(s => {
                                        const existing = getTodayStatus(s.id, course.id);
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
                                                    {existing ? (
                                                        <Badge variant={STATUS_BADGE[existing.status]} size="sm" dot>
                                                            {STATUS_LABELS[existing.status]}
                                                        </Badge>
                                                    ) : <span className="at-unmarked">—</span>}
                                                </td>
                                                <td className="at-td at-td--actions">
                                                    <div className="at-mark-btns">
                                                        {MARK_ACTIONS.map(a => (
                                                            <IonButton
                                                                key={a.status}
                                                                fill={existing?.status === a.status ? 'solid' : 'outline'}
                                                                size="small"
                                                                color={a.color}
                                                                className="at-mark-btn"
                                                                title={a.label}
                                                                onClick={() => handleMark(s.id, s.nom_complet, a.status)}
                                                            >
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
    const [activeSlot, setActiveSlot] = useState<{ slot: ScheduleEntry; course: CourseData } | null>(null);

    if (!user) return null;

    const myCourses  = getCoursesForProfessor(user.nom_complet);
    const allSlots   = getAllSchedules();
    const students   = getUsers().filter(u => isStudent(u.role) && u.is_active);

    // Créneaux du jour liés aux cours de ce prof
    const todaySlots = useMemo(() => {
        return allSlots
            .filter(s => s.day === TODAY_DAY &&
                myCourses.some(c =>
                    c.filiere === s.filiere && c.annee === s.annee &&
                    c.teacher.toLowerCase().includes(user.nom_complet.split(' ')[0].toLowerCase())
                )
            )
            .map(s => {
                const course = myCourses.find(c => c.filiere === s.filiere && c.annee === s.annee);
                return course ? { slot: s, course } : null;
            })
            .filter((x): x is { slot: ScheduleEntry; course: CourseData } => !!x);
    }, [allSlots, myCourses, user.nom_complet]);

    if (activeSlot) {
        return (
            <SessionCall
                slot={activeSlot.slot}
                course={activeSlot.course}
                students={students}
                onBack={() => setActiveSlot(null)}
            />
        );
    }

    return (
        <>
            <div className="at-hero">
                <div className="at-hero-text">
                    <h1 className="at-hero-title">Gestion des présences</h1>
                    <p className="at-hero-sub">Créneaux du jour — {TODAY_DAY}</p>
                    <div className="at-hero-badges">
                        <span className="at-hero-badge"><IonIcon icon={calendarOutline} />{todaySlots.length} créneau{todaySlots.length !== 1 ? 'x' : ''} aujourd'hui</span>
                        <span className="at-hero-badge"><IonIcon icon={schoolOutline} />{myCourses.length} cours</span>
                    </div>
                </div>
            </div>

            {todaySlots.length === 0 ? (
                <div className="at-empty-day">
                    <IonIcon icon={calendarOutline} className="at-empty-icon" />
                    <p>Aucun créneau dans l'emploi du temps pour aujourd'hui ({TODAY_DAY}).</p>
                    <p className="at-empty-day-sub">Pour faire l'appel manuellement, utilisez la liste des cours ci-dessous.</p>
                </div>
            ) : (
                <div className="at-slots-list">
                    <h3 className="at-slots-title">Créneaux à appeler aujourd'hui</h3>
                    {todaySlots.map(({ slot, course }) => {
                        const courseStudents = students.filter(s => s.filiere === slot.filiere && s.annee === slot.annee);
                        const markedCount    = courseStudents.filter(s => !!getTodayStatus(s.id, course.id)).length;
                        const allMarked      = courseStudents.length > 0 && markedCount === courseStudents.length;
                        return (
                            <button key={slot.id} className={`at-slot-card ${allMarked ? 'at-slot-card--done' : ''}`} onClick={() => setActiveSlot({ slot, course })}>
                                <div className="at-slot-card-left">
                                    <div className="at-slot-icon"><IonIcon icon={clipboardOutline} /></div>
                                    <div>
                                        <p className="at-slot-course">{course.name}</p>
                                        <p className="at-slot-meta">{slot.hour} — Salle {slot.room} — {slot.filiere} {slot.annee}</p>
                                    </div>
                                </div>
                                <div className="at-slot-card-right">
                                    <IonChip className={`at-slot-chip ${allMarked ? 'at-slot-chip--done' : markedCount > 0 ? 'at-slot-chip--partial' : ''}`}>
                                        {markedCount}/{courseStudents.length}
                                    </IonChip>
                                    {allMarked && <IonIcon icon={checkmarkCircleOutline} className="at-slot-done-icon" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Accès manuel à tous les cours */}
            <div className="at-all-courses-section">
                <h3 className="at-slots-title">Tous mes cours</h3>
                <div className="at-courses-grid">
                    {myCourses.length === 0 ? (
                        <div className="at-empty"><IonIcon icon={clipboardOutline} className="at-empty-icon" /><p>Aucun cours assigné.</p></div>
                    ) : myCourses.map(c => {
                        // Trouver un créneau représentatif pour ce cours
                        const slot = allSlots.find(s => s.filiere === c.filiere && s.annee === c.annee) ?? {
                            id: c.id, day: TODAY_DAY, hour: '08:00', subject: c.name,
                            room: '—', teacher: c.teacher, filiere: c.filiere, annee: c.annee, color: '',
                        } as ScheduleEntry;
                        const courseStudents = students.filter(s => s.filiere === c.filiere && s.annee === c.annee);
                        return (
                            <button key={c.id} className="at-course-card" onClick={() => setActiveSlot({ slot, course: c })}>
                                <div className="at-course-card-icon"><IonIcon icon={clipboardOutline} /></div>
                                <div className="at-course-card-body">
                                    <h3 className="at-course-card-name">{c.name}</h3>
                                    <p className="at-course-card-meta">{c.filiere} {c.annee}{c.option ? ` (${c.option})` : ''} • {courseStudents.length} étudiants</p>
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
