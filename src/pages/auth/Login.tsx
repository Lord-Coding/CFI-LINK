import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth';
import { Link, useHistory } from 'react-router-dom';
import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonInputPasswordToggle, IonLabel, IonPage, IonRow, IonSpinner, lockClosedOutline, mailOutline, schoolOutline, arrowBackOutline } from '../../lib/ionic';
import { Alert } from '../../components';
import '../../styles/LoginPage.css';

const QUICK_LOGINS = [
    {
        label: 'Directeur',
        desc: 'Gestion globale, statistiques, validation des notes et supervision.',
        email: 'directeur@cfi-ciras.org',
        password: 'Dir@2024',
        color: '#0e7490',
        bg: 'rgba(14,116,144,0.08)',
        icon: '🏛️',
        badge: 'Admin',
    },
    {
        label: 'Professeur',
        desc: 'Saisie et publication des notes, gestion des présences.',
        email: 'owona@cfi-ciras.org',
        password: 'Prof@2024',
        color: '#0369a1',
        bg: 'rgba(3,105,161,0.08)',
        icon: '🎓',
        badge: 'Enseignant',
    },
    {
        label: 'Administratif',
        desc: 'Gestion des inscriptions, documents et codes d\'accès.',
        email: 'secretariat@cfi-ciras.org',
        password: 'Staff@2024',
        color: '#059669',
        bg: 'rgba(5,150,105,0.08)',
        icon: '🗂️',
        badge: 'Staff',
    },
    {
        label: 'Étudiant Concours',
        desc: 'Accès cours, notes et ressources — inscrit par concours.',
        email: 'jean.kamga@etud.cfi-ciras.org',
        password: 'Etud@2024',
        color: '#d97706',
        bg: 'rgba(217,119,6,0.08)',
        icon: '🏆',
        badge: 'Étudiant',
    },
    {
        label: 'Étudiant Externe',
        desc: 'Accès cours et ressources — inscrit par validation externe.',
        email: 'sophie.ateba@gmail.com',
        password: 'Etud@2024',
        color: '#dc2626',
        bg: 'rgba(220,38,38,0.08)',
        icon: '📚',
        badge: 'Étudiant',
    },
];

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [quickLoading, setQuickLoading] = useState<string | null>(null);
    const { login } = useAuth();
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }

        setLoading(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                history.replace("/dashboard");
            } else if (result.error === "PAYMENT_BLOCKED") {
                history.replace("/dashboard");
            } else {
                setError(result.error || "Erreur de connexion.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (ql: typeof QUICK_LOGINS[number]) => {
        setError("");
        setQuickLoading(ql.email);
        setEmail(ql.email);
        setPassword(ql.password);
        try {
            const result = await login(ql.email, ql.password);
            if (result.success || result.error === "PAYMENT_BLOCKED") {
                history.replace("/dashboard");
            } else {
                setError(result.error || "Erreur de connexion.");
            }
        } finally {
            setQuickLoading(null);
        }
    };

    return (
        <IonPage>
            <IonContent className="login-content" scrollY={true}>
                <IonGrid className="login-grid ion-no-padding">
                    <IonRow className="login-row">
                        <IonCol size="0" sizeLg="6" className="login-hero-col">
                            <div className="login-hero">
                                <div className="login-hero-overlay"></div>
                                <div className="login-hero-body">
                                    <div className="login-hero-logo">
                                        <IonIcon icon={schoolOutline}></IonIcon>
                                    </div>
                                    <h2 className="login-hero-title">Bienvenu sur CFI-LINK</h2>
                                    <p className="login-hero-sub">La plateforme académique du CFI-CIRAS. Connectez-vous pour accéder à vos cours, notes et ressources.</p>
                                </div>
                            </div>
                        </IonCol>


                        <IonCol size="12" sizeLg="6" className="login-form-col">
                            <div className="login-form-wrapper">
                                <Link to="/" className="login-mobile-logo">
                                    <div className="login-mobile-logo-icon">
                                        <IonIcon icon={schoolOutline}></IonIcon>
                                    </div>
                                    <span className="login-mobile-logo-text">CFI-LINK</span>
                                </Link>

                                <IonButton
                                    fill="clear"
                                    size="small"
                                    onClick={() => history.push("/landing")}
                                    className="login-back-btn"
                                >
                                    <IonIcon slot="start" icon={arrowBackOutline} />
                                    Retour à l'accueil
                                </IonButton>

                                <h1 className="login-title">Connexion</h1>
                                <p className="login-subtitle">Entrez vos identifiants pour accéder à votre espace.</p>

                                <form onSubmit={handleSubmit} className="login-form">
                                    <IonLabel>Adresse email</IonLabel>
                                    <IonInput 
                                        type="email"
                                        value={email}
                                        onIonInput={e => setEmail(String(e.detail.value ?? ""))}
                                        placeholder="Entrez votre adresse email"
                                        autocomplete="email"
                                        required
                                    >
                                        <IonIcon slot="start" icon={mailOutline}></IonIcon>
                                    </IonInput>

                                    <IonLabel>Mot de passe</IonLabel>
                                    <IonInput 
                                        type="password"
                                        value={password}
                                        onIonInput={e => setPassword(String(e.detail.value ?? ""))}
                                        placeholder="••••••••"
                                        autocomplete="current-password"
                                        required
                                    >
                                        <IonIcon slot="start" icon={lockClosedOutline}></IonIcon>
                                        <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
                                    </IonInput>

                                    { error && (
                                        <Alert variant="danger" description={error} dismissible onDismiss={() => setError("")}></Alert>
                                    )}

                                    <IonButton
                                        expand="block"
                                        shape="round"
                                        type="submit"
                                        disabled={loading}
                                        className="login-submit-btn"
                                    >
                                        {loading ? (
                                            <IonSpinner name="crescent" color="light"/>
                                        ) : (
                                            "Se connecter"
                                        )}
                                    </IonButton>
                                </form>
                                <p className="login-register-link">
                                    Étudiants ?{" "}
                                    <Link to="/register" className="login-link">S'inscrire</Link>
                                </p>

                                <div className="login-demo-box">
                                    <div className="login-demo-header">
                                        <span className="login-demo-pill">🧪 Test</span>
                                        <p className="login-demo-title">Connexion rapide</p>
                                    </div>
                                    <div className="login-demo-grid">
                                        {QUICK_LOGINS.map(ql => (
                                            <button
                                                key={ql.email}
                                                className="login-demo-card"
                                                style={{
                                                    '--ql-color': ql.color,
                                                    '--ql-bg': ql.bg,
                                                } as React.CSSProperties}
                                                onClick={() => handleQuickLogin(ql)}
                                                disabled={quickLoading !== null}
                                                title={ql.email}
                                            >
                                                {quickLoading === ql.email ? (
                                                    <span className="login-demo-spinner" />
                                                ) : (
                                                    <>
                                                        <span className="login-demo-card-icon">{ql.icon}</span>
                                                        <span className="login-demo-card-body">
                                                            <span className="login-demo-card-top">
                                                                <span className="login-demo-card-label">{ql.label}</span>
                                                                <span className="login-demo-card-badge">{ql.badge}</span>
                                                            </span>
                                                            <span className="login-demo-card-desc">{ql.desc}</span>
                                                        </span>
                                                        <span className="login-demo-card-arrow">→</span>
                                                    </>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default Login;