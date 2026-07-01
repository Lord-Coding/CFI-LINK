import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonSegment, IonSegmentButton,
    IonLabel, IonSearchbar, IonProgressBar, IonChip, IonModal,
    IonInput, IonSelect, IonSelectOption,
} from '../lib/ionic';
import {
    bookOutline, timeOutline, peopleOutline,
    layersOutline, addOutline, createOutline, trashOutline,
    arrowForwardOutline, closeOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isAdmin, isStudent, isProfessor, FILIERE_LABELS } from '../lib/store';
import {
    getAllCourses, getCoursesForStudent, getCoursesForProfessor,
    addCourse, updateCourse, deleteCourse, initializeCourseStore, CourseData,
} from '../lib/courses-data';
import { Badge, Card, CardContent } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Courses.css';

/* initialiser le store au premier import */
initializeCourseStore();

/* ─────────────────────────────────
   Types form
───────────────────────────────── */
interface CourseForm {
    name:     string;
    teacher:  string;
    filiere:  'LIC' | 'LAP';
    annee:    'L1' | 'L2' | 'L3';
    option:   'GL' | 'SR' | '';
    hours:    string;
    semester: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
    description: string;
}

const EMPTY_FORM: CourseForm = {
    name: '', teacher: '', filiere: 'LIC', annee: 'L1',
    option: '', hours: '', semester: 'S1', description: '',
};

/* ─────────────────────────────────
   Composant carte de cours
───────────────────────────────── */
interface CourseCardProps {
    course: CourseData;
    showMeta?: boolean;
    canEdit?: boolean;
    onEdit?: (c: CourseData) => void;
    onDelete?: (id: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course: c, showMeta = false, canEdit = false, onEdit, onDelete }) => {
    const history = useHistory();
    return (
        <Card variant="default" hoverable className="co-card">
            <CardContent padding="md" className="co-card-content">
                <div className="co-card-top">
                    <div className="co-card-icon">
                        <IonIcon icon={bookOutline} />
                    </div>
                    <div className="co-card-badges">
                        {showMeta && <Badge variant="info"      size="sm">{c.filiere}</Badge>}
                        {showMeta && <Badge variant="secondary" size="sm">{c.annee}{c.option ? ` (${c.option})` : ''}</Badge>}
                        <Badge variant="secondary" size="sm">{c.semester}</Badge>
                    </div>
                </div>

                <h3 className="co-card-name">{c.name}</h3>
                <p className="co-card-teacher">{c.teacher}</p>
                {c.description && <p className="co-card-desc">{c.description}</p>}

                <div className="co-card-meta">
                    <span className="co-card-meta-item">
                        <IonIcon icon={timeOutline} />{c.hours}h
                    </span>
                    <span className="co-card-meta-item">
                        <IonIcon icon={peopleOutline} />{c.students}
                    </span>
                </div>

                <div className="co-card-progress">
                    <div className="co-card-progress-header">
                        <span>Progression</span>
                        <span className="co-card-progress-pct">{c.progress}%</span>
                    </div>
                    <IonProgressBar value={c.progress / 100} className="co-progress-bar" />
                </div>

                {/* Actions */}
                <div className="co-card-actions">
                    <IonButton
                        fill="solid"
                        size="small"
                        className="co-card-view-btn"
                        onClick={() => history.push(`/courses/${c.id}`)}
                    >
                        Voir le cours
                        <IonIcon slot="end" icon={arrowForwardOutline} />
                    </IonButton>

                    {canEdit && (
                        <div className="co-card-edit-actions">
                            <IonButton fill="clear" size="small" color="medium" onClick={() => onEdit?.(c)}>
                                <IonIcon slot="icon-only" icon={createOutline} />
                            </IonButton>
                            <IonButton fill="clear" size="small" color="danger" onClick={() => onDelete?.(c.id)}>
                                <IonIcon slot="icon-only" icon={trashOutline} />
                            </IonButton>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

/* ─────────────────────────────────
   Modal formulaire cours (prof)
───────────────────────────────── */
interface CourseModalProps {
    isOpen: boolean;
    initial?: CourseData | null;
    professorName: string;
    onClose: () => void;
    onSave: () => void;
}

const CourseModal: React.FC<CourseModalProps> = ({ isOpen, initial, professorName, onClose, onSave }) => {
    const [form, setForm] = useState<CourseForm>(() =>
        initial
            ? {
                name:        initial.name,
                teacher:     initial.teacher,
                filiere:     initial.filiere,
                annee:       initial.annee,
                option:      initial.option ?? '',
                hours:       String(initial.hours),
                semester:    initial.semester as CourseForm['semester'],
                description: initial.description ?? '',
              }
            : { ...EMPTY_FORM, teacher: professorName }
    );
    const [error, setError] = useState('');

    const set = (field: keyof CourseForm) => (val: string) =>
        setForm(f => ({ ...f, [field]: val }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim())    { setError('Le nom du cours est requis.'); return; }
        if (!form.teacher.trim()) { setError('Le professeur est requis.'); return; }
        if (!Number(form.hours))  { setError('Le nombre d\'heures est requis.'); return; }

        const data = {
            name:        form.name.trim(),
            teacher:     form.teacher.trim(),
            filiere:     form.filiere,
            annee:       form.annee,
            option:      form.option as 'GL' | 'SR' | undefined || undefined,
            hours:       Number(form.hours),
            semester:    form.semester,
            description: form.description.trim() || undefined,
        };

        if (initial) {
            updateCourse(initial.id, data);
        } else {
            addCourse(data);
        }
        onSave();
        onClose();
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} className="co-modal">
            <div className="co-modal-inner">
                <div className="co-modal-header">
                    <div className="co-modal-header-icon">
                        <IonIcon icon={bookOutline} />
                    </div>
                    <div>
                        <h2 className="co-modal-title">{initial ? 'Modifier le cours' : 'Nouveau cours'}</h2>
                        <p className="co-modal-subtitle">Remplissez les informations du cours.</p>
                    </div>
                    <IonButton fill="clear" size="small" onClick={onClose} className="co-modal-close">
                        <IonIcon slot="icon-only" icon={closeOutline} />
                    </IonButton>
                </div>

                <form onSubmit={handleSubmit} className="co-modal-form">
                    {error && <p className="co-modal-error">{error}</p>}

                    <div className="co-form-group">
                        <label className="co-form-label">Nom du cours *</label>
                        <IonInput
                            value={form.name}
                            onIonInput={e => set('name')(String(e.detail.value ?? ''))}
                            placeholder="Ex. : Algorithmique avancée"
                            className="co-form-input"
                        />
                    </div>

                    <div className="co-form-group">
                        <label className="co-form-label">Professeur *</label>
                        <IonInput
                            value={form.teacher}
                            onIonInput={e => set('teacher')(String(e.detail.value ?? ''))}
                            placeholder="Nom complet du professeur"
                            className="co-form-input"
                        />
                    </div>

                    <div className="co-form-row">
                        <div className="co-form-group co-form-group--half">
                            <label className="co-form-label">Filière *</label>
                            <IonSelect
                                value={form.filiere}
                                onIonChange={e => set('filiere')(e.detail.value)}
                                className="co-form-select"
                                interface="popover"
                            >
                                <IonSelectOption value="LIC">LIC</IonSelectOption>
                                <IonSelectOption value="LAP">LAP</IonSelectOption>
                            </IonSelect>
                        </div>

                        <div className="co-form-group co-form-group--half">
                            <label className="co-form-label">Niveau *</label>
                            <IonSelect
                                value={form.annee}
                                onIonChange={e => set('annee')(e.detail.value)}
                                className="co-form-select"
                                interface="popover"
                            >
                                <IonSelectOption value="L1">L1</IonSelectOption>
                                <IonSelectOption value="L2">L2</IonSelectOption>
                                <IonSelectOption value="L3">L3</IonSelectOption>
                            </IonSelect>
                        </div>
                    </div>

                    {form.filiere === 'LIC' && form.annee === 'L3' && (
                        <div className="co-form-group">
                            <label className="co-form-label">Option</label>
                            <IonSelect
                                value={form.option}
                                onIonChange={e => set('option')(e.detail.value)}
                                className="co-form-select"
                                interface="popover"
                            >
                                <IonSelectOption value="">Tronc commun</IonSelectOption>
                                <IonSelectOption value="GL">GL — Génie Logiciel</IonSelectOption>
                                <IonSelectOption value="SR">SR — Systèmes & Réseaux</IonSelectOption>
                            </IonSelect>
                        </div>
                    )}

                    <div className="co-form-row">
                        <div className="co-form-group co-form-group--half">
                            <label className="co-form-label">Heures *</label>
                            <IonInput
                                type="number"
                                value={form.hours}
                                onIonInput={e => set('hours')(String(e.detail.value ?? ''))}
                                placeholder="Ex. : 45"
                                min={1}
                                className="co-form-input"
                            />
                        </div>

                        <div className="co-form-group co-form-group--half">
                            <label className="co-form-label">Semestre *</label>
                            <IonSelect
                                value={form.semester}
                                onIonChange={e => set('semester')(e.detail.value)}
                                className="co-form-select"
                                interface="popover"
                            >
                                {(['S1','S2','S3','S4','S5','S6'] as const).map(s => (
                                    <IonSelectOption key={s} value={s}>{s}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </div>
                    </div>

                    <div className="co-form-group">
                        <label className="co-form-label">Description</label>
                        <IonInput
                            value={form.description}
                            onIonInput={e => set('description')(String(e.detail.value ?? ''))}
                            placeholder="Description courte du cours (optionnel)"
                            className="co-form-input"
                        />
                    </div>

                    <div className="co-modal-actions">
                        <IonButton expand="block" fill="outline" color="medium" type="button" onClick={onClose}>
                            Annuler
                        </IonButton>
                        <IonButton expand="block" type="submit" color="primary">
                            {initial ? 'Enregistrer' : 'Ajouter le cours'}
                        </IonButton>
                    </div>
                </form>
            </div>
        </IonModal>
    );
};

/* ─────────────────────────────────
   Page principale
───────────────────────────────── */
const Courses: React.FC = () => {
    const { user } = useAuth();
    const [search,        setSearch]        = useState('');
    const [filterFiliere, setFilterFiliere] = useState<'all' | 'LIC' | 'LAP'>('all');
    const [filterAnnee,   setFilterAnnee]   = useState<'all' | 'L1' | 'L2' | 'L3'>('all');
    const [modalOpen,     setModalOpen]     = useState(false);
    const [editTarget,    setEditTarget]    = useState<CourseData | null>(null);
    const [refreshKey,    setRefreshKey]    = useState(0);

    if (!user) return null;

    const isProf      = isProfessor(user.role);
    const isAdminUser = isAdmin(user.role);

    const baseCourses: CourseData[] = isStudent(user.role)
        ? getCoursesForStudent(user.filiere, user.annee, user.option)
        : isProf
            ? getCoursesForProfessor(user.nom_complet)
            : getAllCourses();

    const filtered = baseCourses.filter(c => {
        const q = search.toLowerCase().trim();
        if (q && !c.name.toLowerCase().includes(q) && !c.teacher.toLowerCase().includes(q)) return false;
        if (isAdminUser && filterFiliere !== 'all' && c.filiere !== filterFiliere) return false;
        if (isAdminUser && filterAnnee   !== 'all' && c.annee   !== filterAnnee)   return false;
        return true;
    });

    const pageTitle = isAdminUser ? 'Tous les cours' : isProf ? 'Mes matières' : 'Mes cours';
    const totalHours  = baseCourses.reduce((a, c) => a + c.hours, 0);
    const avgProgress = baseCourses.length > 0
        ? Math.round(baseCourses.reduce((a, c) => a + c.progress, 0) / baseCourses.length)
        : 0;

    const handleSave = () => setRefreshKey(k => k + 1);

    const handleDelete = (id: string) => {
        if (window.confirm('Supprimer ce cours ?')) {
            deleteCourse(id);
            setRefreshKey(k => k + 1);
        }
    };

    return (
        <DashboardLayout>
            <div key={refreshKey}>

                {/* ── Hero ── */}
                <div className="co-hero">
                    <div className="co-hero-text">
                        <h1 className="co-hero-title">{pageTitle}</h1>
                        <p className="co-hero-sub">
                            {isStudent(user.role) && user.filiere
                                ? `${FILIERE_LABELS[user.filiere]} — ${user.annee}${user.option ? ` (${user.option})` : ''}`
                                : isAdminUser
                                    ? 'Vue complète de tous les cours de la plateforme.'
                                    : 'Vos matières d\'enseignement.'}
                        </p>
                        <div className="co-hero-badges">
                            <span className="co-hero-badge">
                                <IonIcon icon={bookOutline} />{baseCourses.length} cours
                            </span>
                            <span className="co-hero-badge">
                                <IonIcon icon={timeOutline} />{totalHours}h totales
                            </span>
                            {!isAdminUser && (
                                <span className="co-hero-badge">
                                    <IonIcon icon={layersOutline} />{avgProgress}% progression moy.
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Bouton ajout cours (prof) */}
                    {isProf && (
                        <div className="co-hero-action">
                            <IonButton
                                fill="outline"
                                className="co-hero-add-btn"
                                onClick={() => { setEditTarget(null); setModalOpen(true); }}
                            >
                                <IonIcon slot="start" icon={addOutline} />
                                Nouveau cours
                            </IonButton>
                        </div>
                    )}
                </div>

                {/* ── Filtres admin ── */}
                {isAdminUser && (
                    <div className="co-filters">
                        <div className="co-filter-group">
                            <span className="co-filter-label">Filière</span>
                            <IonSegment
                                mode="ios" value={filterFiliere}
                                className="co-segment co-segment--sm"
                                onIonChange={e => setFilterFiliere(String(e.detail.value) as typeof filterFiliere)}
                            >
                                <IonSegmentButton value="all" className="co-seg-btn"><IonLabel>Toutes</IonLabel></IonSegmentButton>
                                <IonSegmentButton value="LIC" className="co-seg-btn"><IonLabel>LIC</IonLabel></IonSegmentButton>
                                <IonSegmentButton value="LAP" className="co-seg-btn"><IonLabel>LAP</IonLabel></IonSegmentButton>
                            </IonSegment>
                        </div>
                        <div className="co-filter-group">
                            <span className="co-filter-label">Niveau</span>
                            <IonSegment
                                mode="ios" value={filterAnnee}
                                className="co-segment co-segment--sm"
                                onIonChange={e => setFilterAnnee(String(e.detail.value) as typeof filterAnnee)}
                            >
                                <IonSegmentButton value="all" className="co-seg-btn"><IonLabel>Tous</IonLabel></IonSegmentButton>
                                <IonSegmentButton value="L1"  className="co-seg-btn"><IonLabel>L1</IonLabel></IonSegmentButton>
                                <IonSegmentButton value="L2"  className="co-seg-btn"><IonLabel>L2</IonLabel></IonSegmentButton>
                                <IonSegmentButton value="L3"  className="co-seg-btn"><IonLabel>L3</IonLabel></IonSegmentButton>
                            </IonSegment>
                        </div>
                    </div>
                )}

                {/* ── Toolbar ── */}
                <div className="co-toolbar">
                    <IonSearchbar
                        value={search}
                        onIonInput={e => setSearch(String(e.detail.value ?? ''))}
                        placeholder="Rechercher un cours ou un professeur…"
                        className="co-searchbar"
                        debounce={200}
                    />
                    <IonChip className="co-result-chip">{filtered.length} cours</IonChip>
                </div>

                {/* ── Grille ── */}
                {filtered.length === 0 ? (
                    <div className="co-empty">
                        <IonIcon icon={bookOutline} className="co-empty-icon" />
                        <p>Aucun cours trouvé.</p>
                    </div>
                ) : (
                    <div className="co-grid">
                        {filtered.map(c => (
                            <CourseCard
                                key={c.id}
                                course={c}
                                showMeta={isAdminUser}
                                canEdit={isProf}
                                onEdit={(course) => { setEditTarget(course); setModalOpen(true); }}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

            </div>

            {/* ── Modal formulaire (prof) ── */}
            {isProf && (
                <CourseModal
                    isOpen={modalOpen}
                    initial={editTarget}
                    professorName={user.nom_complet}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                />
            )}

        </DashboardLayout>
    );
};

export default Courses;
