import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonInput, IonTextarea, IonChip,
} from '../lib/ionic';
import {
    chatbubblesOutline, bookOutline, arrowBackOutline,
    sendOutline, pinOutline, addCircleOutline,
    checkmarkCircleOutline, closeCircleOutline, personOutline,
    timeOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { isStudent } from '../lib/store';
import { getCoursesForStudent, getCoursesForProfessor, CourseData } from '../lib/courses-data';
import {
    getForumPosts, createForumPost, addReply, ForumPost,
} from '../lib/forum-store';
import { Badge, Card, CardContent } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Forum.css';

/* ════════════════════════════════
   Vue détail d'un post
════════════════════════════════ */
const PostDetail: React.FC<{
    post:     ForumPost;
    courseId: string;
    onBack:   () => void;
}> = ({ post: initialPost, courseId, onBack }) => {
    const { user }           = useAuth();
    const [reply, setReply]  = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    if (!user) return null;

    // Lire le post frais depuis le store à chaque render
    const post = getForumPosts(courseId).find(p => p.id === initialPost.id) ?? initialPost;

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;
        addReply(post.id, { author_id: user.id, author_name: user.nom_complet, content: reply });
        setReply('');
        setRefreshKey(k => k + 1);
    };

    return (
        <div className="fr-detail">
            <IonButton fill="clear" size="small" className="fr-back-btn" onClick={onBack}>
                <IonIcon slot="start" icon={arrowBackOutline} />
                Retour au forum
            </IonButton>

            {/* Post principal */}
            <Card variant="default" className="fr-detail-card">
                <CardContent padding="md">
                    <div className="fr-detail-header">
                        {post.pinned && (
                            <Badge variant="warning" size="sm">
                                <IonIcon icon={pinOutline} />Épinglé
                            </Badge>
                        )}
                        <h2 className="fr-detail-title">{post.title}</h2>
                        <div className="fr-detail-meta">
                            <div className="fr-detail-avatar">{post.author_name.charAt(0).toUpperCase()}</div>
                            <span className="fr-detail-author">{post.author_name}</span>
                            <IonIcon icon={timeOutline} className="fr-meta-icon" />
                            <span>{new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                    <p className="fr-detail-content">{post.content}</p>
                </CardContent>
            </Card>

            {/* Réponses */}
            <div className="fr-replies-section">
                <h3 className="fr-replies-title">
                    {post.replies.length} réponse{post.replies.length !== 1 ? 's' : ''}
                </h3>

                {post.replies.length > 0 && (
                    <div className="fr-replies-list">
                        {post.replies.map(r => (
                            <div key={r.id} className="fr-reply">
                                <div className="fr-reply-avatar">{r.author_name.charAt(0).toUpperCase()}</div>
                                <div className="fr-reply-body">
                                    <div className="fr-reply-meta">
                                        <span className="fr-reply-author">{r.author_name}</span>
                                        <span className="fr-reply-date">
                                            {new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <p className="fr-reply-content">{r.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Champ réponse */}
                <form onSubmit={handleReply} className="fr-reply-form">
                    <div className="fr-reply-input-wrap">
                        <div className="fr-reply-input-avatar">
                            {user.nom_complet.charAt(0).toUpperCase()}
                        </div>
                        <IonTextarea
                            className="fr-reply-textarea"
                            value={reply}
                            onIonInput={e => setReply(String(e.detail.value ?? ''))}
                            placeholder="Votre réponse…"
                            rows={2}
                            autoGrow
                        />
                    </div>
                    <div className="fr-reply-submit">
                        <IonButton type="submit" color="primary" size="small" disabled={!reply.trim()} className="fr-send-btn">
                            <IonIcon slot="start" icon={sendOutline} />
                            Répondre
                        </IonButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ════════════════════════════════
   Vue liste des posts d'un cours
════════════════════════════════ */
const CourseForumView: React.FC<{
    course: CourseData;
    onBack: () => void;
    onPost: (post: ForumPost) => void;
}> = ({ course, onBack, onPost }) => {
    const { user }             = useAuth();
    const [fTitle,   setFTitle]   = useState('');
    const [fContent, setFContent] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    if (!user) return null;

    const posts = getForumPosts(course.id);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fTitle.trim() || !fContent.trim()) return;
        createForumPost({
            course_id:   course.id,
            author_id:   user.id,
            author_name: user.nom_complet,
            title:       fTitle,
            content:     fContent,
        });
        setFTitle(''); setFContent('');
        setFormOpen(false);
        setRefreshKey(k => k + 1);
    };

    return (
        <div className="fr-course-view">
            <div className="fr-course-view-header">
                <IonButton fill="clear" size="small" className="fr-back-btn" onClick={onBack}>
                    <IonIcon slot="start" icon={arrowBackOutline} />
                    Tous les cours
                </IonButton>
                <div className="fr-course-view-info">
                    <h2 className="fr-course-view-title">{course.name}</h2>
                    <p className="fr-course-view-meta">{course.filiere} {course.annee} • {posts.length} discussion{posts.length !== 1 ? 's' : ''}</p>
                </div>
                <IonButton fill="outline" size="small" color="primary" onClick={() => setFormOpen(v => !v)}>
                    <IonIcon slot="start" icon={formOpen ? closeCircleOutline : addCircleOutline} />
                    {formOpen ? 'Annuler' : 'Nouvelle discussion'}
                </IonButton>
            </div>

            {/* Formulaire nouveau sujet */}
            {formOpen && (
                <Card variant="default" className="fr-new-post-card">
                    <CardContent padding="md">
                        <form onSubmit={handleCreate} className="fr-new-post-form">
                            <div className="fr-field">
                                <label className="fr-field-label">Titre <span className="fr-required">*</span></label>
                                <IonInput className="fr-field-input" value={fTitle} onIonInput={e => setFTitle(String(e.detail.value ?? ''))} placeholder="Titre de la discussion" required />
                            </div>
                            <div className="fr-field">
                                <label className="fr-field-label">Message <span className="fr-required">*</span></label>
                                <IonTextarea className="fr-field-textarea" value={fContent} onIonInput={e => setFContent(String(e.detail.value ?? ''))} placeholder="Contenu de votre discussion…" rows={4} required />
                            </div>
                            <IonButton type="submit" size="small" color="primary" disabled={!fTitle.trim() || !fContent.trim()}>
                                <IonIcon slot="start" icon={checkmarkCircleOutline} />
                                Publier
                            </IonButton>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Liste des posts */}
            {posts.length === 0 ? (
                <div className="fr-empty">
                    <IonIcon icon={chatbubblesOutline} className="fr-empty-icon" />
                    <p>Aucune discussion. Soyez le premier à poster !</p>
                </div>
            ) : (
                <div className="fr-posts-list">
                    {posts.map(p => (
                        <button key={p.id} className="fr-post-item" onClick={() => onPost(p)}>
                            <div className="fr-post-item-left">
                                {p.pinned && <IonIcon icon={pinOutline} className="fr-pin-icon" />}
                                <div className="fr-post-item-body">
                                    <p className="fr-post-title">{p.title}</p>
                                    <p className="fr-post-meta">
                                        <IonIcon icon={personOutline} />{p.author_name}
                                        <IonIcon icon={timeOutline} />{new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                            <IonChip className="fr-reply-chip">{p.replies.length}</IonChip>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════
   Page principale — liste des cours
════════════════════════════════ */
const Forum: React.FC = () => {
    const { user } = useAuth();
    const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
    const [selectedPost,   setSelectedPost]   = useState<ForumPost | null>(null);

    if (!user) return null;

    const courses = isStudent(user.role)
        ? getCoursesForStudent(user.filiere, user.annee, user.option)
        : getCoursesForProfessor(user.nom_complet);

    return (
        <DashboardLayout>
            <div className="fr-page">

                {/* Hero — toujours visible */}
                {!selectedPost && (
                    <div className="fr-hero">
                        <div className="fr-hero-text">
                            <h1 className="fr-hero-title">Forum de discussion</h1>
                            <p className="fr-hero-sub">Échangez et posez vos questions par cours.</p>
                            <div className="fr-hero-badges">
                                <span className="fr-hero-badge">
                                    <IonIcon icon={bookOutline} />{courses.length} cours
                                </span>
                                <span className="fr-hero-badge">
                                    <IonIcon icon={chatbubblesOutline} />
                                    {courses.reduce((a, c) => a + getForumPosts(c.id).length, 0)} discussions
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation imbriquée */}
                {selectedPost && selectedCourse ? (
                    <PostDetail
                        post={selectedPost}
                        courseId={selectedCourse.id}
                        onBack={() => setSelectedPost(null)}
                    />
                ) : selectedCourse ? (
                    <CourseForumView
                        course={selectedCourse}
                        onBack={() => setSelectedCourse(null)}
                        onPost={p => setSelectedPost(p)}
                    />
                ) : (
                    /* Grille des cours */
                    <div className="fr-courses-grid">
                        {courses.length === 0 ? (
                            <div className="fr-empty">
                                <IonIcon icon={bookOutline} className="fr-empty-icon" />
                                <p>Aucun cours disponible.</p>
                            </div>
                        ) : courses.map(c => {
                            const count = getForumPosts(c.id).length;
                            return (
                                <button key={c.id} className="fr-course-card" onClick={() => setSelectedCourse(c)}>
                                    <div className="fr-course-icon">
                                        <IonIcon icon={bookOutline} />
                                    </div>
                                    <div className="fr-course-body">
                                        <p className="fr-course-name">{c.name}</p>
                                        <p className="fr-course-meta">{c.teacher} • {c.filiere} {c.annee}</p>
                                    </div>
                                    <IonChip className={`fr-post-count ${count > 0 ? 'fr-post-count--active' : ''}`}>
                                        {count}
                                    </IonChip>
                                </button>
                            );
                        })}
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default Forum;
