import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonModal, IonInput, IonSelect,
    IonSelectOption, IonLabel, IonItem, IonChip, IonSearchbar,
    IonSegment, IonSegmentButton,
} from '../lib/ionic';
import {
    libraryOutline, documentTextOutline, videocamOutline,
    documentOutline, addCircleOutline, downloadOutline,
    trashOutline, closeCircleOutline, checkmarkCircleOutline,
    personOutline, bookOutline, schoolOutline, peopleOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { isAdmin, isStaff } from '../lib/store';
import {
    getLibraryItems, searchLibrary, addLibraryItem,
    incrementDownload, deleteLibraryItem,
    LibraryItem, CATEGORY_LABELS,
} from '../lib/library-store';
import { Badge, Card, CardContent, CardHeader, CardTitle, AlertDialog } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Library.css';

type CategoryFilter = 'all' | LibraryItem['category'];

/* ── Icône par type de fichier ── */
function FileIcon({ type }: { type: string }) {
    const icon = type === 'pdf' ? documentTextOutline
               : type === 'video' ? videocamOutline
               : documentOutline;
    const cls  = type === 'pdf' ? 'lb-file-icon--pdf'
               : type === 'video' ? 'lb-file-icon--video'
               : 'lb-file-icon--doc';
    return (
        <div className={`lb-file-icon ${cls}`}>
            <IonIcon icon={icon} />
        </div>
    );
}

/* ── Badge variante par catégorie ── */
type BadgeVar = 'default' | 'success' | 'warning' | 'info' | 'secondary';
const CAT_BADGE: Record<string, BadgeVar> = {
    book: 'default', article: 'info', thesis: 'warning', guide: 'success', manual: 'secondary',
};

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const Library: React.FC = () => {
    const { user } = useAuth();

    const [search,       setSearch]       = useState('');
    const [filter,       setFilter]       = useState<CategoryFilter>('all');
    const [modalOpen,    setModalOpen]    = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<LibraryItem | null>(null);
    const [refreshKey,   setRefreshKey]   = useState(0);

    /* Form */
    const [fTitle,    setFTitle]    = useState('');
    const [fAuthor,   setFAuthor]   = useState('');
    const [fDesc,     setFDesc]     = useState('');
    const [fCategory, setFCategory] = useState<LibraryItem['category']>('book');
    const [fFiliere,  setFFiliere]  = useState('');

    if (!user) return null;

    const canManage = isAdmin(user.role) || isStaff(user.role) || user.role === 'professeur';

    /* Items avec recherche + filtre */
    const baseItems = search.trim() ? searchLibrary(search) : getLibraryItems();
    const items     = filter === 'all' ? baseItems : baseItems.filter(i => i.category === filter);

    /* Compteurs par catégorie */
    const allItems = getLibraryItems();
    const countCat = (cat: string) => allItems.filter(i => i.category === cat).length;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fTitle || !fAuthor) return;
        addLibraryItem({
            title:       fTitle,
            author:      fAuthor,
            category:    fCategory,
            filiere:     fFiliere || undefined,
            description: fDesc,
            file_type:   'pdf',
            size:        '— MB',
            added_by:    user.nom_complet,
        });
        setRefreshKey(k => k + 1);
        closeModal();
    };

    const closeModal = () => {
        setModalOpen(false);
        setFTitle(''); setFAuthor(''); setFDesc('');
        setFCategory('book'); setFFiliere('');
    };

    const handleDownload = (id: string) => {
        incrementDownload(id);
        setRefreshKey(k => k + 1);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        deleteLibraryItem(deleteTarget.id);
        setRefreshKey(k => k + 1);
        setDeleteTarget(null);
    };

    const TABS = [
        { value: 'all',     label: 'Tout',          count: allItems.length },
        { value: 'book',    label: 'Livres',         count: countCat('book') },
        { value: 'article', label: 'Articles',       count: countCat('article') },
        { value: 'thesis',  label: 'Mémoires',       count: countCat('thesis') },
        { value: 'guide',   label: 'Guides',         count: countCat('guide') },
        { value: 'manual',  label: 'Manuels',        count: countCat('manual') },
    ] as const;

    return (
        <DashboardLayout>

            {/* ── Hero ── */}
            <div className="lb-hero">
                <div className="lb-hero-text">
                    <h1 className="lb-hero-title">Bibliothèque numérique 📚</h1>
                    <p className="lb-hero-sub">Ressources pédagogiques en ligne — livres, guides, mémoires et vidéos.</p>
                    <div className="lb-hero-badges">
                        <span className="lb-hero-badge">
                            <IonIcon icon={libraryOutline} />{allItems.length} ressources
                        </span>
                        <span className="lb-hero-badge">
                            <IonIcon icon={documentTextOutline} />{countCat('book') + countCat('manual')} manuels
                        </span>
                        <span className="lb-hero-badge">
                            <IonIcon icon={videocamOutline} />{allItems.filter(i => i.file_type === 'video').length} vidéos
                        </span>
                    </div>
                </div>
                {canManage && (
                    <div className="lb-hero-action">
                        <IonButton className="lb-hero-btn" fill="outline" onClick={() => setModalOpen(true)}>
                            <IonIcon slot="start" icon={addCircleOutline} />
                            Ajouter
                        </IonButton>
                    </div>
                )}
            </div>

            {/* ── Segment + Recherche ── */}
            <div className="lb-toolbar">
                <IonSegment
                    mode="ios"
                    value={filter}
                    className="lb-segment"
                    onIonChange={e => setFilter(String(e.detail.value) as CategoryFilter)}
                >
                    {TABS.map(t => (
                        <IonSegmentButton key={t.value} value={t.value} className="lb-seg-btn">
                            <IonLabel>{t.label} ({t.count})</IonLabel>
                        </IonSegmentButton>
                    ))}
                </IonSegment>

                <div className="lb-search-row">
                    <IonSearchbar
                        value={search}
                        onIonInput={e => setSearch(String(e.detail.value ?? ''))}
                        placeholder="Titre, auteur, description…"
                        className="lb-searchbar"
                        debounce={200}
                    />
                    <IonChip className="lb-count-chip">{items.length}</IonChip>
                </div>
            </div>

            {/* ── Liste ── */}
            {items.length === 0 ? (
                <div className="lb-empty">
                    <IonIcon icon={libraryOutline} className="lb-empty-icon" />
                    <p>Aucune ressource trouvée.</p>
                </div>
            ) : (
                <div className="lb-list">
                    {items.map(item => (
                        <div key={item.id} className="lb-item">
                            <FileIcon type={item.file_type} />

                            <div className="lb-item-body">
                                <div className="lb-item-header">
                                    <h3 className="lb-item-title">{item.title}</h3>
                                    <div className="lb-item-tags">
                                        <Badge variant={CAT_BADGE[item.category] ?? 'secondary'} size="sm">
                                            {CATEGORY_LABELS[item.category]}
                                        </Badge>
                                        {item.filiere && (
                                            <Badge variant="info" size="sm">{item.filiere}</Badge>
                                        )}
                                    </div>
                                </div>
                                <p className="lb-item-author">
                                    <IonIcon icon={personOutline} />{item.author}
                                </p>
                                {item.description && (
                                    <p className="lb-item-desc">{item.description}</p>
                                )}
                                <div className="lb-item-meta">
                                    <span className="lb-item-size">{item.size}</span>
                                    <span className="lb-item-dot" />
                                    <span className="lb-item-downloads">
                                        <IonIcon icon={downloadOutline} />{item.downloads} téléch.
                                    </span>
                                    <span className="lb-item-dot" />
                                    <span className="lb-item-by">Par {item.added_by}</span>
                                </div>
                            </div>

                            <div className="lb-item-actions">
                                <IonButton
                                    fill="outline"
                                    size="small"
                                    color="primary"
                                    className="lb-dl-btn"
                                    onClick={() => handleDownload(item.id)}
                                >
                                    <IonIcon slot="icon-only" icon={downloadOutline} />
                                </IonButton>
                                {canManage && (
                                    <IonButton
                                        fill="clear"
                                        size="small"
                                        color="danger"
                                        className="lb-del-btn"
                                        onClick={() => setDeleteTarget(item)}
                                    >
                                        <IonIcon slot="icon-only" icon={trashOutline} />
                                    </IonButton>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Modal ajout ── */}
            <IonModal isOpen={modalOpen} onDidDismiss={closeModal} className="lb-modal">
                <div className="lb-modal-inner">
                    <div className="lb-modal-header">
                        <div className="lb-modal-header-icon">
                            <IonIcon icon={libraryOutline} />
                        </div>
                        <div>
                            <h2 className="lb-modal-title">Ajouter une ressource</h2>
                            <p className="lb-modal-subtitle">Renseignez les informations du document.</p>
                        </div>
                        <IonButton fill="clear" size="small" onClick={closeModal} className="lb-modal-close">
                            <IonIcon slot="icon-only" icon={closeCircleOutline} />
                        </IonButton>
                    </div>

                    <form onSubmit={handleAdd} className="lb-form">

                        {/* Catégorie — cartes ── */}
                        <div className="lb-form-section">
                            <span className="lb-form-section-label">Catégorie</span>
                            <div className="lb-cat-grid">
                                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                                    <button
                                        key={k}
                                        type="button"
                                        className={`lb-cat-card ${fCategory === k ? 'lb-cat-card--active' : ''}`}
                                        onClick={() => setFCategory(k as LibraryItem['category'])}
                                    >
                                        <IonIcon icon={bookOutline} className="lb-cat-icon" />
                                        <span className="lb-cat-label">{v}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Identité ── */}
                        <div className="lb-form-section">
                            <span className="lb-form-section-label">Informations</span>
                            <div className="lb-form-grid">
                                <div className="lb-field lb-field--full">
                                    <label className="lb-field-label">
                                        <IonIcon icon={bookOutline} className="lb-field-icon" />
                                        Titre <span className="lb-required">*</span>
                                    </label>
                                    <IonInput
                                        className="lb-field-input"
                                        value={fTitle}
                                        onIonInput={e => setFTitle(String(e.detail.value ?? ''))}
                                        placeholder="Titre du document"
                                        required
                                    />
                                </div>
                                <div className="lb-field lb-field--full">
                                    <label className="lb-field-label">
                                        <IonIcon icon={personOutline} className="lb-field-icon" />
                                        Auteur <span className="lb-required">*</span>
                                    </label>
                                    <IonInput
                                        className="lb-field-input"
                                        value={fAuthor}
                                        onIonInput={e => setFAuthor(String(e.detail.value ?? ''))}
                                        placeholder="Nom de l'auteur"
                                        required
                                    />
                                </div>
                                <div className="lb-field lb-field--full">
                                    <label className="lb-field-label">Description</label>
                                    <IonInput
                                        className="lb-field-input"
                                        value={fDesc}
                                        onIonInput={e => setFDesc(String(e.detail.value ?? ''))}
                                        placeholder="Brève description"
                                    />
                                </div>
                                <div className="lb-field">
                                    <label className="lb-field-label">
                                        <IonIcon icon={schoolOutline} className="lb-field-icon" />
                                        Filière
                                    </label>
                                    <IonItem className="lb-select-item" lines="none">
                                        <IonSelect
                                            value={fFiliere}
                                            onIonChange={e => setFFiliere(String(e.detail.value ?? ''))}
                                            interface="popover"
                                            placeholder="Toutes"
                                        >
                                            <IonSelectOption value="">Toutes</IonSelectOption>
                                            <IonSelectOption value="LIC">LIC</IonSelectOption>
                                            <IonSelectOption value="LAP">LAP</IonSelectOption>
                                        </IonSelect>
                                    </IonItem>
                                </div>
                            </div>
                        </div>

                        <div className="lb-form-actions">
                            <IonButton expand="block" fill="outline" color="medium" type="button" onClick={closeModal}>
                                Annuler
                            </IonButton>
                            <IonButton expand="block" type="submit" color="primary">
                                <IonIcon slot="start" icon={checkmarkCircleOutline} />
                                Ajouter
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
                title="Supprimer la ressource"
                description={`Voulez-vous supprimer "${deleteTarget?.title}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                onConfirm={confirmDelete}
            />

        </DashboardLayout>
    );
};

export default Library;
