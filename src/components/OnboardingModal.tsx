import React, { useEffect, useState } from 'react';
import { IonButton, IonIcon } from '../lib/ionic';
import {
    arrowBackOutline,
    arrowForwardOutline,
    barChartOutline,
    bookOutline,
    calendarOutline,
    cardOutline,
    chatbubblesOutline,
    checkmarkCircleOutline,
    closeOutline,
    desktopOutline,
    documentTextOutline,
    gridOutline,
    keyOutline,
    libraryOutline,
    mailOutline,
    peopleOutline,
    personCircleOutline,
    schoolOutline,
} from '../lib/ionic';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../lib/store';
import '../styles/components/_OnboardingModal.css';

/* ─── Clé localStorage ─── */
const STORAGE_KEY = 'cfi_onboarding_done';

/* ─── Types ─── */
interface OnboardingStep {
    icon: string;
    color: string;
    title: string;
    description: string;
    tip?: string;
}

/* ─── Étapes par rôle ─── */
function getStepsForRole(role: Role, name: string): OnboardingStep[] {
    const welcome: OnboardingStep = {
        icon: schoolOutline,
        color: 'primary',
        title: `Bienvenue sur CFI-LINK, ${name.split(' ')[0]} 👋`,
        description:
            'CFI-LINK est la plateforme académique du CFI-CIRAS. Elle centralise tout ce dont vous avez besoin : cours, notes, documents, messagerie et bien plus.',
        tip: 'Ce guide rapide vous présentera les fonctionnalités principales en quelques étapes.',
    };

    if (role === 'super_admin' || role === 'admin') {
        return [
            welcome,
            {
                icon: personCircleOutline,
                color: 'primary',
                title: 'Gestion des utilisateurs',
                description:
                    'Créez, activez et gérez tous les comptes — étudiants, professeurs et personnel administratif — depuis la section Utilisateurs.',
                tip: 'Les nouveaux comptes apparaissent en statut "En attente" jusqu\'à leur activation.',
            },
            {
                icon: keyOutline,
                color: 'success',
                title: 'Codes d\'accès',
                description:
                    'Générez les codes concours (étudiants concours) et les codes de validation (étudiants externes) nécessaires à l\'inscription.',
                tip: 'Chaque code est à usage unique et lié à une filière et un niveau.',
            },
            {
                icon: cardOutline,
                color: 'warning',
                title: 'Paiements et scolarité',
                description:
                    'Suivez les paiements de scolarité, générez les codes de paiement et débloquez les comptes en retard depuis la section Paiements.',
            },
            {
                icon: barChartOutline,
                color: 'info',
                title: 'Statistiques et audit',
                description:
                    'Consultez les statistiques globales de la plateforme et le journal d\'audit qui trace toutes les actions administratives.',
                tip: 'Le journal d\'audit est horodaté et ne peut pas être modifié.',
            },
            {
                icon: checkmarkCircleOutline,
                color: 'success',
                title: 'Vous êtes prêt !',
                description:
                    'Le tableau de bord vous donne une vue d\'ensemble en temps réel. Explorez les modules via le menu latéral à gauche.',
            },
        ];
    }

    if (role === 'professeur') {
        return [
            welcome,
            {
                icon: bookOutline,
                color: 'primary',
                title: 'Vos matières',
                description:
                    'Retrouvez toutes vos matières dans la section Cours. Chaque cours liste les étudiants inscrits et les ressources associées.',
            },
            {
                icon: desktopOutline,
                color: 'info',
                title: 'E-Learning',
                description:
                    'Publiez des leçons, vidéos et quiz dans la section E-Learning. Vos étudiants y accèdent directement depuis leur espace.',
                tip: 'Les quiz peuvent être créés entièrement depuis l\'interface, sans outil externe.',
            },
            {
                icon: schoolOutline,
                color: 'success',
                title: 'Notes et résultats',
                description:
                    'Saisissez les notes CC, TP et Examen pour chaque étudiant. La moyenne est calculée automatiquement lors de la publication.',
            },
            {
                icon: calendarOutline,
                color: 'warning',
                title: 'Emploi du temps et présences',
                description:
                    'Consultez votre planning hebdomadaire et gérez les présences séance par séance depuis la section Présences.',
            },
            {
                icon: checkmarkCircleOutline,
                color: 'success',
                title: 'Vous êtes prêt !',
                description:
                    'Utilisez le menu latéral pour naviguer entre les modules. Votre tableau de bord résume l\'activité de vos cours.',
            },
        ];
    }

    if (role === 'membre_administratif') {
        return [
            welcome,
            {
                icon: documentTextOutline,
                color: 'primary',
                title: 'Documents administratifs',
                description:
                    'Traitez les demandes de documents des étudiants (attestations, relevés, certificats) depuis la section Documents.',
                tip: 'Les modèles sont pré-remplis avec les données de l\'étudiant concerné.',
            },
            {
                icon: cardOutline,
                color: 'warning',
                title: 'Suivi des paiements',
                description:
                    'Consultez l\'état des paiements de scolarité et signalez les situations particulières à l\'administration.',
            },
            {
                icon: calendarOutline,
                color: 'info',
                title: 'Emploi du temps',
                description:
                    'Accédez à l\'emploi du temps complet de l\'établissement. Utile pour coordonner les salles et les ressources.',
            },
            {
                icon: mailOutline,
                color: 'success',
                title: 'Messagerie',
                description:
                    'Communiquez directement avec les étudiants, professeurs et l\'administration via la messagerie intégrée.',
            },
            {
                icon: checkmarkCircleOutline,
                color: 'success',
                title: 'Vous êtes prêt !',
                description:
                    'Votre tableau de bord centralise les tâches en attente. Explorez le menu latéral pour accéder à chaque section.',
            },
        ];
    }

    /* Étudiant (concours & externe) */
    return [
        welcome,
        {
            icon: bookOutline,
            color: 'primary',
            title: 'Vos cours',
            description:
                'Consultez toutes vos matières du semestre en cours dans la section Cours. Chaque fiche détaille le programme, l\'enseignant et votre progression.',
        },
        {
            icon: desktopOutline,
            color: 'info',
            title: 'E-Learning',
            description:
                'Accédez aux vidéos de cours, documents et quiz interactifs publiés par vos professeurs, à tout moment et depuis n\'importe quel appareil.',
            tip: 'Votre progression est sauvegardée automatiquement.',
        },
        {
            icon: schoolOutline,
            color: 'success',
            title: 'Notes et présences',
            description:
                'Consultez vos notes CC, TP et Examen ainsi que votre taux de présence par matière. Les moyennes sont calculées en temps réel.',
        },
        {
            icon: cardOutline,
            color: 'warning',
            title: 'Scolarité',
            description:
                'Suivez l\'état de vos paiements de scolarité et utilisez vos codes de paiement pour régulariser votre situation.',
            tip: 'Un compte bloqué pour impayé sera réactivé dès la validation du paiement.',
        },
        {
            icon: peopleOutline,
            color: 'tertiary',
            title: 'Forum et communauté',
            description:
                'Échangez avec vos camarades sur le forum, consultez l\'annuaire de la promotion et restez informé des actualités du campus.',
        },
        {
            icon: libraryOutline,
            color: 'primary',
            title: 'Bibliothèque et documents',
            description:
                'Accédez à la bibliothèque numérique et demandez vos documents officiels (attestation, relevé de notes) directement depuis la plateforme.',
        },
        {
            icon: checkmarkCircleOutline,
            color: 'success',
            title: 'Vous êtes prêt !',
            description:
                'Votre tableau de bord regroupe l\'essentiel : cours du jour, progression, notifications. Bonne année académique ! 🎓',
        },
    ];
}

/* ─── Composant principal ─── */
const OnboardingModal: React.FC = () => {
    const { user } = useAuth();
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!user) return;
        const done = localStorage.getItem(STORAGE_KEY);
        if (!done) {
            /* Petit délai pour laisser le dashboard s'afficher d'abord */
            const t = setTimeout(() => setVisible(true), 600);
            return () => clearTimeout(t);
        }
    }, [user]);

    if (!user || !visible) return null;

    const steps = getStepsForRole(user.role, user.nom_complet);
    const current = steps[step];
    const isLast = step === steps.length - 1;
    const progress = ((step) / (steps.length - 1)) * 100;

    const handleNext = () => {
        if (isLast) {
            dismiss();
        } else {
            setStep(s => s + 1);
        }
    };

    const handlePrev = () => {
        if (step > 0) setStep(s => s - 1);
    };

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setVisible(false);
    };

    return (
        <div className="ob-backdrop" role="dialog" aria-modal="true" aria-label="Guide de démarrage">
            <div className="ob-modal">

                {/* Bouton fermer */}
                <button className="ob-close" onClick={dismiss} aria-label="Fermer">
                    <IonIcon icon={closeOutline} />
                </button>

                {/* Barre de progression */}
                <div className="ob-progress-bar">
                    <div
                        className="ob-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Indicateur étapes */}
                <div className="ob-steps-dots">
                    {steps.map((_, i) => (
                        <button
                            key={i}
                            className={`ob-dot ${i === step ? 'ob-dot--active' : ''} ${i < step ? 'ob-dot--done' : ''}`}
                            onClick={() => setStep(i)}
                            aria-label={`Étape ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Contenu de l'étape */}
                <div className="ob-step-content" key={step}>
                    <div className={`ob-icon-wrap ob-icon-wrap--${current.color}`}>
                        <IonIcon icon={current.icon} />
                    </div>

                    <h2 className="ob-title">{current.title}</h2>
                    <p className="ob-description">{current.description}</p>

                    {current.tip && (
                        <div className="ob-tip">
                            <span className="ob-tip-label">💡 Bon à savoir</span>
                            <p className="ob-tip-text">{current.tip}</p>
                        </div>
                    )}
                </div>

                {/* Compteur */}
                <p className="ob-counter">{step + 1} / {steps.length}</p>

                {/* Navigation */}
                <div className="ob-actions">
                    <IonButton
                        fill="clear"
                        size="small"
                        onClick={handlePrev}
                        disabled={step === 0}
                        className="ob-btn-prev"
                    >
                        <IonIcon slot="start" icon={arrowBackOutline} />
                        Précédent
                    </IonButton>

                    <IonButton
                        expand="block"
                        shape="round"
                        onClick={handleNext}
                        className="ob-btn-next"
                    >
                        {isLast ? 'Commencer' : 'Suivant'}
                        {!isLast && <IonIcon slot="end" icon={arrowForwardOutline} />}
                        {isLast && <IonIcon slot="end" icon={checkmarkCircleOutline} />}
                    </IonButton>
                </div>

                {/* Skip sur les premières étapes */}
                {!isLast && (
                    <button className="ob-skip" onClick={dismiss}>
                        Passer le guide
                    </button>
                )}
            </div>
        </div>
    );
};

export default OnboardingModal;
