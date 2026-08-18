import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonModal, IonInput, IonChip,
    IonSegment, IonSegmentButton, IonLabel,
} from '../../lib/ionic';
import {
    calendarOutline, addCircleOutline, checkmarkCircleOutline,
    trashOutline, closeCircleOutline, timeOutline, checkmarkOutline,
    schoolOutline, layersOutline,
} from 'ionicons/icons';
import {
    getSemesters, addSemester, setActiveSemester, deleteSemester,
    Semester, SemesterCode, SEMESTER_LABELS, SEMESTER_TO_ANNEE,
} from '../../lib/semester-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { semesterService, type ApiSemester } from '../../lib/services/semesterService';
import { Badge, Card, CardContent, CardHeader, CardTitle, AlertDialog } from '../../components';
import DashboardLayout from '../../components/DashboardLayout';
import '../../styles/admin/ManageSemesters.css';

type Semester = ApiSemester;
type SemesterCode = 'S1'|'S2'|'S3'|'S4'|'S5'|'S6';
const SEMESTER_TO_ANNEE: Record<string, string> = { S1:'L1', S2:'L1', S3:'L2', S4:'L2', S5:'L3', S6:'L3' };

const ANNEE_GROUPS: { annee: 'L1' | 'L2' | 'L3'; codes: SemesterCode[]; label: string }[] = [
    { annee: 'L1', codes: ['S1', 'S2'], label: 'Première année (L1)' },
    { annee: 'L2', codes: ['S3', 'S4'], label: 'Deuxième année (L2)' },
    { annee: 'L3', codes: ['S5', 'S6'], label: 'Troisième année (L3)' },
];

const ALL_TYPES: SemesterCode[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

/* ── Page principale ── */
const ManageSemesters: React.FC = () => {
    const qc = useQueryClient();
    const [modalOpen,    setModalOpen]    = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Semester | null>(null);
    const [filterAnnee,  setFilterAnnee]  = useState<'all' | 'L1' | 'L2' | 'L3'>('all');

    const [fName,      setFName]      = useState('Semestre 1');
    const [fYear,      setFYear]      = useState('2025-2026');
    const [fType,      setFType]      = useState<SemesterCode>('S1');
    const [fStartDate, setFStartDate] = useState('');
    const [fEndDate,   setFEndDate]   = useState('');

    const { data: semesters = [] } = useQuery({
        queryKey: ['semesters'],
        queryFn: semesterService.list,
    });

    const addMutation = useMutation({
        mutationFn: semesterService.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['semesters'] }); closeModal(); },
    });

    const activateMutation = useMutation({
        mutationFn: semesterService.activate,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['semesters'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: semesterService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['semesters'] }); setDeleteTarget(null); },
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fStartDate || !fEndDate) return;
        addMutation.mutate({ name: fName, year: fYear, start_date: fStartDate, end_date: fEndDate, is_active: false, type: fType });
    };

    const closeModal = () => {
        setModalOpen(false);
        setFName('Semestre 1'); setFYear('2025-2026');
        setFType('S1'); setFStartDate(''); setFEndDate('');
    };

    const displayed = filterAnnee === 'all'
        ? semesters
        : semesters.filter(s => SEMESTER_TO_ANNEE[s.type] === filterAnnee);

    const activeSem = semesters.find(s => s.is_active);
    const total     = semesters.length;

    return (
        <DashboardLayout>

            {/* ── Hero ── */}
            <div className="ms-hero">
                <div className="ms-hero-text">
                    <h1 className="ms-hero-title">Gestion des semestres</h1>
                    <p className="ms-hero-sub">
                        6 semestres académiques — L1 (S1–S2), L2 (S3–S4), L3 (S5–S6).
                    </p>
                    <div className="ms-hero-badges">
                        <span className="ms-hero-badge">
                            <IonIcon icon={layersOutline} />{total} semestres
                        </span>
                        {activeSem && (
                            <span className="ms-hero-badge ms-hero-badge--active">
                                <IonIcon icon={checkmarkOutline} />
                                Actif : {activeSem.name} {activeSem.year}
                            </span>
                        )}
                    </div>
                </div>
                <div className="ms-hero-action">
                    <IonButton className="ms-hero-btn" fill="outline" onClick={() => setModalOpen(true)}>
                        <IonIcon slot="start" icon={addCircleOutline} />
                        Nouveau semestre
                    </IonButton>
                </div>
            </div>

            {/* ── Résumé par année ── */}
            <div className="ms-annee-row">
                {ANNEE_GROUPS.map(g => {
                    const count  = semesters.filter(s => SEMESTER_TO_ANNEE[s.type] === g.annee).length;
                    const active = semesters.find(s => SEMESTER_TO_ANNEE[s.type] === g.annee && s.is_active);
                    return (
                        <div key={g.annee} className={`ms-annee-chip ${filterAnnee === g.annee ? 'ms-annee-chip--active' : ''}`}
                            onClick={() => setFilterAnnee(filterAnnee === g.annee ? 'all' : g.annee)}
                        >
                            <IonIcon icon={schoolOutline} className="ms-annee-chip-icon" />
                            <span className="ms-annee-chip-annee">{g.annee}</span>
                            <span className="ms-annee-chip-label">{count} semestres</span>
                            {active && <span className="ms-annee-dot" title="Semestre actif" />}
                        </div>
                    );
                })}
            </div>

            {/* ── Filtre rapide ── */}
            <div className="ms-toolbar">
                <IonSegment
                    mode="ios"
                    value={filterAnnee}
                    className="ms-segment"
                    onIonChange={e => setFilterAnnee(String(e.detail.value) as typeof filterAnnee)}
                >
                    <IonSegmentButton value="all"  className="ms-seg-btn"><IonLabel>Tous</IonLabel></IonSegmentButton>
                    <IonSegmentButton value="L1"   className="ms-seg-btn"><IonLabel>L1</IonLabel></IonSegmentButton>
                    <IonSegmentButton value="L2"   className="ms-seg-btn"><IonLabel>L2</IonLabel></IonSegmentButton>
                    <IonSegmentButton value="L3"   className="ms-seg-btn"><IonLabel>L3</IonLabel></IonSegmentButton>
                </IonSegment>
            </div>

            {/* ── Tableau ── */}
            <div className="ms-table-wrap">
                <Card variant="default" className="ms-table-card">
                    <CardHeader className="ms-table-card-header">
                        <CardTitle>Semestres académiques</CardTitle>
                        <IonChip className="ms-count-chip">{displayed.length}</IonChip>
                    </CardHeader>
                    <CardContent padding="sm">
                        <div className="ms-table-scroll">
                            <table className="ms-table">
                                <thead>
                                    <tr className="ms-thead-tr">
                                        <th className="ms-th">Semestre</th>
                                        <th className="ms-th">Année acad.</th>
                                        <th className="ms-th">Niveau</th>
                                        <th className="ms-th">Type</th>
                                        <th className="ms-th">Période</th>
                                        <th className="ms-th">Statut</th>
                                        <th className="ms-th ms-th--actions">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayed.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="ms-empty-row">
                                                <IonIcon icon={calendarOutline} className="ms-empty-icon" />
                                                <span>Aucun semestre trouvé</span>
                                            </td>
                                        </tr>
                                    ) : displayed.map(s => (
                                        <tr key={s.id} className={`ms-tr ${s.is_active ? 'ms-tr--active' : ''}`}>
                                            <td className="ms-td ms-td--name">
                                                <div className="ms-name-cell">
                                                    {s.is_active && (
                                                        <span className="ms-active-dot" title="Actif" />
                                                    )}
                                                    <span className="ms-sem-name">{s.name}</span>
                                                </div>
                                            </td>
                                            <td className="ms-td">
                                                <span className="ms-year">{s.year}</span>
                                            </td>
                                            <td className="ms-td">
                                                <Badge variant="info" size="sm">
                                                    {SEMESTER_TO_ANNEE[s.type]}
                                                </Badge>
                                            </td>
                                            <td className="ms-td">
                                                <Badge variant="secondary" size="sm">{s.type}</Badge>
                                            </td>
                                            <td className="ms-td ms-td--period">
                                                <div className="ms-period-cell">
                                                    <IonIcon icon={calendarOutline} className="ms-period-icon" />
                                                    <span>
                                                        {new Date(s.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                        {' → '}
                                                        {new Date(s.end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="ms-td">
                                                <Badge variant={s.is_active ? 'success' : 'secondary'} size="sm" dot>
                                                    {s.is_active ? 'Actif' : 'Inactif'}
                                                </Badge>
                                            </td>
                                            <td className="ms-td ms-td--actions">
                                                <div className="ms-actions">
                                                    {!s.is_active && (
                                                        <IonButton
                                                            fill="outline"
                                                            size="small"
                                                            color="success"
                                                            className="ms-action-btn"
                                                            onClick={() => activateMutation.mutate(s.id)}
                                                        >
                                                            <IonIcon slot="start" icon={checkmarkCircleOutline} />
                                                            Activer
                                                        </IonButton>
                                                    )}
                                                    <IonButton
                                                        fill="clear"
                                                        size="small"
                                                        color="danger"
                                                        className="ms-icon-btn"
                                                        onClick={() => setDeleteTarget(s)}
                                                        title="Supprimer"
                                                    >
                                                        <IonIcon slot="icon-only" icon={trashOutline} />
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
            </div>

            {/* ── Modal création ── */}
            <IonModal isOpen={modalOpen} onDidDismiss={closeModal} className="ms-modal">
                <div className="ms-modal-inner">
                    <div className="ms-modal-header">
                        <div className="ms-modal-header-icon">
                            <IonIcon icon={calendarOutline} />
                        </div>
                        <div>
                            <h2 className="ms-modal-title">Nouveau semestre</h2>
                            <p className="ms-modal-subtitle">Configurer une période académique.</p>
                        </div>
                        <IonButton fill="clear" size="small" onClick={closeModal} className="ms-modal-close">
                            <IonIcon slot="icon-only" icon={closeCircleOutline} />
                        </IonButton>
                    </div>

                    <form onSubmit={handleAdd} className="ms-form">

                        {/* Type de semestre */}
                        <div className="ms-form-section">
                            <span className="ms-form-section-label">Semestre</span>
                            <div className="ms-type-grid">
                                {ALL_TYPES.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        className={`ms-type-card ${fType === t ? 'ms-type-card--active' : ''}`}
                                        onClick={() => {
                                            setFType(t);
                                            setFName(`Semestre ${t.slice(1)}`);
                                        }}
                                    >
                                        <span className="ms-type-code">{t}</span>
                                        <span className="ms-type-annee">{SEMESTER_TO_ANNEE[t]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Nom + Année */}
                        <div className="ms-form-section">
                            <span className="ms-form-section-label">Identité</span>
                            <div className="ms-form-grid">
                                <div className="ms-field">
                                    <label className="ms-field-label">Nom</label>
                                    <IonInput
                                        className="ms-field-input"
                                        value={fName}
                                        onIonInput={e => setFName(String(e.detail.value ?? ''))}
                                        placeholder="Semestre 1"
                                        required
                                    />
                                </div>
                                <div className="ms-field">
                                    <label className="ms-field-label">Année académique</label>
                                    <IonInput
                                        className="ms-field-input"
                                        value={fYear}
                                        onIonInput={e => setFYear(String(e.detail.value ?? ''))}
                                        placeholder="2025-2026"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="ms-form-section">
                            <span className="ms-form-section-label">Période</span>
                            <div className="ms-form-grid">
                                <div className="ms-field">
                                    <label className="ms-field-label">
                                        <IonIcon icon={calendarOutline} className="ms-field-icon" />
                                        Date de début <span className="ms-required">*</span>
                                    </label>
                                    <IonInput
                                        className="ms-field-input"
                                        type="date"
                                        value={fStartDate}
                                        onIonInput={e => setFStartDate(String(e.detail.value ?? ''))}
                                        required
                                    />
                                </div>
                                <div className="ms-field">
                                    <label className="ms-field-label">
                                        <IonIcon icon={timeOutline} className="ms-field-icon" />
                                        Date de fin <span className="ms-required">*</span>
                                    </label>
                                    <IonInput
                                        className="ms-field-input"
                                        type="date"
                                        value={fEndDate}
                                        onIonInput={e => setFEndDate(String(e.detail.value ?? ''))}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ms-form-actions">
                            <IonButton expand="block" fill="outline" color="medium" type="button" onClick={closeModal}>
                                Annuler
                            </IonButton>
                            <IonButton expand="block" type="submit" color="primary" disabled={!fStartDate || !fEndDate}>
                                <IonIcon slot="start" icon={checkmarkCircleOutline} />
                                Créer
                            </IonButton>
                        </div>
                    </form>
                </div>
            </IonModal>

            {/* ── Confirmation suppression ── */}
            <AlertDialog
                isOpen={!!deleteTarget}
                onDismiss={() => setDeleteTarget(null)}
                variant="danger"
                title="Supprimer le semestre"
                description={`Voulez-vous supprimer "${deleteTarget?.name} ${deleteTarget?.year}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}
            />

        </DashboardLayout>
    );
};

export default ManageSemesters;
