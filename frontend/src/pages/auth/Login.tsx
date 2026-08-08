import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth';
import { Link, useHistory } from 'react-router-dom';
import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonInputPasswordToggle, IonLabel, IonPage, IonRow, IonSpinner, lockClosedOutline, mailOutline, schoolOutline, arrowBackOutline } from '../../lib/ionic';
import { Alert } from '../../components';
import '../../styles/LoginPage.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
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

    return (
        <IonPage>
            <IonContent className="login-content" scrollY={false}>
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
                                    <strong>Demo :</strong> admin@cfi-ciras.org / Lord@123@admin
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