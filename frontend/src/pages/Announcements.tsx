import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonTextarea, IonInput,
    IonSelect, IonSelectOption, IonChip,
} from '../lib/ionic';
import {
    megaphoneOutline, addCircleOutline, trashOutline, pinOutline,
    closeOutline, alertCircleOutline, informationCircleOutline,
    warningOutline, checkmarkCircleOutline, timeOutline,
    peopleOutline, personCircleOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService, type ApiAnnouncement } from '../lib/services/announcementService';
import { Badge, Card, CardContent } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Announcements.css';

type Announcement = ApiAnnouncement;
/* ── Helpers ── */
const PRIORITY_CONFIG: Record<string, { label: string; icon: string; variant: 'default'|'warning'|'danger' }> = {
    normal:    { label: 'Normal',    icon: informationCircleOutline, variant: 'default'  },
    important: { label: 'Important', icon: alertCircleOutline,       variant: 'warning'  },
    urgent:    { label: 'Urgent',    icon: warningOutline,           variant: 'danger'   },
};

const TARGET_LABELS: Record<string, string> = {
    all:                'Tous les rôles',
    etudiant_concours:  'Étudiants (concours)',
    etudiant_externe:   'Étudiants (externes)',
    professeur:         'Professeurs',
    membre_administratif: 'Personnel administratif',
    admin:              'Admins',
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

/* ════════════════════════════════
   Formulaire d'ajout (admin)
════════════════════════════════ */
interface FormState {
    title:       string;
    content:     string;
    priority:    Announcement['priority'];
    target_role: string;
    pinned:      boolean;
}
const EMPTY_FORM: FormState = {
    title: '', content: '', priority: 'normal', target_role: 'all', pinned: false,
};

interface AddFormProps { author: string; onSave: (data: { title: string; content: string; priority: 'normal'|'important'|'urgent'; target_role: string; pinned: boolean }) => void; onCancel: () => void; }

const AddForm: React.FC<AddFormProps> = ({ author, onSave, onCancel }) => {
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [error, setError] = useState('');
    const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim())   { setError('Le titre est requis.'); return; }
        if (!form.content.trim()) { setError('Le contenu est requis.'); return; }
        onSave({
            title:       form.title.trim(),
            content:     form.content.trim(),
            priority:    form.priority,
            target_role: form.target_role,
            pinned:      form.pinned,
        });
    };

    return (
        <Card variant="default" className="an-form-card">
            <CardContent padding="md">
                <form onSubmit={handleSubmit} className="an-form">
                    <h3 className="an-form-title">
                        <IonIcon icon={addCircleOutline} /> Nouvelle annonce
                    </h3>
                    {error && <p className="an-form-error">{error}</p>}

                    <div className="an-form-group">
                        <label className="an-form-label">Titre <span className="an-required">*</span></label>
                        <IonInput
                            className="an-form-input"
                            value={form.title}
                            onIonInput={e => set('title', String(e.detail.value ?? ''))}
                            placeholder="Titre de l'annonce"
                        />
                    </div>

                    <div className="an-form-group">
                        <label className="an-form-label">Contenu <span className="an-required">*</span></label>
                        <IonTextarea
                            className="an-form-textarea"
                            value={form.content}
                            onIonInput={e => set('content', String(e.detail.value ?? ''))}
                            placeholder="Contenu de l'annonce…"
                            rows={4}
                            autoGrow
                        />
                    </div>

                    <div className="an-form-row">
                        <div className="an-form-group">
                            <label className="an-form-label">Priorité</label>
                            <IonSelect
                                className="an-form-select"
                                value={form.priority}
                                onIonChange={e => set('priority', e.detail.value)}
                                interface="popover"
                            >
                                <IonSelectOption value="normal">Normal</IonSelectOption>
                                <IonSelectOption value="important">Important</IonSelectOption>
                                <IonSelectOption value="urgent">Urgent</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="an-form-group">
                            <label className="an-form-label">Destinataires</label>
                            <IonSelect
                                className="an-form-select"
                                value={form.target_role}
                                onIonChange={e => set('target_role', e.detail.value)}
                                interface="popover"
                            >
                                {Object.entries(TARGET_LABELS).map(([val, label]) => (
                                    <IonSelectOption key={val} value={val}>{label}</IonSelectOption>
                                ))}
                            </IonSelect>
                        </div>
                    </div>

                    <div className="an-form-check">
                        <input
                            id="an-pinned"
                            type="checkbox"
                            checked={form.pinned}
                            onChange={e => set('pinned', e.target.checked)}
                            className="an-form-checkbox"
                        />
                        <label htmlFor="an-pinned" className="an-form-check-label">
                            <IonIcon icon={pinOutline} /> Épingler cette annonce
                        </label>
                    </div>

                    <div className="an-form-actions">
                        <IonButton fill="outline" color="medium" type="button" onClick={onCancel}>
                            <IonIcon slot="start" icon={closeOutline} />Annuler
                        </IonButton>
                        <IonButton type="submit" color="primary">
                            <IonIcon slot="start" icon={checkmarkCircleOutline} />Publier
                        </IonButton>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

/* ════════════════════════════════
   Carte annonce
════════════════════════════════ */
interface AnnouncementCardProps {
    announcement: Announcement;
    canAdmin:     boolean;
    onDelete:     (id: number) => void;
    onTogglePin:  (id: number, current: boolean) => void;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement: a, canAdmin, onDelete, onTogglePin }) => {
    const cfg = PRIORITY_CONFIG[a.priority ?? 'normal'] ?? PRIORITY_CONFIG.normal;
    return (
        <div className={`an-card an-card--${a.priority} ${a.pinned ? 'an-card--pinned' : ''}`}>
            <div className="an-card-header">
                <div className="an-card-left">
                    {a.pinned && (
                        <span className="an-pin-badge">
                            <IonIcon icon={pinOutline} /> Épinglé
                        </span>
                    )}
                    <Badge variant={cfg.variant} size="sm">
                        <IonIcon icon={cfg.icon} />{cfg.label}
                    </Badge>
                    {a.target_role && a.target_role !== 'all' && (
                        <Badge variant="secondary" size="sm">
                            <IonIcon icon={peopleOutline} />
                            {TARGET_LABELS[a.target_role] ?? a.target_role}
                        </Badge>
                    )}
                </div>
                {canAdmin && (
                    <div className="an-card-actions">
                        <IonButton
                            fill="clear" size="small"
                            color={a.pinned ? 'warning' : 'medium'}
                            title={a.pinned ? 'Désépingler' : 'Épingler'}
                            onClick={() => onTogglePin(a.id, !!a.pinned)}
                        >
                            <IonIcon slot="icon-only" icon={pinOutline} />
                        </IonButton>
                        <IonButton fill="clear" size="small" color="danger" title="Supprimer" onClick={() => onDelete(a.id)}>
                            <IonIcon slot="icon-only" icon={trashOutline} />
                        </IonButton>
                    </div>
                )}
            </div>

            <h3 className="an-card-title">{a.title}</h3>
            <p className="an-card-content">{a.content}</p>

            <div className="an-card-footer">
                <span className="an-card-author">
                    <IonIcon icon={personCircleOutline} />{a.author}
                </span>
                <span className="an-card-date">
                    <IonIcon icon={timeOutline} />{formatDate(a.created_at)}
                </span>
            </div>
        </div>
    );
};

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const Announcements: React.FC = () => {
    const { user } = useAuth();
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);

    if (!user) return null;

    const canAdmin = isAdmin(user.role);

    const { data: announcements = [], isLoading } = useQuery({
        queryKey: ['announcements'],
        queryFn: announcementService.list,
    });

    const addMutation = useMutation({
        mutationFn: announcementService.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['announcements'] }); setShowForm(false); },
    });

    const deleteMutation = useMutation({
        mutationFn: announcementService.delete,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Announcement> }) => announcementService.update(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
    });

    const total  = announcements.length;
    const pinned = announcements.filter(a => a.pinned).length;

    const handleSave = (data: { title: string; content: string; priority: Announcement['priority']; target_role: string; pinned: boolean }) => {
        addMutation.mutate({ ...data, author_id: user.id });
    };

    const handleDelete = (id: number) => deleteMutation.mutate(id);
    const handlePin = (id: number, current: boolean) => updateMutation.mutate({ id, data: { pinned: !current } });

    return (
        <DashboardLayout>
            <div className="an-page" key={refresh}>

        {/* ── Hero ── */}
        <div className="an-hero">
            <div className="an-hero-text">
                <h1 className="an-hero-title">Annonces officielles</h1>
                <p className="an-hero-sub">Informations et communications de l'établissement.</p>
                <div className="an-hero-badges">
                    <span className="an-hero-badge"><IonIcon icon={megaphoneOutline} />{total} annonce{total !== 1 ? 's' : ''}</span>
                    {pinned > 0 && <span className="an-hero-badge"><IonIcon icon={pinOutline} />{pinned} épinglée{pinned !== 1 ? 's' : ''}</span>}
                </div>
            </div>
            {canAdmin && (
                <IonButton fill="outline" size="small" className="an-hero-btn" onClick={() => setShowForm(v => !v)}>
                    <IonIcon slot="start" icon={showForm ? closeOutline : addCircleOutline} />
                    {showForm ? 'Annuler' : 'Nouvelle annonce'}
                </IonButton>
            )}
        </div>

        {showForm && canAdmin && (
            <AddForm author={user.nom_complet} onSave={handleSave} onCancel={() => setShowForm(false)} />
        )}

        {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}><IonSpinner name="crescent" /></div>
        ) : announcements.length === 0 ? (
            <div className="an-empty"><IonIcon icon={megaphoneOutline} className="an-empty-icon" /><p>Aucune annonce pour le moment.</p></div>
        ) : (
            <div className="an-list">
                {announcements.map(a => (
                    <AnnouncementCard key={a.id} announcement={a} canAdmin={canAdmin}
                        onDelete={handleDelete} onTogglePin={handlePin} />
                ))}
            </div>
        )}

            </div>
        </DashboardLayout>
    );
};

export default Announcements;
