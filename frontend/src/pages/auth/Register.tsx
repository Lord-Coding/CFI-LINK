import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Annee, Filiere, OptionLIC } from '../../lib/store';
import { arrowBackOutline, checkmarkCircleOutline, IonButton, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonInputPasswordToggle, IonItem, IonLabel, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner, schoolOutline } from '../../lib/ionic';
import { Card, CardContent, Alert } from '../../components';
import { authService, type RegisterPayload } from '../../lib/services/authService';
import '../../styles/RegisterPage.css';

type StudentType = "concours" | "externe";
type Step = "choose" | "code" | "info" | "success";

const Register: React.FC = () => {
    const history = useHistory();

    const [type, setType] = useState<StudentType | null>(null);
    const [step, setStep] = useState<Step>("choose");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [code, setCode] = useState("");
    // Données pré-remplies par le code concours (réponse API)
    const [concoursData, setConcoursData] = useState<{
        nom_complet: string; filiere: Filiere; annee: Annee; option_lic?: OptionLIC;
    } | null>(null);

    // Pour l'externe on garde juste le code validé
    const [validationCode, setValidationCode] = useState<string | null>(null);

    const [nomComplet, setNomComplet] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [filiere, setFiliere] = useState<Filiere | "">("");
    const [annee, setAnnee] = useState<Annee | "">("");
    const [option, setOption] = useState<OptionLIC | "">("");

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (type === "concours") {
                // Vérification côté serveur via un appel register "dry-run" non disponible
                // On valide côté client d'abord via le format, puis le serveur rejette si invalide
                if (!code.trim().startsWith('CONC-')) {
                    setError("Format de code concours invalide (CONC-XXXXXX).");
                    return;
                }
                // Pré-remplissage temporaire — sera vérifié par le backend au submit final
                setConcoursData(null); // le backend valide au moment de register
                setStep("info");
            } else {
                if (!code.trim().startsWith('EXT-')) {
                    setError("Format de code externe invalide (EXT-XXXXXX).");
                    return;
                }
                setValidationCode(code.trim());
                setStep("info");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
        if (type === "externe" && (!nomComplet || !filiere || !annee)) {
            setError("Veuillez remplir tous les champs."); return;
        }
        setLoading(true);
        try {
            const payload: RegisterPayload = {
                type: type === "concours" ? "concours" : "externe",
                code: code.trim(),
                email,
                password,
                nom_complet: type === "externe" ? nomComplet : undefined,
                filiere: type === "externe" ? (filiere as Filiere) : undefined,
                annee: type === "externe" ? (annee as Annee) : undefined,
                option_lic: type === "externe" && filiere === "LIC" && annee === "L3"
                    ? (option as OptionLIC) : undefined,
            };
            await authService.register(payload);
            setStep("success");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;
            setError(msg ?? "Une erreur est survenue. Vérifiez vos informations.");
        } finally {
            setLoading(false);
        }
    }

  return (
    <IonPage>
      <IonContent className="register-content" scrollY={true}>
        <IonGrid className="register-grid ion-no-padding">
          <IonRow className="register-row">

            {/* ── Panneau héro desktop ── */}
            <IonCol size="0" sizeLg="6" className="register-hero-col">
              <div className="register-hero">
                <div className="register-hero-overlay" />
                <div className="register-hero-body">
                  <div className="register-hero-logo">
                    <IonIcon icon={schoolOutline} />
                  </div>
                  <h2 className="register-hero-title">Rejoignez CFI-LINK</h2>
                  <p className="register-hero-sub">
                    Inscrivez-vous pour accéder à la plateforme académique du CFI-CIRAS.
                  </p>
                </div>
              </div>
            </IonCol>

            {/* ── Formulaire multi-étapes ── */}
            <IonCol size="12" sizeLg="6" className="register-form-col">
              <div className="register-form-wrapper">

                {/* Logo mobile */}
                <Link to="/" className="register-mobile-logo">
                  <div className="register-mobile-logo-icon">
                    <IonIcon icon={schoolOutline} />
                  </div>
                  <span className="register-mobile-logo-text">CFI-LINK</span>
                </Link>

                {/* ════ ÉTAPE : Choisir le type ════ */}
                {step === "choose" && (
                  <div className="register-step">
                    <IonButton
                      size="small"
                      fill="clear"
                      onClick={() => history.push("/landing")}
                      className="register-back-btn"
                    >
                      <IonIcon slot="start" icon={arrowBackOutline} />
                      Retour à l'accueil
                    </IonButton>

                    <h1 className="register-title">Inscription</h1>
                    <p className="register-subtitle">Choisissez votre type d'inscription.</p>
                    <div className="register-type-cards">
                      {/* Carte concours — Card UI CFI clickable */}
                      <Card
                        variant="outlined"
                        hoverable
                        clickable
                        radius="lg"
                        onClick={() => { setType("concours"); setStep("code"); }}
                        className="register-type-card-cfi"
                      >
                        <CardContent padding="md">
                          <h3 className="register-type-card-title">Étudiant par concours</h3>
                          <p className="register-type-card-desc">
                            Vous avez réussi le concours d'entrée et disposez d'un code concours.
                          </p>
                        </CardContent>
                      </Card>

                      {/* Carte externe */}
                      <Card
                        variant="outlined"
                        hoverable
                        clickable
                        radius="lg"
                        onClick={() => { setType("externe"); setStep("code"); }}
                        className="register-type-card-cfi"
                      >
                        <CardContent padding="md">
                          <h3 className="register-type-card-title">Étudiant externe</h3>
                          <p className="register-type-card-desc">
                            Vous avez payé la taxe d'inscription et reçu un code de validation.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* ════ ÉTAPE : Saisir le code ════ */}
                {step === "code" && (
                  <div className="register-step">
                    <IonButton
                      size="small"
                      fill="clear"
                      onClick={() => { setStep("choose"); setError(""); }}
                      className="register-back-btn"
                    >
                      Retour
                      <IonIcon slot="start" icon={arrowBackOutline}></IonIcon>
                    </IonButton>

                    <h1 className="register-title">
                      {type === "concours" ? "Code concours" : "Code de validation"}
                    </h1>
                    <p className="register-subtitle">
                      {type === "concours"
                        ? "Saisissez le code concours qui vous a été attribué."
                        : "Saisissez le code de validation reçu auprès de l'administration."}
                    </p>

                    <form onSubmit={handleCodeSubmit} className="register-form">
                      <IonItem className="register-input-item" lines="full">
                        <IonLabel position="stacked">
                          {type === "concours" ? "Code concours" : "Code de validation"}
                        </IonLabel>
                        <IonInput
                          value={code}
                          onIonInput={e => setCode(String(e.detail.value ?? ""))}
                          placeholder={type === "concours" ? "CONC-XXXXXX" : "EXT-XXXXXX"}
                          required
                        />
                      </IonItem>

                      {error && (
                        <Alert
                          variant="danger"
                          description={error}
                          dismissible
                          onDismiss={() => setError("")}
                        />
                      )}

                      <IonButton
                        size="large"
                        expand="block"
                        type="submit"
                        className="register-submit-btn"
                      >
                        Vérifier le code
                      </IonButton>
                    </form>
                  </div>
                )}

                {/* ════ ÉTAPE : Informations ════ */}
                {step === "info" && (
                  <div className="register-step">
                    <IonButton
                      fill="clear"
                      size="small"
                      onClick={() => { setStep("code"); setError(""); }}
                      className="register-back-btn"
                    >
                      Retour
                      <IonIcon slot="start" icon={arrowBackOutline}></IonIcon>
                    </IonButton>

                    <h1 className="register-title">Vos informations</h1>
                    <p className="register-subtitle">Complétez votre inscription.</p>

                    <form onSubmit={handleRegister} className="register-form">
                        {type === "concours" ? (
                        /* Bannière concours */
                        <Card variant="flat" className="register-concours-card">
                          <CardContent padding="sm">
                            <p className="register-concours-text">
                              Code concours : <strong>{code}</strong>
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--ion-color-medium)', marginTop: '0.25rem' }}>
                              Le nom et la filière seront récupérés depuis le serveur.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <>
                          <IonItem className="register-input-item" lines="full">
                            <IonLabel position="stacked">Nom complet</IonLabel>
                            <IonInput
                              value={nomComplet}
                              onIonInput={e => setNomComplet(String(e.detail.value ?? ""))}
                              placeholder="Jean Dupont"
                              required
                            />
                          </IonItem>

                          <div className="register-row-2col">
                            <IonItem className="register-input-item" lines="full">
                              <IonLabel position="stacked">Filière</IonLabel>
                              <IonSelect
                                value={filiere}
                                onIonChange={e => { setFiliere(e.detail.value); setOption(""); }}
                                placeholder="Choisir"
                                interface="action-sheet"
                              >
                                <IonSelectOption value="LIC">LIC — Informatique</IonSelectOption>
                                <IonSelectOption value="LAP">LAP — Administrative</IonSelectOption>
                              </IonSelect>
                            </IonItem>

                            <IonItem className="register-input-item" lines="full">
                              <IonLabel position="stacked">Année</IonLabel>
                              <IonSelect
                                value={annee}
                                onIonChange={e => setAnnee(e.detail.value)}
                                placeholder="Choisir"
                                interface="action-sheet"
                              >
                                <IonSelectOption value="L1">L1</IonSelectOption>
                                <IonSelectOption value="L2">L2</IonSelectOption>
                                <IonSelectOption value="L3">L3</IonSelectOption>
                              </IonSelect>
                            </IonItem>
                          </div>

                          {filiere === "LIC" && annee === "L3" && (
                            <IonItem className="register-input-item" lines="full">
                              <IonLabel position="stacked">Option (obligatoire L3 LIC)</IonLabel>
                              <IonSelect
                                value={option}
                                onIonChange={e => setOption(e.detail.value)}
                                placeholder="Choisir une option"
                                interface="action-sheet"
                              >
                                <IonSelectOption value="GL">GL — Génie Logiciel</IonSelectOption>
                                <IonSelectOption value="SR">SR — Réseaux & Télécoms</IonSelectOption>
                              </IonSelect>
                            </IonItem>
                          )}
                        </>
                      )}

                      <IonItem className="register-input-item" lines="full">
                        <IonLabel position="stacked">Email</IonLabel>
                        <IonInput
                          type="email"
                          value={email}
                          onIonInput={e => setEmail(String(e.detail.value ?? ""))}
                          placeholder="votre@email.com"
                          required
                        />
                      </IonItem>

                      <IonItem className="register-input-item" lines="full">
                        <IonLabel position="stacked">Mot de passe</IonLabel>
                        <IonInput
                          type="password"
                          value={password}
                          onIonInput={e => setPassword(String(e.detail.value ?? ""))}
                          placeholder="••••••••"
                          required
                        >
                            <IonIcon slot="start" icon="lockClosedOutline"></IonIcon>
                            <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
                        </IonInput>
                      </IonItem>

                      {error && (
                        <Alert
                          variant="danger"
                          description={error}
                          dismissible
                          onDismiss={() => setError("")}
                        />
                      )}

                      <IonButton
                        size="large"
                        expand="block"
                        shape="round"
                        type="submit"
                        disabled={loading}
                        className="register-submit-btn"
                      >
                        {loading ? (
                            <IonSpinner name="crescent" />
                        ) : (
                            "Créer un compte"
                        )}
                      </IonButton>
                    </form>
                  </div>
                )}

                {step === "success" && (
                  <div className="register-success">
                    <div className="register-success-icon">
                      <IonIcon icon={checkmarkCircleOutline} />
                    </div>
                    <h2 className="register-success-title">Inscription réussie !</h2>
                    <p className="register-success-msg">
                      {type === "concours"
                        ? "Votre compte a été activé automatiquement. Vous pouvez vous connecter."
                        : "Votre compte sera activé par l'administration. Vous recevrez une confirmation."}
                    </p>
                    <IonButton
                      size="large"
                      shape="round"
                      expand="block"
                      onClick={() => history.replace("/login")}
                      className="register-submit-btn"
                    >
                      Se connecter
                    </IonButton>
                  </div>
                )}

                {step !== "success" && (
                  <p className="register-login-link">
                    Déjà un compte ?{" "}
                    <Link to="/login" className="register-link">Se connecter</Link>
                  </p>
                )}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  )
}

export default Register;