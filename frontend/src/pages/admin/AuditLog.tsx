import React, { useState } from 'react';
import { IonIcon, IonChip, IonSearchbar, IonSegment, IonSegmentButton, IonLabel } from '../../lib/ionic';
import {
    shieldOutline, timeOutline, personOutline, keyOutline,
    cardOutline, documentTextOutline, settingsOutline, schoolOutline,
    fingerPrintOutline,
} from 'ionicons/icons';
import {
    getAuditLog, getAuditByCategory,
    CATEGORY_LABELS, AuditEntry,
} from '../../lib/audit-store';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../../lib/services/auditService';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../../components';
import DashboardLayout from '../../components/DashboardLayout';
import '../../styles/admin/AuditLog.css';

/* ── Icône par catégorie ── */
const CATEGORY_ICONS: Record<string, string> = {
    auth:     fingerPrintOutline,
    user:     personOutline,
    payment:  cardOutline,
    code:     keyOutline,
    document: documentTextOutline,
    system:   settingsOutline,
    grade:    schoolOutline,
};

/* ── Variante Badge par catégorie ── */
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';

const CATEGORY_BADGE: Record<string, BadgeVariant> = {
    auth:     'default',
    user:     'success',
    payment:  'warning',
    code:     'info',
    document: 'secondary',
    system:   'secondary',
    grade:    'danger',
};

type CategoryKey = 'all' | keyof typeof CATEGORY_LABELS;

const TABS: { value: CategoryKey; label: string }[] = [
    { value: 'all',      label: 'Tous' },
    { value: 'auth',     label: 'Auth' },
    { value: 'user',     label: 'Utilisateurs' },
    { value: 'payment',  label: 'Paiements' },
    { value: 'code',     label: 'Codes' },
    { value: 'document', label: 'Documents' },
    { value: 'grade',    label: 'Notes' },
    { value: 'system',   label: 'Système' },
];

/* ── Formatage date ── */
function formatDate(iso: string): { date: string; time: string } {
    const d = new Date(iso);
    return {
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
}

/* ── Page principale ── */
const AuditLog: React.FC = () => {
    const [search,   setSearch]   = useState('');
    const [category, setCategory] = useState<CategoryKey>('all');

    const params: Record<string, string> = {};
    if (category !== 'all') params.category = category;
    if (search.trim()) params.search = search.trim();

    const { data: allEntries = [] } = useQuery({
        queryKey: ['audit-logs', category, search],
        queryFn: () => auditService.list(params),
    });

    // Fallback local pour les stats par catégorie
    const { data: allForStats = [] } = useQuery({
        queryKey: ['audit-logs', 'all'],
        queryFn: () => auditService.list(),
    });

    const filtered = allEntries;
    const countBy = (cat: string) => allForStats.filter((e: AuditEntry) => e.category === cat).length;

    return (
        <DashboardLayout>

            {/* ── Hero ── */}
            <div className="al-hero">
                <div className="al-hero-text">
                    <h1 className="al-hero-title">Journal d'audit</h1>
                    <p className="al-hero-sub">Traçabilité complète des actions sur la plateforme.</p>
                    <div className="al-hero-badges">
                        <span className="al-hero-badge">
                            <IonIcon icon={shieldOutline} />
                            {allEntries.length} entrées enregistrées
                        </span>
                        <span className="al-hero-badge">
                            <IonIcon icon={timeOutline} />
                            {filtered.length} affichées
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Stats rapides ── */}
            <div className="al-stats-row">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <button
                        key={key}
                        className={`al-stat-chip ${category === key ? 'al-stat-chip--active' : ''}`}
                        onClick={() => setCategory(category === key ? 'all' : key as CategoryKey)}
                    >
                        <IonIcon icon={CATEGORY_ICONS[key] ?? shieldOutline} className="al-stat-chip-icon" />
                        <span className="al-stat-chip-count">{countBy(key)}</span>
                        <span className="al-stat-chip-label">{label}</span>
                    </button>
                ))}
            </div>

            {/* ── Segment + Recherche ── */}
            <div className="al-toolbar">
                <IonSegment
                    mode="ios"
                    value={category}
                    className="al-segment"
                    onIonChange={e => setCategory(String(e.detail.value) as CategoryKey)}
                >
                    {TABS.map(t => (
                        <IonSegmentButton key={t.value} value={t.value} className="al-seg-btn">
                            <IonLabel>{t.label}</IonLabel>
                        </IonSegmentButton>
                    ))}
                </IonSegment>

                <IonSearchbar
                    value={search}
                    onIonInput={e => setSearch(String(e.detail.value ?? ''))}
                    placeholder="Rechercher une action, un utilisateur…"
                    className="al-searchbar"
                    debounce={200}
                />
            </div>

            {/* ── Tableau ── */}
            <div className="al-table-wrap">
                <Card variant="default" className="al-table-card">
                    <CardHeader className="al-table-card-header">
                        <CardTitle>Entrées du journal</CardTitle>
                        <IonChip className="al-count-chip">{filtered.length}</IonChip>
                    </CardHeader>
                    <CardContent padding="sm">
                        <div className="al-table-scroll">
                            <table className="al-table">
                                <thead>
                                    <tr className="al-thead-tr">
                                        <th className="al-th">Date / Heure</th>
                                        <th className="al-th">Utilisateur</th>
                                        <th className="al-th">Action</th>
                                        <th className="al-th al-th--details">Détails</th>
                                        <th className="al-th">Catégorie</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="al-empty-row">
                                                <IonIcon icon={shieldOutline} className="al-empty-icon" />
                                                <span>Aucune entrée trouvée</span>
                                            </td>
                                        </tr>
                                    ) : filtered.map(e => {
                                        const { date, time } = formatDate(e.created_at);
                                        return (
                                            <tr key={e.id} className="al-tr">
                                                <td className="al-td al-td--date">
                                                    <div className="al-date-cell">
                                                        <IonIcon icon={timeOutline} className="al-date-icon" />
                                                        <div>
                                                            <span className="al-date">{date}</span>
                                                            <span className="al-time">{time}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="al-td al-td--user">
                                                    <div className="al-user-cell">
                                                        <div className="al-user-avatar">
                                                            {(e.user?.nom_complet ?? '?').charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="al-user-name">{e.user?.nom_complet ?? '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="al-td al-td--action">
                                                    <span className="al-action">{e.action}</span>
                                                </td>
                                                <td className="al-td al-td--details">
                                                    <span className="al-details">{e.details}</span>
                                                </td>
                                                <td className="al-td al-td--cat">
                                                    <Badge variant={CATEGORY_BADGE[e.category] ?? 'secondary'} size="sm">
                                                        <IonIcon icon={CATEGORY_ICONS[e.category] ?? shieldOutline} />
                                                        {CATEGORY_LABELS[e.category]}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </DashboardLayout>
    );
};

export default AuditLog;
