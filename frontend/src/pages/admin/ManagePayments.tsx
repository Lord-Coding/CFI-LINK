import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonChip, IonSearchbar,
} from '../../lib/ionic';
import {
    cardOutline, lockClosedOutline, lockOpenOutline, copyOutline,
    checkmarkOutline, addCircleOutline, peopleOutline,
    alertCircleOutline, checkmarkCircleOutline, timeOutline,
} from 'ionicons/icons';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../lib/services/userService';
import { paymentService } from '../../lib/services/paymentService';
import { Avatar, Badge, Card, CardContent, CardHeader, CardTitle } from '../../components';
import DashboardLayout from '../../components/DashboardLayout';
import '../../styles/admin/ManagePayment.css';

const CopyButton: React.FC<{ code: string; copied: string | null; onCopy: (c: string) => void }> = ({ code, copied, onCopy }) => (
    <IonButton
        fill="clear"
        size="small"
        color={copied === code ? 'success' : 'medium'}
        className="mp-copy-btn"
        onClick={() => onCopy(code)}
        title="Copier"
    >
        <IonIcon slot="icon-only" icon={copied === code ? checkmarkOutline : copyOutline} />
    </IonButton>
);

/* ── Page principale ── */
const ManagePayments: React.FC = () => {
    const qc = useQueryClient();
    const [copied, setCopied] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const { data: students = [] }    = useQuery({ queryKey: ['users', 'students'],  queryFn: () => userService.list({ role: 'etudiant_concours' }) });
    const { data: paymentCodes = [] } = useQuery({ queryKey: ['payment-codes'],      queryFn: paymentService.listCodes });

    const toggleBlockMutation = useMutation({
        mutationFn: userService.togglePaymentBlock,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    });

    const generateCodeMutation = useMutation({
        mutationFn: ({ student_id, month }: { student_id: number; month: string }) =>
            paymentService.generateCode(student_id, month),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-codes'] }),
    });

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    const generateCode = (studentId: number) => {
        const month = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        generateCodeMutation.mutate({ student_id: studentId, month });
    };

    const q = search.toLowerCase().trim();
    const displayedStudents = students.filter(u => !q || u.nom_complet.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));

    const blocked      = students.filter(u => u.payment_blocked).length;
    const ok           = students.length - blocked;
    const codesWaiting = paymentCodes.filter(c => !c.used).length;

    return (
        <DashboardLayout>

            {/* ── Hero ── */}
            <div className="mp-hero">
                <div className="mp-hero-text">
                    <h1 className="mp-hero-title">Gestion des paiements</h1>
                    <p className="mp-hero-sub">Gérez la scolarité des étudiants et générez les codes de déblocage.</p>
                    <div className="mp-hero-badges">
                        <span className="mp-hero-badge">
                            <IonIcon icon={peopleOutline} />{students.length} étudiants
                        </span>
                        <span className="mp-hero-badge">
                            <IonIcon icon={alertCircleOutline} />{blocked} bloqués
                        </span>
                        <span className="mp-hero-badge">
                            <IonIcon icon={cardOutline} />{codesWaiting} codes en attente
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="mp-stats-row">
                <div className="mp-stat-chip">
                    <IonIcon icon={peopleOutline} className="mp-stat-chip-icon" />
                    <span className="mp-stat-chip-count">{students.length}</span>
                    <span className="mp-stat-chip-label">Étudiants total</span>
                </div>
                <div className="mp-stat-chip">
                    <IonIcon icon={checkmarkCircleOutline} className="mp-stat-chip-icon mp-stat-chip-icon--success" />
                    <span className="mp-stat-chip-count">{ok}</span>
                    <span className="mp-stat-chip-label">À jour</span>
                </div>
                <div className="mp-stat-chip">
                    <IonIcon icon={lockClosedOutline} className="mp-stat-chip-icon mp-stat-chip-icon--danger" />
                    <span className="mp-stat-chip-count">{blocked}</span>
                    <span className="mp-stat-chip-label">Bloqués</span>
                </div>
                <div className="mp-stat-chip">
                    <IonIcon icon={timeOutline} className="mp-stat-chip-icon mp-stat-chip-icon--warning" />
                    <span className="mp-stat-chip-count">{codesWaiting}</span>
                    <span className="mp-stat-chip-label">Codes actifs</span>
                </div>
            </div>

            {/* ── Tableau étudiants ── */}
            <div className="mp-table-wrap">
                <Card variant="default" className="mp-table-card">
                    <CardHeader className="mp-table-card-header">
                        <CardTitle>Scolarité étudiants</CardTitle>
                        <IonChip className="mp-count-chip">{displayedStudents.length}</IonChip>
                    </CardHeader>
                    <CardContent padding="sm">
                        <IonSearchbar
                            value={search}
                            onIonInput={e => setSearch(String(e.detail.value ?? ''))}
                            placeholder="Rechercher un étudiant..."
                            className="mp-searchbar"
                            debounce={200}
                        />
                        <div className="mp-table-scroll">
                            <table className="mp-table">
                                <thead>
                                    <tr className="mp-thead-tr">
                                        <th className="mp-th">Étudiant</th>
                                        <th className="mp-th">Filière</th>
                                        <th className="mp-th">Statut</th>
                                        <th className="mp-th mp-th--actions">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="mp-empty-row">
                                                <IonIcon icon={peopleOutline} className="mp-empty-icon" />
                                                <span>Aucun étudiant trouvé</span>
                                            </td>
                                        </tr>
                                    ) : displayedStudents.map(u => (
                                        <tr key={u.id} className="mp-tr">
                                            <td className="mp-td mp-td--student">
                                                <div className="mp-student-cell">
                                                    <Avatar
                                                        fallback={u.nom_complet.charAt(0).toUpperCase()}
                                                        size="sm"
                                                        color={u.payment_blocked ? 'var(--ion-color-danger)' : 'var(--ion-color-success)'}
                                                    />
                                                    <div className="mp-student-info">
                                                        <span className="mp-student-name">{u.nom_complet}</span>
                                                        <span className="mp-student-email">{u.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="mp-td mp-td--filiere">
                                                <div className="mp-filiere-cell">
                                                    <Badge variant="info" size="sm">{u.filiere ?? '—'}</Badge>
                                                    <span className="mp-annee">{u.annee ?? ''}</span>
                                                </div>
                                            </td>
                                            <td className="mp-td mp-td--status">
                                                <Badge
                                                    variant={u.payment_blocked ? 'danger' : 'success'}
                                                    size="sm"
                                                    dot
                                                >
                                                    {u.payment_blocked ? 'Bloqué' : 'À jour'}
                                                </Badge>
                                            </td>
                                            <td className="mp-td mp-td--actions">
                                                <div className="mp-actions">
                                                    <IonButton
                                                        fill="outline"
                                                        size="small"
                                                        color={u.payment_blocked ? 'success' : 'danger'}
                                                        className="mp-block-btn"
                                                        onClick={() => toggleBlockMutation.mutate(u.id)}
                                                    >
                                                        <IonIcon
                                                            slot="start"
                                                            icon={u.payment_blocked ? lockOpenOutline : lockClosedOutline}
                                                        />
                                                        {u.payment_blocked ? 'Débloquer' : 'Bloquer'}
                                                    </IonButton>
                                                    {u.payment_blocked && (
                                                        <IonButton
                                                            fill="clear"
                                                            size="small"
                                                            color="primary"
                                                            className="mp-gencode-btn"
                                                            onClick={() => generateCode(u.id)}
                                                            title="Générer un code de paiement"
                                                        >
                                                            <IonIcon slot="start" icon={addCircleOutline} />
                                                            Code
                                                        </IonButton>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Codes de paiement générés ── */}
            {paymentCodes.length > 0 && (
                <div className="mp-table-wrap">
                    <Card variant="default" className="mp-table-card">
                        <CardHeader className="mp-table-card-header">
                            <CardTitle>Codes de paiement générés</CardTitle>
                            <IonChip className="mp-count-chip">{paymentCodes.length}</IonChip>
                        </CardHeader>
                        <CardContent padding="sm">
                            <div className="mp-table-scroll">
                                <table className="mp-table">
                                    <thead>
                                        <tr className="mp-thead-tr">
                                            <th className="mp-th">Code</th>
                                            <th className="mp-th">Étudiant</th>
                                            <th className="mp-th">Mois</th>
                                            <th className="mp-th">Statut</th>
                                            <th className="mp-th mp-th--actions">Copier</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentCodes.map(c => (
                                            <tr key={c.id} className="mp-tr">
                                                <td className="mp-td mp-td--code">
                                                    <span className="mp-code">{c.code}</span>
                                                </td>
                                                <td className="mp-td">{c.student?.nom_complet ?? `Étudiant #${c.student_id}`}</td>
                                                <td className="mp-td mp-td--month">
                                                    <span className="mp-month">{c.month}</span>
                                                </td>
                                                <td className="mp-td">
                                                    <Badge variant={c.used ? 'secondary' : 'warning'} size="sm" dot>
                                                        {c.used ? 'Utilisé' : 'En attente'}
                                                    </Badge>
                                                </td>
                                                <td className="mp-td mp-td--actions">
                                                    <CopyButton code={c.code} copied={copied} onCopy={copyCode} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

        </DashboardLayout>
    );
};

export default ManagePayments;
