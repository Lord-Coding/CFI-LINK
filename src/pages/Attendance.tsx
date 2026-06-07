import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonProgressBar, IonChip,
    IonSegment, IonSegmentButton, IonLabel,
} from '../lib/ionic';
import {
    checkmarkCircleOutline, closeCircleOutline, timeOutline,
    documentTextOutline, peopleOutline, clipboardOutline,
    arrowBackOutline, alertCircleOutline, schoolOutline,
    shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { getUsers, isStudent } from '../lib/store';
import { getCoursesForProfessor, CourseData } from '../lib/courses-data';
import {
    getStudentAttendance, markAttendance,
    getAttendanceStats, STATUS_LABELS, AttendanceRecord,
} from '../lib/attendance-store';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Attendance.css';

/* ── Variante badge par statut ── */
type BadgeVar = 'success' | 'danger' | 'warning' | 'info';
const STATUS_BADGE: Record<string, BadgeVar> = {
    present: 'success', absent: 'danger', late: 'warning', excused: 'info',
};

/* ── Actions de marquage ── */
const MARK_ACTIONS: { status: AttendanceRecord['status']; label: string; icon: string; color: string }[] = [
    { status: 'present', label: 'Présent',    icon: checkmarkCircleOutline, color: 'success' },
    { status: 'absent',  label: 'Absent',     icon: closeCircleOutline,     color: 'danger'  },
    { status: 'late',    label: 'En retard',  icon: timeOutline,            color: 'warning' },
    { status: 'excused', label: 'Excusé',     icon: documentTextOutline,    color: 'medium'  },
];

/* ════════════════════════════════
   Vue Étudiant
════════════════════════════════ */
const StudentAttendanceView: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;

    const stats   = getAttendanceStats(user.id);
    const records = getStudentAttendance(user.id);

    const statCards = [
        { icon: shieldCheckmarkOutline, label: 'Taux de présence',  value: `${stats.rate}%`,   color: 'primary',  showBar: true },
        { icon: checkmarkCircleOutline, label: 'Présences',          value: stats.present,       color: 'success'  },
        { icon: closeCircleOutline,     label: 'Absences',           value: stats.absent,        color: 'danger'   },
        { icon: timeOutline,            label: 'En retard',          value: stats.late,          color: 'warning'  },
        { icon: documentTextOutline,    label: 'Excusés',            value: stats.excused,       color: 'info'     },
    ];

    return (
        <>
            {/* Hero */}
            <div className="at-hero">
                <div className="at-hero-text">
                    <h1 className="at-hero-title">Mes présences</h1>
                    <p className="at-hero-sub">Suivi de votre assiduité sur l'ensemble des cours.</p>
                    <div className="at-hero-badges">
                        <span className={`at-hero-badge ${stats.rate < 75 ? 'at-hero-badge--danger' : 'at-hero-badge--success'}`}>
                            <IonIcon icon={shieldCheckmarkOutline} />
                            {stats.rate}% de présence
                        </span>
                        <span className="at-hero-badge">
                            <IonIcon icon={clipboardOutline} />
                            {stats.total} séances enregistrées
                        </span>
                    </div>
                </div>
            </div>

            {/* Alerte si taux < 75% */}
            {stats.rate < 75 && (
                <div className="at-alert">
                    <IonIcon icon={alertCircleOutline} className="at-alert-icon" />
                    <p>Attention : votre taux de présence est inférieur à 75%. Vous risquez l'exclusion aux examens.</p>
                </div>
            )}

            {/* Stats */}
            <div className="at-stats-row">
                {statCards.map(s => (
                    <div key={s.label} className="at-stat-card">
                        <div className={`at-stat-icon at-stat-icon--${s.color}`}>
                            <IonIcon icon={s.icon} />
                        </div>
                        <p className="at-stat-value">{s.value}</p>
                        <p className="at-stat-label">{s.label}</p>
                        {s.showBar && (
                            <IonProgressBar
                                value={stats.rate / 100}
                                className={`at-stat-bar ${stats.rate >= 75 ? 'at-stat-bar--ok' : 'at-stat-bar--warn'}`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Tableau */}
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
                                                {new Date(r.date).toLocaleDateString('fr-FR', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                })}
                                            </td>
                                            <td className="at-td at-td--course">{r.course_name}</td>
                                            <td className="at-td">
                                                <Badge variant={STATUS_BADGE[r.status]} size="sm" dot>
                                                    {STATUS_LABELS[r.status]}
                                                </Badge>
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
   Vue Professeur
════════════════════════════════ */
const ProfessorAttendanceView: React.FC = () => {
    const { user } = useAuth();
    const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
    const [markedToday,    setMarkedToday]    = useState<Record<string, AttendanceRecord['status']>>({});
    const [refreshKey,     setRefreshKey]     = useState(0);

    if (!user) return null;

    const myCourses = getCoursesForProfessor(user.nom_complet);
    const students  = getUsers().filter(u => isStudent(u.role) && u.is_active);

    const handleMark = (studentId: string, studentName: string, status: AttendanceRecord['status']) => {
        if (!selectedCourse) return;
        markAttendance({
            student_id:   studentId,
            student_name: studentName,
            course_id:    selectedCourse.id,
            course_name:  selectedCourse.name,
            date:         new Date().toISOString(),
            status,
            marked_by:    user.id,
        });
        setMarkedToday(prev => ({ ...prev, [studentId]: status }));
        setRefreshKey(k => k + 1);
    };

    const courseStudents = selectedCourse
        ? students.filter(s => s.filiere === selectedCourse.filiere && s.annee === selectedCourse.annee)
        : [];

    const markedCount = Object.keys(markedToday).length;

    return (
        <>
            {/* Hero */}
            <div className="at-hero">
                <div className="at-hero-text">
                    <h1 className="at-hero-title">Gestion des présences</h1>
                    <p className="at-hero-sub">Marquez la présence pour vos cours du jour.</p>
                    <div className="at-hero-badges">
                        <span className="at-hero-badge">
                            <IonIcon icon={schoolOutline} />{myCourses.length} cours
                        </span>
                        {selectedCourse && (
                            <span className="at-hero-badge at-hero-badge--success">
                                <IonIcon icon={checkmarkCircleOutline} />
                                {markedCount}/{courseStudents.length} marqués
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {!selectedCourse ? (
                /* Grille des cours */
                <div className="at-courses-grid">
                    {myCourses.length === 0 ? (
                        <div className="at-empty">
                            <IonIcon icon={clipboardOutline} className="at-empty-icon" />
                            <p>Aucun cours assigné.</p>
                        </div>
                    ) : myCourses.map(c => (
                        <button
                            key={c.id}
                            className="at-course-card"
                            onClick={() => { setSelectedCourse(c); setMarkedToday({}); }}
                        >
                            <div className="at-course-card-icon">
                                <IonIcon icon={clipboardOutline} />
                            </div>
                            <div className="at-course-card-body">
                                <h3 className="at-course-card-name">{c.name}</h3>
                                <p className="at-course-card-meta">
                                    {c.filiere} {c.annee}
                                    {c.option ? ` (${c.option})` : ''} •{' '}
                                    {students.filter(s => s.filiere === c.filiere && s.annee === c.annee).length} étudiants
                                </p>
                            </div>
                            <IonIcon icon={arrowBackOutline} className="at-course-card-arrow" style={{ transform: 'rotate(180deg)' }} />
                        </button>
                    ))}
                </div>
            ) : (
                /* Vue marquage */
                <div className="at-marking">
                    <div className="at-marking-header">
                        <IonButton fill="clear" size="small" onClick={() => setSelectedCourse(null)} className="at-back-btn">
                            <IonIcon slot="start" icon={arrowBackOutline} />
                            Retour aux cours
                        </IonButton>
                        <div className="at-marking-info">
                            <h2 className="at-marking-title">{selectedCourse.name}</h2>
                            <p className="at-marking-date">
                                Séance du {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                        <IonChip className="at-count-chip">{markedCount}/{courseStudents.length} marqués</IonChip>
                    </div>

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
                                                <th className="at-th at-th--actions">Marquer</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courseStudents.map(s => {
                                                const current = markedToday[s.id];
                                                return (
                                                    <tr key={s.id} className={`at-tr ${current ? 'at-tr--marked' : ''}`}>
                                                        <td className="at-td at-td--student">
                                                            <div className="at-student-cell">
                                                                <div className="at-student-avatar">
                                                                    {s.nom_complet.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="at-student-name">{s.nom_complet}</span>
                                                            </div>
                                                        </td>
                                                        <td className="at-td at-td--hide-mobile at-td--meta">
                                                            {s.filiere} {s.annee}
                                                        </td>
                                                        <td className="at-td">
                                                            {current ? (
                                                                <Badge variant={STATUS_BADGE[current]} size="sm" dot>
                                                                    {STATUS_LABELS[current]}
                                                                </Badge>
                                                            ) : (
                                                                <span className="at-unmarked">—</span>
                                                            )}
                                                        </td>
                                                        <td className="at-td at-td--actions">
                                                            <div className="at-mark-btns">
                                                                {MARK_ACTIONS.map(a => (
                                                                    <IonButton
                                                                        key={a.status}
                                                                        fill={current === a.status ? 'solid' : 'outline'}
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
            )}
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
                {isStudent(user.role)
                    ? <StudentAttendanceView />
                    : <ProfessorAttendanceView />
                }
            </div>
        </DashboardLayout>
    );
};

export default Attendance;
