import React, { useState, useCallback } from 'react';
import { IonButton, IonIcon, IonTextarea } from '../lib/ionic';
import {
    chatbubblesOutline, arrowBackOutline, sendOutline, pinOutline,
    addCircleOutline, closeCircleOutline, personOutline, timeOutline,
    checkmarkCircleOutline, lockClosedOutline, chevronForwardOutline,
    chevronBackOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { isStudent } from '../lib/store';
import {
    getRecentPosts, getTotalPostCount, createForumPost, addReply,
    addNestedReply, initializeForum, ForumPost, ForumReply,
} from '../lib/forum-store';
import { Badge, Card, CardContent } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Forum.css';

initializeForum();

const PAGE_SIZE = 20;

/* ── Helpers ── */
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatShort(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/* ════════════════════════════════
   Composant réponse imbriquée
════════════════════════════════ */
interface ReplyItemProps {
    reply:    ForumReply;
    postId:   string;
    depth:    number;
    onNested: (parentId: string) => void;
    replyingTo: string | null;
    nestedDraft: string;
    setNestedDraft: (v: string) => void;
    submitNested: (parentId: string) => void;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
    reply, postId, depth, onNested, replyingTo, nestedDraft, setNestedDraft, submitNested,
}) => (
    <div className={`fr-reply ${depth > 0 ? 'fr-reply--nested' : ''}`}>
        <div className="fr-reply-avatar">{reply.author_name.charAt(0).toUpperCase()}</div>
        <div className="fr-reply-body">
            <div className="fr-reply-meta">
                <span className="fr-reply-author">{reply.author_name}</span>
                <span className="fr-reply-date">{formatShort(reply.date)}</span>
            </div>
            <p className="fr-reply-content">{reply.content}</p>

            {/* Bouton répondre à cette réponse (1 niveau max) */}
            {depth === 0 && (
                <button className="fr-reply-thread-btn" onClick={() => onNested(reply.id)}>
                    <IonIcon icon={chevronForwardOutline} /> Répondre
                </button>
            )}

            {/* Formulaire inline réponse imbriquée */}
            {replyingTo === reply.id && (
                <div className="fr-nested-form">
                    <IonTextarea
                        className="fr-reply-textarea fr-reply-textarea--sm"
                        value={nestedDraft}
                        onIonInput={e => setNestedDraft(String(e.detail.value ?? ''))}
                        placeholder={`Répondre à ${reply.author_name}…`}
                        rows={2}
                        autoGrow
                    />
                    <div className="fr-nested-actions">
                        <IonButton fill="clear" size="small" color="medium" onClick={() => onNested('')}>Annuler</IonButton>
                        <IonButton size="small" color="primary" disabled={!nestedDraft.trim()} onClick={() => submitNested(reply.id)}>
                            <IonIcon slot="start" icon={sendOutline} />Envoyer
                        </IonButton>
                    </div>
                </div>
            )}

            {/* Réponses imbriquées */}
            {(reply.replies ?? []).map(r => (
                <div key={r.id} className="fr-reply fr-reply--nested">
                    <div className="fr-reply-avatar fr-reply-avatar--sm">{r.author_name.charAt(0).toUpperCase()}</div>
                    <div className="fr-reply-body">
                        <div className="fr-reply-meta">
                            <span className="fr-reply-author">{r.author_name}</span>
                            <span className="fr-reply-date">{formatShort(r.date)}</span>
                        </div>
                        <p className="fr-reply-content">{r.content}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/* ════════════════════════════════
   Détail d'un post
════════════════════════════════ */
const PostDetail: React.FC<{ post: ForumPost; onBack: () => void }> = ({ post: initial, onBack }) => {
    const { user }              = useAuth();
    const [reply, setReply]     = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [nestedDraft, setNestedDraft] = useState('');

    if (!user) return null;

    // Relit depuis le store à chaque render
    const posts = getRecentPosts(1000);
    const post  = posts.find(p => p.id === initial.id) ?? initial;

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;
        addReply(post.id, { author_id: user.id, author_name: user.nom_complet, content: reply });
        setReply('');
        setRefreshKey(k => k + 1);
    };

    const handleNested = useCallback((parentId: string) => {
        setReplyingTo(parentId || null);
        setNestedDraft('');
    }, []);

    const submitNested = useCallback((parentId: string) => {
        if (!nestedDraft.trim()) return;
        addNestedReply(post.id, parentId, { author_id: user.id, author_name: user.nom_complet, content: nestedDraft });
        setReplyingTo(null);
        setNestedDraft('');
        setRefreshKey(k => k + 1);
    }, [nestedDraft, post.id, user]);

    return (
        <div className="fr-detail" key={refreshKey}>
            <IonButton fill="clear" size="small" className="fr-back-btn" onClick={onBack}>
                <IonIcon slot="start" icon={arrowBackOutline} />Retour au forum
            </IonButton>

            <Card variant="default" className="fr-detail-card">
                <CardContent padding="md">
                    <div className="fr-detail-header">
                        {post.pinned && <Badge variant="warning" size="sm"><IonIcon icon={pinOutline} />Épinglé</Badge>}
                        <h2 className="fr-detail-title">{post.title}</h2>
                        <div className="fr-detail-meta">
                            <div className="fr-detail-avatar">{post.author_name.charAt(0).toUpperCase()}</div>
                            <span className="fr-detail-author">{post.author_name}</span>
                            <IonIcon icon={timeOutline} className="fr-meta-icon" />
                            <span>{formatDate(post.date)}</span>
                        </div>
                    </div>
                    <p className="fr-detail-content">{post.content}</p>
                </CardContent>
            </Card>

            <div className="fr-replies-section">
                <h3 className="fr-replies-title">
                    {post.replies.length} réponse{post.replies.length !== 1 ? 's' : ''}
                </h3>

                {post.replies.length > 0 && (
                    <div className="fr-replies-list">
                        {post.replies.map(r => (
                            <ReplyItem
                                key={r.id}
                                reply={r}
                                postId={post.id}
                                depth={0}
                                onNested={handleNested}
                                replyingTo={replyingTo}
                                nestedDraft={nestedDraft}
                                setNestedDraft={setNestedDraft}
                                submitNested={submitNested}
                            />
                        ))}
                    </div>
                )}

                <form onSubmit={handleReply} className="fr-reply-form">
                    <div className="fr-reply-input-wrap">
                        <div className="fr-reply-input-avatar">{user.nom_complet.charAt(0).toUpperCase()}</div>
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
                            <IonIcon slot="start" icon={sendOutline} />Répondre
                        </IonButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ════════════════════════════════
   Fil de discussion principal
════════════════════════════════ */
const ForumTimeline: React.FC<{ onPost: (p: ForumPost) => void }> = ({ onPost }) => {
    const { user }                    = useAuth();
    const [page,       setPage]       = useState(0);
    const [formOpen,   setFormOpen]   = useState(false);
    const [fTitle,     setFTitle]     = useState('');
    const [fContent,   setFContent]   = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    if (!user) return null;

    const total    = getTotalPostCount();
    const posts    = getRecentPosts(PAGE_SIZE, page * PAGE_SIZE);
    const maxPage  = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fTitle.trim() || !fContent.trim()) return;
        createForumPost({ course_id: 'general', author_id: user.id, author_name: user.nom_complet, title: fTitle, content: fContent });
        setFTitle(''); setFContent('');
        setFormOpen(false);
        setPage(0);                        // revenir à la première page
        setRefreshKey(k => k + 1);
    };

    return (
        <div key={refreshKey}>
            {/* Barre d'actions */}
            <div className="fr-timeline-toolbar">
                <span className="fr-timeline-count">{total} discussion{total !== 1 ? 's' : ''}</span>
                <IonButton fill="outline" size="small" color="primary" onClick={() => setFormOpen(v => !v)}>
                    <IonIcon slot="start" icon={formOpen ? closeCircleOutline : addCircleOutline} />
                    {formOpen ? 'Annuler' : 'Nouvelle discussion'}
                </IonButton>
            </div>

            {/* Formulaire nouveau post */}
            {formOpen && (
                <Card variant="default" className="fr-new-post-card">
                    <CardContent padding="md">
                        <form onSubmit={handleCreate} className="fr-new-post-form">
                            <div className="fr-field">
                                <label className="fr-field-label">Titre <span className="fr-required">*</span></label>
                                <input
                                    className="fr-field-input-native"
                                    value={fTitle}
                                    onChange={e => setFTitle(e.target.value)}
                                    placeholder="Titre de la discussion"
                                    required
                                />
                            </div>
                            <div className="fr-field">
                                <label className="fr-field-label">Message <span className="fr-required">*</span></label>
                                <IonTextarea
                                    className="fr-field-textarea"
                                    value={fContent}
                                    onIonInput={e => setFContent(String(e.detail.value ?? ''))}
                                    placeholder="Partagez votre question ou sujet de discussion…"
                                    rows={4}
                                    required
                                />
                            </div>
                            <IonButton type="submit" size="small" color="primary" disabled={!fTitle.trim() || !fContent.trim()}>
                                <IonIcon slot="start" icon={checkmarkCircleOutline} />Publier
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
                                <div className="fr-post-item-avatar">{p.author_name.charAt(0).toUpperCase()}</div>
                                <div className="fr-post-item-body">
                                    <p className="fr-post-title">{p.title}</p>
                                    <p className="fr-post-meta">
                                        <IonIcon icon={personOutline} />{p.author_name}
                                        <IonIcon icon={timeOutline} />{formatShort(p.date)}
                                    </p>
                                </div>
                            </div>
                            <div className="fr-post-item-right">
                                <span className="fr-reply-count">
                                    <IonIcon icon={chatbubblesOutline} />{p.replies.length}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {maxPage > 0 && (
                <div className="fr-pagination">
                    <IonButton fill="outline" size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                        <IonIcon slot="icon-only" icon={chevronBackOutline} />
                    </IonButton>
                    <span className="fr-pagination-label">Page {page + 1} / {maxPage + 1}</span>
                    <IonButton fill="outline" size="small" disabled={page >= maxPage} onClick={() => setPage(p => p + 1)}>
                        <IonIcon slot="icon-only" icon={chevronForwardOutline} />
                    </IonButton>
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════
   Page principale Forum
════════════════════════════════ */
const Forum: React.FC = () => {
    const { user }                = useAuth();
    const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);

    if (!user) return null;

    // Accès réservé aux étudiants uniquement
    if (!isStudent(user.role)) {
        return (
            <DashboardLayout>
                <div className="fr-restricted">
                    <IonIcon icon={lockClosedOutline} className="fr-restricted-icon" />
                    <h2 className="fr-restricted-title">Forum réservé aux étudiants</h2>
                    <p className="fr-restricted-sub">Cet espace d'échange est exclusivement accessible aux étudiants inscrits (concours et externes).</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="fr-page">
                {!selectedPost && (
                    <div className="fr-hero">
                        <div className="fr-hero-text">
                            <h1 className="fr-hero-title">Forum des étudiants</h1>
                            <p className="fr-hero-sub">Posez vos questions, partagez vos expériences, entraidez-vous.</p>
                            <div className="fr-hero-badges">
                                <span className="fr-hero-badge">
                                    <IonIcon icon={chatbubblesOutline} />{getTotalPostCount()} discussions
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {selectedPost ? (
                    <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
                ) : (
                    <ForumTimeline onPost={p => setSelectedPost(p)} />
                )}
            </div>
        </DashboardLayout>
    );
};

export default Forum;
