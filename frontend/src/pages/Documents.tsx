// @ts-nocheck
import React, { useRef, useState } from 'react';
import {
    IonButton, IonIcon, IonModal, IonChip,
    IonSearchbar, IonSegment, IonSegmentButton, IonLabel,
} from '../lib/ionic';
import {
    documentTextOutline, downloadOutline, addCircleOutline,
    checkmarkCircleOutline, closeCircleOutline, printOutline,
    eyeOutline, timeOutline,
    cloudDownloadOutline, ribbonOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { isAdmin, isStaff, isStudent } from '../lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService, type ApiDocumentRequest } from '../lib/services/documentService';
import {
    generateDocument, printDocument, downloadDocumentAsPdf, DocTemplateType,
} from '../lib/document-templates';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Documents.css';

type DocumentRequest = ApiDocumentRequest;
const DOC_TYPE_LABELS: Record<string, string> = {
    attestation_inscription: "Attestation d'inscription",
    releve_notes: 'Relevé de notes',
    certificat_scolarite: 'Certificat de scolarité',
    attestation_reussite: 'Attestation de réussite',
};
const DOC_STATUS_LABELS: Record<string, string> = {
    pending: 'En attente', approved: 'Approuvée', rejected: 'Rejetée', ready: 'Prête',
};
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

/* ── Modal aperçu document généré ── */
interface DocPreviewModalProps {
    isOpen:  boolean;
    html:    string;
    title:   string;
    onClose: () => void;
    onPrint: () => void;
    onDownload: () => void;
}

const DocPreviewModal: React.FC<DocPreviewModalProps> = ({ isOpen, html, title, onClose, onPrint, onDownload }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} className="dc-preview-modal">
            <div className="dc-preview-inner">
                <div className="dc-preview-header">
                    <div className="dc-preview-header-icon">
                        <IonIcon icon={documentTextOutline} />
                    </div>
                    <div className="dc-preview-header-text">
                        <h2 className="dc-preview-title">{title}</h2>
                        <p className="dc-preview-subtitle">Aperçu du document généré</p>
                    </div>
                    <IonButton fill="clear" size="small" onClick={onClose} className="dc-view-close">
                        <IonIcon slot="icon-only" icon={closeCircleOutline} />
                    </IonButton>
                </div>

                <div className="dc-preview-frame-wrap">
                    <iframe
                        ref={iframeRef}
                        srcDoc={html}
                        className="dc-preview-frame"
                        title={title}
                        sandbox="allow-same-origin"
                    />
                </div>

                <div className="dc-preview-footer">
                    <IonButton fill="outline" color="medium" onClick={onClose}>
                        Fermer
                    </IonButton>
                    <IonButton fill="outline" color="primary" onClick={onPrint}>
                        <IonIcon slot="start" icon={printOutline} />
                        Imprimer
                    </IonButton>
                    <IonButton color="success" onClick={onDownload}>
                        <IonIcon slot="start" icon={cloudDownloadOutline} />
                        Télécharger PDF
                    </IonButton>
                </div>
            </div>
        </IonModal>
    );
};

/* ── Génération attestation imprimable ── */
function printAttestation(user: ReturnType<typeof useAuth>['user']) {
    if (!user) return;
    const html = generateDocument('attestation_inscription', user);
    printDocument(html);
}

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const Documents: React.FC = () => {
    const { user } = useAuth();

    const qc = useQueryClient();
    const [mainTab,       setMainTab]       = useState<MainTab>('docs');
    const [docFilter,     setDocFilter]     = useState<DocFilter>('all');
    const [search,        setSearch]        = useState('');
    const [viewDoc,       setViewDoc]       = useState<Doc | null>(null);
    const [requestOpen,   setRequestOpen]   = useState(false);
    const [reqType,       setReqType]       = useState<DocumentRequest['type']>('attestation_inscription');
    const [previewHtml,   setPreviewHtml]   = useState('');
    const [previewTitle,  setPreviewTitle]  = useState('');
    const [previewOpen,   setPreviewOpen]   = useState(false);

    if (!user) return null;

    const canManage  = isAdmin(user.role) || isStaff(user.role);
    const canRequest = isStudent(user.role);

    const { data: requests = [] } = useQuery<any[]>({ queryKey: ['document-requests'],
        queryFn: documentService.list,
    });

    const createMutation = useMutation<any,any,any>({
        mutationFn: documentService.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['document-requests'] }); setRequestOpen(false); },
    });

    const processMutation = useMutation<any,any,any>({
        mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
            documentService.process(id, status, notes),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['document-requests'] }),
    });

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    const openPreview = (type: DocTemplateType, title: string) => {
        const html = generateDocument(type, user as Parameters<typeof generateDocument>[1]);
        setPreviewHtml(html); setPreviewTitle(title); setPreviewOpen(true);
    };

    const handleRequest = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(reqType);
    };

    const q = search.toLowerCase().trim();
    const filteredDocs = MOCK_DOCS.filter(d => {
        if (q && !d.title.toLowerCase().includes(q)) return false;
        if (docFilter !== 'all' && d.type !== docFilter) return false;
        return true;
    });

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
                </div>            </div>

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
                                            onClick={() => {
                                                if (canRequest) {
                                                    const typeMap: Record<string, DocTemplateType> = {
                                                        attestation:   'attestation_inscription',
                                                        releve:        'releve_notes',
                                                        certificat:    'certificat_scolarite',
                                                        administratif: 'attestation_inscription',
                                                    };
                                                    openPreview(typeMap[doc.type] ?? 'attestation_inscription', doc.title);
                                                } else {
                                                    setViewDoc(doc);
                                                }
                                            }}
                                            title="Aperçu"
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
                                                onClick={() => {
                                                    if (canRequest) {
                                                        const typeMap: Record<string, DocTemplateType> = {
                                                            attestation:   'attestation_inscription',
                                                            releve:        'releve_notes',
                                                            certificat:    'certificat_scolarite',
                                                            administratif: 'attestation_inscription',
                                                        };
                                                        const html = generateDocument(typeMap[doc.type] ?? 'attestation_inscription', user);
                                                        downloadDocumentAsPdf(html, doc.title);
                                                    }
                                                }}
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
                                                                        onClick={() => processMutation.mutate({ id: r.id as number, status: 'ready' })}
                                                                    >
                                                                        <IonIcon slot="start" icon={checkmarkCircleOutline} />
                                                                        Prêt
                                                                    </IonButton>
                                                                    <IonButton
                                                                        fill="clear"
                                                                        size="small"
                                                                        color="danger"
                                                                        className="dc-req-action-btn"
                                                                        onClick={() => processMutation.mutate({ id: r.id as number, status: 'rejected' })}
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

            {/* ── Modal détail document (admin/staff) ── */}
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
                            <IonButton
                                expand="block"
                                fill="outline"
                                color="primary"
                                type="button"
                                onClick={() => {
                                    const typeMap: Record<string, DocTemplateType> = {
                                        attestation_inscription: 'attestation_inscription',
                                        releve_notes:            'releve_notes',
                                        certificat_scolarite:    'certificat_scolarite',
                                        attestation_reussite:    'attestation_reussite',
                                    };
                                    openPreview(typeMap[reqType], DOC_TYPE_LABELS[reqType]);
                                }}
                            >
                                <IonIcon slot="start" icon={eyeOutline} />
                                Aperçu
                            </IonButton>
                            <IonButton expand="block" type="submit" color="primary">
                                <IonIcon slot="start" icon={checkmarkCircleOutline} />
                                Soumettre
                            </IonButton>
                        </div>
                    </form>
                </div>
            </IonModal>

            {/* ── Modal aperçu document généré ── */}
            <DocPreviewModal
                isOpen={previewOpen}
                html={previewHtml}
                title={previewTitle}
                onClose={() => setPreviewOpen(false)}
                onPrint={() => printDocument(previewHtml)}
                onDownload={() => downloadDocumentAsPdf(previewHtml, previewTitle)}
            />

        </DashboardLayout>
    );
};

export default Documents;


