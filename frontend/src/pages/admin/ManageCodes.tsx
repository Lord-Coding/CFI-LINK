import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonModal, IonInput,
    IonSegment, IonSegmentButton, IonLabel, IonChip, IonSpinner,
} from '../../lib/ionic';
import {
    addCircleOutline, copyOutline, checkmarkOutline, keyOutline,
    lockClosedOutline, calendarOutline, shieldCheckmarkOutline,
    statsChartOutline, timeOutline, closeCircleOutline,
    checkmarkCircleOutline, personOutline, schoolOutline,
    alertCircleOutline,
} from 'ionicons/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { codesService } from '../../lib/services/codesService';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../../components';
import DashboardLayout from '../../components/DashboardLayout';
import '../../styles/admin/ManageCode.css';

type TabKey = 'concours' | 'validation';
type Filiere = 'LIC' | 'LAP';
type Annee = 'L1' | 'L2' | 'L3';
type OptionLIC = 'GL' | 'SR';

const FILIERES: { value: Filiere; label: string; sub: string }[] = [
    { value: 'LIC', label: 'LIC', sub: 'Informatique' },
    { value: 'LAP', label: 'LAP', sub: 'Administrative' },
];
const ANNEES: { value: Annee; label: string }[] = [
    { value: 'L1', label: 'L1' }, { value: 'L2', label: 'L2' }, { value: 'L3', label: 'L3' },
];
const OPTIONS: { value: OptionLIC; label: string; sub: string }[] = [
    { value: 'GL', label: 'GL', sub: 'Génie Logiciel' },
    { value: 'SR', label: 'SR', sub: 'Réseaux & Télécoms' },
];

const CopyButton: React.FC<{ code: string; copied: string | null; onCopy: (c: string) => void }> = ({ code, copied, onCopy }) => (
    <IonButton fill="clear" size="small" color={copied === code ? 'success' : 'medium'}
        className="mc-copy-btn" onClick={() => onCopy(code)} title="Copier">
        <IonIcon slot="icon-only" icon={copied === code ? checkmarkOutline : copyOutline} />
    </IonButton>
);

const ManageCodes: React.FC = () => {
    const qc = useQueryClient();
    const [tab, setTab]         = useState<TabKey>('concours');
    const [copied, setCopied]   = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError]     = useState('');

    const [cNom,     setCNom]     = useState('');
    const [cFiliere, setCFiliere] = useState<Filiere | ''>('');
    const [cAnnee,   setCAnnee]   = useState<Annee | ''>('');
    const [cOption,  setCOption]  = useState<OptionLIC | ''>('');
    const needsOption = cFiliere === 'LIC' && cAnnee === 'L3';

    // ── Queries ──
    const { data: concoursCodes = [], isLoading: loadingConcours } =
        useQuery({ queryKey: ['codes', 'concours'], queryFn: codesService.listConcours });

    const { data: validationCodes = [], isLoading: loadingValidation } =
        useQuery({ queryKey: ['codes', 'validation'], queryFn: codesService.listValidation });

    // ── Mutations ──
    const createConcours = useMutation({
        mutationFn: codesService.createConcours,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['codes', 'concours'] }); closeModal(); },
        onError: (e: unknown) => {
            const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? 'Erreur lors de la création.');
        },
    });

    const createValidation = useMutation({
        mutationFn: () => codesService.createValidation(30),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['codes', 'validation'] }),
    });

    const deleteConcours = useMutation({
        mutationFn: codesService.deleteConcours,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['codes', 'concours'] }),
    });

    const deleteValidation = useMutation({
        mutationFn: codesService.deleteValidation,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['codes', 'validation'] }),
    });

    const handleCreateConcours = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!cNom || !cFiliere || !cAnnee) return;
        if (needsOption && !cOption) return;
        createConcours.mutate({
            nom_complet: cNom,
            filiere:     cFiliere,
            annee:       cAnnee,
            option_lic:  needsOption ? cOption as OptionLIC : undefined,
        });
    };

    const closeModal = () => {
        setModalOpen(false); setError('');
        setCNom(''); setCFiliere(''); setCAnnee(''); setCOption('');
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    const concoursTotal = concoursCodes.length;
    const concoursDispo = concoursCodes.filter(c => !c.used).length;
    const validTotal    = validationCodes.length;
    const validDispo    = validationCodes.filter(c => !c.used && new Date(c.expires_at) > new Date()).length;

    return (
        <DashboardLayout>
            <div className="mc-hero">
                <div className="mc-hero-text">
                    <h1 className="mc-hero-title">Gestion des codes d'accès</h1>
                    <p className="mc-hero-sub">Générez et suivez les codes concours et de validation externe.</p>
                    <div className="mc-hero-badges">
                        <span className="mc-hero-badge"><IonIcon icon={keyOutline} />{concoursTotal} codes concours</span>
                        <span className="mc-hero-badge"><IonIcon icon={shieldCheckmarkOutline} />{concoursDispo} disponibles</span>
                        <span className="mc-hero-badge"><IonIcon icon={lockClosedOutline} />{validDispo} externes valides</span>
                    </div>
                </div>
                <div className="mc-hero-action">
                    {tab === 'concours' ? (
                        <IonButton className="mc-hero-btn" fill="outline" onClick={() => setModalOpen(true)}>
                            <IonIcon slot="start" icon={addCircleOutline} />Nouveau code concours
                        </IonButton>
                    ) : (
                        <IonButton className="mc-hero-btn" fill="outline"
                            onClick={() => createValidation.mutate()}
                            disabled={createValidation.isPending}>
                            <IonIcon slot="start" icon={addCircleOutline} />Générer un code externe
                        </IonButton>
                    )}
                </div>
            </div>

            <div className="mc-stats-row">
                <div className="mc-stat-chip"><IonIcon icon={keyOutline} className="mc-stat-chip-icon" />
                    <span className="mc-stat-chip-count">{concoursDispo}/{concoursTotal}</span>
                    <span className="mc-stat-chip-label">Concours dispos</span></div>
                <div className="mc-stat-chip"><IonIcon icon={lockClosedOutline} className="mc-stat-chip-icon" />
                    <span className="mc-stat-chip-count">{validDispo}/{validTotal}</span>
                    <span className="mc-stat-chip-label">Externes valides</span></div>
                <div className="mc-stat-chip"><IonIcon icon={statsChartOutline} className="mc-stat-chip-icon" />
                    <span className="mc-stat-chip-count">{concoursCodes.filter(c => c.used).length}</span>
                    <span className="mc-stat-chip-label">Concours utilisés</span></div>
                <div className="mc-stat-chip"><IonIcon icon={timeOutline} className="mc-stat-chip-icon" />
                    <span className="mc-stat-chip-count">
                        {validationCodes.filter(c => !c.used && new Date(c.expires_at) < new Date()).length}
                    </span>
                    <span className="mc-stat-chip-label">Externes expirés</span></div>
            </div>

            <div className="mc-toolbar">
                <IonSegment mode="ios" value={tab} className="mc-segment"
                    onIonChange={e => setTab(String(e.detail.value) as TabKey)}>
                    <IonSegmentButton value="concours" className="mc-seg-btn"><IonLabel>Codes Concours</IonLabel></IonSegmentButton>
                    <IonSegmentButton value="validation" className="mc-seg-btn"><IonLabel>Codes Validation</IonLabel></IonSegmentButton>
                </IonSegment>
            </div>

            {tab === 'concours' && (
                <div className="mc-table-wrap">
                    <Card variant="default" className="mc-table-card">
                        <CardHeader className="mc-table-card-header">
                            <CardTitle>Codes Concours</CardTitle>
                            <IonChip className="mc-count-chip">{concoursCodes.length}</IonChip>
                        </CardHeader>
                        <CardContent padding="sm">
                            {loadingConcours ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}><IonSpinner name="crescent" /></div>
                            ) : (
                                <div className="mc-table-scroll">
                                    <table className="mc-table">
                                        <thead><tr className="mc-thead-tr">
                                            <th className="mc-th">Code</th><th className="mc-th">Étudiant</th>
                                            <th className="mc-th">Filière</th><th className="mc-th">Année</th>
                                            <th className="mc-th">Statut</th><th className="mc-th mc-th--actions">Actions</th>
                                        </tr></thead>
                                        <tbody>
                                            {concoursCodes.length === 0 ? (
                                                <tr><td colSpan={6} className="mc-empty-row">
                                                    <IonIcon icon={keyOutline} className="mc-empty-icon" /><span>Aucun code généré</span>
                                                </td></tr>
                                            ) : concoursCodes.map(c => (
                                                <tr key={c.id} className="mc-tr">
                                                    <td className="mc-td mc-td--code"><span className="mc-code">{c.code}</span></td>
                                                    <td className="mc-td mc-td--name">{c.nom_complet}</td>
                                                    <td className="mc-td"><Badge variant="info" size="sm">{c.filiere}</Badge></td>
                                                    <td className="mc-td"><span className="mc-annee">{c.annee}{c.option_lic ? ` (${c.option_lic})` : ''}</span></td>
                                                    <td className="mc-td">
                                                        <Badge variant={c.used ? 'secondary' : 'success'} size="sm" dot>
                                                            {c.used ? 'Utilisé' : 'Disponible'}
                                                        </Badge>
                                                    </td>
                                                    <td className="mc-td mc-td--actions" style={{ display: 'flex', gap: '0.25rem' }}>
                                                        <CopyButton code={c.code} copied={copied} onCopy={copyCode} />
                                                        {!c.used && (
                                                            <IonButton fill="clear" size="small" color="danger"
                                                                onClick={() => deleteConcours.mutate(c.id)}>
                                                                <IonIcon slot="icon-only" icon={closeCircleOutline} />
                                                            </IonButton>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {tab === 'validation' && (
                <div className="mc-table-wrap">
                    <Card variant="default" className="mc-table-card">
                        <CardHeader className="mc-table-card-header">
                            <CardTitle>Codes de Validation Externe</CardTitle>
                            <IonChip className="mc-count-chip">{validationCodes.length}</IonChip>
                        </CardHeader>
                        <CardContent padding="sm">
                            {loadingValidation ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}><IonSpinner name="crescent" /></div>
                            ) : (
                                <div className="mc-table-scroll">
                                    <table className="mc-table">
                                        <thead><tr className="mc-thead-tr">
                                            <th className="mc-th">Code</th><th className="mc-th">Expire le</th>
                                            <th className="mc-th">Statut</th><th className="mc-th mc-th--actions">Actions</th>
                                        </tr></thead>
                                        <tbody>
                                            {validationCodes.length === 0 ? (
                                                <tr><td colSpan={4} className="mc-empty-row">
                                                    <IonIcon icon={lockClosedOutline} className="mc-empty-icon" /><span>Aucun code généré</span>
                                                </td></tr>
                                            ) : validationCodes.map(c => {
                                                const isExpired = new Date(c.expires_at) < new Date();
                                                const variant   = c.used ? 'secondary' : isExpired ? 'danger' : 'success';
                                                const label     = c.used ? 'Utilisé' : isExpired ? 'Expiré' : 'Disponible';
                                                return (
                                                    <tr key={c.id} className="mc-tr">
                                                        <td className="mc-td mc-td--code"><span className="mc-code">{c.code}</span></td>
                                                        <td className="mc-td mc-td--date">
                                                            <div className="mc-date-cell">
                                                                <IonIcon icon={calendarOutline} className="mc-date-icon" />
                                                                <span>{new Date(c.expires_at).toLocaleDateString('fr-FR')}</span>
                                                            </div>
                                                        </td>
                                                        <td className="mc-td"><Badge variant={variant} size="sm" dot>{label}</Badge></td>
                                                        <td className="mc-td mc-td--actions" style={{ display: 'flex', gap: '0.25rem' }}>
                                                            <CopyButton code={c.code} copied={copied} onCopy={copyCode} />
                                                            {!c.used && (
                                                                <IonButton fill="clear" size="small" color="danger"
                                                                    onClick={() => deleteValidation.mutate(c.id)}>
                                                                    <IonIcon slot="icon-only" icon={closeCircleOutline} />
                                                                </IonButton>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal création code concours */}
            <IonModal isOpen={modalOpen} onDidDismiss={closeModal} className="mc-modal">
                <div className="mc-modal-inner">
                    <div className="mc-modal-header">
                        <div className="mc-modal-header-icon"><IonIcon icon={keyOutline} /></div>
                        <div>
                            <h2 className="mc-modal-title">Nouveau code concours</h2>
                            <p className="mc-modal-subtitle">Générez un code d'accès pour un étudiant.</p>
                        </div>
                        <IonButton fill="clear" size="small" onClick={closeModal} className="mc-modal-close">
                            <IonIcon slot="icon-only" icon={closeCircleOutline} />
                        </IonButton>
                    </div>

                    <form onSubmit={handleCreateConcours} className="mc-form">
                        {error && (
                            <div style={{ color: 'var(--ion-color-danger)', fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <IonIcon icon={alertCircleOutline} />{error}
                            </div>
                        )}

                        <div className="mc-form-section">
                            <span className="mc-form-section-label">Étudiant</span>
                            <div className="mc-field mc-field--full">
                                <label className="mc-field-label"><IonIcon icon={personOutline} className="mc-field-icon" />
                                    Nom complet <span className="mc-required">*</span></label>
                                <IonInput className="mc-field-input" value={cNom}
                                    onIonInput={e => setCNom(String(e.detail.value ?? ''))}
                                    placeholder="Prénom Nom" required />
                            </div>
                        </div>

                        <div className="mc-form-section">
                            <span className="mc-form-section-label">Filière</span>
                            <div className="mc-picker-grid">
                                {FILIERES.map(f => (
                                    <button key={f.value} type="button"
                                        className={`mc-pick-card ${cFiliere === f.value ? 'mc-pick-card--active' : ''}`}
                                        onClick={() => { setCFiliere(f.value); setCOption(''); }}>
                                        <IonIcon icon={schoolOutline} className="mc-pick-card-icon" />
                                        <span className="mc-pick-card-label">{f.label}</span>
                                        <span className="mc-pick-card-sub">{f.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mc-form-section">
                            <span className="mc-form-section-label">Année</span>
                            <div className="mc-picker-grid mc-picker-grid--3">
                                {ANNEES.map(a => (
                                    <button key={a.value} type="button"
                                        className={`mc-pick-card ${cAnnee === a.value ? 'mc-pick-card--active' : ''}`}
                                        onClick={() => setCAnnee(a.value)}>
                                        <span className="mc-pick-card-label">{a.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {needsOption && (
                            <div className="mc-form-section">
                                <span className="mc-form-section-label">Option <span className="mc-required">*</span></span>
                                <div className="mc-picker-grid">
                                    {OPTIONS.map(o => (
                                        <button key={o.value} type="button"
                                            className={`mc-pick-card ${cOption === o.value ? 'mc-pick-card--active' : ''}`}
                                            onClick={() => setCOption(o.value)}>
                                            <span className="mc-pick-card-label">{o.label}</span>
                                            <span className="mc-pick-card-sub">{o.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mc-form-actions">
                            <IonButton expand="block" fill="outline" color="medium" type="button" onClick={closeModal}>Annuler</IonButton>
                            <IonButton expand="block" type="submit" color="primary"
                                disabled={createConcours.isPending || !cNom || !cFiliere || !cAnnee || (needsOption && !cOption)}>
                                {createConcours.isPending
                                    ? <IonSpinner name="crescent" />
                                    : <><IonIcon slot="start" icon={checkmarkCircleOutline} />Générer le code</>
                                }
                            </IonButton>
                        </div>
                    </form>
                </div>
            </IonModal>
        </DashboardLayout>
    );
};

export default ManageCodes;
