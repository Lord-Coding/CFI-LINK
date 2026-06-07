import React, { useState } from 'react'
import { validatePaymentCode } from '../lib/store';
import { useAuth } from '../hooks/useAuth';
import { alertCircleOutline, IonButton, IonCard, IonCardContent, IonIcon, IonInput, IonLabel, IonSpinner, IonText } from '../lib/ionic';
import "../styles/components/_PaymentBlockedOverlay.css";
import Alert from './ui/Alert';
import { Card, CardContent } from './ui/Card';

const PaymentBlockedOverlay = () => {
    const  { user, refreshUser } = useAuth();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!user?.payment_blocked) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = validatePaymentCode(code, user.id);
            if (result.valid) {
                await refreshUser();
            } else {
                setError(result.error || "Code invalide.");
            }
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="pbo-backdrop">
        <Card className="pbo-card" radius='xl'>
            <CardContent>
                <div className="pbo-icon-wrapper">
                    <IonIcon icon={alertCircleOutline} className="pbo-icon"></IonIcon>
                </div>
                <h2 className="pbo-description">Scolarité impayée</h2>

                <Alert 
                    variant="warning" 
                    description="Votre accès est bloqué en raison d'un retard de paiement. Veuillez vous rapprocher de l'administration et saisir le code de validation ci-dessous."
                ></Alert>

                <form onSubmit={handleSubmit} className="pbo-form">
                    <IonLabel>Code de validation</IonLabel>
                    <IonInput 
                        value={code} 
                        onIonInput={(e) => setCode(String(e.detail.value ?? ""))}
                        placeholder="PAY-XXXXXX"
                        autocomplete="off"
                        className="pbo-input"
                        required
                    ></IonInput>

                    {
                        error && (
                            <Alert variant="danger" description={error} dismissible onDismiss={() => setError("")}></Alert>
                        )
                    }

                    <IonButton type="submit" expand="block" className="pbo-submit-btn" disabled={loading || !code.trim()}>
                        {loading ? <IonSpinner name="crescent"></IonSpinner> : "Valider le paiement"}
                    </IonButton>
                </form>
            </CardContent>
        </Card>
    </div>
  )
}

export default PaymentBlockedOverlay
