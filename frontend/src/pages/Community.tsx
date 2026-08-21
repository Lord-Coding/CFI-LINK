// @ts-nocheck
import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonSearchbar, IonSegment,
    IonSegmentButton, IonLabel, IonTextarea,
} from '../lib/ionic';
import {
    chatbubblesOutline, peopleOutline, heartOutline, heart,
    sendOutline, trashOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { isStudent, FILIERE_LABELS } from '../lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService, type ApiCommunityPost } from '../lib/services/communityService';
import { userService } from '../lib/services/userService';
import { Badge } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Community.css';

type TabKey = 'feed' | 'members';

const Community: React.FC = () => {
    const { user }  = useAuth();
    const qc        = useQueryClient();
    const [tab,     setTab]     = useState<TabKey>('feed');
    const [search,  setSearch]  = useState('');
    const [newPost, setNewPost] = useState('');

    if (!user) return null;

    const { data: posts = [] }    = useQuery<any[]>({ queryKey: ['community'], queryFn: communityService.list });
    const { data: allUsers = [] } = useQuery<any[]>({ queryKey: ['users', 'students'], queryFn: () => userService.list({ role: 'etudiant_concours' }) });
    const students = allUsers.filter((u: { is_active: boolean }) => u.is_active);

    const addMutation = useMutation<any,any,any>({
        mutationFn: communityService.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['community'] }); setNewPost(''); },
    });
    const likeMutation = useMutation<any,any,any>({
        mutationFn: communityService.toggleLike,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['community'] }),
    });
    const deleteMutation = useMutation<any,any,any>({
        mutationFn: communityService.delete,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['community'] }),
    });

    const q = search.toLowerCase().trim();
    const filteredStudents = students.filter((s: { nom_complet: string; filiere?: string }) =>
        !q || s.nom_complet.toLowerCase().includes(q) || (s.filiere ?? '').toLowerCase().includes(q)
    );

    const handlePublish = () => { if (!newPost.trim()) return; addMutation.mutate(newPost.trim()); };
    const handleLike    = (id: number) => likeMutation.mutate(id);
    const handleDelete  = (id: number) => deleteMutation.mutate(id);

    const initials = user.nom_complet.charAt(0).toUpperCase();

    return (
        <DashboardLayout>
            <div className="co-page" key={refresh}>

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

                {/* ════ Fil d'actualité ════ */}
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
                            {posts.length === 0 ? (
                                <div className="co-empty">
                                    <IonIcon icon={chatbubblesOutline} className="co-empty-icon" />
                                    <p>Aucune publication pour l'instant.</p>
                                </div>
                            ) : posts.map((p: ApiCommunityPost) => {
                                const hasLiked = false; // le backend retourne likes_count, pas le tableau d'ids
                                const isOwner  = p.author_id === user.id;
                                return (
                                    <div key={p.id} className="co-post">
                                        <div className="co-post-header">
                                            <div className="co-post-avatar">{(p.author?.nom_complet ?? '?').charAt(0).toUpperCase()}</div>
                                            <div className="co-post-meta">
                                                <span className="co-post-author">{p.author?.nom_complet ?? '—'}</span>
                                                <span className="co-post-date">
                                                    {new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {isOwner && (
                                                <IonButton fill="clear" size="small" color="medium" className="co-delete-btn"
                                                    onClick={() => handleDelete(p.id)} aria-label="Supprimer">
                                                    <IonIcon slot="icon-only" icon={trashOutline} />
                                                </IonButton>
                                            )}
                                        </div>
                                        <p className="co-post-content">{p.content}</p>
                                        <div className="co-post-actions">
                                            <button className={`co-action-btn ${hasLiked ? 'co-action-btn--liked' : ''}`}
                                                onClick={() => handleLike(p.id)}>
                                                <IonIcon icon={hasLiked ? heart : heartOutline} />
                                                {p.likes_count}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ════ Membres ════ */}
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
                                {filteredStudents.map((s: { id: number; nom_complet: string; filiere?: string; annee?: string; option_lic?: string; role: string }) => (
                                    <div key={s.id} className="co-member-card">
                                        <div className="co-member-avatar">{s.nom_complet.charAt(0).toUpperCase()}</div>
                                        <div className="co-member-body">
                                            <p className="co-member-name">{s.nom_complet}</p>
                                            <p className="co-member-meta">
                                                {s.filiere ? (FILIERE_LABELS[s.filiere as keyof typeof FILIERE_LABELS] ?? s.filiere) : '—'}
                                                {s.annee ? ` — ${s.annee}` : ''}
                                                {s.option_lic ? ` (${s.option_lic})` : ''}
                                            </p>
                                        </div>
                                        <Badge variant={s.role === 'etudiant_concours' ? 'default' : 'info'} size="sm">
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

