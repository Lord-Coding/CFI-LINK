import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon, IonInput, IonToggle } from '../lib/ionic';
import {
    personOutline, mailOutline, lockClosedOutline,
    saveOutline, checkmarkCircleOutline, sunnyOutline,
    moonOutline, shieldOutline, informationCircleOutline,
    colorPaletteOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { ROLE_LABELS, FILIERE_LABELS } from '../lib/store';
import { userService } from '../lib/services/userService';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Settings.css';

/* ── Couleurs d'avatar disponibles ── */
const AVATAR_COLORS = [
    { value: '#3880ff', label: 'Bleu'    },
    { value: '#2dd36f', label: 'Vert'    },
    { value: '#ffc409', label: 'Jaune'   },
    { value: '#eb445a', label: 'Rouge'   },
    { value: '#5260ff', label: 'Violet'  },
    { value: '#0cd1e8', label: 'Cyan'    },
    { value: '#f4a261', label: 'Orange'  },
    { value: '#264653', label: 'Ardoise' },
];

/* ════════════════════════════════
   Page Paramètres
════════════════════════════════ */
const Settings: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    /* Profile */
    const [fNom,   setFNom]   = useState(user?.nom_complet ?? '');
    const [fEmail, setFEmail] = useState(user?.email ?? '');
    const [profileSaved, setProfileSaved] = useState(false);

    /* Mot de passe */
    const [fOldPass, setFOldPass] = useState('');
    const [fNewPass, setFNewPass] = useState('');
    const [passError, setPassError] = useState('');
    const [passSaved, setPassSaved] = useState(false);

    /* Couleur avatar */
    const [avatarColor, setAvatarColor] = useState(
        () => localStorage.getItem('cfi_avatar_color') ?? '#3880ff'
    );

    useEffect(() => {
        if (user) { setFNom(user.nom_complet); setFEmail(user.email); }
    }, [user]);

    if (!user) return null;

    /* Handlers */
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userService.update(Number(user.id), { nom_complet: fNom, email: fEmail });
            refreshUser();
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2500);
        } catch {
            // silencieux — géré par l'intercepteur global
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassError('');
        if (fNewPass.length < 8) {
            setPassError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        try {
            await userService.update(Number(user.id), {
                password: fNewPass,
                // Le backend vérifiera l'ancien mot de passe si besoin
                // Pour l'instant on envoie directement le nouveau
            });
            refreshUser();
            setFOldPass(''); setFNewPass('');
            setPassSaved(true);
            setTimeout(() => setPassSaved(false), 2500);
        } catch {
            setPassError('Impossible de modifier le mot de passe. Vérifiez vos informations.');
        }
    };

    const handleAvatarColor = (color: string) => {
        setAvatarColor(color);
        localStorage.setItem('cfi_avatar_color', color);
    };

    const initials = user.nom_complet.charAt(0).toUpperCase();

    return (
        <DashboardLayout>
            <div className="st-page">

                {/* ── Hero ── */}
                <div className="st-hero">
                    <div className="st-hero-avatar" style={{ backgroundColor: avatarColor }}>
                        {initials}
                    </div>
                    <div className="st-hero-info">
                        <h1 className="st-hero-name">{user.nom_complet}</h1>
                        <p className="st-hero-role">{ROLE_LABELS[user.role]}</p>
                        {user.filiere && (
                            <p className="st-hero-filiere">
                                {FILIERE_LABELS[user.filiere]} — {user.annee}
                                {user.option ? ` (${user.option})` : ''}
                            </p>
                        )}
                        <div className="st-hero-badges">
                            <Badge variant={user.is_active ? 'success' : 'danger'} size="sm" dot>
                                {user.is_active ? 'Compte actif' : 'Inactif'}
                            </Badge>
                            <Badge variant="secondary" size="sm">{user.email}</Badge>
                        </div>
                    </div>
                </div>

                <div className="st-grid">

                    {/* ── Profil ── */}
                    <div className="st-card">
                        <div className="st-card-header">
                            <div className="st-card-header-icon st-card-header-icon--primary">
                                <IonIcon icon={personOutline} />
                            </div>
                            <h2 className="st-card-title">Informations personnelles</h2>
                        </div>

                        <form onSubmit={handleSaveProfile} className="st-form">
                            <div className="st-field">
                                <label className="st-field-label">
                                    <IonIcon icon={personOutline} className="st-field-icon" />
                                    Nom complet
                                </label>
                                <IonInput
                                    className="st-field-input"
                                    value={fNom}
                                    onIonInput={e => setFNom(String(e.detail.value ?? ''))}
                                    placeholder="Prénom Nom"
                                />
                            </div>
                            <div className="st-field">
                                <label className="st-field-label">
                                    <IonIcon icon={mailOutline} className="st-field-icon" />
                                    Adresse email
                                </label>
                                <IonInput
                                    className="st-field-input"
                                    type="email"
                                    value={fEmail}
                                    onIonInput={e => setFEmail(String(e.detail.value ?? ''))}
                                    placeholder="email@cfi-ciras.org"
                                />
                            </div>
                            <IonButton
                                expand="block"
                                type="submit"
                                color={profileSaved ? 'success' : 'primary'}
                                className="st-save-btn"
                            >
                                <IonIcon slot="start" icon={profileSaved ? checkmarkCircleOutline : saveOutline} />
                                {profileSaved ? 'Enregistré !' : 'Enregistrer les modifications'}
                            </IonButton>
                        </form>
                    </div>

                    {/* ── Mot de passe ── */}
                    <div className="st-card">
                        <div className="st-card-header">
                            <div className="st-card-header-icon st-card-header-icon--warning">
                                <IonIcon icon={lockClosedOutline} />
                            </div>
                            <h2 className="st-card-title">Changer le mot de passe</h2>
                        </div>

                        <form onSubmit={handleChangePassword} className="st-form">
                            <div className="st-field">
                                <label className="st-field-label">
                                    <IonIcon icon={shieldOutline} className="st-field-icon" />
                                    Ancien mot de passe
                                </label>
                                <IonInput
                                    className="st-field-input"
                                    type="password"
                                    value={fOldPass}
                                    onIonInput={e => setFOldPass(String(e.detail.value ?? ''))}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="st-field">
                                <label className="st-field-label">
                                    <IonIcon icon={lockClosedOutline} className="st-field-icon" />
                                    Nouveau mot de passe
                                </label>
                                <IonInput
                                    className="st-field-input"
                                    type="password"
                                    value={fNewPass}
                                    onIonInput={e => setFNewPass(String(e.detail.value ?? ''))}
                                    placeholder="Min. 6 caractères"
                                />
                            </div>

                            {passError && (
                                <div className="st-error">
                                    <IonIcon icon={informationCircleOutline} />
                                    {passError}
                                </div>
                            )}

                            <IonButton
                                expand="block"
                                type="submit"
                                color={passSaved ? 'success' : 'warning'}
                                className="st-save-btn"
                            >
                                <IonIcon slot="start" icon={passSaved ? checkmarkCircleOutline : lockClosedOutline} />
                                {passSaved ? 'Mot de passe modifié !' : 'Modifier le mot de passe'}
                            </IonButton>
                        </form>
                    </div>

                    {/* ── Apparence ── */}
                    <div className="st-card">
                        <div className="st-card-header">
                            <div className="st-card-header-icon st-card-header-icon--info">
                                <IonIcon icon={isDark ? moonOutline : sunnyOutline} />
                            </div>
                            <h2 className="st-card-title">Apparence</h2>
                        </div>

                        <div className="st-appearance">
                            <div className="st-toggle-row">
                                <div>
                                    <p className="st-toggle-label">Mode sombre</p>
                                    <p className="st-toggle-desc">Basculer entre le thème clair et sombre.</p>
                                </div>
                                <IonToggle
                                    checked={isDark}
                                    onIonChange={e => {
                                        if (e.detail.checked !== isDark) toggleTheme();
                                    }}
                                    className="st-toggle"
                                />
                            </div>

                            {/* Thème preview */}
                            <div className="st-theme-previews">
                                <button
                                    className={`st-theme-preview st-theme-preview--light ${!isDark ? 'st-theme-preview--active' : ''}`}
                                    onClick={() => isDark && toggleTheme()}
                                >
                                    <div className="st-preview-bar" />
                                    <div className="st-preview-content">
                                        <div className="st-preview-line" />
                                        <div className="st-preview-line st-preview-line--short" />
                                    </div>
                                    <span className="st-preview-label">Clair</span>
                                </button>
                                <button
                                    className={`st-theme-preview st-theme-preview--dark ${isDark ? 'st-theme-preview--active' : ''}`}
                                    onClick={() => !isDark && toggleTheme()}
                                >
                                    <div className="st-preview-bar st-preview-bar--dark" />
                                    <div className="st-preview-content st-preview-content--dark">
                                        <div className="st-preview-line st-preview-line--dark" />
                                        <div className="st-preview-line st-preview-line--dark st-preview-line--short" />
                                    </div>
                                    <span className="st-preview-label">Sombre</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Couleur avatar ── */}
                    <div className="st-card">
                        <div className="st-card-header">
                            <div className="st-card-header-icon st-card-header-icon--success">
                                <IonIcon icon={colorPaletteOutline} />
                            </div>
                            <h2 className="st-card-title">Couleur de l'avatar</h2>
                        </div>

                        <div className="st-avatar-section">
                            {/* Aperçu */}
                            <div className="st-avatar-preview">
                                <div className="st-avatar-big" style={{ backgroundColor: avatarColor }}>
                                    {initials}
                                </div>
                                <div>
                                    <p className="st-avatar-preview-name">{user.nom_complet}</p>
                                    <p className="st-avatar-preview-role">{ROLE_LABELS[user.role]}</p>
                                </div>
                            </div>

                            {/* Palette */}
                            <div className="st-color-grid">
                                {AVATAR_COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        className={`st-color-swatch ${avatarColor === c.value ? 'st-color-swatch--active' : ''}`}
                                        style={{ backgroundColor: c.value }}
                                        onClick={() => handleAvatarColor(c.value)}
                                        title={c.label}
                                        aria-label={`Couleur ${c.label}`}
                                    >
                                        {avatarColor === c.value && (
                                            <IonIcon icon={checkmarkCircleOutline} className="st-color-check" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
