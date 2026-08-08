import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonProgressBar, IonSearchbar, IonChip, IonModal,
    IonInput, IonSelect, IonSelectOption,
} from '../lib/ionic';
import {
    playOutline, documentTextOutline, helpCircleOutline, ribbonOutline,
    bookOutline, arrowBackOutline, checkmarkCircleOutline, lockClosedOutline,
    chevronForwardOutline, timeOutline, videocamOutline,
    schoolOutline, layersOutline, addOutline, createOutline, trashOutline,
    closeOutline, addCircleOutline, removeCircleOutline,
} from 'ionicons/icons';
import { Badge, Card, CardContent } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { isProfessor } from '../lib/store';
import {
    getAllCourses, getCoursesForProfessor, getLessonsForCourse,
    addLesson, updateLesson, deleteLesson,
    initializeCourseStore, CourseData, Lesson, QuizQuestion,
} from '../lib/courses-data';
import {
    markLessonComplete as persistComplete,
    getCompletedLessonIds, getCourseProgressPercent, getLessonProgress,
} from '../lib/elearning-store';
import '../styles/ELearning.css';

initializeCourseStore();

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
   Modal Leçon (ajout / édition)
════════════════════════════════ */
interface LessonForm {
    title:    string;
    type:     'video' | 'document' | 'quiz' | 'exam';
    duration: string;
    file_url: string;
    locked:   boolean;
}
const EMPTY_LESSON: LessonForm = { title: '', type: 'video', duration: '', file_url: '', locked: false };

interface LessonModalProps {
    isOpen:   boolean;
    courseId: string;
    initial?: Lesson | null;
    nextOrder: number;
    onClose:  () => void;
    onSave:   () => void;
}

const LessonModal: React.FC<LessonModalProps> = ({ isOpen, courseId, initial, nextOrder, onClose, onSave }) => {
    const [form, setForm] = useState<LessonForm>(() =>
        initial
            ? { title: initial.title, type: initial.type, duration: initial.duration, file_url: initial.file_url ?? '', locked: initial.locked }
            : { ...EMPTY_LESSON }
    );
    const [questions, setQuestions] = useState<QuizQuestion[]>(initial?.quizQuestions ?? []);
    const [error, setError] = useState('');

    const set = (field: keyof LessonForm) => (val: string | boolean) =>
        setForm(f => ({ ...f, [field]: val }));

    const addQuestion = () =>
        setQuestions(q => [...q, { id: crypto.randomUUID(), question: '', options: ['', '', '', ''], correctIndex: 0 }]);

    const updateQuestion = (qi: number, field: 'question' | 'correctIndex', val: string | number) =>
        setQuestions(q => q.map((item, i) => i === qi ? { ...item, [field]: val } : item));

    const updateOption = (qi: number, oi: number, val: string) =>
        setQuestions(q => q.map((item, i) => i === qi ? { ...item, options: item.options.map((o, j) => j === oi ? val : o) } : item));

    const removeQuestion = (qi: number) =>
        setQuestions(q => q.filter((_, i) => i !== qi));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim())    { setError('Le titre est requis.'); return; }
        if (!form.duration.trim()) { setError('La durée est requise.'); return; }
        if ((form.type === 'quiz' || form.type === 'exam') && questions.length === 0) {
            setError('Ajoutez au moins une question pour ce type de leçon.'); return;
        }

        const data: Omit<Lesson, 'id'> = {
            courseId,
            title:        form.title.trim(),
            type:         form.type,
            duration:     form.duration.trim(),
            file_url:     form.file_url.trim() || undefined,
            completed:    initial?.completed ?? false,
            locked:       form.locked,
            order:        initial?.order ?? nextOrder,
            quizQuestions: (form.type === 'quiz' || form.type === 'exam') ? questions : undefined,
        };

        if (initial) {
            updateLesson(initial.id, data);
        } else {
            addLesson(data);
        }
        onSave();
        onClose();
    };

    const isQuizType = form.type === 'quiz' || form.type === 'exam';

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose} className="el-lesson-modal">
            <div className="el-lesson-modal-inner">
                <div className="el-lesson-modal-header">
                    <div className="el-lesson-modal-icon">
                        <IonIcon icon={addCircleOutline} />
                    </div>
                    <div>
                        <h2 className="el-lesson-modal-title">{initial ? 'Modifier la leçon' : 'Nouvelle leçon'}</h2>
                        <p className="el-lesson-modal-subtitle">Remplissez les informations de la leçon.</p>
                    </div>
                    <IonButton fill="clear" size="small" onClick={onClose} className="el-lesson-modal-close">
                        <IonIcon slot="icon-only" icon={closeOutline} />
                    </IonButton>
                </div>

                <form onSubmit={handleSubmit} className="el-lesson-modal-form">
                    {error && <p className="el-lesson-modal-error">{error}</p>}

                    <div className="el-form-group">
                        <label className="el-form-label">Titre *</label>
                        <IonInput
                            value={form.title}
                            onIonInput={e => set('title')(String(e.detail.value ?? ''))}
                            placeholder="Ex. : Introduction aux structures"
                            className="el-form-input"
                        />
                    </div>

                    <div className="el-form-row">
                        <div className="el-form-group el-form-group--half">
                            <label className="el-form-label">Type *</label>
                            <IonSelect
                                value={form.type}
                                onIonChange={e => set('type')(e.detail.value)}
                                className="el-form-select"
                                interface="popover"
                            >
                                <IonSelectOption value="video">Vidéo</IonSelectOption>
                                <IonSelectOption value="document">Document</IonSelectOption>
                                <IonSelectOption value="quiz">Quiz</IonSelectOption>
                                <IonSelectOption value="exam">Examen</IonSelectOption>
                            </IonSelect>
                        </div>

                        <div className="el-form-group el-form-group--half">
                            <label className="el-form-label">Durée *</label>
                            <IonInput
                                value={form.duration}
                                onIonInput={e => set('duration')(String(e.detail.value ?? ''))}
                                placeholder="Ex. : 45 min ou 2h"
                                className="el-form-input"
                            />
                        </div>
                    </div>

                    {!isQuizType && (
                        <div className="el-form-group">
                            <label className="el-form-label">URL du fichier</label>
                            <IonInput
                                value={form.file_url}
                                onIonInput={e => set('file_url')(String(e.detail.value ?? ''))}
                                placeholder="https://… (vidéo MP4 ou PDF)"
                                className="el-form-input"
                            />
                        </div>
                    )}

                    <div className="el-form-group el-form-group--check">
                        <label className="el-form-label">Verrouillée</label>
                        <IonSelect
                            value={form.locked ? 'yes' : 'no'}
                            onIonChange={e => set('locked')(e.detail.value === 'yes')}
                            className="el-form-select"
                            interface="popover"
                        >
                            <IonSelectOption value="no">Non — accessible librement</IonSelectOption>
                            <IonSelectOption value="yes">Oui — accès restreint</IonSelectOption>
                        </IonSelect>
                    </div>

                    {/* Questions quiz */}
                    {isQuizType && (
                        <div className="el-quiz-builder">
                            <div className="el-quiz-builder-header">
                                <span className="el-quiz-builder-title">Questions ({questions.length})</span>
                                <IonButton fill="clear" size="small" color="primary" type="button" onClick={addQuestion}>
                                    <IonIcon slot="start" icon={addOutline} /> Ajouter
                                </IonButton>
                            </div>

                            {questions.map((q, qi) => (
                                <div key={q.id} className="el-quiz-builder-q">
                                    <div className="el-quiz-builder-q-header">
                                        <span className="el-quiz-builder-q-num">Q{qi + 1}</span>
                                        <IonButton fill="clear" size="small" color="danger" type="button" onClick={() => removeQuestion(qi)}>
                                            <IonIcon slot="icon-only" icon={removeCircleOutline} />
                                        </IonButton>
                                    </div>
                                    <IonInput
                                        value={q.question}
                                        onIonInput={e => updateQuestion(qi, 'question', String(e.detail.value ?? ''))}
                                        placeholder="Texte de la question"
                                        className="el-form-input el-form-input--q"
                                    />
                                    <div className="el-quiz-builder-options">
                                        {q.options.map((opt, oi) => (
                                            <div key={oi} className={`el-quiz-builder-opt ${q.correctIndex === oi ? 'el-quiz-builder-opt--correct' : ''}`}>
                                                <button
                                                    type="button"
                                                    className="el-quiz-builder-opt-radio"
                                                    onClick={() => updateQuestion(qi, 'correctIndex', oi)}
                                                    title="Marquer comme bonne réponse"
                                                />
                                                <IonInput
                                                    value={opt}
                                                    onIonInput={e => updateOption(qi, oi, String(e.detail.value ?? ''))}
                                                    placeholder={`Réponse ${oi + 1}`}
                                                    className="el-form-input el-form-input--opt"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="el-quiz-builder-hint">Cliquez sur le cercle pour définir la bonne réponse.</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="el-lesson-modal-actions">
                        <IonButton expand="block" fill="outline" color="medium" type="button" onClick={onClose}>
                            Annuler
                        </IonButton>
                        <IonButton expand="block" type="submit" color="primary">
                            {initial ? 'Enregistrer' : 'Ajouter'}
                        </IonButton>
                    </div>
                </form>
            </div>
        </IonModal>
    );
};

/* ════════════════════════════════
   Vue Quiz / Examen
════════════════════════════════ */
const QuizView: React.FC<{ lesson: Lesson; courseId: string; studentId: string; onBack: () => void }> = ({ lesson, courseId, studentId, onBack }) => {
    const questions = lesson.quizQuestions ?? [];
    const [answers,   setAnswers]   = useState<(number | null)[]>(new Array(questions.length).fill(null));
    const [submitted, setSubmitted] = useState(false);
    const score = submitted ? answers.filter((a, i) => a === questions[i].correctIndex).length : 0;

    const handleSubmit = () => {
        setSubmitted(true);
        const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 100;
        persistComplete(studentId, lesson.id, courseId, pct);
    };

    if (questions.length === 0) {
        return (
            <div className="el-quiz">
                <button className="el-back-btn" onClick={onBack}>
                    <IonIcon icon={arrowBackOutline} /> Retour au cours
                </button>
                <p style={{ textAlign:'center', color:'var(--ion-color-medium)', padding:'2rem' }}>Aucune question disponible.</p>
            </div>
        );
    }

    return (
        <div className="el-quiz">
            <button className="el-back-btn" onClick={onBack}>
                <IonIcon icon={arrowBackOutline} /> Retour au cours
            </button>

            <div className="el-quiz-header">
                <h2 className="el-quiz-title">{lesson.title}</h2>
                <Badge variant={LESSON_BADGE[lesson.type]} size="sm">
                    <IonIcon icon={LESSON_ICON[lesson.type]} /> {LESSON_LABEL[lesson.type]}
                </Badge>
            </div>

            {submitted && (
                <div className={`el-quiz-result ${score === questions.length ? 'el-quiz-result--perfect' : 'el-quiz-result--partial'}`}>
                    <IonIcon icon={score === questions.length ? checkmarkCircleOutline : ribbonOutline} />
                    <span>{score}/{questions.length} — {score === questions.length ? 'Parfait ! 🎉' : 'Continuez à réviser !'}</span>
                </div>
            )}

            <div className="el-quiz-questions">
                {questions.map((q, qi) => (
                    <div key={q.id} className="el-quiz-question">
                        <p className="el-quiz-q">{qi + 1}. {q.question}</p>
                        <div className="el-quiz-options">
                            {q.options.map((opt, oi) => {
                                const selected  = answers[qi] === oi;
                                const isCorrect = submitted && oi === q.correctIndex;
                                const isWrong   = submitted && selected && oi !== q.correctIndex;
                                return (
                                    <button
                                        key={oi} disabled={submitted}
                                        onClick={() => { const n = [...answers]; n[qi] = oi; setAnswers(n); }}
                                        className={['el-quiz-option', isCorrect ? 'el-quiz-option--correct' : '', isWrong ? 'el-quiz-option--wrong' : '', !submitted && selected ? 'el-quiz-option--selected' : ''].filter(Boolean).join(' ')}
                                    >{opt}</button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {!submitted && (
                <IonButton expand="block" color="primary" disabled={answers.includes(null)} onClick={handleSubmit} className="el-submit-btn">
                    <IonIcon slot="start" icon={checkmarkCircleOutline} /> Soumettre le quiz
                </IonButton>
            )}
        </div>
    );
};

/* ════════════════════════════════
   Vue Vidéo / Document
════════════════════════════════ */
const MediaView: React.FC<{ lesson: Lesson; courseId: string; studentId: string; onBack: () => void }> = ({ lesson, courseId, studentId, onBack }) => {
    const [done, setDone] = useState(() => {
        const p = studentId ? getLessonProgress(studentId, lesson.id) : undefined;
        return p?.completed ?? false;
    });

    const handleComplete = () => {
        persistComplete(studentId, lesson.id, courseId);
        setDone(true);
    };

    return (
        <div className="el-video">
            <button className="el-back-btn" onClick={onBack}>
                <IonIcon icon={arrowBackOutline} /> Retour au cours
            </button>

            <h2 className="el-video-title">{lesson.title}</h2>

            {lesson.type === 'video' ? (
                lesson.file_url ? (
                    <div style={{ borderRadius:'16px', overflow:'hidden', border:'1.5px solid var(--ion-color-light-shade)', background:'#000' }}>
                        <video controls style={{ width:'100%', display:'block', maxHeight:'480px' }} src={lesson.file_url} onEnded={handleComplete}>
                            Votre navigateur ne supporte pas la lecture vidéo.
                        </video>
                    </div>
                ) : (
                    <div className="el-video-player">
                        <div className="el-video-placeholder">
                            <div className="el-video-play-wrap">
                                <IonIcon icon={playOutline} className="el-video-play-icon" />
                            </div>
                            <p className="el-video-duration">{lesson.duration}</p>
                            <p className="el-video-note">Aucune vidéo liée — ajoutez une URL dans les paramètres de la leçon.</p>
                        </div>
                    </div>
                )
            ) : (
                lesson.file_url ? (
                    <div style={{ borderRadius:'16px', overflow:'hidden', border:'1.5px solid var(--ion-color-light-shade)', height:'600px' }}>
                        <iframe src={lesson.file_url} style={{ width:'100%', height:'100%', border:'none' }} title={lesson.title} />
                    </div>
                ) : (
                    <div className="el-video-player">
                        <div className="el-video-placeholder">
                            <div className="el-video-play-wrap">
                                <IonIcon icon={documentTextOutline} className="el-video-play-icon" />
                            </div>
                            <p className="el-video-duration">Document PDF — {lesson.duration}</p>
                            <p className="el-video-note">Aucun fichier lié à cette leçon.</p>
                        </div>
                    </div>
                )
            )}

            <Card variant="default" className="el-video-desc-card">
                <CardContent padding="md">
                    <h3 className="el-video-desc-title">Description</h3>
                    <p className="el-video-desc-text">
                        Suivez attentivement ce contenu et prenez des notes pour les activités suivantes.
                    </p>
                </CardContent>
            </Card>

            {done ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.875rem', borderRadius:'12px', background:'rgba(var(--ion-color-success-rgb),0.1)', border:'1.5px solid rgba(var(--ion-color-success-rgb),0.25)', color:'var(--ion-color-success)', fontWeight:600 }}>
                    <IonIcon icon={checkmarkCircleOutline} /> Leçon terminée
                </div>
            ) : (
                <IonButton expand="block" color="success" className="el-done-btn" onClick={handleComplete}>
                    <IonIcon slot="start" icon={checkmarkCircleOutline} /> Marquer comme terminé
                </IonButton>
            )}
        </div>
    );
};

/* ════════════════════════════════
   Détail d'un cours (vue leçons)
════════════════════════════════ */
interface CourseDetailViewProps {
    course: CourseData;
    onBack: () => void;
    isProf: boolean;
    studentId: string;
}

const CourseDetailView: React.FC<CourseDetailViewProps> = ({ course, onBack, isProf, studentId }) => {
    const [activeLesson,  setActiveLesson]  = useState<Lesson | null>(null);
    const [lessonModal,   setLessonModal]   = useState(false);
    const [editLesson,    setEditLesson]    = useState<Lesson | null>(null);
    const [refreshKey,    setRefreshKey]    = useState(0);

    const lessons      = getLessonsForCourse(course.id);
    const completedIds = isProf ? new Set<string>() : getCompletedLessonIds(studentId, course.id);
    const completedCnt = isProf ? lessons.filter(l => l.completed).length : completedIds.size;
    const progress     = lessons.length > 0 ? Math.round((completedCnt / lessons.length) * 100) : 0;

    const handleSaveLesson = () => setRefreshKey(k => k + 1);

    const handleDeleteLesson = (id: string) => {
        if (window.confirm('Supprimer cette leçon ?')) {
            deleteLesson(id);
            setRefreshKey(k => k + 1);
        }
    };

    if (activeLesson) {
        const fresh = getLessonsForCourse(course.id).find(l => l.id === activeLesson.id) ?? activeLesson;
        if (fresh.type === 'quiz' || fresh.type === 'exam') {
            return <QuizView lesson={fresh} courseId={course.id} studentId={studentId} onBack={() => { setActiveLesson(null); setRefreshKey(k => k + 1); }} />;
        }
        return <MediaView lesson={fresh} courseId={course.id} studentId={studentId} onBack={() => { setActiveLesson(null); setRefreshKey(k => k + 1); }} />;
    }

    return (
        <div className="el-detail" key={refreshKey}>
            <button className="el-back-btn" onClick={onBack}>
                <IonIcon icon={arrowBackOutline} /> Tous les cours
            </button>

            {/* Header */}
            <Card variant="default" className="el-detail-header-card">
                <CardContent padding="md">
                    <div className="el-detail-header">
                        <div className="el-detail-header-info">
                            <h2 className="el-detail-name">{course.name}</h2>
                            <p className="el-detail-teacher">{course.teacher} • {course.filiere} {course.annee}</p>
                            {course.description && <p className="el-detail-desc">{course.description}</p>}
                        </div>
                        <IonChip className="el-detail-chip">
                            {completedCnt}/{lessons.length} leçons
                        </IonChip>
                    </div>
                    <div className="el-detail-progress">
                        <IonProgressBar value={progress / 100} className="el-detail-progress-bar" />
                        <span className="el-detail-pct">{progress}%</span>
                    </div>
                </CardContent>
            </Card>

            {/* Barre actions prof */}
            {isProf && (
                <div className="el-prof-actions">
                    <IonButton
                        fill="outline" size="small"
                        onClick={() => { setEditLesson(null); setLessonModal(true); }}
                    >
                        <IonIcon slot="start" icon={addOutline} /> Ajouter une leçon
                    </IonButton>
                </div>
            )}

            {/* Leçons */}
            <h3 className="el-lessons-title">Contenu du cours</h3>
            <div className="el-lessons-list">
                {lessons.length === 0 ? (
                    <div className="el-empty">
                        <IonIcon icon={layersOutline} className="el-empty-icon" />
                        <p>Aucune leçon — {isProf ? 'ajoutez du contenu ci-dessus.' : 'contenu à venir.'}</p>
                    </div>
                ) : (
                    lessons.map((lesson) => {
                        const isDone = isProf ? lesson.completed : completedIds.has(lesson.id);
                        return (
                        <div key={lesson.id} className="el-lesson-row">
                            <button
                                disabled={lesson.locked && !isProf}
                                onClick={() => (!lesson.locked || isProf) && setActiveLesson(lesson)}
                                className={[
                                    'el-lesson-item',
                                    lesson.locked && !isProf ? 'el-lesson-item--locked'    : '',
                                    isDone                   ? 'el-lesson-item--completed' : '',
                                ].filter(Boolean).join(' ')}
                            >
                                <div className={[
                                    'el-lesson-icon',
                                    lesson.locked && !isProf ? 'el-lesson-icon--locked'    : '',
                                    isDone                   ? 'el-lesson-icon--completed' : `el-lesson-icon--${lesson.type}`,
                                ].filter(Boolean).join(' ')}>
                                    <IonIcon icon={
                                        lesson.locked && !isProf ? lockClosedOutline :
                                        isDone                   ? checkmarkCircleOutline :
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
                                            <IonIcon icon={timeOutline} /> {lesson.duration}
                                        </span>
                                    </div>
                                </div>
                                {(!lesson.locked || isProf) && (
                                    <IonIcon icon={chevronForwardOutline} className="el-lesson-arrow" />
                                )}
                            </button>

                            {/* Actions prof */}
                            {isProf && (
                                <div className="el-lesson-prof-actions">
                                    <IonButton fill="clear" size="small" color="medium"
                                        onClick={() => { setEditLesson(lesson); setLessonModal(true); }}>
                                        <IonIcon slot="icon-only" icon={createOutline} />
                                    </IonButton>
                                    <IonButton fill="clear" size="small" color="danger"
                                        onClick={() => handleDeleteLesson(lesson.id)}>
                                        <IonIcon slot="icon-only" icon={trashOutline} />
                                    </IonButton>
                                </div>
                            )}
                        </div>
                        );
                    })
                )}
            </div>

            {/* Modal leçon */}
            {isProf && (
                <LessonModal
                    isOpen={lessonModal}
                    courseId={course.id}
                    initial={editLesson}
                    nextOrder={lessons.length + 1}
                    onClose={() => setLessonModal(false)}
                    onSave={handleSaveLesson}
                />
            )}
        </div>
    );
};

/* ════════════════════════════════
   Page principale E-Learning
════════════════════════════════ */
const ELearning: React.FC = () => {
    const { user }                          = useAuth();
    const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
    const [search,         setSearch]         = useState('');

    if (!user) return null;

    const isProf = isProfessor(user.role);

    const courses = isProf
        ? getCoursesForProfessor(user.nom_complet)
        : getAllCourses();

    const filtered = courses.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.teacher.toLowerCase().includes(search.toLowerCase())
    );

    const totalLessons = courses.reduce((a, c) => a + getLessonsForCourse(c.id).length, 0);
    const doneLessons  = isProf
        ? courses.reduce((a, c) => a + getLessonsForCourse(c.id).filter(l => l.completed).length, 0)
        : courses.reduce((a, c) => {
            const lessons = getLessonsForCourse(c.id);
            return a + getCourseProgressPercent(user.id, c.id, lessons.length) * lessons.length / 100;
          }, 0);
    const totalProgress = courses.length > 0
        ? Math.round(courses.reduce((a, c) => {
            const lessons = getLessonsForCourse(c.id);
            return a + (isProf ? c.progress : getCourseProgressPercent(user.id, c.id, lessons.length));
          }, 0) / courses.length)
        : 0;

    if (selectedCourse) {
        return (
            <DashboardLayout>
                <CourseDetailView
                    course={selectedCourse}
                    onBack={() => setSelectedCourse(null)}
                    isProf={isProf}
                    studentId={user.id}
                />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* ── Hero ── */}
            <div className="el-hero">
                <div className="el-hero-text">
                    <h1 className="el-hero-title">{isProf ? 'E-Learning — Mes cours 📚' : 'E-Learning 📖'}</h1>
                    <p className="el-hero-sub">
                        {isProf
                            ? 'Gérez le contenu pédagogique de vos cours.'
                            : 'Vidéos, quiz et examens pour chaque cours.'}
                    </p>
                    <div className="el-hero-badges">
                        <span className="el-hero-badge"><IonIcon icon={bookOutline} />{courses.length} cours</span>
                        <span className="el-hero-badge"><IonIcon icon={layersOutline} />{doneLessons}/{totalLessons} leçons</span>
                        {!isProf && <span className="el-hero-badge"><IonIcon icon={schoolOutline} />{totalProgress}% progression</span>}
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

            {/* ── Grille ── */}
            {filtered.length === 0 ? (
                <div className="el-empty">
                    <IonIcon icon={bookOutline} className="el-empty-icon" />
                    <p>Aucun cours trouvé.</p>
                </div>
            ) : (
                <div className="el-grid">
                    {filtered.map(course => {
                        const lessons      = getLessonsForCourse(course.id);
                        const completedCnt = lessons.filter(l => l.completed).length;
                        return (
                            <button key={course.id} className="el-course-card" onClick={() => setSelectedCourse(course)}>
                                <div className="el-course-card-top">
                                    <div className="el-course-icon"><IonIcon icon={bookOutline} /></div>
                                    <div className="el-course-badges">
                                        <Badge variant="info"      size="sm">{course.filiere}</Badge>
                                        <Badge variant="secondary" size="sm">{course.annee}</Badge>
                                    </div>
                                </div>
                                <h3 className="el-course-name">{course.name}</h3>
                                <p className="el-course-teacher">{course.teacher}</p>
                                {course.description && <p className="el-course-desc">{course.description}</p>}
                                <div className="el-course-meta">
                                    <span className="el-course-meta-item">
                                        <IonIcon icon={layersOutline} />
                                        {completedCnt}/{lessons.length} leçons
                                    </span>
                                    <span className="el-course-pct">{course.progress}%</span>
                                </div>
                                <IonProgressBar value={course.progress / 100} className="el-course-progress" />
                                <div className="el-course-footer">
                                    <IonIcon icon={chevronForwardOutline} className="el-course-arrow" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
};

export default ELearning;
