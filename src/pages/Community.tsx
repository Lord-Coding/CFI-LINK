import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonSegment,
    IonSegmentButton, IonLabel, IonTextarea,
} from '../lib/ionic';
import {
    chatbubblesOutline, peopleOutline, heartOutline, heart,
    sendOutline, personOutline, schoolOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { getUsers, isStudent, FILIERE_LABELS } from '../lib/store';
import { Badge } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Community.css';

/* ── Posts mockés ── */
interface Post {
    id:      string;
    author:  string;
    initials: string;
    content: string;
    date:    string;
    likes:   number;
    replies: number;
}

const MOCK_POSTS: Post[] = [
    { id: '1', author: 'Jean Kamga',    initials: 'J', content: "Quelqu'un a les notes du TD d'algorithmique de la semaine dernière ?", date: 'Il y a 2h',  likes: 5,  replies: 3  },
    { id: '2', author: 'Marie Nkoulou', initials: 'M', content: "Le projet tutoré de base de données est à rendre vendredi. N'oubliez pas !",              date: 'Il y a 5h',  likes: 12, replies: 7  },
    { id: '3', author: 'Paul Essomba',  initials: 'P', content: 'Super cours de réseaux aujourd\'hui ! Le prof a bien expliqué les sous-réseaux.',            date: 'Hier',        likes: 8,  replies: 2  },
    { id: '4', author: 'Sophie Mbarga', initials: 'S', content: 'Qui est intéressé par un groupe d\'étude pour les examens de fin de semestre ?',             date: 'Hier',        likes: 15, replies: 11 },
];

type TabKey = 'feed' | 'members';

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const Community: React.FC = () => {
    const { user }   = useAuth();
    const [tab,      setTab]      = useState<TabKey>('feed');
    const [search,   setSearch]   = useState('');
    const [newPost,  setNewPost]  = useState('');
    const [posts,    setPosts]    = useState<Post[]>(MOCK_POSTS);
    const [liked,    setLiked]    = useState<Set<string>>(new Set());

    if (!user) return null;

    const students = getUsers().filter(u => isStudent(u.role) && u.is_active);

    const q = search.toLowerCase().trim();
    const filteredStudents = students.filter(s =>
        !q ||
        s.nom_complet.toLowerCase().includes(q) ||
        s.filiere?.toLowerCase().includes(q)
    );

    const handlePublish = () => {
        if (!newPost.trim()) return;
        const p: Post = {
            id:       crypto.randomUUID(),
            author:   user.nom_complet,
            initials: user.nom_complet.charAt(0).toUpperCase(),
            content:  newPost.trim(),
            date:     'À l\'instant',
            likes:    0,
            replies:  0,
        };
        setPosts([p, ...posts]);
        setNewPost('');
    };

    const toggleLike = (id: string) => {
        setLiked(prev => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); } else { next.add(id); }
            return next;
        });
        setPosts(prev => prev.map(p =>
            p.id === id ? { ...p, likes: p.likes + (liked.has(id) ? -1 : 1) } : p
        ));
    };

    const initials = user.nom_complet.charAt(0).toUpperCase();

    return (
        <DashboardLayout>
            <div className="co-page">

                {/* ── Hero ── */}
                <div className="co-hero">
                    <div className="co-hero-text">
                        <h1 className="co-hero-title">Communauté</h1>
                        <p className="co-hero-sub">Échangez avec vos camarades de promotion.</p>
                        <div className="co-hero-badges">
                            <span className="co-hero-badge">
                                <IonIcon icon={peopleOutline} />{students.length} étudiants actifs
                            </span>
                            <span className="co-hero-badge">
                                <IonIcon icon={chatbubblesOutline} />{posts.length} publications
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Segment ── */}
                <IonSegment
                    mode="ios"
                    value={tab}
                    className="co-segment"
                    onIonChange={e => setTab(String(e.detail.value) as TabKey)}
                >
                    <IonSegmentButton value="feed" className="co-seg-btn">
                        <IonLabel>
                            <IonIcon icon={chatbubblesOutline} />
                            Fil d'actualité
                        </IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="members" className="co-seg-btn">
                        <IonLabel>
                            <IonIcon icon={peopleOutline} />
                            Membres ({students.length})
                        </IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                {/* ════ Onglet Fil d'actualité ════ */}
                {tab === 'feed' && (
                    <div className="co-feed">

                        {/* Composer */}
                        <div className="co-composer">
                            <div className="co-composer-avatar">{initials}</div>
                            <div className="co-composer-right">
                                <IonTextarea
                                    className="co-composer-input"
                                    value={newPost}
                                    onIonInput={e => setNewPost(String(e.detail.value ?? ''))}
                                    placeholder="Quoi de neuf ?"
                                    rows={2}
                                    autoGrow
                                />
                                <div className="co-composer-footer">
                                    <IonButton
                                        fill="solid"
                                        color="primary"
                                        size="small"
                                        disabled={!newPost.trim()}
                                        onClick={handlePublish}
                                        className="co-publish-btn"
                                    >
                                        <IonIcon slot="start" icon={sendOutline} />
                                        Publier
                                    </IonButton>
                                </div>
                            </div>
                        </div>

                        {/* Posts */}
                        <div className="co-posts-list">
                            {posts.map(p => (
                                <div key={p.id} className="co-post">
                                    <div className="co-post-header">
                                        <div className="co-post-avatar">{p.initials}</div>
                                        <div className="co-post-meta">
                                            <span className="co-post-author">{p.author}</span>
                                            <span className="co-post-date">{p.date}</span>
                                        </div>
                                    </div>
                                    <p className="co-post-content">{p.content}</p>
                                    <div className="co-post-actions">
                                        <button
                                            className={`co-action-btn ${liked.has(p.id) ? 'co-action-btn--liked' : ''}`}
                                            onClick={() => toggleLike(p.id)}
                                        >
                                            <IonIcon icon={liked.has(p.id) ? heart : heartOutline} />
                                            {p.likes}
                                        </button>
                                        <button className="co-action-btn">
                                            <IonIcon icon={chatbubblesOutline} />
                                            {p.replies} réponse{p.replies !== 1 ? 's' : ''}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ════ Onglet Membres ════ */}
                {tab === 'members' && (
                    <div className="co-members">
                        <IonSearchbar
                            value={search}
                            onIonInput={e => setSearch(String(e.detail.value ?? ''))}
                            placeholder="Rechercher un membre…"
                            className="co-searchbar"
                            debounce={200}
                        />

                        {filteredStudents.length === 0 ? (
                            <div className="co-empty">
                                <IonIcon icon={peopleOutline} className="co-empty-icon" />
                                <p>Aucun membre trouvé.</p>
                            </div>
                        ) : (
                            <div className="co-members-grid">
                                {filteredStudents.map(s => (
                                    <div key={s.id} className="co-member-card">
                                        <div className="co-member-avatar">
                                            {s.nom_complet.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="co-member-body">
                                            <p className="co-member-name">{s.nom_complet}</p>
                                            <p className="co-member-meta">
                                                {s.filiere ? FILIERE_LABELS[s.filiere] : '—'}
                                                {s.annee ? ` — ${s.annee}` : ''}
                                                {s.option ? ` (${s.option})` : ''}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={s.role === 'etudiant_concours' ? 'default' : 'info'}
                                            size="sm"
                                        >
                                            {s.role === 'etudiant_concours' ? 'Concours' : 'Externe'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default Community;
