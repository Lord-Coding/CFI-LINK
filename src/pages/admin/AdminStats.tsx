import React from 'react';
import { IonIcon, IonProgressBar, IonCol, IonGrid, IonRow } from '../../lib/ionic';
import {
    peopleOutline, schoolOutline, personCircleOutline, pulseOutline,
    cardOutline, barChartOutline, trendingUpOutline, shieldOutline,
    bookOutline, keyOutline, pieChartOutline, timeOutline,
    checkmarkCircleOutline, alertCircleOutline,
} from 'ionicons/icons';
import {
    getUsers, isStudent, isProfessor, isStaff,
    getConcoursCodes, getValidationCodes,
} from '../../lib/store';
import { getPaymentRecords, MONTHLY_FEE } from '../../lib/payment-store';
import { getAuditLog } from '../../lib/audit-store';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../../components';
import DashboardLayout from '../../components/DashboardLayout';
import '../../styles/admin/AdminStats.css';

const AdminStats: React.FC = () => {
    /* ── Données ── */
    const users           = getUsers();
    const students        = users.filter(u => isStudent(u.role));
    const professors      = users.filter(u => isProfessor(u.role));
    const staff           = users.filter(u => isStaff(u.role));
    const activeUsers     = users.filter(u => u.is_active);
    const blocked         = students.filter(u => u.payment_blocked);

    const payments        = getPaymentRecords();
    const confirmed       = payments.filter(p => p.status === 'confirmed');
    const pending         = payments.filter(p => p.status === 'pending');
    const revenue         = confirmed.reduce((a, p) => a + p.amount, 0);

    const concoursCodes   = getConcoursCodes();
    const validationCodes = getValidationCodes();
    const auditEntries    = getAuditLog(100);

    const licStudents     = students.filter(s => s.filiere === 'LIC');
    const lapStudents     = students.filter(s => s.filiere === 'LAP');
    const licPct          = students.length > 0 ? (licStudents.length / students.length) : 0;
    const lapPct          = students.length > 0 ? (lapStudents.length / students.length) : 0;

    /* ── Stat cards ── */
    const statCards = [
        { icon: peopleOutline,      label: 'Total utilisateurs',    value: users.length,           color: 'primary' },
        { icon: schoolOutline,      label: 'Étudiants',             value: students.length,        color: 'success' },
        { icon: personCircleOutline, label: 'Professeurs',          value: professors.length,      color: 'info'    },
        { icon: pulseOutline,       label: 'Comptes actifs',        value: activeUsers.length,     color: 'warning' },
        { icon: cardOutline,        label: 'Revenus (FCFA)',        value: revenue.toLocaleString(), color: 'success' },
        { icon: barChartOutline,    label: 'Paiements confirmés',   value: confirmed.length,       color: 'primary' },
        { icon: trendingUpOutline,  label: 'En attente',            value: pending.length,         color: 'warning' },
        { icon: shieldOutline,      label: 'Bloqués',               value: blocked.length,         color: 'danger'  },
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
                                    {auditEntries.slice(0, 10).map(e => (
                                        <div key={e.id} className="as-activity-item">
                                            <div className="as-activity-dot" />
                                            <div className="as-activity-body">
                                                <p className="as-activity-action">{e.action} — {e.details}</p>
                                                <p className="as-activity-meta">
                                                    {e.user_name} •{' '}
                                                    {new Date(e.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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

        </DashboardLayout>
    );
};

export default AdminStats;
