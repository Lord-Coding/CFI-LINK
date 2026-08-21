import React, { useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
    IonButton, IonCol, IonContent, IonGrid, IonIcon,
    IonInput, IonLabel, IonPage, IonRow, IonSpinner,
    arrowBackOutline, checkmarkCircleOutline, lockClosedOutline, mailOutline,
} from '../../lib/ionic';
import { Alert } from '../../components';
import { passwordResetService } from '../../lib/services/passwordResetService';
import '../../styles/ForgotPasswordPage.css';

type Step = 'email' | 'code' | 'password' | 'success';

/* ────────────────────────────────────────────────
   Page "Mot de passe oublié" — 3 étapes :
   1. Saisir l'email
   2. Entrer le code à 6 chiffres reçu par mail
   3. Choisir un nouveau mot de passe
──────────────────────────────────────────────── */
const ForgotPassword: React.FC = () => {
    const history = useHistory();

    const [step,     setStep]     = useState<Step>('email');
    const [email,    setEmail]    = useState('');
    const [code,     setCode]     = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirm,  setConfirm]  = useState('');
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState('');
    const [resendCd, setResendCd] = useState(0);

    // Refs pour les 6 champs du code
    const codeRefs = [
        useRef<HTMLIonInputElement>(null),
        useRef<HTMLIonInputElement>(null),
        useRef<HTMLIonInputElement>(null),
        useRef<HTMLIonInputElement>(null),
        useRef<HTMLIonInputElement>(null),
        useRef<HTMLIonInputElement>(null),
    ];

    const codeString = code.join('');
    const codeComplete = codeString.length === 6 && code.every(c => /^\d$/.test(c));

    /* ── Étape 1 : demander le code ── */
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email.trim()) return;
        setLoading(true);
        try {
            await passwordResetService.requestReset(email.trim());
            setStep('code');
            startResendCooldown();
        } catch {
            setError("Une erreur est survenue. Vérifiez l'email et réessayez.");
        } finally {
            setLoading(false);
        }
    };

    /* ── Étape 2 : vérifier le code ── */
    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!codeComplete) { setError('Entrez les 6 chiffres du code.'); return; }
        setLoading(true);
        try {
            const res = await passwordResetService.verifyCode(email, codeString);
            if (res.valid) {
                setStep('password');
            } else {
                setError(res.message ?? 'Code invalide ou expiré.');
            }
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? 'Code invalide ou expiré.');
        } finally {
            setLoading(false);
        }
    };

    /* ── Étape 3 : nouveau mot de passe ── */
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
        if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
        setLoading(true);
        try {
            await passwordResetService.resetPassword(email, codeString, password, confirm);
            setStep('success');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? 'Une erreur est survenue. Réessayez.');
        } finally {
            setLoading(false);
        }
    };

    /* ── Renvoi de code ── */
    const handleResend = async () => {
        if (resendCd > 0) return;
        setError('');
        setLoading(true);
        try {
            await passwordResetService.requestReset(email);
            setCode(['', '', '', '', '', '']);
            startResendCooldown();
        } catch {
            setError("Impossible de renvoyer le code. Réessayez.");
        } finally {
            setLoading(false);
        }
    };

    const startResendCooldown = () => {
        setResendCd(60);
        const iv = setInterval(() => {
            setResendCd(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; });
        }, 1000);
    };

    /* ── Saisie du code chiffre par chiffre ── */
    const handleCodeInput = (idx: number, val: string) => {
        const digit = val.replace(/\D/g, '').slice(-1);
        const next  = [...code];
        next[idx]   = digit;
        setCode(next);
        if (digit && idx < 5) {
            codeRefs[idx + 1].current?.setFocus();
        }
    };

    const handleCodeKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[idx] && idx > 0) {
            codeRefs[idx - 1].current?.setFocus();
        }
    };

    /* ── Indicateur d'étapes ── */
    const stepDone = (s: number) => {
        const order: Step[] = ['email', 'code', 'password', 'success'];
        return order.indexOf(step) > s;
    };
    const stepActive = (s: number) => {
        const order: Step[] = ['email', 'code', 'password'];
        return order.indexOf(step) === s;
    };

    return (
        <IonPage>
            <IonContent className="fp-content" scrollY={true}>
                <IonGrid className="fp-grid ion-no-padding">
                    <IonRow className="fp-row">

                        {/* ── Hero desktop ── */}
                        <IonCol size="0" sizeLg="6" className="fp-hero-col">
                            <div className="fp-hero">
                                <div className="fp-hero-overlay" />
                                <div className="fp-hero-body">
                                    <div className="fp-hero-icon-wrap">
                                        <IonIcon icon={lockClosedOutline} />
                                    </div>
                                    <h2 className="fp-hero-title">Récupération du compte</h2>
                                    <p className="fp-hero-sub">
                                        Un code de vérification sera envoyé à votre adresse email
                                        pour confirmer votre identité.
                                    </p>
                                </div>
                            </div>
                        </IonCol>

                        {/* ── Formulaire ── */}
                        <IonCol size="12" sizeLg="6" className="fp-form-col">
                            <div className="fp-form-wrapper">

                                {/* Logo mobile */}
                                <Link to="/" className="fp-mobile-logo">
                                    <div className="fp-mobile-logo-icon">
                                        <IonIcon icon={lockClosedOutline} />
                                    </div>
                                    <span className="fp-mobile-logo-text">CFI-LINK</span>
                                </Link>

                                {/* Bouton retour */}
                                {step !== 'success' && (
                                    <IonButton fill="clear" size="small"
                                        onClick={() => step === 'email' ? history.push('/login') : setStep(step === 'code' ? 'email' : 'code')}
                                        className="fp-back-btn">
                                        <IonIcon slot="start" icon={arrowBackOutline} />
                                        {step === 'email' ? 'Retour à la connexion' : 'Étape précédente'}
                                    </IonButton>
                                )}

                                {/* Indicateur 3 étapes */}
                                {step !== 'success' && (
                                    <div className="fp-steps">
                                        {[0, 1, 2].map(i => (
                                            <React.Fragment key={i}>
                                                <div className={`fp-step ${stepDone(i) ? 'fp-step--done' : ''} ${stepActive(i) ? 'fp-step--active' : ''}`}>
                                                    {stepDone(i) ? <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '0.9rem' }} /> : i + 1}
                                                </div>
                                                {i < 2 && <div className={`fp-step-line ${stepDone(i) ? 'fp-step-line--done' : ''}`} />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}

                                {/* ════ ÉTAPE 1 — Email ════ */}
                                {step === 'email' && (
                                    <>
                                        <h1 className="fp-title">Mot de passe oublié ?</h1>
                                        <p className="fp-subtitle">
                                            Entrez votre adresse email. Nous vous enverrons un code à 6 chiffres pour réinitialiser votre mot de passe.
                                        </p>

                                        <form onSubmit={handleEmailSubmit}>
                                            <IonLabel>Adresse email</IonLabel>
                                            <IonInput
                                                type="email" value={email}
                                                onIonInput={e => setEmail(String(e.detail.value ?? ''))}
                                                placeholder="votre@email.com"
                                                autocomplete="email"
                                                required
                                            >
                                                <IonIcon slot="start" icon={mailOutline} />
                                            </IonInput>

                                            {error && (
                                                <Alert variant="danger" description={error} dismissible onDismiss={() => setError('')} />
                                            )}

                                            <IonButton expand="block" shape="round" type="submit"
                                                disabled={loading || !email.trim()} className="fp-submit-btn">
                                                {loading ? <IonSpinner name="crescent" color="light" /> : 'Envoyer le code'}
                                            </IonButton>
                                        </form>

                                        <p className="fp-back-link">
                                            Vous vous souvenez ?{' '}
                                            <Link to="/login" className="fp-link">Se connecter</Link>
                                        </p>
                                    </>
                                )}

                                {/* ════ ÉTAPE 2 — Code ════ */}
                                {step === 'code' && (
                                    <>
                                        <h1 className="fp-title">Entrez le code</h1>
                                        <p className="fp-subtitle">
                                            Un code à 6 chiffres a été envoyé à <strong>{email}</strong>.
                                            Il est valable 15 minutes.
                                        </p>

                                        <form onSubmit={handleCodeSubmit}>
                                            <div className="fp-code-group">
                                                {code.map((digit, idx) => (
                                                    <IonInput
                                                        key={idx}
                                                        ref={codeRefs[idx]}
                                                        className={`fp-code-input${digit ? ' fp-code-input--filled' : ''}`}
                                                        value={digit}
                                                        maxlength={1}
                                                        inputmode="numeric"
                                                        type="text"
                                                        onIonInput={e => handleCodeInput(idx, String(e.detail.value ?? ''))}
                                                        onKeyDown={e => handleCodeKeyDown(idx, e as unknown as React.KeyboardEvent)}
                                                    />
                                                ))}
                                            </div>

                                            {error && (
                                                <Alert variant="danger" description={error} dismissible onDismiss={() => setError('')} />
                                            )}

                                            <IonButton expand="block" shape="round" type="submit"
                                                disabled={loading || !codeComplete} className="fp-submit-btn">
                                                {loading ? <IonSpinner name="crescent" color="light" /> : 'Vérifier le code'}
                                            </IonButton>
                                        </form>

                                        <div className="fp-resend-row">
                                            <span>Pas reçu ?</span>
                                            {resendCd > 0
                                                ? <span>Renvoyer dans {resendCd}s</span>
                                                : (
                                                    <button className="fp-link" onClick={handleResend} disabled={loading}>
                                                        Renvoyer le code
                                                    </button>
                                                )
                                            }
                                        </div>
                                    </>
                                )}

                                {/* ════ ÉTAPE 3 — Nouveau mot de passe ════ */}
                                {step === 'password' && (
                                    <>
                                        <h1 className="fp-title">Nouveau mot de passe</h1>
                                        <p className="fp-subtitle">
                                            Choisissez un mot de passe sécurisé d'au moins 8 caractères.
                                        </p>

                                        <form onSubmit={handlePasswordSubmit}>
                                            <IonLabel>Nouveau mot de passe</IonLabel>
                                            <IonInput
                                                type="password" value={password}
                                                onIonInput={e => setPassword(String(e.detail.value ?? ''))}
                                                placeholder="••••••••" required
                                            >
                                                <IonIcon slot="start" icon={lockClosedOutline} />
                                            </IonInput>

                                            <IonLabel>Confirmer le mot de passe</IonLabel>
                                            <IonInput
                                                type="password" value={confirm}
                                                onIonInput={e => setConfirm(String(e.detail.value ?? ''))}
                                                placeholder="••••••••" required
                                            >
                                                <IonIcon slot="start" icon={lockClosedOutline} />
                                            </IonInput>

                                            {error && (
                                                <Alert variant="danger" description={error} dismissible onDismiss={() => setError('')} />
                                            )}

                                            <IonButton expand="block" shape="round" type="submit"
                                                disabled={loading || !password || !confirm} className="fp-submit-btn">
                                                {loading
                                                    ? <IonSpinner name="crescent" color="light" />
                                                    : 'Réinitialiser le mot de passe'
                                                }
                                            </IonButton>
                                        </form>
                                    </>
                                )}

                                {/* ════ SUCCÈS ════ */}
                                {step === 'success' && (
                                    <div className="fp-success">
                                        <div className="fp-success-icon">
                                            <IonIcon icon={checkmarkCircleOutline} />
                                        </div>
                                        <h2 className="fp-success-title">Mot de passe réinitialisé !</h2>
                                        <p className="fp-success-msg">
                                            Votre mot de passe a été mis à jour avec succès.
                                            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                                        </p>
                                        <IonButton expand="block" shape="round"
                                            onClick={() => history.replace('/login')} className="fp-submit-btn">
                                            Se connecter
                                        </IonButton>
                                    </div>
                                )}

                            </div>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default ForgotPassword;
