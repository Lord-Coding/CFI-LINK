import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { alertCircleOutline, IonButton, IonContent, IonIcon, IonPage } from '../lib/ionic'
import "../styles/_NotFound.css";

const NotFound: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        console.error("404 - Route inexistante :", location.pathname);
    }, [location.pathname]);

    return (
        <IonPage>
            <IonContent className="notfound-content">
                <div className="notfound-container">
                    <IonIcon icon={alertCircleOutline} className="notfound-icon"></IonIcon>
                    <h1 className="notfound-code">404</h1>
                    <p className="notfound-message">Oups! Page introuvable</p>
                    <IonButton expand="block" shape="round" size="large" onClick={() => window.location.replace("/")} className="notfound-btn">
                        Retour à l'acceuil
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default NotFound;
