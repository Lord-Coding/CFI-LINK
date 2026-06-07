import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonProgressBar, IonSearchbar, IonChip,
} from '../lib/ionic';
import {
    playOutline, documentTextOutline, helpCircleOutline, ribbonOutline,
    bookOutline, arrowBackOutline, checkmarkCircleOutline, lockClosedOutline,
    chevronForwardOutline, timeOutline, peopleOutline, videocamOutline,
    schoolOutline, layersOutline,
} from 'ionicons/icons';
import { Badge, Card, CardContent } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/ELearning.css';

/* ── Types ── */
interface Lesson {
    id:        string;
    title:     string;
    type:      'video' | 'document' | 'quiz' | 'exam';
    duration:  string;
    completed: boolean;
    locked:    boolean;
}

interface Course {
    id:               string;
    name:             string;
    teacher:          string;
    filiere:          string;
    annee:            string;
    description:      string;
    progress:         number;
    totalLessons:     number;
    completedLessons: number;
    lessons:          Lesson[];
}

/* ── Données mockées ── */
const mockCourses: Course[] = [
    {
        id: '1', name: 'Algorithmique avancée', teacher: 'Prof. Mbarga',
        filiere: 'LIC', annee: 'L2',
        description: 'Structures de données avancées, complexité algorithmique et programmation dynamique.',
        progress: 65, totalLessons: 12, completedLessons: 8,
        lessons: [
            { id: 'l1',  title: 'Introduction aux structures avancées',   type: 'video',    duration: '45 min', completed: true,  locked: false },
            { id: 'l2',  title: 'Supports de cours — Chapitre 1',         type: 'document', duration: '15 min', completed: true,  locked: false },
            { id: 'l3',  title: 'Arbres binaires de recherche',            type: 'video',    duration: '50 min', completed: true,  locked: false },
            { id: 'l4',  title: 'Quiz — Arbres & Graphes',                 type: 'quiz',     duration: '20 min', completed: true,  locked: false },
            { id: 'l5',  title: 'Graphes : parcours & plus courts chemins',type: 'video',    duration: '55 min', completed: true,  locked: false },
            { id: 'l6',  title: 'Tables de hachage',                       type: 'video',    duration: '40 min', completed: true,  locked: false },
            { id: 'l7',  title: 'TD noté — Structures de données',         type: 'document', duration: '30 min', completed: true,  locked: false },
            { id: 'l8',  title: 'Programmation dynamique',                 type: 'video',    duration: '60 min', completed: true,  locked: false },
            { id: 'l9',  title: 'Quiz — Programmation dynamique',          type: 'quiz',     duration: '25 min', completed: false, locked: false },
            { id: 'l10', title: 'Algorithmes de tri avancés',              type: 'video',    duration: '50 min', completed: false, locked: false },
            { id: 'l11', title: 'Complexité NP',                           type: 'video',    duration: '55 min', completed: false, locked: true  },
            { id: 'l12', title: 'Examen final — Algorithmique',            type: 'exam',     duration: '2h',     completed: false, locked: true  },
        ],
    },
    {
        id: '2', name: 'Base de données', teacher: 'Dr. Nkoulou',
        filiere: 'LIC', annee: 'L2',
        description: 'Modélisation, SQL avancé, normalisation et administration de bases de données.',
        progress: 40, totalLessons: 10, completedLessons: 4,
        lessons: [
            { id: 'b1',  title: 'Modèle relationnel',           type: 'video',    duration: '40 min', completed: true,  locked: false },
            { id: 'b2',  title: 'SQL — Les fondamentaux',        type: 'video',    duration: '50 min', completed: true,  locked: false },
            { id: 'b3',  title: 'Quiz — SQL Basics',             type: 'quiz',     duration: '15 min', completed: true,  locked: false },
            { id: 'b4',  title: 'Jointures et sous-requêtes',    type: 'video',    duration: '45 min', completed: true,  locked: false },
            { id: 'b5',  title: 'Normalisation (1NF-3NF)',       type: 'video',    duration: '55 min', completed: false, locked: false },
            { id: 'b6',  title: 'Supports — Normalisation',      type: 'document', duration: '20 min', completed: false, locked: false },
            { id: 'b7',  title: 'Quiz — Normalisation',          type: 'quiz',     duration: '20 min', completed: false, locked: true  },
            { id: 'b8',  title: 'Transactions & concurrence',    type: 'video',    duration: '50 min', completed: false, locked: true  },
            { id: 'b9',  title: 'Administration PostgreSQL',     type: 'video',    duration: '60 min', completed: false, locked: true  },
            { id: 'b10', title: 'Examen final — BDD',            type: 'exam',     duration: '2h',     completed: false, locked: true  },
        ],
    },
    {
        id: '3', name: 'Droit administratif', teacher: 'Me. Atangana',
        filiere: 'LAP', annee: 'L1',
        description: 'Principes du droit administratif, actes administratifs et contentieux.',
        progress: 80, totalLessons: 8, completedLessons: 6,
        lessons: [
            { id: 'd1', title: 'Introduction au droit administratif',  type: 'video',    duration: '35 min', completed: true,  locked: false },
            { id: 'd2', title: "L'organisation administrative",        type: 'video',    duration: '45 min', completed: true,  locked: false },
            { id: 'd3', title: 'Les actes administratifs',             type: 'video',    duration: '50 min', completed: true,  locked: false },
            { id: 'd4', title: 'Quiz — Actes administratifs',          type: 'quiz',     duration: '15 min', completed: true,  locked: false },
            { id: 'd5', title: 'Le service public',                    type: 'video',    duration: '40 min', completed: true,  locked: false },
            { id: 'd6', title: 'Documents — Jurisprudence',            type: 'document', duration: '25 min', completed: true,  locked: false },
            { id: 'd7', title: 'Le contentieux administratif',         type: 'video',    duration: '55 min', completed: false, locked: false },
            { id: 'd8', title: 'Examen final — Droit admin',           type: 'exam',     duration: '2h',     completed: false, locked: true  },
        ],
    },
    {
        id: '4', name: 'Anglais technique', teacher: 'Mme. Fotso',
        filiere: 'LIC', annee: 'L1',
        description: 'Anglais technique orienté informatique et communication professionnelle.',
        progress: 30, totalLessons: 8, completedLessons: 2,
        lessons: [
            { id: 'a1', title: 'Technical vocabulary',   type: 'video',    duration: '30 min', completed: true,  locked: false },
            { id: 'a2', title: 'Reading comprehension',  type: 'document', duration: '20 min', completed: true,  locked: false },
            { id: 'a3', title: 'Quiz — Vocabulary',      type: 'quiz',     duration: '15 min', completed: false, locked: false },
            { id: 'a4', title: 'Writing emails',         type: 'video',    duration: '35 min', completed: false, locked: false },
            { id: 'a5', title: 'Presentation skills',    type: 'video',    duration: '40 min', completed: false, locked: true  },
            { id: 'a6', title: 'Mock presentation',      type: 'document', duration: '30 min', completed: false, locked: true  },
            { id: 'a7', title: 'Quiz — Communication',   type: 'quiz',     duration: '20 min', completed: false, locked: true  },
            { id: 'a8', title: 'Final exam — English',   type: 'exam',     duration: '1h30',   completed: false, locked: true  },
        ],
    },
];

/* ── Helpers ── */
const LESSON_ICON: Record<string, string> = {
    video:    videocamOutline,
    document: documentTextOutline,
    quiz:     helpCircleOutline,
    exam:     ribbonOutline,
};
const LESSON_LABEL: Record<string, string> = {
    video: 'Vidéo', document: 'Document', quiz: 'Quiz', exam: 'Examen',
};

type LessonBadge = 'default' | 'warning' | 'info' | 'danger';
const LESSON_BADGE: Record<string, LessonBadge> = {
    video: 'default', document: 'warning', quiz: 'info', exam: 'danger',
};

/* ════════════════════════════════
   Vue Quiz / Examen
════════════════════════════════ */
const QUIZ_QUESTIONS = [
    { q: "Quelle est la complexité temporelle d'un BFS ?", options: ["O(n)", "O(n log n)", "O(V + E)", "O(n²)"], correct: 2 },
    { q: "Algorithme pour le plus court chemin dans un graphe pondéré ?", options: ["DFS", "BFS", "Dijkstra", "Bubble Sort"], correct: 2 },
    { q: "Quelle structure utilise le principe LIFO ?", options: ["File", "Pile", "Liste", "Arbre"], correct: 1 },
];

const QuizView: React.FC<{ lesson: Lesson; onBack: () => void }> = ({ lesson, onBack }) => {
    const [answers,   setAnswers]   = useState<(number | null)[]>(new Array(QUIZ_QUESTIONS.length).fill(null));
    const [submitted, setSubmitted] = useState(false);
    const score = submitted ? answers.filter((a, i) => a === QUIZ_QUESTIONS[i].correct).length : 0;

    return (
        <div className="el-quiz">
            <button className="el-back-btn" onClick={onBack}>
                <IonIcon icon={arrowBackOutline} /> Retour au cours
            </button>

            <div className="el-quiz-header">
                <h2 className="el-quiz-title">{lesson.title}</h2>
                <Badge variant={LESSON_BADGE[lesson.type]} size="sm">
                    <IonIcon icon={LESSON_ICON[lesson.type]} />
                    {LESSON_LABEL[lesson.type]}
                </Badge>
            </div>

            {submitted && (
                <div className={`el-quiz-result ${score === QUIZ_QUESTIONS.length ? 'el-quiz-result--perfect' : 'el-quiz-result--partial'}`}>
                    <IonIcon icon={score === QUIZ_QUESTIONS.length ? checkmarkCircleOutline : ribbonOutline} />
                    <span>{score}/{QUIZ_QUESTIONS.length} — {score === QUIZ_QUESTIONS.length ? 'Parfait ! 🎉' : 'Continuez à réviser !'}</span>
                </div>
            )}

            <div className="el-quiz-questions">
                {QUIZ_QUESTIONS.map((q, qi) => (
                    <div key={qi} className="el-quiz-question">
                        <p className="el-quiz-q">{qi + 1}. {q.q}</p>
                        <div className="el-quiz-options">
                            {q.options.map((opt, oi) => {
                                const selected  = answers[qi] === oi;
                                const isCorrect = submitted && oi === q.correct;
                                const isWrong   = submitted && selected && oi !== q.correct;
                                return (
                                    <button
                                        key={oi}
                                        disabled={submitted}
                                        onClick={() => {
                                            const next = [...answers];
                                            next[qi] = oi;
                                            setAnswers(next);
                                        }}
                                        className={[
                                            'el-quiz-option',
                                            isCorrect ? 'el-quiz-option--correct'  : '',
                                            isWrong   ? 'el-quiz-option--wrong'    : '',
                                            !submitted && selected ? 'el-quiz-option--selected' : '',
                                        ].filter(Boolean).join(' ')}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {!submitted && (
                <IonButton
                    expand="block"
                    color="primary"
                    disabled={answers.includes(null)}
                    onClick={() => setSubmitted(true)}
                    className="el-submit-btn"
                >
                    <IonIcon slot="start" icon={checkmarkCircleOutline} />
                    Soumettre le quiz
                </IonButton>
            )}
        </div>
    );
};

/* ════════════════════════════════
   Vue Vidéo / Document
════════════════════════════════ */
const VideoView: React.FC<{ lesson: Lesson; onBack: () => void }> = ({ lesson, onBack }) => (
    <div className="el-video">
        <button className="el-back-btn" onClick={onBack}>
            <IonIcon icon={arrowBackOutline} /> Retour au cours
        </button>

        <h2 className="el-video-title">{lesson.title}</h2>

        <div className="el-video-player">
            <div className="el-video-placeholder">
                <div className="el-video-play-wrap">
                    <IonIcon icon={playOutline} className="el-video-play-icon" />
                </div>
                <p className="el-video-duration">{lesson.type === 'video' ? 'Vidéo de cours' : 'Document PDF'} — {lesson.duration}</p>
                <p className="el-video-note">Lecteur intégré — à connecter avec le backend</p>
            </div>
        </div>

        <Card variant="default" className="el-video-desc-card">
            <CardContent padding="md">
                <h3 className="el-video-desc-title">Description</h3>
                <p className="el-video-desc-text">
                    Ce cours couvre les concepts essentiels liés au sujet. Suivez attentivement et prenez des notes pour le quiz suivant.
                </p>
            </CardContent>
        </Card>

        <IonButton expand="block" color="success" className="el-done-btn">
            <IonIcon slot="start" icon={checkmarkCircleOutline} />
            Marquer comme terminé
        </IonButton>
    </div>
);

/* ════════════════════════════════
   Détail d'un cours
════════════════════════════════ */
const CourseDetail: React.FC<{ course: Course; onBack: () => void }> = ({ course, onBack }) => {
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

    if (activeLesson) {
        if (activeLesson.type === 'quiz' || activeLesson.type === 'exam') {
            return <QuizView lesson={activeLesson} onBack={() => setActiveLesson(null)} />;
        }
        return <VideoView lesson={activeLesson} onBack={() => setActiveLesson(null)} />;
    }

    return (
        <div className="el-detail">
            <button className="el-back-btn" onClick={onBack}>
                <IonIcon icon={arrowBackOutline} /> Tous les cours
            </button>

            {/* Header du cours */}
            <Card variant="default" className="el-detail-header-card">
                <CardContent padding="md">
                    <div className="el-detail-header">
                        <div className="el-detail-header-info">
                            <h2 className="el-detail-name">{course.name}</h2>
                            <p className="el-detail-teacher">{course.teacher} • {course.filiere} {course.annee}</p>
                            <p className="el-detail-desc">{course.description}</p>
                        </div>
                        <IonChip className="el-detail-chip">
                            {course.completedLessons}/{course.totalLessons} leçons
                        </IonChip>
                    </div>
                    <div className="el-detail-progress">
                        <IonProgressBar value={course.progress / 100} className="el-detail-progress-bar" />
                        <span className="el-detail-pct">{course.progress}%</span>
                    </div>
                </CardContent>
            </Card>

            {/* Liste des leçons */}
            <h3 className="el-lessons-title">Contenu du cours</h3>
            <div className="el-lessons-list">
                {course.lessons.map((lesson) => (
                    <button
                        key={lesson.id}
                        disabled={lesson.locked}
                        onClick={() => !lesson.locked && setActiveLesson(lesson)}
                        className={[
                            'el-lesson-item',
                            lesson.locked    ? 'el-lesson-item--locked'    : '',
                            lesson.completed ? 'el-lesson-item--completed' : '',
                        ].filter(Boolean).join(' ')}
                    >
                        <div className={[
                            'el-lesson-icon',
                            lesson.locked    ? 'el-lesson-icon--locked'    : '',
                            lesson.completed ? 'el-lesson-icon--completed' : `el-lesson-icon--${lesson.type}`,
                        ].filter(Boolean).join(' ')}>
                            <IonIcon icon={
                                lesson.locked    ? lockClosedOutline :
                                lesson.completed ? checkmarkCircleOutline :
                                LESSON_ICON[lesson.type]
                            } />
                        </div>
                        <div className="el-lesson-body">
                            <p className="el-lesson-title">{lesson.title}</p>
                            <div className="el-lesson-meta">
                                <Badge variant={LESSON_BADGE[lesson.type]} size="sm">
                                    {LESSON_LABEL[lesson.type]}
                                </Badge>
                                <span className="el-lesson-duration">
                                    <IonIcon icon={timeOutline} />
                                    {lesson.duration}
                                </span>
                            </div>
                        </div>
                        {!lesson.locked && (
                            <IonIcon icon={chevronForwardOutline} className="el-lesson-arrow" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

/* ════════════════════════════════
   Page principale — liste des cours
════════════════════════════════ */
const ELearning: React.FC = () => {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [search,         setSearch]         = useState('');

    const filtered = mockCourses.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.teacher.toLowerCase().includes(search.toLowerCase())
    );

    const totalProgress = Math.round(
        mockCourses.reduce((a, c) => a + c.progress, 0) / mockCourses.length
    );
    const totalLessons = mockCourses.reduce((a, c) => a + c.totalLessons, 0);
    const doneLessons  = mockCourses.reduce((a, c) => a + c.completedLessons, 0);

    if (selectedCourse) {
        return (
            <DashboardLayout>
                <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>

            {/* ── Hero ── */}
            <div className="el-hero">
                <div className="el-hero-text">
                    <h1 className="el-hero-title">E-Learning 📖</h1>
                    <p className="el-hero-sub">Vidéos, quiz et examens pour chaque cours.</p>
                    <div className="el-hero-badges">
                        <span className="el-hero-badge">
                            <IonIcon icon={bookOutline} />{mockCourses.length} cours
                        </span>
                        <span className="el-hero-badge">
                            <IonIcon icon={layersOutline} />{doneLessons}/{totalLessons} leçons
                        </span>
                        <span className="el-hero-badge">
                            <IonIcon icon={schoolOutline} />{totalProgress}% progression
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Recherche ── */}
            <div className="el-toolbar">
                <IonSearchbar
                    value={search}
                    onIonInput={e => setSearch(String(e.detail.value ?? ''))}
                    placeholder="Rechercher un cours ou un professeur…"
                    className="el-searchbar"
                    debounce={200}
                />
                <IonChip className="el-count-chip">{filtered.length}</IonChip>
            </div>

            {/* ── Grille de cours ── */}
            {filtered.length === 0 ? (
                <div className="el-empty">
                    <IonIcon icon={bookOutline} className="el-empty-icon" />
                    <p>Aucun cours trouvé.</p>
                </div>
            ) : (
                <div className="el-grid">
                    {filtered.map(course => (
                        <button
                            key={course.id}
                            className="el-course-card"
                            onClick={() => setSelectedCourse(course)}
                        >
                            {/* Icône */}
                            <div className="el-course-card-top">
                                <div className="el-course-icon">
                                    <IonIcon icon={bookOutline} />
                                </div>
                                <div className="el-course-badges">
                                    <Badge variant="info"      size="sm">{course.filiere}</Badge>
                                    <Badge variant="secondary" size="sm">{course.annee}</Badge>
                                </div>
                            </div>

                            <h3 className="el-course-name">{course.name}</h3>
                            <p className="el-course-teacher">{course.teacher}</p>
                            <p className="el-course-desc">{course.description}</p>

                            <div className="el-course-meta">
                                <span className="el-course-meta-item">
                                    <IonIcon icon={layersOutline} />
                                    {course.completedLessons}/{course.totalLessons} leçons
                                </span>
                                <span className="el-course-pct">{course.progress}%</span>
                            </div>

                            <IonProgressBar
                                value={course.progress / 100}
                                className="el-course-progress"
                            />

                            <div className="el-course-footer">
                                <IonIcon icon={chevronForwardOutline} className="el-course-arrow" />
                            </div>
                        </button>
                    ))}
                </div>
            )}

        </DashboardLayout>
    );
};

export default ELearning;
