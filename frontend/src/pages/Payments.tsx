import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonModal, IonInput, IonSelect,
    IonSelectOption, IonItem, IonChip, IonSpinner,
} from '../lib/ionic';
import {
    cardOutline, phonePortraitOutline, cashOutline,
    checkmarkCircleOutline, closeCircleOutline, timeOutline,
    walletOutline, alertCircleOutline, keyOutline,
    informationCircleOutline, peopleOutline, sendOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { isAdmin, isStaff, isStudent } from '../lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../lib/services/paymentService';
import { Avatar, Badge, Card, CardContent, CardHeader, CardTitle } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Payments.css';

const MONTHLY_FEE = 25000;
type PaymentMethod = 'cash' | 'mobile_money' | 'card';
const METHOD_LABELS: Record<PaymentMethod, string> = { cash: 'Espèces', mobile_money: 'Mobile Money', card: 'Carte bancaire' };
const METHOD_ICON: Record<PaymentMethod, string>   = { cash: cashOutline, mobile_money: phonePortraitOutline, card: cardOutline };

const MONTHS = [
    'Octobre 2024', 'Novembre 2024', 'Décembre 2024',
    'Janvier 2025', 'Février 2025', 'Mars 2025',
    'Avril 2025',   'Mai 2025',     'Juin 2025',
];
type PayBadge = 'success' | 'warning' | 'danger' | 'secondary';
const STATUS_BADGE: Record<string, PayBadge> = { confirmed: 'success', pending: 'warning', rejected: 'danger' };
const STATUS_LABEL: Record<string, string> = { confirmed: 'Confirmé', pending: 'En attente', rejected: 'Rejeté' };

const MONTHS = [
    'Octobre 2024', 'Novembre 2024', 'Décembre 2024',
    'Janvier 2025', 'Février 2025', 'Mars 2025',
    'Avril 2025',   'Mai 2025',     'Juin 2025',
];

type PayBadge = 'success' | 'warning' | 'danger' | 'secondary';
const STATUS_BADGE: Record<string, PayBadge> = {
    confirmed: 'success', pending: 'warning', rejected: 'danger',
};
const STATUS_LABEL: Record<string, string> = {
    confirmed: 'Confirmé', pending: 'En attente', rejected: 'Rejeté',
};

/* ── Icône méthode ── */
const METHOD_ICON: Record<PaymentMethod, string> = {
    cash:         cashOutline,
    mobile_money: phonePortraitOutline,
    card:         cardOutline,
};

/* ════════════════════════════════
   Vue Étudiant
════════════════════════════════ */
const StudentPaymentView: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const qc = useQueryClient();
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [fMonth,       setFMonth]       = useState('');
    const [fMethod,      setFMethod]      = useState<PaymentMethod | ''>('');
    const [fReference,   setFReference]   = useState('');
    const [codeInput,    setCodeInput]    = useState('');
    const [codeError,    setCodeError]    = useState('');
    const [codeSuccess,  setCodeSuccess]  = useState(false);

    if (!user) return null;

    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['payments', 'student', user.id],
        queryFn: paymentService.list,
    });

    const createMutation = useMutation({
        mutationFn: paymentService.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); setPayModalOpen(false); setFMonth(''); setFMethod(''); setFReference(''); },
    });

    const validateCodeMutation = useMutation({
        mutationFn: paymentService.validateCode,
        onSuccess: () => { refreshUser(); setCodeSuccess(true); setCodeInput(''); setCodeError(''); },
        onError: (e: unknown) => {
            const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setCodeError(msg ?? 'Code invalide.');
        },
    });

    const getMonthStatus = (month: string) => payments.find(p => p.month === month)?.status ?? 'unpaid';
    const confirmedCount = MONTHS.filter(m => getMonthStatus(m) === 'confirmed').length;

    const handleSubmit = () => {
        if (!fMonth || !fMethod) return;
        createMutation.mutate({ month: fMonth, amount: MONTHLY_FEE, method: fMethod, reference: fReference || undefined });
    };

    const handleValidateCode = (e: React.FormEvent) => {
        e.preventDefault();
        setCodeError('');
        validateCodeMutation.mutate(codeInput.trim());
    };

    return (
        <>
            {/* Hero */}
            <div className={`py-hero ${user.payment_blocked ? 'py-hero--blocked' : ''}`}>
                <div className="py-hero-text">
                    <h1 className="py-hero-title">Ma scolarité</h1>
                    <p className="py-hero-sub">
                        Frais mensuels : <strong>{MONTHLY_FEE.toLocaleString()} FCFA</strong>
                        {user.payment_blocked ? ' — Compte bloqué pour impayé.' : ''}
                    </p>
                    <div className="py-hero-badges">
                        <span className="py-hero-badge">
                            <IonIcon icon={checkmarkCircleOutline} />{confirmedCount}/{MONTHS.length} mois payés
                        </span>
                        <span className={`py-hero-badge ${user.payment_blocked ? 'py-hero-badge--danger' : 'py-hero-badge--success'}`}>
                            <IonIcon icon={user.payment_blocked ? alertCircleOutline : checkmarkCircleOutline} />
                            {user.payment_blocked ? 'Bloqué' : 'Actif'}
                        </span>
                    </div>
                </div>
                <div className="py-hero-action">
                    <IonButton className="py-hero-btn" fill="outline" onClick={() => setPayModalOpen(true)}>
                        <IonIcon slot="start" icon={cardOutline} />
                        Payer
                    </IonButton>
                </div>
            </div>

            {/* Alerte blocage + saisie code */}
            {user.payment_blocked && (
                <div className="py-block-alert">
                    <div className="py-block-alert-body">
                        <IonIcon icon={alertCircleOutline} className="py-block-alert-icon" />
                        <div>
                            <p className="py-block-alert-title">Compte bloqué — Scolarité impayée</p>
                            <p className="py-block-alert-desc">Saisissez le code de paiement fourni par l'administration.</p>
                        </div>
                    </div>
                    <form onSubmit={handleValidateCode} className="py-code-form">
                        <IonInput
                            className="py-code-input"
                            value={codeInput}
                            onIonInput={e => setCodeInput(String(e.detail.value ?? ''))}
                            placeholder="PAY-XXXXXX"
                            required
                        />
                        <IonButton type="submit" color="primary" className="py-code-btn">
                            <IonIcon slot="start" icon={keyOutline} />
                            Valider
                        </IonButton>
                    </form>
                    {codeError && <p className="py-code-error"><IonIcon icon={alertCircleOutline} />{codeError}</p>}
                </div>
            )}

            {/* Succès déblocage */}
            {codeSuccess && (
                <div className="py-success">
                    <IonIcon icon={checkmarkCircleOutline} className="py-success-icon" />
                    <span>Compte débloqué avec succès !</span>
                </div>
            )}

            {/* Calendrier mois */}
            <Card variant="default" className="py-calendar-card">
                <CardHeader className="py-calendar-header">
                    <CardTitle>Calendrier des paiements</CardTitle>
                    <IonChip className="py-count-chip">{confirmedCount}/{MONTHS.length}</IonChip>
                </CardHeader>
                <CardContent padding="md">
                    <div className="py-months-grid">
                        {MONTHS.map(m => {
                            const status    = getMonthStatus(m);
                            const shortMonth = m.split(' ')[0].slice(0, 3);
                            const year       = m.split(' ')[1]?.slice(2);
                            return (
                                <div key={m} className={`py-month-cell py-month-cell--${status}`}>
                                    <span className="py-month-name">{shortMonth}</span>
                                    <span className="py-month-year">{year}</span>
                                    <IonIcon
                                        icon={
                                            status === 'confirmed' ? checkmarkCircleOutline :
                                            status === 'pending'   ? timeOutline :
                                            status === 'rejected'  ? closeCircleOutline :
                                            walletOutline
                                        }
                                        className="py-month-icon"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Historique */}
            {payments.length > 0 && (
                <Card variant="default" className="py-table-card">
                    <CardHeader className="py-table-header">
                        <CardTitle>Historique des paiements</CardTitle>
                        <IonChip className="py-count-chip">{payments.length}</IonChip>
                    </CardHeader>
                    <CardContent padding="sm">
                        <div className="py-table-scroll">
                            <table className="py-table">
                                <thead>
                                    <tr className="py-thead-tr">
                                        <th className="py-th">Mois</th>
                                        <th className="py-th">Montant</th>
                                        <th className="py-th">Mode</th>
                                        <th className="py-th">Statut</th>
                                        <th className="py-th">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(p => (
                                        <tr key={p.id} className="py-tr">
                                            <td className="py-td py-td--month">{p.month}</td>
                                            <td className="py-td py-td--amount">{p.amount.toLocaleString()} FCFA</td>
                                            <td className="py-td">
                                                <div className="py-method-cell">
                                                    <IonIcon icon={METHOD_ICON[p.method]} className="py-method-icon" />
                                                    <span className="py-method-hide-mobile">{METHOD_LABELS[p.method]}</span>
                                                </div>
                                            </td>
                                            <td className="py-td">
                                                <Badge variant={STATUS_BADGE[p.status] ?? 'secondary'} size="sm" dot>
                                                    {STATUS_LABEL[p.status] ?? p.status}
                                                </Badge>
                                            </td>
                                            <td className="py-td py-td--date">
                                                {new Date(p.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal paiement */}
            <IonModal isOpen={payModalOpen} onDidDismiss={() => setPayModalOpen(false)} className="py-modal">
                <div className="py-modal-inner">
                    <div className="py-modal-header">
                        <div className="py-modal-header-icon"><IonIcon icon={cardOutline} /></div>
                        <div>
                            <h2 className="py-modal-title">Effectuer un paiement</h2>
                            <p className="py-modal-subtitle">{MONTHLY_FEE.toLocaleString()} FCFA / mois</p>
                        </div>
                        <IonButton fill="clear" size="small" onClick={() => setPayModalOpen(false)} className="py-modal-close">
                            <IonIcon slot="icon-only" icon={closeCircleOutline} />
                        </IonButton>
                    </div>

                    <div className="py-modal-body">
                        {/* Mois */}
                        <div className="py-form-section">
                            <span className="py-form-section-label">Mois à payer</span>
                            <IonItem className="py-select-item" lines="none">
                                <IonSelect
                                    value={fMonth}
                                    onIonChange={e => setFMonth(String(e.detail.value ?? ''))}
                                    interface="action-sheet"
                                    placeholder="Sélectionner un mois"
                                >
                                    {MONTHS.filter(m => getMonthStatus(m) !== 'confirmed').map(m => (
                                        <IonSelectOption key={m} value={m}>{m}</IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonItem>
                        </div>

                        {/* Mode de paiement */}
                        <div className="py-form-section">
                            <span className="py-form-section-label">Mode de paiement</span>
                            <div className="py-method-grid">
                                {(Object.entries(METHOD_LABELS) as [PaymentMethod, string][]).map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`py-method-card ${fMethod === key ? 'py-method-card--active' : ''}`}
                                        onClick={() => setFMethod(key)}
                                    >
                                        <IonIcon icon={METHOD_ICON[key]} className="py-method-card-icon" />
                                        <span className="py-method-card-label">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info cash */}
                        {fMethod === 'cash' && (
                            <div className="py-info-box py-info-box--warning">
                                <IonIcon icon={informationCircleOutline} className="py-info-icon" />
                                <p>Rapprochez-vous de la scolarité pour le paiement en espèces. Il sera confirmé par l'administration.</p>
                            </div>
                        )}

                        {/* Référence mobile money / card */}
                        {(fMethod === 'mobile_money' || fMethod === 'card') && (
                            <div className="py-form-section">
                                <span className="py-form-section-label">
                                    {fMethod === 'mobile_money' ? 'Numéro / Référence' : 'Référence de transaction'}
                                </span>
                                <IonInput
                                    className="py-field-input"
                                    value={fReference}
                                    onIonInput={e => setFReference(String(e.detail.value ?? ''))}
                                    placeholder={fMethod === 'mobile_money' ? '6XX XXX XXX' : 'REF-XXXX'}
                                />
                                <p className="py-field-hint">
                                    {fMethod === 'mobile_money'
                                        ? `Envoyez ${MONTHLY_FEE.toLocaleString()} FCFA puis saisissez la référence.`
                                        : 'Saisissez la référence après le paiement.'}
                                </p>
                            </div>
                        )}

                        <IonButton
                            expand="block"
                            color="primary"
                            disabled={!fMonth || !fMethod}
                            onClick={handleSubmit}
                            className="py-submit-btn"
                        >
                            <IonIcon slot="start" icon={sendOutline} />
                            Soumettre le paiement
                        </IonButton>
                    </div>
                </div>
            </IonModal>
        </>
    );
};

/* ════════════════════════════════
   Vue Admin / Staff
════════════════════════════════ */
const AdminPaymentView: React.FC = () => {
    const qc = useQueryClient();
    const { data: records = [], isLoading } = useQuery({
        queryKey: ['payments', 'admin'],
        queryFn: paymentService.list,
    });

    const confirmMutation = useMutation({
        mutationFn: paymentService.confirm,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
    });
    const rejectMutation = useMutation({
        mutationFn: paymentService.reject,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
    });

    const pending   = records.filter(r => r.status === 'pending');
    const confirmed = records.filter(r => r.status === 'confirmed');

    return (
        <>
            <div className="py-hero">
                <div className="py-hero-text">
                    <h1 className="py-hero-title">Suivi des paiements</h1>
                    <p className="py-hero-sub">Confirmez ou rejetez les paiements soumis par les étudiants.</p>
                    <div className="py-hero-badges">
                        <span className="py-hero-badge py-hero-badge--warning"><IonIcon icon={timeOutline} />{pending.length} en attente</span>
                        <span className="py-hero-badge py-hero-badge--success"><IonIcon icon={checkmarkCircleOutline} />{confirmed.length} confirmés</span>
                    </div>
                </div>
            </div>

            {isLoading && <div style={{ textAlign: 'center', padding: '2rem' }}><IonSpinner name="crescent" /></div>}

            {!isLoading && pending.length > 0 && (
                <Card variant="default" className="py-table-card">
                    <CardHeader className="py-table-header py-table-header--warning">
                        <CardTitle>En attente de confirmation</CardTitle>
                        <IonChip className="py-count-chip py-count-chip--warning">{pending.length}</IonChip>
                    </CardHeader>
                    <CardContent padding="sm">
                        <div className="py-table-scroll">
                            <table className="py-table">
                                <thead><tr className="py-thead-tr">
                                    <th className="py-th">Étudiant</th><th className="py-th">Mois</th>
                                    <th className="py-th">Montant</th><th className="py-th py-th--hide-mobile">Mode</th>
                                    <th className="py-th py-th--hide-mobile">Référence</th><th className="py-th py-th--actions">Actions</th>
                                </tr></thead>
                                <tbody>
                                    {pending.map(r => (
                                        <tr key={r.id} className="py-tr">
                                            <td className="py-td py-td--student">
                                                <div className="py-student-cell">
                                                    <Avatar fallback={(r.student?.nom_complet ?? '?').charAt(0).toUpperCase()} size="sm" color="var(--ion-color-primary)" />
                                                    <span>{r.student?.nom_complet ?? `Étudiant #${r.student_id}`}</span>
                                                </div>
                                            </td>
                                            <td className="py-td py-td--month">{r.month}</td>
                                            <td className="py-td py-td--amount">{r.amount.toLocaleString()} FCFA</td>
                                            <td className="py-td py-th--hide-mobile">
                                                <div className="py-method-cell">
                                                    <IonIcon icon={METHOD_ICON[r.method as PaymentMethod]} className="py-method-icon" />{METHOD_LABELS[r.method as PaymentMethod]}
                                                </div>
                                            </td>
                                            <td className="py-td py-th--hide-mobile py-td--ref">{r.reference ?? '—'}</td>
                                            <td className="py-td py-td--actions">
                                                <div className="py-action-btns">
                                                    <IonButton fill="outline" size="small" color="success" className="py-action-btn"
                                                        disabled={confirmMutation.isPending} onClick={() => confirmMutation.mutate(r.id)}>
                                                        <IonIcon slot="start" icon={checkmarkCircleOutline} />Confirmer
                                                    </IonButton>
                                                    <IonButton fill="clear" size="small" color="danger" className="py-action-btn"
                                                        disabled={rejectMutation.isPending} onClick={() => rejectMutation.mutate(r.id)}>
                                                        <IonIcon slot="start" icon={closeCircleOutline} />Rejeter
                                                    </IonButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!isLoading && confirmed.length > 0 && (
                <Card variant="default" className="py-table-card">
                    <CardHeader className="py-table-header"><CardTitle>Paiements confirmés</CardTitle><IonChip className="py-count-chip">{confirmed.length}</IonChip></CardHeader>
                    <CardContent padding="sm">
                        <div className="py-table-scroll">
                            <table className="py-table">
                                <thead><tr className="py-thead-tr">
                                    <th className="py-th">Étudiant</th><th className="py-th">Mois</th><th className="py-th">Montant</th>
                                    <th className="py-th py-th--hide-mobile">Mode</th><th className="py-th">Date confirmation</th>
                                </tr></thead>
                                <tbody>
                                    {confirmed.map(r => (
                                        <tr key={r.id} className="py-tr">
                                            <td className="py-td py-td--student">
                                                <div className="py-student-cell">
                                                    <Avatar fallback={(r.student?.nom_complet ?? '?').charAt(0).toUpperCase()} size="sm" color="var(--ion-color-success)" />
                                                    <span>{r.student?.nom_complet ?? `Étudiant #${r.student_id}`}</span>
                                                </div>
                                            </td>
                                            <td className="py-td py-td--month">{r.month}</td>
                                            <td className="py-td py-td--amount">{r.amount.toLocaleString()} FCFA</td>
                                            <td className="py-td py-th--hide-mobile">
                                                <div className="py-method-cell">
                                                    <IonIcon icon={METHOD_ICON[r.method as PaymentMethod]} className="py-method-icon" />{METHOD_LABELS[r.method as PaymentMethod]}
                                                </div>
                                            </td>
                                            <td className="py-td py-td--date">{r.confirmed_at ? new Date(r.confirmed_at).toLocaleDateString('fr-FR') : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!isLoading && records.length === 0 && (
                <div className="py-empty"><IonIcon icon={walletOutline} className="py-empty-icon" /><p>Aucun paiement enregistré.</p></div>
            )}
        </>
    );
};

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const Payments: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="py-page">
                {isStudent(user.role)
                    ? <StudentPaymentView />
                    : <AdminPaymentView />
                }
            </div>
        </DashboardLayout>
    );
};

export default Payments;
