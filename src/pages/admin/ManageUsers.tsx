import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonModal,
    IonInput,
    IonSegment, IonSegmentButton, IonLabel, IonSearchbar, IonChip,
} from '../../lib/ionic';
import {
    addCircleOutline, shieldOutline, trashOutline,
    peopleOutline, schoolOutline, personCircleOutline, businessOutline,
    shieldCheckmarkOutline, personOutline, mailOutline, lockClosedOutline,
    closeCircleOutline, checkmarkCircleOutline, statsChartOutline,
} from 'ionicons/icons';
import { useAuth } from '../../hooks/useAuth';
import {
    createUser, deleteUser, getUsers, isStudent,
    updateUser, User, ROLE_LABELS,
} from '../../lib/store';
import { Avatar, Badge, Card, CardContent, CardHeader, CardTitle, AlertDialog } from '../../components';
import DashboardLayout from '../../components/DashboardLayout';
import '../../styles/admin/ManageUsers.css';

type ManageUserRole = 'admin' | 'professeur' | 'membre_administratif';

/* ── Segment tabs config ── */
const TABS = [
    { value: 'students',   label: 'Étudiants',       icon: schoolOutline },
    { value: 'professors', label: 'Professeurs',      icon: personCircleOutline },
    { value: 'staff',      label: 'Administratifs',   icon: businessOutline },
    { value: 'admins',     label: 'Admins',           icon: peopleOutline },
] as const;

type TabKey = typeof TABS[number]['value'];

/* ── Composant ligne de tableau ── */
interface UserRowProps {
    user: User;
    currentUserId?: string;
    showAcademic: boolean;
    onToggle: (id: string, current: boolean) => void;
    onDelete: (id: string) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, currentUserId, showAcademic, onToggle, onDelete }) => {
    const initials = user.nom_complet.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const isSelf   = user.id === currentUserId;

    return (
        <tr className="mu-tr">
            {/* Nom */}
            <td className="mu-td mu-td--name">
                <div className="mu-user-cell">
                    <Avatar
                        fallback={initials}
                        size="sm"
                        color={user.is_active ? 'var(--ion-color-primary)' : 'var(--ion-color-medium)'}
                    />
                    <span className="mu-user-name">{user.nom_complet}</span>
                </div>
            </td>

            {/* Email */}
            <td className="mu-td mu-td--email">
                <span className="mu-email">{user.email}</span>
            </td>

            {/* Rôle */}
            <td className="mu-td mu-td--role">
                <Badge variant="secondary" size="sm">
                    {ROLE_LABELS[user.role]}
                </Badge>
            </td>

            {/* Filière/Année — étudiants seulement */}
            {showAcademic && (
                <td className="mu-td mu-td--filiere">
                    {user.filiere
                        ? <span className="mu-filiere">{user.filiere} {user.annee}{user.option ? ` (${user.option})` : ''}</span>
                        : <span className="mu-empty">—</span>
                    }
                </td>
            )}

            {/* Statut */}
            <td className="mu-td mu-td--status">
                <Badge variant={user.is_active ? 'success' : 'danger'} size="sm" dot>
                    {user.is_active ? 'Actif' : 'Inactif'}
                </Badge>
            </td>

            {/* Actions */}
            <td className="mu-td mu-td--actions">
                {!isSelf && (
                    <div className="mu-actions">
                        <IonButton
                            fill="clear"
                            size="small"
                            color={user.is_active ? 'warning' : 'success'}
                            className="mu-action-btn"
                            title={user.is_active ? 'Désactiver' : 'Activer'}
                            onClick={() => onToggle(user.id, user.is_active)}
                        >
                            <IonIcon slot="icon-only" icon={user.is_active ? shieldCheckmarkOutline : shieldOutline} />
                        </IonButton>
                        <IonButton
                            fill="clear"
                            size="small"
                            color="danger"
                            className="mu-action-btn"
                            title="Supprimer"
                            onClick={() => onDelete(user.id)}
                        >
                            <IonIcon slot="icon-only" icon={trashOutline} />
                        </IonButton>
                    </div>
                )}
            </td>
        </tr>
    );
};

/* ── Page principale ── */
const ManageUsers: React.FC = () => {
    const { user: currentUser } = useAuth();

    /* State */
    const [users,       setUsers]       = useState(getUsers());
    const [tab,         setTab]         = useState<TabKey>('students');
    const [search,      setSearch]      = useState('');
    const [modalOpen,   setModalOpen]   = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

    /* Form */
    const [createRole,  setCreateRole]  = useState<ManageUserRole>('professeur');
    const [fNom,        setFNom]        = useState('');
    const [fEmail,      setFEmail]      = useState('');
    const [fPassword,   setFPassword]   = useState('');
    const [fSpecialite, setFSpecialite] = useState('');
    const [fGrade,      setFGrade]      = useState('');
    const [fService,    setFService]    = useState('');

    const refresh = () => setUsers(getUsers());

    /* Groupes */
    const grouped: Record<TabKey, User[]> = {
        admins:     users.filter(u => u.role === 'admin' || u.role === 'super_admin'),
        professors: users.filter(u => u.role === 'professeur'),
        staff:      users.filter(u => u.role === 'membre_administratif'),
        students:   users.filter(u => isStudent(u.role)),
    };

    const q = search.toLowerCase().trim();
    const displayedUsers = (grouped[tab] ?? []).filter(u =>
        !q ||
        u.nom_complet.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );

    /* Handlers */
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fNom || !fEmail || !fPassword) return;

        const data: Omit<User, 'id' | 'created_at'> = {
            nom_complet: fNom,
            email:       fEmail,
            password:    fPassword,
            role:        createRole,
            is_active:   true,
        };

        if (createRole === 'professeur') {
            data.specialite = fSpecialite;
            data.grade      = fGrade;
        } else if (createRole === 'membre_administratif') {
            data.service = fService;
        }

        createUser(data);
        refresh();
        closeModal();
    };

    const closeModal = () => {
        setModalOpen(false);
        setFNom(''); setFEmail(''); setFPassword('');
        setFSpecialite(''); setFGrade(''); setFService('');
        setCreateRole('professeur');
    };

    const toggleActive = (id: string, current: boolean) => {
        updateUser(id, { is_active: !current });
        refresh();
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        deleteUser(deleteTarget.id);
        refresh();
        setDeleteTarget(null);
    };

    const canCreateAdmin = currentUser?.role === 'super_admin';
    const showAcademic   = tab === 'students';

    return (
        <DashboardLayout>
            {/* ── Bannière hero ── */}
            <div className="mu-hero">
                <div className="mu-hero-text">
                    <h1 className="mu-hero-title">Gestion des utilisateurs</h1>
                    <p className="mu-hero-sub">Gérez les comptes, rôles et accès de la plateforme CFI-LINK.</p>
                    <div className="mu-hero-badges">
                        <span className="mu-hero-badge">
                            <IonIcon icon={peopleOutline} />
                            {users.length} comptes
                        </span>
                        <span className="mu-hero-badge">
                            <IonIcon icon={statsChartOutline} />
                            {users.filter(u => u.is_active).length} actifs
                        </span>
                        <span className="mu-hero-badge">
                            <IonIcon icon={schoolOutline} />
                            {grouped.students.length} étudiants
                        </span>
                    </div>
                </div>
                <div className="mu-hero-action">
                    <IonButton className="mu-hero-btn" fill="outline" onClick={() => setModalOpen(true)}>
                        <IonIcon slot="start" icon={addCircleOutline} />
                        Nouveau compte
                    </IonButton>
                </div>
            </div>

            {/* ── Compteurs rapides ── */}
            <div className="mu-stats-row">
                {TABS.map(t => (
                    <button
                        key={t.value}
                        className={`mu-stat-chip ${tab === t.value ? 'mu-stat-chip--active' : ''}`}
                        onClick={() => setTab(t.value)}
                    >
                        <IonIcon icon={t.icon} className="mu-stat-chip-icon" />
                        <span className="mu-stat-chip-count">{grouped[t.value].length}</span>
                        <span className="mu-stat-chip-label">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Segment + Recherche ── */}
            <div className="mu-toolbar">
                <IonSegment
                    mode="ios"
                    value={tab}
                    className="mu-segment"
                    onIonChange={e => setTab(String(e.detail.value) as TabKey)}
                >
                    {TABS.map(t => (
                        <IonSegmentButton key={t.value} value={t.value} className="mu-seg-btn">
                            <IonLabel>{t.label}</IonLabel>
                        </IonSegmentButton>
                    ))}
                </IonSegment>

                <IonSearchbar
                    value={search}
                    onIonInput={e => setSearch(String(e.detail.value ?? ''))}
                    placeholder="Rechercher..."
                    className="mu-searchbar"
                    debounce={200}
                />
            </div>

            {/* ── Tableau ── */}
            <div className="mu-table-wrap">
                <Card variant="default" className="mu-table-card">
                    <CardHeader className="mu-table-card-header">
                        <CardTitle>
                            {TABS.find(t => t.value === tab)?.label}
                        </CardTitle>
                        <IonChip className="mu-count-chip">
                            {displayedUsers.length}
                        </IonChip>
                    </CardHeader>
                    <CardContent padding="sm">
                        <div className="mu-table-scroll">
                            <table className="mu-table">
                                <thead>
                                    <tr className="mu-thead-tr">
                                        <th className="mu-th">Nom</th>
                                        <th className="mu-th">Email</th>
                                        <th className="mu-th">Rôle</th>
                                        {showAcademic && <th className="mu-th">Filière / Année</th>}
                                        <th className="mu-th">Statut</th>
                                        <th className="mu-th mu-th--actions">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedUsers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={showAcademic ? 6 : 5}
                                                className="mu-empty-row"
                                            >
                                                <IonIcon icon={peopleOutline} className="mu-empty-icon" />
                                                <span>Aucun utilisateur trouvé</span>
                                            </td>
                                        </tr>
                                    ) : displayedUsers.map(u => (
                                        <UserRow
                                            key={u.id}
                                            user={u}
                                            currentUserId={currentUser?.id}
                                            showAcademic={showAcademic}
                                            onToggle={toggleActive}
                                            onDelete={id => {
                                                const target = users.find(x => x.id === id);
                                                if (target) setDeleteTarget(target);
                                            }}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Modal création ── */}
            <IonModal
                isOpen={modalOpen}
                onDidDismiss={closeModal}
                className="mu-modal"
            >
                <div className="mu-modal-inner">

                    <div className="mu-modal-header">
                        <div className="mu-modal-header-icon">
                            <IonIcon icon={personCircleOutline} />
                        </div>
                        <div>
                            <h2 className="mu-modal-title">Créer un utilisateur</h2>
                            <p className="mu-modal-subtitle">Renseignez les informations du nouveau compte.</p>
                        </div>
                        <IonButton fill="clear" size="small" onClick={closeModal} className="mu-modal-close">
                            <IonIcon slot="icon-only" icon={closeCircleOutline} />
                        </IonButton>
                    </div>

                    <form onSubmit={handleCreate} className="mu-form">

                        <div className="mu-form-section">
                            <span className="mu-form-section-label">Type de compte</span>
                            <div className="mu-role-picker">
                                {(canCreateAdmin ? [
                                    { value: 'admin',                label: 'Directeur',     sub: 'Accès admin',      icon: shieldCheckmarkOutline },
                                    { value: 'professeur',           label: 'Professeur',    sub: 'Corps enseignant', icon: schoolOutline },
                                    { value: 'membre_administratif', label: 'Administratif', sub: 'Gestion interne',  icon: businessOutline },
                                ] : [
                                    { value: 'professeur',           label: 'Professeur',    sub: 'Corps enseignant', icon: schoolOutline },
                                    { value: 'membre_administratif', label: 'Administratif', sub: 'Gestion interne',  icon: businessOutline },
                                ] as { value: ManageUserRole; label: string; sub: string; icon: string }[]).map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`mu-role-card ${createRole === opt.value ? 'mu-role-card--active' : ''}`}
                                        onClick={() => setCreateRole(opt.value as ManageUserRole)}
                                    >
                                        <IonIcon icon={opt.icon} className="mu-role-card-icon" />
                                        <span className="mu-role-card-label">{opt.label}</span>
                                        <span className="mu-role-card-sub">{opt.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mu-form-section">
                            <span className="mu-form-section-label">Identité</span>
                            <div className="mu-form-grid">
                                <div className="mu-field">
                                    <label className="mu-field-label">
                                        <IonIcon icon={personOutline} className="mu-field-icon" />
                                        Nom complet <span className="mu-required">*</span>
                                    </label>
                                    <IonInput
                                        className="mu-field-input"
                                        value={fNom}
                                        onIonInput={e => setFNom(String(e.detail.value ?? ''))}
                                        placeholder="Prénom Nom"
                                        required
                                    />
                                </div>
                                <div className="mu-field">
                                    <label className="mu-field-label">
                                        <IonIcon icon={mailOutline} className="mu-field-icon" />
                                        Email <span className="mu-required">*</span>
                                    </label>
                                    <IonInput
                                        className="mu-field-input"
                                        type="email"
                                        value={fEmail}
                                        onIonInput={e => setFEmail(String(e.detail.value ?? ''))}
                                        placeholder="email@cfi-ciras.org"
                                        required
                                    />
                                </div>
                                <div className="mu-field mu-field--full">
                                    <label className="mu-field-label">
                                        <IonIcon icon={lockClosedOutline} className="mu-field-icon" />
                                        Mot de passe <span className="mu-required">*</span>
                                    </label>
                                    <IonInput
                                        className="mu-field-input"
                                        type="password"
                                        value={fPassword}
                                        onIonInput={e => setFPassword(String(e.detail.value ?? ''))}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {createRole === 'professeur' && (
                            <div className="mu-form-section">
                                <span className="mu-form-section-label">Informations académiques</span>
                                <div className="mu-form-grid">
                                    <div className="mu-field">
                                        <label className="mu-field-label">Spécialité</label>
                                        <IonInput
                                            className="mu-field-input"
                                            value={fSpecialite}
                                            onIonInput={e => setFSpecialite(String(e.detail.value ?? ''))}
                                            placeholder="ex: Informatique"
                                        />
                                    </div>
                                    <div className="mu-field">
                                        <label className="mu-field-label">Grade</label>
                                        <IonInput
                                            className="mu-field-input"
                                            value={fGrade}
                                            onIonInput={e => setFGrade(String(e.detail.value ?? ''))}
                                            placeholder="ex: Maître de conférences"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {createRole === 'membre_administratif' && (
                            <div className="mu-form-section">
                                <span className="mu-form-section-label">Service</span>
                                <div className="mu-field mu-field--full">
                                    <label className="mu-field-label">Nom du service</label>
                                    <IonInput
                                        className="mu-field-input"
                                        value={fService}
                                        onIonInput={e => setFService(String(e.detail.value ?? ''))}
                                        placeholder="ex: Scolarité"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mu-form-actions">
                            <IonButton expand="block" fill="outline" color="medium" type="button" onClick={closeModal}>
                                Annuler
                            </IonButton>
                            <IonButton expand="block" type="submit" color="primary">
                                <IonIcon slot="start" icon={checkmarkCircleOutline} />
                                Créer le compte
                            </IonButton>
                        </div>
                    </form>
                </div>
            </IonModal>

            {/* ── Dialog confirmation suppression ── */}
            <AlertDialog
                isOpen={!!deleteTarget}
                onDismiss={() => setDeleteTarget(null)}
                variant="danger"
                title="Supprimer l'utilisateur"
                description={`Voulez-vous vraiment supprimer "${deleteTarget?.nom_complet}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                onConfirm={confirmDelete}
            />

        </DashboardLayout>
    );
};

export default ManageUsers;
