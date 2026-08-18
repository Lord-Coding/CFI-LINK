import React from 'react';
import { IonIcon, IonProgressBar, IonCol, IonGrid, IonRow, IonButton } from '../../lib/ionic';
import {
    peopleOutline, schoolOutline, personCircleOutline, pulseOutline,
    cardOutline, barChartOutline, trendingUpOutline, shieldOutline,
    bookOutline, keyOutline, timeOutline, downloadOutline,
    checkmarkCircleOutline, alertCircleOutline, clipboardOutline,
    desktopOutline, calendarOutline,
} from 'ionicons/icons';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../lib/services/userService';
import { paymentService } from '../../lib/services/paymentService';
import { gradeService } from '../../lib/services/gradeService';
import { attendanceService } from '../../lib/services/attendanceService';
import { courseService } from '../../lib/services/courseService';
import { codesService } from '../../lib/services/codesService';
import { auditService } from '../../lib/services/auditService';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../../components';
import DashboardLayout from '../../components/DashboardLayout';
import '../../styles/admin/AdminStats.css';

const MONTHLY_FEE = 25000;

const AdminStats: React.FC = () => {
    const { data: users           = [] } = useQuery({ queryKey: ['users'],            queryFn: userService.list });
    const { data: payments        = [] } = useQuery({ queryKey: ['payments', 'admin'], queryFn: paymentService.list });
    const { data: concoursCodes   = [] } = useQuery({ queryKey: ['codes', 'concours'], queryFn: codesService.listConcours });
    const { data: validationCodes = [] } = useQuery({ queryKey: ['codes', 'validation'], queryFn: codesService.listValidation });
    const { data: allGrades       = [] } = useQuery({ queryKey: ['grades'],            queryFn: () => gradeService.list() });
    const { data: attendanceRecs  = [] } = useQuery({ queryKey: ['attendance', 'all'], queryFn: () => attendanceService.list() });
    const { data: allCourses      = [] } = useQuery({ queryKey: ['courses'],           queryFn: courseService.list });
    const { data: auditEntries    = [] } = useQuery({ queryKey: ['audit-logs', 'recent'], queryFn: () => auditService.list() });

    const students        = users.filter((u: {role: string}) => u.role === 'etudiant_concours' || u.role === 'etudiant_externe');
    const professors      = users.filter((u: {role: string}) => u.role === 'professeur');
    const activeUsers     = users.filter((u: {is_active: boolean}) => u.is_active);
    const blocked         = students.filter((u: {payment_blocked: boolean}) => u.payment_blocked);
    const pendingAccounts = users.filter((u: {is_active: boolean}) => !u.is_active);

    const confirmed       = payments.filter((p: {status: string}) => p.status === 'confirmed');
    const pending         = payments.filter((p: {status: string}) => p.status === 'pending');
    const revenue         = confirmed.reduce((a: number, p: {amount: number}) => a + p.amount, 0);

    const licStudents = students.filter((s: {filiere?: string}) => s.filiere === 'LIC');
    const lapStudents = students.filter((s: {filiere?: string}) => s.filiere === 'LAP');
    const licPct      = students.length > 0 ? licStudents.length / students.length : 0;
    const lapPct      = students.length > 0 ? lapStudents.length / students.length : 0;

    const attByFiliere = (['LIC', 'LAP'] as const).map(f => {
        const fStudentIds = new Set(students.filter((s: {filiere?: string}) => s.filiere === f).map((s: {id: number}) => s.id));
        const fRecords = attendanceRecs.filter((r: {student_id: number}) => fStudentIds.has(r.student_id));
        const total   = fRecords.length;
        const present = fRecords.filter((r: {status: string}) => r.status === 'present' || r.status === 'late').length;
        const absent  = fRecords.filter((r: {status: string}) => r.status === 'absent').length;
        const rate    = total > 0 ? Math.round((present / total) * 100) : 0;
        return { filiere: f, total, present, absent, rate };
    });

    const coursesWithProgress = allCourses.slice(0, 5).map((c: {id: number; name: string; lessons?: {id: number}[]}) => {
        const lessons = c.lessons ?? [];
        const done    = 0; // progression réelle nécessite des données per-student
        const pct     = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
        return { name: c.name, total: lessons.length, done, pct };
    });

    const byAnnee = (['L1', 'L2', 'L3'] as const).map(a => ({
        annee: a,
        count: students.filter((s: {annee?: string}) => s.annee === a).length,
        pct: students.length > 0
            ? Math.round((students.filter((s: {annee?: string}) => s.annee === a).length / students.length) * 100)
            : 0,
    }));

    const publishedGrades = allGrades.filter((g: {status: string}) => g.status === 'published').length;
    const draftGrades     = allGrades.filter((g: {status: string}) => g.status === 'draft').length;

    const exportStudentsCSV = () => {
        const header = 'Nom,Email,Rôle,Filière,Année,Option,Actif,Scolarité bloquée\n';
        const rows = students.map((s: {nom_complet: string; email: string; role: string; filiere?: string; annee?: string; option_lic?: string; is_active: boolean; payment_blocked: boolean}) =>
            `"${s.nom_complet}","${s.email}","${s.role}",${s.filiere ?? ''},${s.annee ?? ''},${s.option_lic ?? ''},${s.is_active},${!!s.payment_blocked}`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = 'etudiants_cfi.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const statCards = [
        { icon: peopleOutline,       label: 'Total utilisateurs',  value: users.length,             color: 'primary' },
        { icon: schoolOutline,       label: 'Étudiants',           value: students.length,          color: 'success' },
        { icon: personCircleOutline, label: 'Professeurs',         value: professors.length,        color: 'info'    },
        { icon: pulseOutline,        label: 'Comptes actifs',      value: activeUsers.length,       color: 'warning' },
        { icon: cardOutline,         label: 'Revenus (FCFA)',      value: revenue.toLocaleString(), color: 'success' },
        { icon: barChartOutline,     label: 'Paiements confirmés', value: confirmed.length,         color: 'primary' },
        { icon: trendingUpOutline,   label: 'En attente paiement', value: pending.length,           color: 'warning' },
        { icon: shieldOutline,       label: 'Bloqués',             value: blocked.length,           color: 'danger'  },
    ];

    return (
        <DashboardLayout>

            {/* ── Hero ── */}
            <div className="as-hero">
                <div className="as-hero-text">
                    <h1 className="as-hero-title">Statistiques avancées</h1>
                    <p className="as-hero-sub">Vue d'ensemble détaillée de la plateforme CFI-LINK.</p>
                    <div className="as-hero-badges">
                        <span className="as-hero-badge">
                            <IonIcon icon={peopleOutline} />{users.length} comptes
                        </span>
                        <span className="as-hero-badge">
                            <IonIcon icon={checkmarkCircleOutline} />{activeUsers.length} actifs
                        </span>
                        <span className="as-hero-badge">
                            <IonIcon icon={cardOutline} />{revenue.toLocaleString()} FCFA encaissés
                        </span>
                    </div>
                </div>
                <IonButton fill="outline" size="small" className="as-export-btn" onClick={exportStudentsCSV}>
                    <IonIcon slot="start" icon={downloadOutline} />Export étudiants CSV
                </IonButton>
            </div>

            {/* ── Stat cards ── */}
            <div className="as-section">
                <p className="as-section-label">Vue d'ensemble</p>
                <IonGrid className="ion-no-padding as-stats-grid">
                    <IonRow>
                        {statCards.map(s => (
                            <IonCol key={s.label} size="6" sizeLg="3">
                                <Card variant="default" hoverable className="as-stat-card">
                                    <CardContent padding="md" className="as-stat-card-content">
                                        <div className={`as-stat-icon as-stat-icon--${s.color}`}>
                                            <IonIcon icon={s.icon} />
                                        </div>
                                        <p className="as-stat-value">{s.value}</p>
                                        <p className="as-stat-label">{s.label}</p>
                                    </CardContent>
                                </Card>
                            </IonCol>
                        ))}
                    </IonRow>
                </IonGrid>
            </div>

            {/* ── Grille principale ── */}
            <IonGrid className="ion-no-padding as-main-grid">
                <IonRow>

                    {/* Répartition par filière */}
                    <IonCol size="12" sizeLg="6">
                        <Card variant="default" className="as-card">
                            <CardHeader>
                                <div className="as-card-header">
                                    <IonIcon icon={bookOutline} className="as-card-header-icon--primary" />
                                    <CardTitle>Répartition par filière</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent padding="md">
                                <div className="as-filiere-list">
                                    <div className="as-filiere-item">
                                        <div className="as-filiere-label">
                                            <span>LIC — Informatique</span>
                                            <Badge variant="info" size="sm">{licStudents.length} étudiants</Badge>
                                        </div>
                                        <div className="as-progress-wrap">
                                            <IonProgressBar value={licPct} className="as-progress as-progress--primary" />
                                            <span className="as-progress-pct">{Math.round(licPct * 100)}%</span>
                                        </div>
                                    </div>
                                    <div className="as-filiere-item">
                                        <div className="as-filiere-label">
                                            <span>LAP — Administrative</span>
                                            <Badge variant="success" size="sm">{lapStudents.length} étudiants</Badge>
                                        </div>
                                        <div className="as-progress-wrap">
                                            <IonProgressBar value={lapPct} className="as-progress as-progress--success" />
                                            <span className="as-progress-pct">{Math.round(lapPct * 100)}%</span>
                                        </div>
                                    </div>

                                    <div className="as-annee-grid">
                                        {(['L1', 'L2', 'L3'] as const).map(a => {
                                            const count = students.filter(s => s.annee === a).length;
                                            const pct   = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
                                            return (
                                                <div key={a} className="as-annee-item">
                                                    <p className="as-annee-value">{count}</p>
                                                    <p className="as-annee-label">{a}</p>
                                                    <p className="as-annee-pct">{pct}%</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </IonCol>

                    {/* Finances */}
                    <IonCol size="12" sizeLg="6">
                        <Card variant="default" className="as-card">
                            <CardHeader>
                                <div className="as-card-header">
                                    <IonIcon icon={cardOutline} className="as-card-header-icon--success" />
                                    <CardTitle>Finances</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent padding="md">
                                <div className="as-finance-content">
                                    <div className="as-revenue-box">
                                        <p className="as-revenue-label">Revenus encaissés</p>
                                        <p className="as-revenue-amount">{revenue.toLocaleString()} FCFA</p>
                                    </div>
                                    <div className="as-finance-grid">
                                        <div className="as-finance-item">
                                            <IonIcon icon={checkmarkCircleOutline} className="as-finance-icon--success" />
                                            <p className="as-finance-value">{confirmed.length}</p>
                                            <p className="as-finance-label">Confirmés</p>
                                        </div>
                                        <div className="as-finance-item">
                                            <IonIcon icon={timeOutline} className="as-finance-icon--warning" />
                                            <p className="as-finance-value as-finance-value--warning">{pending.length}</p>
                                            <p className="as-finance-label">En attente</p>
                                        </div>
                                    </div>
                                    <div className="as-finance-meta">
                                        <p>Frais mensuels : <strong>{MONTHLY_FEE.toLocaleString()} FCFA</strong> / étudiant</p>
                                        <p>Potentiel mensuel : <strong>{(students.length * MONTHLY_FEE).toLocaleString()} FCFA</strong></p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </IonCol>

                    {/* Codes */}
                    <IonCol size="12" sizeLg="6">
                        <Card variant="default" className="as-card">
                            <CardHeader>
                                <div className="as-card-header">
                                    <IonIcon icon={keyOutline} className="as-card-header-icon--info" />
                                    <CardTitle>Codes d'accès</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent padding="md">
                                <div className="as-codes-grid">
                                    <div className="as-code-item">
                                        <p className="as-code-count">{concoursCodes.length}</p>
                                        <p className="as-code-label">Codes concours</p>
                                        <div className="as-code-meta">
                                            <Badge variant="success" size="sm">{concoursCodes.filter(c => c.used).length} utilisés</Badge>
                                            <Badge variant="secondary" size="sm">{concoursCodes.filter(c => !c.used).length} disponibles</Badge>
                                        </div>
                                    </div>
                                    <div className="as-code-item">
                                        <p className="as-code-count">{validationCodes.length}</p>
                                        <p className="as-code-label">Codes validation</p>
                                        <div className="as-code-meta">
                                            <Badge variant="success" size="sm">{validationCodes.filter(c => c.used).length} utilisés</Badge>
                                            <Badge variant="secondary" size="sm">{validationCodes.filter(c => !c.used).length} disponibles</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </IonCol>

                    {/* Activité récente */}
                    <IonCol size="12" sizeLg="6">
                        <Card variant="default" className="as-card">
                            <CardHeader>
                                <div className="as-card-header">
                                    <IonIcon icon={trendingUpOutline} className="as-card-header-icon--warning" />
                                    <CardTitle>Activité récente</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent padding="md">
                                <div className="as-activity-list">
                                    {auditEntries.slice(0, 10).map((e: {id: number; action: string; details?: string; user?: {nom_complet: string}; created_at: string}) => (
                                        <div key={e.id} className="as-activity-item">
                                            <div className="as-activity-dot" />
                                            <div className="as-activity-body">
                                                <p className="as-activity-action">{e.action} — {e.details}</p>
                                                <p className="as-activity-meta">
                                                    {e.user?.nom_complet ?? '—'} •{' '}
                                                    {new Date(e.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {auditEntries.length === 0 && (
                                        <p className="as-activity-empty">Aucune activité enregistrée.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </IonCol>

                </IonRow>
            </IonGrid>


            {/* ── Seconde grille : présences + E-Learning + inscriptions ── */}
            <IonGrid className="ion-no-padding as-main-grid">
                <IonRow>

                    {/* Présences par filière */}
                    <IonCol size="12" sizeLg="6">
                        <Card variant="default" className="as-card">
                            <CardHeader>
                                <div className="as-card-header">
                                    <IonIcon icon={clipboardOutline} className="as-card-header-icon--info" />
                                    <CardTitle>Présences par filière</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent padding="md">
                                {attendanceRecords.length === 0 ? (
                                    <p className="as-activity-empty">Aucune donnée de présence.</p>
                                ) : (
                                    <div className="as-filiere-list">
                                        {attByFiliere.map(a => (
                                            <div key={a.filiere} className="as-filiere-item">
                                                <div className="as-filiere-label">
                                                    <span>{a.filiere}</span>
                                                    <div style={{ display:'flex', gap:'0.4rem' }}>
                                                        <Badge variant="success" size="sm">{a.present} présences</Badge>
                                                        <Badge variant="danger"  size="sm">{a.absent} absences</Badge>
                                                    </div>
                                                </div>
                                                <div className="as-progress-wrap">
                                                    <IonProgressBar value={a.rate / 100} className="as-progress" />
                                                    <span className="as-progress-pct">{a.rate}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </IonCol>

                    {/* Taux de complétion E-Learning */}
                    <IonCol size="12" sizeLg="6">
                        <Card variant="default" className="as-card">
                            <CardHeader>
                                <div className="as-card-header">
                                    <IonIcon icon={desktopOutline} className="as-card-header-icon--primary" />
                                    <CardTitle>Complétion E-Learning</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent padding="md">
                                {coursesWithProgress.length === 0 ? (
                                    <p className="as-activity-empty">Aucun cours disponible.</p>
                                ) : (
                                    <div className="as-filiere-list">
                                        {coursesWithProgress.map((c, i) => (
                                            <div key={i} className="as-filiere-item">
                                                <div className="as-filiere-label">
                                                    <span style={{ fontSize:'0.82rem' }}>{c.name}</span>
                                                    <Badge variant="info" size="sm">{c.done}/{c.total} leçons</Badge>
                                                </div>
                                                <div className="as-progress-wrap">
                                                    <IonProgressBar value={c.pct / 100} className="as-progress as-progress--success" />
                                                    <span className="as-progress-pct">{c.pct}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </IonCol>

                    {/* Inscriptions par niveau */}
                    <IonCol size="12" sizeLg="6">
                        <Card variant="default" className="as-card">
                            <CardHeader>
                                <div className="as-card-header">
                                    <IonIcon icon={calendarOutline} className="as-card-header-icon--warning" />
                                    <CardTitle>Inscriptions par niveau</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent padding="md">
                                <div className="as-annee-grid" style={{ marginBottom:'1rem' }}>
                                    {byAnnee.map(a => (
                                        <div key={a.annee} className="as-annee-item">
                                            <p className="as-annee-value">{a.count}</p>
                                            <p className="as-annee-label">{a.annee}</p>
                                            <p className="as-annee-pct">{a.pct}%</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="as-filiere-list">
                                    {byAnnee.map(a => (
                                        <div key={a.annee} className="as-filiere-item">
                                            <div className="as-filiere-label">
                                                <span>{a.annee}</span>
                                                <Badge variant="secondary" size="sm">{a.count} étudiants</Badge>
                                            </div>
                                            <div className="as-progress-wrap">
                                                <IonProgressBar value={a.pct / 100} className="as-progress as-progress--primary" />
                                                <span className="as-progress-pct">{a.pct}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </IonCol>

                    {/* Notes publiées */}
                    <IonCol size="12" sizeLg="6">
                        <Card variant="default" className="as-card">
                            <CardHeader>
                                <div className="as-card-header">
                                    <IonIcon icon={checkmarkCircleOutline} className="as-card-header-icon--success" />
                                    <CardTitle>Notes saisies</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent padding="md">
                                <div className="as-finance-grid">
                                    <div className="as-finance-item">
                                        <IonIcon icon={checkmarkCircleOutline} className="as-finance-icon--success" />
                                        <p className="as-finance-value">{publishedGrades}</p>
                                        <p className="as-finance-label">Publiées</p>
                                    </div>
                                    <div className="as-finance-item">
                                        <IonIcon icon={alertCircleOutline} className="as-finance-icon--warning" />
                                        <p className="as-finance-value as-finance-value--warning">{draftGrades}</p>
                                        <p className="as-finance-label">Brouillons</p>
                                    </div>
                                </div>
                                {(publishedGrades + draftGrades) > 0 && (
                                    <div className="as-progress-wrap" style={{ marginTop:'1rem' }}>
                                        <IonProgressBar value={publishedGrades / (publishedGrades + draftGrades)} className="as-progress as-progress--success" />
                                        <span className="as-progress-pct">{Math.round(publishedGrades / (publishedGrades + draftGrades) * 100)}% publiées</span>
                                    </div>
                                )}
                                {pendingAccounts.length > 0 && (
                                    <div className="as-finance-meta" style={{ marginTop:'1rem' }}>
                                        <p>{pendingAccounts.length} compte{pendingAccounts.length > 1 ? 's' : ''} en attente d'activation</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </IonCol>

                </IonRow>
            </IonGrid>

            {/* Graphiques E1 */}
            <IonGrid className="ion-no-padding as-main-grid">
                <IonRow>
                    <IonCol size="12" sizeLg="6">
                        <Card variant="default" className="as-card">
                            <CardHeader><div className="as-card-header"><IonIcon icon={clipboardOutline} className="as-card-header-icon--info" /><CardTitle>Présences par filière</CardTitle></div></CardHeader>
                            <CardContent padding="md">
                                {attendanceRecords.length === 0 ? <p className="as-activity-empty">Aucune donnée de présence.</p> : (
                                    <div className="as-filiere-list">{attByFiliere.map(a => (<div key={a.filiere} className="as-filiere-item"><div className="as-filiere-label"><span>{a.filiere}</span><div style={{display:'flex',gap:'0.4rem'}}><Badge variant="success" size="sm">{a.present} présents</Badge><Badge variant="danger" size="sm">{a.absent} absences</Badge></div></div><div className="as-progress-wrap"><IonProgressBar value={a.rate/100} className="as-progress" /><span className="as-progress-pct">{a.rate}%</span></div></div>))}</div>
                                )}
                            </CardContent>
                        </Card>
                    </IonCol>
                    <IonCol size="12" sizeLg="6">
                        <Card variant="default" className="as-card">
                            <CardHeader><div className="as-card-header"><IonIcon icon={desktopOutline} className="as-card-header-icon--primary" /><CardTitle>Complétion E-Learning</CardTitle></div></CardHeader>
                            <CardContent padding="md">
                                {coursesWithProgress.length === 0 ? <p className="as-activity-empty">Aucun cours.</p> : (
                                    <div className="as-filiere-list">{coursesWithProgress.map((c,i) => (<div key={i} className="as-filiere-item"><div className="as-filiere-label"><span style={{fontSize:'0.82rem'}}>{c.name}</span><Badge variant="info" size="sm">{c.done}/{c.total}</Badge></div><div className="as-progress-wrap"><IonProgressBar value={c.pct/100} className="as-progress as-progress--success" /><span className="as-progress-pct">{c.pct}%</span></div></div>))}</div>
                                )}
                            </CardContent>
                        </Card>
                    </IonCol>
                    <IonCol size="12" sizeLg="6">
                        <Card variant="default" className="as-card">
                            <CardHeader><div className="as-card-header"><IonIcon icon={calendarOutline} className="as-card-header-icon--warning" /><CardTitle>Inscriptions par niveau</CardTitle></div></CardHeader>
                            <CardContent padding="md">
                                <div className="as-annee-grid" style={{marginBottom:'1rem'}}>{byAnnee.map(a => (<div key={a.annee} className="as-annee-item"><p className="as-annee-value">{a.count}</p><p className="as-annee-label">{a.annee}</p><p className="as-annee-pct">{a.pct}%</p></div>))}</div>
                                <div className="as-filiere-list">{byAnnee.map(a => (<div key={a.annee} className="as-filiere-item"><div className="as-filiere-label"><span>{a.annee}</span><Badge variant="secondary" size="sm">{a.count} étudiants</Badge></div><div className="as-progress-wrap"><IonProgressBar value={a.pct/100} className="as-progress as-progress--primary" /><span className="as-progress-pct">{a.pct}%</span></div></div>))}</div>
                            </CardContent>
                        </Card>
                    </IonCol>
                    <IonCol size="12" sizeLg="6">
                        <Card variant="default" className="as-card">
                            <CardHeader><div className="as-card-header"><IonIcon icon={checkmarkCircleOutline} className="as-card-header-icon--success" /><CardTitle>Notes saisies</CardTitle></div></CardHeader>
                            <CardContent padding="md">
                                <div className="as-finance-grid"><div className="as-finance-item"><IonIcon icon={checkmarkCircleOutline} className="as-finance-icon--success" /><p className="as-finance-value">{publishedGrades}</p><p className="as-finance-label">Publiées</p></div><div className="as-finance-item"><IonIcon icon={alertCircleOutline} className="as-finance-icon--warning" /><p className="as-finance-value as-finance-value--warning">{draftGrades}</p><p className="as-finance-label">Brouillons</p></div></div>
                                {(publishedGrades+draftGrades)>0&&(<div className="as-progress-wrap" style={{marginTop:'1rem'}}><IonProgressBar value={publishedGrades/(publishedGrades+draftGrades)} className="as-progress as-progress--success" /><span className="as-progress-pct">{Math.round(publishedGrades/(publishedGrades+draftGrades)*100)}% publiées</span></div>)}
                                {pendingAccounts.length>0&&(<div className="as-finance-meta" style={{marginTop:'1rem'}}><p>{pendingAccounts.length} compte{pendingAccounts.length>1?'s':''} en attente d'activation</p></div>)}
                            </CardContent>
                        </Card>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </DashboardLayout>
    );
};

export default AdminStats;