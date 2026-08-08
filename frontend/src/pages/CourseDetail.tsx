import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
    IonButton, IonIcon, IonProgressBar, IonChip,
} from '../lib/ionic';
import {
    arrowBackOutline, bookOutline, checkmarkCircleOutline,
    chevronForwardOutline, desktopOutline, documentTextOutline,
    helpCircleOutline, lockClosedOutline, peopleOutline,
    playOutline, ribbonOutline, timeOutline,
} from 'ionicons/icons';
import { Badge, Card, CardContent } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import { getCourseById, getLessonsForCourse, markLessonComplete, Lesson } from '../lib/courses-data';
import { FILIERE_LABELS } from '../lib/store';
import '../styles/CourseDetail.css';

/* ── Helpers ── */
const LESSON_ICON: Record<string, string> = {
    video:    playOutline,
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
   Vue Quiz inline
════════════════════════════════ */
const QuizView: React.FC<{ lesson: Lesson; onBack: () => void; onComplete: () => void }> = ({ lesson, onBack, onComplete }) => {
    const questions = lesson.quizQuestions ?? [];
    const [answers,   setAnswers]   = useState<(number | null)[]>(new Array(questions.length).fill(null));
    const [submitted, setSubmitted] = useState(false);
    const score = submitted ? answers.filter((a, i) => a === questions[i].correctIndex).length : 0;

    const handleSubmit = () => {
        setSubmitted(true);
        onComplete();
    };

    if (questions.length === 0) {
        return (
            <div className="cd-quiz">
                <button className="cd-back-btn" onClick={onBack}>
                    <IonIcon icon={arrowBackOutline} /> Retour
                </button>
                <p style={{ color: 'var(--ion-color-medium)', textAlign: 'center', padding: '2rem' }}>
                    Aucune question disponible pour ce quiz.
                </p>
            </div>
        );
    }

    return (
        <div className="cd-quiz">
            <button className="cd-back-btn" onClick={onBack}>
                <IonIcon icon={arrowBackOutline} /> Retour au cours
            </button>

            <div className="cd-quiz-header">
                <h2 className="cd-quiz-title">{lesson.title}</h2>
                <Badge variant={LESSON_BADGE[lesson.type]} size="sm">
                    <IonIcon icon={LESSON_ICON[lesson.type]} /> {LESSON_LABEL[lesson.type]}
                </Badge>
            </div>

            {submitted && (
                <div className={`cd-quiz-result ${score === questions.length ? 'cd-quiz-result--perfect' : 'cd-quiz-result--partial'}`}>
                    <IonIcon icon={score === questions.length ? checkmarkCircleOutline : ribbonOutline} />
                    <span>{score}/{questions.length} — {score === questions.length ? 'Parfait ! 🎉' : 'Continuez à réviser !'}</span>
                </div>
            )}

            <div className="cd-quiz-questions">
                {questions.map((q, qi) => (
                    <div key={q.id} className="cd-quiz-question">
                        <p className="cd-quiz-q">{qi + 1}. {q.question}</p>
                        <div className="cd-quiz-options">
                            {q.options.map((opt, oi) => {
                                const selected  = answers[qi] === oi;
                                const isCorrect = submitted && oi === q.correctIndex;
                                const isWrong   = submitted && selected && oi !== q.correctIndex;
                                return (
                                    <button
                                        key={oi}
                                        disabled={submitted}
                                        onClick={() => {
                                            const next = [...answers]; next[qi] = oi; setAnswers(next);
                                        }}
                                        className={[
                                            'cd-quiz-option',
                                            isCorrect ? 'cd-quiz-option--correct' : '',
                                            isWrong   ? 'cd-quiz-option--wrong'   : '',
                                            !submitted && selected ? 'cd-quiz-option--selected' : '',
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
                    onClick={handleSubmit}
                    className="cd-submit-btn"
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
const MediaView: React.FC<{ lesson: Lesson; onBack: () => void; onComplete: () => void }> = ({ lesson, onBack, onComplete }) => {
    const [done, setDone] = useState(lesson.completed);

    const handleComplete = () => {
        markLessonComplete(lesson.id);
        setDone(true);
        onComplete();
    };

    return (
        <div className="cd-media">
            <button className="cd-back-btn" onClick={onBack}>
                <IonIcon icon={arrowBackOutline} /> Retour au cours
            </button>

            <div className="cd-media-header">
                <h2 className="cd-media-title">{lesson.title}</h2>
                <Badge variant={LESSON_BADGE[lesson.type]} size="sm">
                    <IonIcon icon={LESSON_ICON[lesson.type]} /> {LESSON_LABEL[lesson.type]}
                </Badge>
            </div>

            {lesson.type === 'video' ? (
                lesson.file_url ? (
                    <div className="cd-video-wrap">
                        <video
                            controls
                            className="cd-video-player"
                            src={lesson.file_url}
                            onEnded={handleComplete}
                        >
                            Votre navigateur ne supporte pas la lecture vidéo.
                        </video>
                    </div>
                ) : (
                    <div className="cd-media-placeholder">
                        <div className="cd-media-play-wrap">
                            <IonIcon icon={playOutline} className="cd-media-play-icon" />
                        </div>
                        <p className="cd-media-duration">{lesson.duration}</p>
                        <p className="cd-media-note">Aucune vidéo liée à cette leçon.</p>
                    </div>
                )
            ) : (
                lesson.file_url ? (
                    <div className="cd-pdf-wrap">
                        <iframe
                            src={lesson.file_url}
                            className="cd-pdf-viewer"
                            title={lesson.title}
                        />
                    </div>
                ) : (
                    <div className="cd-media-placeholder">
                        <div className="cd-media-play-wrap">
                            <IonIcon icon={documentTextOutline} className="cd-media-play-icon" />
                        </div>
                        <p className="cd-media-duration">{lesson.duration}</p>
                        <p className="cd-media-note">Aucun fichier lié à cette leçon.</p>
                    </div>
                )
            )}

            <Card variant="default" className="cd-media-desc-card">
                <CardContent padding="md">
                    <h3 className="cd-media-desc-title">Description</h3>
                    <p className="cd-media-desc-text">
                        Suivez attentivement ce contenu et prenez des notes pour les activités suivantes.
                    </p>
                    <div className="cd-media-meta">
                        <span><IonIcon icon={timeOutline} /> {lesson.duration}</span>
                    </div>
                </CardContent>
            </Card>

            {done ? (
                <div className="cd-done-badge">
                    <IonIcon icon={checkmarkCircleOutline} /> Leçon terminée
                </div>
            ) : (
                <IonButton expand="block" color="success" className="cd-done-btn" onClick={handleComplete}>
                    <IonIcon slot="start" icon={checkmarkCircleOutline} />
                    Marquer comme terminé
                </IonButton>
            )}
        </div>
    );
};

/* ════════════════════════════════
   Page principale CourseDetail
════════════════════════════════ */
const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [activeLesson, setActiveLesson]   = useState<Lesson | null>(null);
    const [refreshKey,   setRefreshKey]     = useState(0);

    const course  = getCourseById(id);
    const lessons = getLessonsForCourse(id);

    const handleComplete = () => setRefreshKey(k => k + 1);

    if (!course) {
        return (
            <DashboardLayout>
                <div className="cd-not-found">
                    <IonIcon icon={bookOutline} />
                    <p>Cours introuvable.</p>
                    <IonButton fill="outline" onClick={() => history.push('/courses')}>
                        Retour aux cours
                    </IonButton>
                </div>
            </DashboardLayout>
        );
    }

    const freshLessons  = getLessonsForCourse(id);
    const completedCount = freshLessons.filter(l => l.completed).length;
    const progress       = freshLessons.length > 0
        ? Math.round((completedCount / freshLessons.length) * 100)
        : 0;

    /* Vue leçon active */
    if (activeLesson) {
        const fresh = freshLessons.find(l => l.id === activeLesson.id) ?? activeLesson;
        if (fresh.type === 'quiz' || fresh.type === 'exam') {
            return (
                <DashboardLayout>
                    <QuizView lesson={fresh} onBack={() => setActiveLesson(null)} onComplete={handleComplete} />
                </DashboardLayout>
            );
        }
        return (
            <DashboardLayout>
                <MediaView lesson={fresh} onBack={() => setActiveLesson(null)} onComplete={handleComplete} />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="cd-page" key={refreshKey}>

                {/* Retour */}
                <button className="cd-back-btn" onClick={() => history.push('/courses')}>
                    <IonIcon icon={arrowBackOutline} /> Tous les cours
                </button>

                {/* Hero du cours */}
                <div className="cd-hero">
                    <div className="cd-hero-left">
                        <div className="cd-hero-icon">
                            <IonIcon icon={bookOutline} />
                        </div>
                        <div className="cd-hero-info">
                            <div className="cd-hero-badges">
                                <Badge variant="info" size="sm">{course.filiere}</Badge>
                                <Badge variant="secondary" size="sm">{course.annee}{course.option ? ` (${course.option})` : ''}</Badge>
                                <Badge variant="secondary" size="sm">{course.semester}</Badge>
                            </div>
                            <h1 className="cd-hero-title">{course.name}</h1>
                            <p className="cd-hero-teacher">{course.teacher}</p>
                            {course.description && (
                                <p className="cd-hero-desc">{course.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats rapides */}
                <div className="cd-stats-row">
                    <div className="cd-stat">
                        <IonIcon icon={timeOutline} />
                        <span className="cd-stat-value">{course.hours}h</span>
                        <span className="cd-stat-label">durée totale</span>
                    </div>
                    <div className="cd-stat">
                        <IonIcon icon={peopleOutline} />
                        <span className="cd-stat-value">{course.students}</span>
                        <span className="cd-stat-label">étudiants</span>
                    </div>
                    <div className="cd-stat">
                        <IonIcon icon={desktopOutline} />
                        <span className="cd-stat-value">{freshLessons.length}</span>
                        <span className="cd-stat-label">leçons</span>
                    </div>
                    <div className="cd-stat">
                        <IonIcon icon={checkmarkCircleOutline} />
                        <span className="cd-stat-value">{completedCount}</span>
                        <span className="cd-stat-label">terminées</span>
                    </div>
                </div>

                {/* Progression */}
                <Card variant="default" className="cd-progress-card">
                    <CardContent padding="md">
                        <div className="cd-progress-header">
                            <span className="cd-progress-label">Progression globale</span>
                            <span className="cd-progress-pct">{progress}%</span>
                        </div>
                        <IonProgressBar value={progress / 100} className="cd-progress-bar" />
                        <p className="cd-progress-sub">{completedCount}/{freshLessons.length} leçons complétées</p>
                    </CardContent>
                </Card>

                {/* Lien E-Learning */}
                <div className="cd-elearning-cta">
                    <IonButton
                        fill="outline"
                        onClick={() => history.push('/elearning')}
                        className="cd-elearning-btn"
                    >
                        <IonIcon slot="start" icon={desktopOutline} />
                        Voir dans E-Learning
                    </IonButton>
                </div>

                {/* Liste des leçons */}
                <h2 className="cd-lessons-title">
                    Contenu du cours
                    <IonChip className="cd-lessons-chip">{freshLessons.length} leçons</IonChip>
                </h2>

                {freshLessons.length === 0 ? (
                    <div className="cd-empty">
                        <IonIcon icon={desktopOutline} className="cd-empty-icon" />
                        <p>Aucune leçon disponible pour ce cours.</p>
                    </div>
                ) : (
                    <div className="cd-lessons-list">
                        {freshLessons.map((lesson) => (
                            <button
                                key={lesson.id}
                                disabled={lesson.locked}
                                onClick={() => !lesson.locked && setActiveLesson(lesson)}
                                className={[
                                    'cd-lesson-item',
                                    lesson.locked    ? 'cd-lesson-item--locked'    : '',
                                    lesson.completed ? 'cd-lesson-item--completed' : '',
                                ].filter(Boolean).join(' ')}
                            >
                                {/* Numéro */}
                                <div className="cd-lesson-order">{lesson.order}</div>

                                {/* Icône type */}
                                <div className={[
                                    'cd-lesson-icon',
                                    lesson.locked    ? 'cd-lesson-icon--locked'    : '',
                                    lesson.completed ? 'cd-lesson-icon--completed' : `cd-lesson-icon--${lesson.type}`,
                                ].filter(Boolean).join(' ')}>
                                    <IonIcon icon={
                                        lesson.locked    ? lockClosedOutline :
                                        lesson.completed ? checkmarkCircleOutline :
                                        LESSON_ICON[lesson.type]
                                    } />
                                </div>

                                {/* Contenu */}
                                <div className="cd-lesson-body">
                                    <p className="cd-lesson-title">{lesson.title}</p>
                                    <div className="cd-lesson-meta">
                                        <Badge variant={LESSON_BADGE[lesson.type]} size="sm">
                                            {LESSON_LABEL[lesson.type]}
                                        </Badge>
                                        <span className="cd-lesson-duration">
                                            <IonIcon icon={timeOutline} /> {lesson.duration}
                                        </span>
                                    </div>
                                </div>

                                {/* Flèche / lock */}
                                {!lesson.locked && (
                                    <IonIcon icon={chevronForwardOutline} className="cd-lesson-arrow" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default CourseDetail;
