import React from 'react';
import { Link } from 'react-router-dom';
import { arrowForwardOutline, bookOutline, desktopOutline, documentTextOutline, IonButton, IonCol, IonContent, IonGrid, IonIcon, IonPage, IonRow, peopleOutline, ribbonOutline, schoolOutline, shieldOutline } from '../lib/ionic';
import { Card, CardContent } from '../components';
import '../styles/LandingPage.css';


const features = [
  { icon: bookOutline, title: "Cours en ligne", description: "Accédez à vos cours, supports et exercices à tout moment." },
  { icon: peopleOutline, title: "Communauté", description: "Échangez avec vos camarades et enseignants en temps réel." },
  { icon: ribbonOutline, title: "Certifications", description: "Obtenez vos attestations et diplômes numériques." },
  { icon: desktopOutline, title: "E-Learning", description: "Vidéos, quiz et examens interacrifs pour un apprentissage moderne." },
  { icon: shieldOutline, title: "Gestion sécurisée", description: "Notes, présences et documents gérés en toute sécurité." },
  { icon: schoolOutline, title: "Filières LIC & LAP", description: "Informatique ou Administrative - Choisissez votre parcours." },
];

const Landing: React.FC = () => {
  return (
    <IonPage>
      <IonContent className="landing-content" scrollEvents={true}>
        <nav className="landing-nav">
          <div className="landing-nav-inner">
            <Link to="/" className="landing-nav-brand">
              <div className="landing-nav-logo">
                <IonIcon icon={schoolOutline}></IonIcon>
              </div>
              <span className="landing-nav-name">CFI-LINK</span>
            </Link>

            <div className="landing-nav-links">
              <a href="#features" className="landing-nav-link">Fonctionnalités</a>
              <a href="#filieres" className="landing-nav-link">Filières</a>
              <a href="#about" className="landing-nav-link">À propos</a>
            </div>

            <div className="landing-nav-actions">
              <Link to="/login">
                <IonButton fill="clear" size="small" className="action-btn">Se connecter</IonButton>
              </Link>
              <Link to="/register">
                <IonButton size="small" className="action-btn">S'inscrire</IonButton>
              </Link>
            </div>
          </div>
        </nav>

        <section className="landing-hero">
          <div className="landing-hero-bg" />
          <div className="landing-hero-body">
            <h1 className="landing-hero-title">
              Votre avenir commence avec{" "}
              <span className="landing-hero-gradient">CFI-LINK</span>
            </h1>
            <p className="landing-hero-sub">
              La plateforme e-learning du CFI-CIRAS. Gérez vos cours, suivez
              vos notes, et connectez-vous à votre communauté universitaire.
            </p>
            <div className="landing-hero-ctas">
              <Link to="/login">
                <IonButton expand="block" size="large"  className="ctas-btn">
                  <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                  Commencer maintenant
                </IonButton>
              </Link>
              <a href="#features">
                <IonButton fill="outline" size="large" color="light" className="ctas-btn" style={{ fontWeight: "bold" }}>
                  Découvrir la plateforme
                </IonButton>
              </a>
            </div>
          </div>
          <div className="landing-hero-wave">
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
              <path d="M0 40C360 100 720 0 1440 60V100H0V40Z" fill="var(--ion-background-color, #fff)" />
            </svg>
          </div>
        </section>

        <section id="features" className="landing-section">
          <div className="landing-container">
            <div className="landing-section-header">
              <h2 className="landing-section-title">Tout ce dont vous avez besoin</h2>
              <p className="landing-section-sub">
                CFI-LINK centralise la gestion académique, administrative et communautaire du CFI-CIRAS.
              </p>
            </div>

            <IonGrid className="ion-no-padding">
              <IonRow>
                {features.map(f => (
                  <IonCol key={f.title} size="12" sizeSm="6" sizeLg="4">
                    <Card variant="default" hoverable radius="lg" className="landing-feature-card">
                      <CardContent padding="lg">
                        <div className="landing-feature-icon">
                          <IonIcon icon={f.icon} />
                        </div>
                        <h3 className="landing-feature-title">{f.title}</h3>
                        <p className="landing-feature-desc">{f.description}</p>
                      </CardContent>
                    </Card>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>
        </section>

        <section id="filieres" className="landing-section landing-section--alt">
          <div className="landing-container">
            <div className="landing-section-header">
              <h2 className="landing-section-title">Nos Filières</h2>
              <p className="landing-section-sub">Deux parcours de Licence adaptés à vos ambitions.</p>
            </div>

            <IonGrid className="ion-no-padding">
              <IonRow className="ion-justify-content-center">
                <IonCol size="12" sizeMd="6">
                  <Card variant="default" radius="xl" className="landing-filiere-card">
                    <CardContent padding="lg">
                      <div className="landing-filiere-icon landing-filiere-icon--blue">
                        <IonIcon icon={desktopOutline} />
                      </div>
                      <h3 className="landing-filiere-title">LIC — Informatique</h3>
                      <p className="landing-filiere-desc">3 ans de formation avec spécialisation en 3ème année :</p>
                      <ul className="landing-filiere-list">
                        <li><span className="landing-filiere-dot landing-filiere-dot--blue" /><strong>GL</strong> — Génie Logiciel</li>
                        <li><span className="landing-filiere-dot landing-filiere-dot--blue" /><strong>SR</strong> — Systèmes & Réseaux / Télécoms</li>
                      </ul>
                    </CardContent>
                  </Card>
                </IonCol>

                <IonCol size="12" sizeMd="6">
                  <Card variant="default" radius="xl" className="landing-filiere-card">
                    <CardContent padding="lg">
                      <div className="landing-filiere-icon landing-filiere-icon--green">
                        <IonIcon icon={documentTextOutline} />
                      </div>
                      <h3 className="landing-filiere-title">LAP — Administrative</h3>
                      <p className="landing-filiere-desc">Licence Administrative et Professionnelle en 3 ans.</p>
                      <ul className="landing-filiere-list">
                        <li><span className="landing-filiere-dot landing-filiere-dot--green" />Gestion administrative</li>
                        <li><span className="landing-filiere-dot landing-filiere-dot--green" />Formation professionnelle</li>
                      </ul>
                    </CardContent>
                  </Card>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </section>

        <footer id="about" className="landing-footer">
          <div className="landing-container landing-footer-inner">
            <div className="landing-footer-brand">
              <div className="landing-footer-logo"><IonIcon icon={schoolOutline} /></div>
              <div>
                <h3 className="landing-footer-name">CFI-LINK</h3>
                <p className="landing-footer-sub">CFI-CIRAS — Plateforme académique</p>
              </div>
            </div>
            <p className="landing-footer-copy">© 2026 CFI-CIRAS. Tous droits réservés.</p>
          </div>
        </footer>

      </IonContent>
    </IonPage>
  );
}

export default Landing;
