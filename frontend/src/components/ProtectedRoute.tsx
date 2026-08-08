import React from 'react';
import { IonContent, IonPage, IonSpinner } from '../lib/ionic';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../lib/store';
import { Redirect } from 'react-router-dom';
import "../styles/components/_ProtectedRoute.css";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <IonPage>
                <IonContent>
                    <div className="protected-loading">
                        <IonSpinner name="crescent" className="protected-spinner"></IonSpinner>
                        <p className="protected-loading-text"></p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }
  
    if (!user) {
        return <Redirect to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Redirect to="/dashboard"></Redirect>;
    }

    return <>{children}</>

}

export default ProtectedRoute
