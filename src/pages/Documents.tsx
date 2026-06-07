import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonModal, IonChip,
    IonSearchbar, IonSegment, IonSegmentButton, IonLabel,
} from '../lib/ionic';
import {
    documentTextOutline, downloadOutline, addCircleOutline,
    checkmarkCircleOutline, closeCircleOutline, printOutline,
    eyeOutline, timeOutline, personOutline, calendarOutline,
    archiveOutline, cloudDownloadOutline, ribbonOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { isAdmin, isStaff, isStudent, FILIERE_LABELS } from '../lib/store';
import {
    getDocumentRequests, getStudentRequests,
    createDocumentRequest, processRequest,
    DOC_TYPE_LABELS, DOC_STATUS_LABELS, DocumentRequest,
} from '../lib/documents-store';
import { Badge, Card, CardContent, CardHeader, CardTitle, AlertDialog } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Documents.css';

/* ── Données mockées des documents disponibles ── */
interface Doc {
    id:     string;
    title:  string;
    type:   'attestation' | 'releve' | 'certificat' | 'administratif';
    date:   string;
    status: 'disponible' | 'en_cours' | 'archive';
}

const MOCK_DOCS: Doc[] = [
    { id: '1', title: "Attestation d'inscription 2024-2025",  type: 'attestation',    date: '2024-10-15', status: 'disponible' },
    { id: '2', title: 'Relevé de notes Semestre 1',           type: 'releve',         date: '2024-07-20', status: 'disponible' },
    { id: '3', title: 'Certificat de scolarité',              type: 'certificat',     date: '2024-11-01', status: 'en_cours'   },
    { id: '4', title: 'Relevé de notes Semestre 2',           type: 'releve',         date: '2025-01-15', status: 'en_cours'   },
    { id: '5', title: 'Attestation de réussite L1',           type: 'attestation',    date: '2024-08-01', status: 'disponible' },
    { id: '6', title: 'Fiche de pré-inscription L2',          type: 'administratif',  date: '2024-09-10', status: 'archive'    },
];

const DOC_TYPE_LABELS_LOCAL: Record<string, string> = {
    attestation:   'Attestation',
    releve:        'Relevé de notes',
    certificat:    'Certificat',
    administratif: 'Document administratif',
};

type BadgeVar = 'success' | 'warning' | 'secondary';
const DOC_STATUS_BADGE: Record<string, BadgeVar> = {
    disponible: 'success',
    en_cours:   'warning',
    archive:    'secondary',
};
const DOC_STATUS_LABEL: Record<string, string> = {
    disponible: 'Disponible',
    en_cours:   'En cours',
    archive:    'Archivé',
};

type ReqBadge = 'warning' | 'success' | 'danger' | 'default';
const REQ_STATUS_BADGE: Record<string, ReqBadge> = {
    pending:  'warning',
    approved: 'success',
    rejected: 'danger',
    ready:    'default',
};

type MainTab = 'docs' | 'requests';
type DocFilter = 'all' | 'attestation' | 'releve' | 'certificat' | 'administratif';

/* ── Génération attestation imprimable ── */
function printAttestation(user: ReturnType<typeof useAuth>['user']) {
    if (!user) return;
    const filiere = user.filiere ? FILIERE_LABELS[user.filiere] : '—';
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Attestation — ${user.nom_complet}</title>
<style>
  body{font-family:Georgia,serif;padding:60px;color:#333;max-width:700px;margin:0 auto}
  h1{text-align:center;color:#1d4ed8;border-bottom:3px solid #1d4ed8;padding-bottom:15px}
  .content{margin:40px 0;line-height:2;font-size:16px}
  .signature{margin-top:60px;text-align:right}
  .stamp{border:2px solid #1d4ed8;padding:10px 20px;display:inline-block;color:#1d4ed8;font-weight:bold;transform:rotate(-5deg);margin-top:20px}
</style></head>
<body>
  <h1>CFI-CIRAS</h1>
  <p style="text-align:center;color:#666">Centre de Formation en Informatique — CIRAS</p>
  <h2 style="text-align:center;margin-top:40px">ATTESTATION D'INSCRIPTION</h2>
  <div class="content">
    <p>Le Directeur du CFI-CIRAS atteste que :</p>
    <p><strong>M./Mme ${user.nom_complet}</strong></p>
    <p>est régulièrement inscrit(e) au sein de notre établissement pour l'année académique <strong>2024-2025</strong>.</p>
    <p><strong>Filière :</strong> ${filiere}</p>
    <p><strong>Niveau :</strong> ${user.annee ?? '—'}${user.option ? ` (Option : ${user.option})` : ''}</p>
    <p>En foi de quoi, la présente attestation est délivrée pour servir et valoir ce que de droit.</p>
  </div>
  <div class="signature">
    <p>Fait à Yaoundé, le ${new Date().toLocaleDateString('fr-FR')}</p>
    <p style="margin-top:30px"><strong>Le Directeur</strong></p>
    <p>Dr. Michel Fouda</p>
    <div class="stamp">CFI-CIRAS</div>
  </div>
</body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.print(); }
}

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const Documents: React.FC = () => {
    const { user } = useAuth();

    const [mainTab,      setMainTab]      = useState<MainTab>('docs');
    const [docFilter,    setDocFilter]    = useState<DocFilter>('all');
    const [search,       setSearch]       = useState('');
    const [viewDoc,      setViewDoc]      = useState<Doc | null>(null);
    const [requestOpen,  setRequestOpen]  = useState(false);
    const [reqType,      setReqType]      = useState<DocumentRequest['type']>('attestation_inscription');
    const [refreshKey,   setRefreshKey]   = useState(0);

    if (!user) return null;

    const canManage = isAdmin(user.role) || isStaff(user.role);
    const canRequest = isStudent(user.role);

    /* Documents */
    const q = search.toLowerCase().trim();
    const filteredDocs = MOCK_DOCS.filter(d => {
        if (q && !d.title.toLowerCase().includes(q)) return false;
        if (docFilter !== 'all' && d.type !== docFilter) return false;
        return true;
    });

    /* Demandes */
    const requests      = canManage ? getDocumentRequests() : getStudentRequests(user.id);
    const pendingCount  = requests.filter(r => r.status === 'pending').length;

    const handleRequest = (e: React.FormEvent) => {
        e.preventDefault();
        createDocumentRequest({
            student_id:   user.id,
            student_name: user.nom_complet,
            type:         reqType,
        });
        setRefreshKey(k => k + 1);
        setRequestOpen(false);
    };

    const DOC_TABS: { value: DocFilter; label: string }[] = [
        { value: 'all',           label: 'Tous'          },
        { value: 'attestation',   label: 'Attestations'  },
        { value: 'releve',        label: 'Relevés'       },
        { value: 'certificat',    label: 'Certificats'   },
        { value: 'administratif', label: 'Administratifs'},
    ];

    return (
        <DashboardLayout>

            {/* ── Hero ── */}
            <div className="dc-hero">
                <div className="dc-hero-text">
                    <h1 className="dc-hero-title">Documents officiels</h1>
                    <p className="dc-hero-sub">Attestations, relevés de notes, certificats et formulaires administratifs.</p>
                    <div className="dc-hero-badges">
                        <span className="dc-hero-badge">
                            <IonIcon icon={documentTextOutline} />{MOCK_DOCS.length} documents
                        </span>
                        <span className="dc-hero-badge">
                            <IonIcon icon={timeOutline} />{pendingCount} demandes en attente
                        </span>
                    </div>
                </div>
                <div className="dc-hero-actions">
                    {canRequest && (
                        <>
                            <IonButton className="dc-hero-btn" fill="outline" onClick={() => printAttestation(user)}>
                                <IonIcon slot="start" icon={printOutline} />
                                Attestation rapide
                            </IonButton>
                            <IonButton className="dc-hero-btn" fill="outline" onClick={() => setRequestOpen(true)}>
                                <IonIcon slot="start" icon={addCircleOutline} />
                                Demander
                            </IonButton>
                        </>
                    )}
                </div>
            </div>

            {/* ── Onglets principaux ── */}
            <div className="dc-main-tabs">
                <IonSegment
                    mode="ios"
                    value={mainTab}
                    className="dc-segment"
                    onIonChange={e => setMainTab(String(e.detail.value) as MainTab)}
                >
                    <IonSegmentButton value="docs" className="dc-seg-btn">
                        <IonLabel>Documents ({filteredDocs.length})</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="requests" className="dc-seg-btn">
                        <IonLabel>
                            Demandes ({requests.length})
                            {pendingCount > 0 && <span className="dc-pending-dot">{pendingCount}</span>}
                        </IonLabel>
                    </IonSegmentButton>
                </IonSegment>
            </div>

            {/* ════════ Onglet Documents ════════ */}
            {mainTab === 'docs' && (
                <>
                    {/* Filtres + recherche */}
                    <div className="dc-toolbar">
                        <IonSegment
                            mode="ios"
                            value={docFilter}
                            className="dc-segment dc-segment--sm"
                            onIonChange={e => setDocFilter(String(e.detail.value) as DocFilter)}
                        >
                            {DOC_TABS.map(t => (
                                <IonSegmentButton key={t.value} value={t.value} className="dc-seg-btn dc-seg-btn--sm">
                                    <IonLabel>{t.label}</IonLabel>
                                </IonSegmentButton>
                            ))}
                        </IonSegment>
                        <div className="dc-search-row">
                            <IonSearchbar
                                value={search}
                                onIonInput={e => setSearch(String(e.detail.value ?? ''))}
                                placeholder="Rechercher un document…"
                                className="dc-searchbar"
                                debounce={200}
                            />
                            <IonChip className="dc-count-chip">{filteredDocs.length}</IonChip>
                        </div>
                    </div>

                    {/* Liste */}
                    {filteredDocs.length === 0 ? (
                        <div className="dc-empty">
                            <IonIcon icon={documentTextOutline} className="dc-empty-icon" />
                            <p>Aucun document trouvé.</p>
                        </div>
                    ) : (
                        <div className="dc-docs-list">
                            {filteredDocs.map(doc => (
                                <div key={doc.id} className="dc-doc-item">
                                    <div className="dc-doc-icon">
                                        <IonIcon icon={
                                            doc.type === 'releve'     ? ribbonOutline :
                                            doc.type === 'certificat' ? checkmarkCircleOutline :
                                            documentTextOutline
                                        } />
                                    </div>
                                    <div className="dc-doc-body">
                                        <p className="dc-doc-title">{doc.title}</p>
                                        <p className="dc-doc-meta">
                                            {DOC_TYPE_LABELS_LOCAL[doc.type]} •{' '}
                                            {new Date(doc.date).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <Badge variant={DOC_STATUS_BADGE[doc.status]} size="sm">
                                        {DOC_STATUS_LABEL[doc.status]}
                                    </Badge>
                                    <div className="dc-doc-actions">
                                        <IonButton
                                            fill="clear"
                                            size="small"
                                            color="primary"
                                            className="dc-icon-btn"
                                            onClick={() => setViewDoc(doc)}
                                            title="Voir"
                                        >
                                            <IonIcon slot="icon-only" icon={eyeOutline} />
                                        </IonButton>
                                        {doc.status === 'disponible' && (
                                            <IonButton
                                                fill="clear"
                                                size="small"
                                                color="success"
                                                className="dc-icon-btn"
                                                title="Télécharger"
                                            >
                                                <IonIcon slot="icon-only" icon={downloadOutline} />
                                            </IonButton>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ════════ Onglet Demandes ════════ */}
            {mainTab === 'requests' && (
                <div className="dc-requests-wrap">
                    <Card variant="default" className="dc-requests-card">
                        <CardHeader className="dc-requests-card-header">
                            <CardTitle>Demandes de documents</CardTitle>
                            <IonChip className="dc-count-chip">{requests.length}</IonChip>
                        </CardHeader>
                        <CardContent padding="sm">
                            {requests.length === 0 ? (
                                <div className="dc-empty">
                                    <IonIcon icon={documentTextOutline} className="dc-empty-icon" />
                                    <p>Aucune demande.</p>
                                </div>
                            ) : (
                                <div className="dc-req-table-scroll">
                                    <table className="dc-req-table">
                                        <thead>
                                            <tr className="dc-req-thead">
                                                {canManage && <th className="dc-req-th">Étudiant</th>}
                                                <th className="dc-req-th">Type</th>
                                                <th className="dc-req-th">Date</th>
                                                <th className="dc-req-th">Statut</th>
                                                {canManage && <th className="dc-req-th dc-req-th--actions">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.map(r => (
                                                <tr key={r.id} className="dc-req-tr">
                                                    {canManage && (
                                                        <td className="dc-req-td dc-req-td--student">
                                                            <div className="dc-req-student">
                                                                <div className="dc-req-avatar">
                                                                    {r.student_name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span>{r.student_name}</span>
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="dc-req-td">{DOC_TYPE_LABELS[r.type]}</td>
                                                    <td className="dc-req-td dc-req-td--date">
                                                        {new Date(r.requested_at).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td className="dc-req-td">
                                                        <Badge variant={REQ_STATUS_BADGE[r.status]} size="sm" dot>
                                                            {DOC_STATUS_LABELS[r.status]}
                                                        </Badge>
                                                    </td>
                                                    {canManage && (
                                                        <td className="dc-req-td dc-req-td--actions">
                                                            {r.status === 'pending' ? (
                                                                <div className="dc-req-actions">
                                                                    <IonButton
                                                                        fill="outline"
                                                                        size="small"
                                                                        color="success"
                                                                        className="dc-req-action-btn"
                                                                        onClick={() => {
                                                                            processRequest(r.id, 'ready', user.nom_complet);
                                                                            setRefreshKey(k => k + 1);
                                                                        }}
                                                                    >
                                                                        <IonIcon slot="start" icon={checkmarkCircleOutline} />
                                                                        Prêt
                                                                    </IonButton>
                                                                    <IonButton
                                                                        fill="clear"
                                                                        size="small"
                                                                        color="danger"
                                                                        className="dc-req-action-btn"
                                                                        onClick={() => {
                                                                            processRequest(r.id, 'rejected', user.nom_complet);
                                                                            setRefreshKey(k => k + 1);
                                                                        }}
                                                                    >
                                                                        <IonIcon slot="start" icon={closeCircleOutline} />
                                                                        Refuser
                                                                    </IonButton>
                                                                </div>
                                                            ) : (
                                                                <span className="dc-req-processed">
                                                                    {r.processed_by && `Par ${r.processed_by}`}
                                                                </span>
                                                            )}
                                                        </td>
                                                    )}
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

            {/* ── Modal détail document ── */}
            <IonModal isOpen={!!viewDoc} onDidDismiss={() => setViewDoc(null)} className="dc-view-modal">
                {viewDoc && (
                    <div className="dc-view-inner">
                        <div className="dc-view-header">
                            <div className="dc-view-header-icon">
                                <IonIcon icon={documentTextOutline} />
                            </div>
                            <div className="dc-view-header-text">
                                <h2 className="dc-view-title">{viewDoc.title}</h2>
                                <p className="dc-view-subtitle">{DOC_TYPE_LABELS_LOCAL[viewDoc.type]}</p>
                            </div>
                            <IonButton fill="clear" size="small" onClick={() => setViewDoc(null)} className="dc-view-close">
                                <IonIcon slot="icon-only" icon={closeCircleOutline} />
                            </IonButton>
                        </div>

                        <div className="dc-view-content">
                            <div className="dc-view-meta">
                                <div className="dc-view-meta-row">
                                    <span className="dc-view-meta-label">Type</span>
                                    <Badge variant="secondary" size="sm">{DOC_TYPE_LABELS_LOCAL[viewDoc.type]}</Badge>
                                </div>
                                <div className="dc-view-meta-row">
                                    <span className="dc-view-meta-label">Date</span>
                                    <span className="dc-view-meta-value">
                                        {new Date(viewDoc.date).toLocaleDateString('fr-FR', {
                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <div className="dc-view-meta-row">
                                    <span className="dc-view-meta-label">Statut</span>
                                    <Badge variant={DOC_STATUS_BADGE[viewDoc.status]} size="sm" dot>
                                        {DOC_STATUS_LABEL[viewDoc.status]}
                                    </Badge>
                                </div>
                                {user?.nom_complet && (
                                    <div className="dc-view-meta-row">
                                        <span className="dc-view-meta-label">Étudiant</span>
                                        <span className="dc-view-meta-value">{user.nom_complet}</span>
                                    </div>
                                )}
                            </div>

                            {/* Aperçu document */}
                            <div className="dc-view-preview">
                                <div className="dc-view-preview-icon">
                                    <IonIcon icon={documentTextOutline} />
                                </div>
                                <p className="dc-view-preview-name">{viewDoc.title}</p>
                                <p className="dc-view-preview-note">
                                    Aperçu PDF — fonctionnalité backend requise
                                </p>
                            </div>
                        </div>

                        <div className="dc-view-footer">
                            {viewDoc.status === 'disponible' ? (
                                <IonButton expand="block" color="success">
                                    <IonIcon slot="start" icon={cloudDownloadOutline} />
                                    Télécharger
                                </IonButton>
                            ) : (
                                <IonButton expand="block" fill="outline" color="medium" disabled>
                                    {viewDoc.status === 'en_cours' ? 'Document en cours de traitement' : 'Document archivé'}
                                </IonButton>
                            )}
                        </div>
                    </div>
                )}
            </IonModal>

            {/* ── Modal demande de document ── */}
            <IonModal isOpen={requestOpen} onDidDismiss={() => setRequestOpen(false)} className="dc-req-modal">
                <div className="dc-req-modal-inner">
                    <div className="dc-modal-header">
                        <div className="dc-modal-header-icon">
                            <IonIcon icon={addCircleOutline} />
                        </div>
                        <div>
                            <h2 className="dc-modal-title">Demande de document</h2>
                            <p className="dc-modal-subtitle">Choisissez le type de document souhaité.</p>
                        </div>
                        <IonButton fill="clear" size="small" onClick={() => setRequestOpen(false)} className="dc-modal-close">
                            <IonIcon slot="icon-only" icon={closeCircleOutline} />
                        </IonButton>
                    </div>

                    <form onSubmit={handleRequest} className="dc-req-form">
                        <div className="dc-req-types">
                            {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                                <button
                                    key={k}
                                    type="button"
                                    className={`dc-req-type-card ${reqType === k ? 'dc-req-type-card--active' : ''}`}
                                    onClick={() => setReqType(k as DocumentRequest['type'])}
                                >
                                    <IonIcon icon={documentTextOutline} className="dc-req-type-icon" />
                                    <span className="dc-req-type-label">{v}</span>
                                </button>
                            ))}
                        </div>

                        <div className="dc-req-form-actions">
                            <IonButton expand="block" fill="outline" color="medium" type="button" onClick={() => setRequestOpen(false)}>
                                Annuler
                            </IonButton>
                            <IonButton expand="block" type="submit" color="primary">
                                <IonIcon slot="start" icon={checkmarkCircleOutline} />
                                Soumettre
                            </IonButton>
                        </div>
                    </form>
                </div>
            </IonModal>

        </DashboardLayout>
    );
};

export default Documents;
