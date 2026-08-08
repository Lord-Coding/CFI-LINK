import React, { useState, useCallback } from 'react';
import {
    IonButton, IonIcon, IonProgressBar,
    IonSegment, IonSegmentButton, IonLabel, IonInput, IonChip,
} from '../lib/ionic';
import {
    trendingUpOutline, ribbonOutline, downloadOutline,
    documentTextOutline, printOutline, checkmarkCircleOutline,
    closeCircleOutline, schoolOutline, cloudUploadOutline,
    eyeOutline, createOutline, arrowBackOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { getUsers, isStudent, isProfessor, FILIERE_LABELS } from '../lib/store';
import { getCoursesForProfessor, CourseData } from '../lib/courses-data';
import {
    getGradesForStudent, getGradesForCourse, upsertGrade, publishGradesForCourse,
    unpublishGradesForCourse, getCourseGradeStatus, calcMoyenne, calcMoyenneGenerale,
    GradeEntry,
} from '../lib/grades-store';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Grades.css';

/* ── Helpers couleurs ── */
function noteColor(val: number | null): string {
    if (val === null) return '';
    if (val >= 16) return 'gr-note--excellent';
    if (val >= 12) return 'gr-note--good';
    if (val >= 10) return 'gr-note--pass';
    return 'gr-note--fail';
}

/* ── Export CSV ── */
function exportCSV(entries: GradeEntry[], label: string) {
    const header = 'Étudiant,Matière,CC,TP,Examen,Coefficient,Moyenne,Statut\n';
    const rows = entries.map(g => {
        const m = calcMoyenne(g.cc, g.tp, g.exam);
        return `"${g.student_name}","${g.course_name}",${g.cc ?? ''},${g.tp ?? ''},${g.exam ?? ''},${g.coef},${m !== null ? m.toFixed(2) : ''},${g.status}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `notes_${label}.csv`; a.click();
    URL.revokeObjectURL(url);
}

/* ── Print relevé étudiant ── */
function printReleve(userName: string, filiere: string, annee: string, option: string | undefined, sem: string, entries: GradeEntry[]) {
    const moyenne = calcMoyenneGenerale(entries);
    const rows = entries.map(g => {
        const m = calcMoyenne(g.cc, g.tp, g.exam);
        const color = m !== null && m >= 10 ? '#16a34a' : '#dc2626';
        return `<tr><td style="padding:8px;border:1px solid #ddd">${g.course_name}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${g.cc ?? '—'}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${g.tp ?? '—'}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${g.exam ?? '—'}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${g.coef}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;font-weight:bold;color:${color}">${m !== null ? m.toFixed(2) : '—'}</td></tr>`;
    }).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relevé de notes — ${userName}</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#333}h1{color:#1d4ed8;font-size:22px}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#1d4ed8;color:#fff;padding:10px;text-align:center}.header{display:flex;justify-content:space-between;border-bottom:3px solid #1d4ed8;padding-bottom:20px;margin-bottom:20px}.footer{margin-top:30px;text-align:center;color:#666;font-size:12px}</style>
</head><body><div class="header"><div><h1>CFI-CIRAS</h1><p>Centre de Formation en Informatique — CIRAS</p></div>
<div style="text-align:right"><p><strong>RELEVÉ DE NOTES</strong></p><p>${sem} — ${new Date().getFullYear()}</p></div></div>
<p><strong>Étudiant :</strong> ${userName}</p><p><strong>Filière :</strong> ${filiere} — ${annee}${option ? ` (${option})` : ''}</p>
<table><thead><tr><th>Matière</th><th>CC</th><th>TP</th><th>Examen</th><th>Coef</th><th>Moyenne</th></tr></thead><tbody>${rows}</tbody></table>
<p style="font-size:16px"><strong>Moyenne générale : ${moyenne.toFixed(2)}/20</strong> — <span style="color:${moyenne >= 10 ? '#16a34a' : '#dc2626'}">${moyenne >= 10 ? 'VALIDÉ' : 'NON VALIDÉ'}</span></p>
<div class="footer"><p>Document généré le ${new Date().toLocaleDateString('fr-FR')} — CFI-LINK</p></div></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.print(); }
}

/* ════════════════════════════════
   Vue Étudiant
════════════════════════════════ */
const StudentGradesView: React.FC = () => {
    const { user } = useAuth();
    const [sem, setSem] = useState('S1');
    if (!user) return null;

    const allEntries  = getGradesForStudent(user.id);
    const entries     = allEntries.filter(g => g.semestre === sem);
    const moyenne     = calcMoyenneGenerale(entries);
    const valide      = moyenne >= 10;
    const filiere     = user.filiere ? FILIERE_LABELS[user.filiere] : '—';

    const excellent   = entries.filter(g => { const m = calcMoyenne(g.cc, g.tp, g.exam); return m !== null && m >= 16; }).length;
    const bon         = entries.filter(g => { const m = calcMoyenne(g.cc, g.tp, g.exam); return m !== null && m >= 12 && m < 16; }).length;
    const passable    = entries.filter(g => { const m = calcMoyenne(g.cc, g.tp, g.exam); return m !== null && m >= 10 && m < 12; }).length;
    const insuffisant = entries.filter(g => { const m = calcMoyenne(g.cc, g.tp, g.exam); return m !== null && m < 10; }).length;

    // Semestres disponibles selon l'année de l'étudiant
    const SEMS = user.annee === 'L1' ? ['S1','S2'] : user.annee === 'L2' ? ['S3','S4'] : ['S5','S6'];

    return (
        <>
            <div className="gr-hero">
                <div className="gr-hero-text">
                    <h1 className="gr-hero-title">Notes & Résultats</h1>
                    <p className="gr-hero-sub">{filiere} — {user.annee}{user.option ? ` (${user.option})` : ''}</p>
                    <div className="gr-hero-badges">
                        <span className="gr-hero-badge"><IonIcon icon={schoolOutline} />{entries.length} matières</span>
                        {entries.length > 0 && (
                            <span className={`gr-hero-badge ${valide ? 'gr-hero-badge--success' : 'gr-hero-badge--danger'}`}>
                                <IonIcon icon={valide ? checkmarkCircleOutline : closeCircleOutline} />
                                Moyenne : {moyenne.toFixed(2)}/20
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="gr-toolbar">
                <IonSegment mode="ios" value={sem} className="gr-segment" onIonChange={e => setSem(String(e.detail.value))}>
                    {SEMS.map(s => (
                        <IonSegmentButton key={s} value={s} className="gr-seg-btn">
                            <IonLabel>Semestre {s.replace('S','')}</IonLabel>
                        </IonSegmentButton>
                    ))}
                </IonSegment>
            </div>

            {entries.length === 0 ? (
                <div className="gr-empty">
                    <IonIcon icon={schoolOutline} className="gr-empty-icon" />
                    <p>Aucune note publiée pour ce semestre.</p>
                </div>
            ) : (
                <>
                    <div className="gr-stats-row">
                        <div className="gr-stat-card">
                            <div className="gr-stat-icon gr-stat-icon--primary"><IonIcon icon={trendingUpOutline} /></div>
                            <div><p className="gr-stat-value">{moyenne.toFixed(2)}</p><p className="gr-stat-label">Moyenne générale</p></div>
                        </div>
                        <div className="gr-stat-card">
                            <div className={`gr-stat-icon ${valide ? 'gr-stat-icon--success' : 'gr-stat-icon--danger'}`}><IonIcon icon={ribbonOutline} /></div>
                            <div><p className="gr-stat-value">{valide ? 'Validé' : 'Non validé'}</p><p className="gr-stat-label">Statut {sem}</p></div>
                        </div>
                        <div className="gr-stat-card gr-stat-card--mentions">
                            <p className="gr-stat-label gr-stat-label--top">Répartition</p>
                            <div className="gr-mentions">
                                <span className="gr-mention gr-mention--excellent">{excellent} ≥16</span>
                                <span className="gr-mention gr-mention--good">{bon} ≥12</span>
                                <span className="gr-mention gr-mention--pass">{passable} ≥10</span>
                                <span className="gr-mention gr-mention--fail">{insuffisant} &lt;10</span>
                            </div>
                        </div>
                    </div>

                    <div className="gr-export-row">
                        <IonButton fill="outline" size="small" color="primary" className="gr-export-btn"
                            onClick={() => printReleve(user.nom_complet, filiere, user.annee ?? '', user.option, sem, entries)}>
                            <IonIcon slot="start" icon={printOutline} />Relevé PDF
                        </IonButton>
                        <IonButton fill="outline" size="small" color="medium" className="gr-export-btn"
                            onClick={() => exportCSV(entries, sem)}>
                            <IonIcon slot="start" icon={downloadOutline} />Export CSV
                        </IonButton>
                    </div>

                    <Card variant="default" className="gr-table-card">
                        <CardHeader className="gr-table-card-header">
                            <CardTitle>Notes — {sem}</CardTitle>
                            <Badge variant={valide ? 'success' : 'danger'} size="sm" dot>{valide ? 'Semestre validé' : 'Non validé'}</Badge>
                        </CardHeader>
                        <CardContent padding="sm">
                            <div className="gr-table-scroll">
                                <table className="gr-table">
                                    <thead>
                                        <tr className="gr-thead-tr">
                                            <th className="gr-th gr-th--matiere">Matière</th>
                                            <th className="gr-th gr-th--center">CC</th>
                                            <th className="gr-th gr-th--center">TP</th>
                                            <th className="gr-th gr-th--center">Examen</th>
                                            <th className="gr-th gr-th--center">Coef</th>
                                            <th className="gr-th gr-th--center">Moyenne</th>
                                            <th className="gr-th gr-th--progress">Progression</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map(g => {
                                            const moy = calcMoyenne(g.cc, g.tp, g.exam);
                                            return (
                                                <tr key={g.id} className="gr-tr">
                                                    <td className="gr-td gr-td--matiere">
                                                        <div className="gr-matiere-cell"><IonIcon icon={documentTextOutline} className="gr-matiere-icon" /><span>{g.course_name}</span></div>
                                                    </td>
                                                    <td className="gr-td gr-td--center"><span className={`gr-note ${noteColor(g.cc)}`}>{g.cc ?? '—'}</span></td>
                                                    <td className="gr-td gr-td--center"><span className={`gr-note ${noteColor(g.tp)}`}>{g.tp ?? '—'}</span></td>
                                                    <td className="gr-td gr-td--center"><span className={`gr-note ${noteColor(g.exam)}`}>{g.exam ?? '—'}</span></td>
                                                    <td className="gr-td gr-td--center"><span className="gr-coef">{g.coef}</span></td>
                                                    <td className="gr-td gr-td--center">
                                                        <span className={`gr-moyenne ${moy !== null && moy >= 10 ? 'gr-moyenne--pass' : moy !== null ? 'gr-moyenne--fail' : ''}`}>
                                                            {moy !== null ? moy.toFixed(2) : '—'}
                                                        </span>
                                                    </td>
                                                    <td className="gr-td gr-td--progress">
                                                        {moy !== null && (
                                                            <div className="gr-progress-cell">
                                                                <IonProgressBar value={moy / 20} className={`gr-progress-bar ${moy >= 10 ? 'gr-progress-bar--pass' : 'gr-progress-bar--fail'}`} />
                                                                <span className="gr-progress-pct">{Math.round((moy / 20) * 100)}%</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        <tr className="gr-tr gr-tr--total">
                                            <td className="gr-td gr-td--matiere gr-td--total" colSpan={4}>Moyenne générale</td>
                                            <td className="gr-td gr-td--center gr-td--total">{entries.reduce((a, g) => a + g.coef, 0)}</td>
                                            <td className="gr-td gr-td--center gr-td--total" colSpan={2}>
                                                <span className={`gr-moyenne gr-moyenne--lg ${valide ? 'gr-moyenne--pass' : 'gr-moyenne--fail'}`}>{moyenne.toFixed(2)}/20</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </>
    );
};

/* ════════════════════════════════
   Vue Professeur — Saisie des notes
════════════════════════════════ */
interface NoteInputProps {
    value: number | null;
    onChange: (v: number | null) => void;
    placeholder?: string;
}
const NoteInput: React.FC<NoteInputProps> = ({ value, onChange, placeholder = '—' }) => (
    <IonInput
        type="number"
        min={0} max={20} step={0.5}
        value={value ?? ''}
        placeholder={placeholder}
        className="gr-note-input"
        onIonInput={e => {
            const raw = String(e.detail.value ?? '').trim();
            if (raw === '') { onChange(null); return; }
            const n = parseFloat(raw);
            onChange(isNaN(n) ? null : Math.min(20, Math.max(0, n)));
        }}
    />
);

interface CourseGradeViewProps {
    course: CourseData;
    onBack: () => void;
}

const CourseGradeView: React.FC<CourseGradeViewProps> = ({ course, onBack }) => {
    const { user } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);
    const [savingId,   setSavingId]   = useState<string | null>(null);

    if (!user) return null;

    // Étudiants de ce cours
    const students = getUsers().filter(u =>
        isStudent(u.role) && u.is_active &&
        u.filiere === course.filiere && u.annee === course.annee &&
        (!course.option || !u.option || u.option === course.option)
    );

    const entries     = getGradesForCourse(course.id);
    const courseStats = getCourseGradeStatus(course.id);
    const allPublished = courseStats.total > 0 && courseStats.draft === 0;

    // Map studentId -> entry courant
    const entryMap = Object.fromEntries(entries.map(e => [e.student_id, e]));

    // State local des notes en cours d'édition
    const [drafts, setDrafts] = useState<Record<string, { cc: number|null; tp: number|null; exam: number|null; coef: number }>>(() => {
        const init: Record<string, { cc: number|null; tp: number|null; exam: number|null; coef: number }> = {};
        students.forEach(s => {
            const e = entryMap[s.id];
            init[s.id] = { cc: e?.cc ?? null, tp: e?.tp ?? null, exam: e?.exam ?? null, coef: e?.coef ?? 2 };
        });
        return init;
    });

    const setDraft = (sid: string, field: 'cc'|'tp'|'exam'|'coef', val: number|null) => {
        setDrafts(prev => ({ ...prev, [sid]: { ...prev[sid], [field]: val } }));
    };

    const handleSave = useCallback((studentId: string, studentName: string) => {
        const d = drafts[studentId];
        if (!d) return;
        setSavingId(studentId);
        upsertGrade({
            student_id:   studentId,
            student_name: studentName,
            course_id:    course.id,
            course_name:  course.name,
            semestre:     course.semester ?? 'S1',
            filiere:      course.filiere,
            annee:        course.annee,
            cc:           d.cc,
            tp:           d.tp,
            exam:         d.exam,
            coef:         d.coef,
            status:       'draft',
            created_by:   user.id,
        });
        setRefreshKey(k => k + 1);
        setSavingId(null);
    }, [drafts, course, user.id]);

    const handlePublish = () => {
        publishGradesForCourse(course.id);
        setRefreshKey(k => k + 1);
    };

    const handleUnpublish = () => {
        unpublishGradesForCourse(course.id);
        setRefreshKey(k => k + 1);
    };

    return (
        <div key={refreshKey}>
            <div className="gr-course-header">
                <IonButton fill="clear" size="small" onClick={onBack} className="gr-back-btn">
                    <IonIcon slot="start" icon={arrowBackOutline} />Retour aux cours
                </IonButton>
                <div className="gr-course-info">
                    <h2 className="gr-course-title">{course.name}</h2>
                    <p className="gr-course-meta">{course.filiere} {course.annee}{course.option ? ` (${course.option})` : ''} • {students.length} étudiants</p>
                </div>
                <div className="gr-course-actions">
                    {allPublished ? (
                        <IonButton fill="outline" size="small" color="warning" onClick={handleUnpublish}>
                            <IonIcon slot="start" icon={eyeOutline} />Dépublier
                        </IonButton>
                    ) : (
                        <IonButton fill="solid" size="small" color="success" onClick={handlePublish} disabled={courseStats.total === 0}>
                            <IonIcon slot="start" icon={cloudUploadOutline} />Publier ({courseStats.total} notes)
                        </IonButton>
                    )}
                    <IonButton fill="outline" size="small" color="medium" onClick={() => exportCSV(entries, course.name)}>
                        <IonIcon slot="start" icon={downloadOutline} />CSV
                    </IonButton>
                </div>
            </div>

            {courseStats.total > 0 && (
                <div className="gr-pub-banner">
                    <IonChip className={`gr-pub-chip ${allPublished ? 'gr-pub-chip--published' : 'gr-pub-chip--draft'}`}>
                        {allPublished ? 'Notes publiées' : `${courseStats.draft} brouillon(s), ${courseStats.published} publié(s)`}
                    </IonChip>
                </div>
            )}

            {students.length === 0 ? (
                <div className="gr-empty"><IonIcon icon={schoolOutline} className="gr-empty-icon" /><p>Aucun étudiant dans ce groupe.</p></div>
            ) : (
                <Card variant="default" className="gr-table-card">
                    <CardContent padding="sm">
                        <div className="gr-table-scroll">
                            <table className="gr-table">
                                <thead>
                                    <tr className="gr-thead-tr">
                                        <th className="gr-th gr-th--matiere">Étudiant</th>
                                        <th className="gr-th gr-th--center">CC /20</th>
                                        <th className="gr-th gr-th--center">TP /20</th>
                                        <th className="gr-th gr-th--center">Exam /20</th>
                                        <th className="gr-th gr-th--center">Coef</th>
                                        <th className="gr-th gr-th--center">Moyenne</th>
                                        <th className="gr-th gr-th--center">Statut</th>
                                        <th className="gr-th gr-th--actions">Sauvegarder</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => {
                                        const d   = drafts[s.id] ?? { cc: null, tp: null, exam: null, coef: 2 };
                                        const moy = calcMoyenne(d.cc, d.tp, d.exam);
                                        const existing = entryMap[s.id];
                                        return (
                                            <tr key={s.id} className="gr-tr">
                                                <td className="gr-td gr-td--matiere">
                                                    <div className="gr-matiere-cell">
                                                        <div className="gr-student-avatar">{s.nom_complet.charAt(0).toUpperCase()}</div>
                                                        <span>{s.nom_complet}</span>
                                                    </div>
                                                </td>
                                                <td className="gr-td gr-td--center"><NoteInput value={d.cc}   onChange={v => setDraft(s.id,'cc',v)}   /></td>
                                                <td className="gr-td gr-td--center"><NoteInput value={d.tp}   onChange={v => setDraft(s.id,'tp',v)}   /></td>
                                                <td className="gr-td gr-td--center"><NoteInput value={d.exam} onChange={v => setDraft(s.id,'exam',v)} /></td>
                                                <td className="gr-td gr-td--center"><NoteInput value={d.coef} onChange={v => setDraft(s.id,'coef', v ?? 1)} placeholder="2" /></td>
                                                <td className="gr-td gr-td--center">
                                                    <span className={`gr-moyenne ${moy !== null && moy >= 10 ? 'gr-moyenne--pass' : moy !== null ? 'gr-moyenne--fail' : ''}`}>
                                                        {moy !== null ? moy.toFixed(2) : '—'}
                                                    </span>
                                                </td>
                                                <td className="gr-td gr-td--center">
                                                    {existing ? (
                                                        <Badge variant={existing.status === 'published' ? 'success' : 'warning'} size="sm" dot>
                                                            {existing.status === 'published' ? 'Publié' : 'Brouillon'}
                                                        </Badge>
                                                    ) : <span className="gr-empty-cell">—</span>}
                                                </td>
                                                <td className="gr-td gr-td--center">
                                                    <IonButton fill="solid" size="small" color="primary"
                                                        disabled={savingId === s.id}
                                                        onClick={() => handleSave(s.id, s.nom_complet)}
                                                        className="gr-save-btn">
                                                        <IonIcon slot="icon-only" icon={createOutline} />
                                                    </IonButton>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

/* ════════════════════════════════
   Vue Professeur — Liste des cours
════════════════════════════════ */
const ProfessorGradesView: React.FC = () => {
    const { user } = useAuth();
    const [selected, setSelected] = useState<CourseData | null>(null);
    if (!user) return null;

    const courses = getCoursesForProfessor(user.nom_complet);

    if (selected) return <CourseGradeView course={selected} onBack={() => setSelected(null)} />;

    return (
        <>
            <div className="gr-hero">
                <div className="gr-hero-text">
                    <h1 className="gr-hero-title">Gestion des notes</h1>
                    <p className="gr-hero-sub">Saisissez et publiez les notes de vos cours.</p>
                    <div className="gr-hero-badges">
                        <span className="gr-hero-badge"><IonIcon icon={schoolOutline} />{courses.length} cours</span>
                    </div>
                </div>
            </div>

            {courses.length === 0 ? (
                <div className="gr-empty"><IonIcon icon={schoolOutline} className="gr-empty-icon" /><p>Aucun cours assigné.</p></div>
            ) : (
                <div className="gr-courses-grid">
                    {courses.map(c => {
                        const stats = getCourseGradeStatus(c.id);
                        const allPub = stats.total > 0 && stats.draft === 0;
                        return (
                            <button key={c.id} className="gr-course-card" onClick={() => setSelected(c)}>
                                <div className="gr-course-card-icon"><IonIcon icon={documentTextOutline} /></div>
                                <div className="gr-course-card-body">
                                    <p className="gr-course-card-name">{c.name}</p>
                                    <p className="gr-course-card-meta">{c.filiere} {c.annee}{c.option ? ` (${c.option})` : ''}</p>
                                </div>
                                <Badge variant={allPub ? 'success' : stats.total > 0 ? 'warning' : 'secondary'} size="sm">
                                    {allPub ? 'Publié' : stats.total > 0 ? `${stats.draft} brouillon(s)` : 'Vide'}
                                </Badge>
                            </button>
                        );
                    })}
                </div>
            )}
        </>
    );
};

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const Grades: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;

    return (
        <DashboardLayout>
            {isProfessor(user.role) ? <ProfessorGradesView /> : <StudentGradesView />}
        </DashboardLayout>
    );
};

export default Grades;
