import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonSegment, IonSegmentButton,
    IonLabel, IonSearchbar, IonProgressBar, IonChip,
} from '../lib/ionic';
import {
    bookOutline, timeOutline, peopleOutline, schoolOutline,
    layersOutline, filterOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { isAdmin, isStudent, isProfessor, FILIERE_LABELS } from '../lib/store';
import {
    allCoursesData, getCoursesForStudent,
    getCoursesForProfessor, CourseData,
} from '../lib/courses-data';
import { Badge, Card, CardContent } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Courses.css';

/* ─────────────────────────────────
   Composant carte de cours
───────────────────────────────── */
const CourseCard: React.FC<{ course: CourseData; showMeta?: boolean }> = ({ course: c, showMeta = false }) => (
    <Card variant="default" hoverable className="co-card">
        <CardContent padding="md" className="co-card-content">

            {/* En-tête */}
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

            {/* Infos */}
            <h3 className="co-card-name">{c.name}</h3>
            <p className="co-card-teacher">{c.teacher}</p>

            {/* Méta */}
            <div className="co-card-meta">
                <span className="co-card-meta-item">
                    <IonIcon icon={timeOutline} />
                    {c.hours}h
                </span>
                <span className="co-card-meta-item">
                    <IonIcon icon={peopleOutline} />
                    {c.students}
                </span>
            </div>

            {/* Progression */}
            <div className="co-card-progress">
                <div className="co-card-progress-header">
                    <span>Progression</span>
                    <span className="co-card-progress-pct">{c.progress}%</span>
                </div>
                <IonProgressBar
                    value={c.progress / 100}
                    className="co-progress-bar"
                />
            </div>
        </CardContent>
    </Card>
);

/* ─────────────────────────────────
   Page principale
───────────────────────────────── */
const Courses: React.FC = () => {
    const { user } = useAuth();
    const [search,        setSearch]        = useState('');
    const [filterFiliere, setFilterFiliere] = useState<'all' | 'LIC' | 'LAP'>('all');
    const [filterAnnee,   setFilterAnnee]   = useState<'all' | 'L1' | 'L2' | 'L3'>('all');

    if (!user) return null;

    /* Cours selon le rôle */
    const baseCourses: CourseData[] = isStudent(user.role)
        ? getCoursesForStudent(user.filiere, user.annee, user.option)
        : isProfessor(user.role)
            ? getCoursesForProfessor(user.nom_complet)
            : allCoursesData;

    const isAdminUser = isAdmin(user.role);

    /* Filtres */
    const filtered = baseCourses.filter(c => {
        const q = search.toLowerCase().trim();
        if (q && !c.name.toLowerCase().includes(q) && !c.teacher.toLowerCase().includes(q)) return false;
        if (isAdminUser && filterFiliere !== 'all' && c.filiere !== filterFiliere) return false;
        if (isAdminUser && filterAnnee  !== 'all' && c.annee   !== filterAnnee)   return false;
        return true;
    });

    /* Titre selon le rôle */
    const pageTitle = isAdminUser
        ? 'Tous les cours'
        : isProfessor(user.role)
            ? 'Mes matières'
            : 'Mes cours';

    /* Stats rapides */
    const totalHours    = baseCourses.reduce((a, c) => a + c.hours, 0);
    const avgProgress   = baseCourses.length > 0
        ? Math.round(baseCourses.reduce((a, c) => a + c.progress, 0) / baseCourses.length)
        : 0;

    return (
        <DashboardLayout>

            {/* ── Hero ── */}
            <div className="co-hero">
                <div className="co-hero-text">
                    <h1 className="co-hero-title">{pageTitle}</h1>
                    <p className="co-hero-sub">
                        {isStudent(user.role) && user.filiere
                            ? `${FILIERE_LABELS[user.filiere]} — ${user.annee}${user.option ? ` (${user.option})` : ''}`
                            : isAdminUser
                                ? 'Vue complète de tous les cours de la plateforme.'
                                : `Vos matières d'enseignement.`
                        }
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
            </div>

            {/* ── Filtres admin ── */}
            {isAdminUser && (
                <div className="co-filters">
                    {/* Filière */}
                    <div className="co-filter-group">
                        <span className="co-filter-label">Filière</span>
                        <IonSegment
                            mode="ios"
                            value={filterFiliere}
                            className="co-segment co-segment--sm"
                            onIonChange={e => setFilterFiliere(String(e.detail.value) as typeof filterFiliere)}
                        >
                            <IonSegmentButton value="all" className="co-seg-btn"><IonLabel>Toutes</IonLabel></IonSegmentButton>
                            <IonSegmentButton value="LIC" className="co-seg-btn"><IonLabel>LIC</IonLabel></IonSegmentButton>
                            <IonSegmentButton value="LAP" className="co-seg-btn"><IonLabel>LAP</IonLabel></IonSegmentButton>
                        </IonSegment>
                    </div>

                    {/* Année */}
                    <div className="co-filter-group">
                        <span className="co-filter-label">Niveau</span>
                        <IonSegment
                            mode="ios"
                            value={filterAnnee}
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

            {/* ── Filtre semestre pour étudiant/prof ── */}

            {/* ── Barre de recherche ── */}
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

            {/* ── Grille de cours ── */}
            {filtered.length === 0 ? (
                <div className="co-empty">
                    <IonIcon icon={bookOutline} className="co-empty-icon" />
                    <p>Aucun cours trouvé.</p>
                </div>
            ) : (
                <div className="co-grid">
                    {filtered.map(c => (
                        <CourseCard key={c.id} course={c} showMeta={isAdminUser} />
                    ))}
                </div>
            )}

        </DashboardLayout>
    );
};

export default Courses;
