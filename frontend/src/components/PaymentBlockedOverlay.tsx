import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { paymentService } from '../lib/services/paymentService';
import { alertCircleOutline, IonButton, IonIcon, IonInput, IonLabel, IonSpinner } from '../lib/ionic';
import "../styles/components/_PaymentBlockedOverlay.css";
import Alert from './ui/Alert';
import { Card, CardContent } from './ui/Card';

const PaymentBlockedOverlay: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [code,    setCode]    = useState('');
    const [error,   setError]   = useState('');

    if (!user?.payment_blocked) return null;

    const validateMutation = useMutation({
        mutationFn: paymentService.validateCode,
        onSuccess: () => { refreshUser(); },
        onError: (e: unknown) => {
            const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? 'Code invalide ou déjà utilisé.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!code.trim()) return;
        validateMutation.mutate(code.trim());
    };

    return (
        <div className="pbo-backdrop">
            <Card className="pbo-card" radius="xl">
                <CardContent>
                    <div className="pbo-icon-wrapper">
                        <IonIcon icon={alertCircleOutline} className="pbo-icon" />
                    </div>
                    <h2 className="pbo-description">Scolarité impayée</h2>

                    <Alert
                        variant="warning"
                        description="Votre accès est bloqué en raison d'un retard de paiement. Veuillez vous rapprocher de l'administration et saisir le code de validation ci-dessous."
                    />

                    <form onSubmit={handleSubmit} className="pbo-form">
                        <IonLabel>Code de validation</IonLabel>
                        <IonInput
                            value={code}
                            onIonInput={e => setCode(String(e.detail.value ?? ''))}
                            placeholder="PAY-XXXXXX"
                            autocomplete="off"
                            className="pbo-input"
                            required
                        />

                        {error && (
                            <Alert variant="danger" description={error} dismissible onDismiss={() => setError('')} />
                        )}

                        <IonButton
                            type="submit"
                            expand="block"
                            className="pbo-submit-btn"
                            disabled={validateMutation.isPending || !code.trim()}
                        >
                            {validateMutation.isPending
                                ? <IonSpinner name="crescent" />
                                : 'Valider le paiement'
                            }
                        </IonButton>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentBlockedOverlay;
