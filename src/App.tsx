import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

/* Theme & global styles */
import './theme/variables.css';
import './theme/global.css';

import { AuthProvider } from './components/providers/AuthProvider';
import { ToastProvider } from './components/providers/ToastProvider';
import { ThemeProvider } from './components/ThemeProvider';
import ProtectedRoute from './components/ProtectedRoute';
import SideMenu from './components/SideMenu';
import { useAuth } from './hooks/useAuth';

/* Pages */
import NotFound  from './components/NotFound';
import Landing   from './pages/Landing';
import Login     from './pages/auth/Login';
import Register  from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ManageUsers     from './pages/admin/ManageUsers';
import ManageCodes     from './pages/admin/ManageCodes';
import ManagePayments  from './pages/admin/ManagePayments';
import ManageSemesters from './pages/admin/ManageSemesters';
import AuditLog        from './pages/admin/AuditLog';
import AdminStats      from './pages/admin/AdminStats';
import Courses         from './pages/Courses';
import CourseDetail    from './pages/CourseDetail';
import ELearning       from './pages/ELearning';
import Schedule        from './pages/Schedule';
import Library         from './pages/Library';
import Messages        from './pages/Messages';
import CalendarPage    from './pages/CalendarPage';
import Documents       from './pages/Documents';
import Settings        from './pages/Settings';
import Grades          from './pages/Grades';
import Attendance      from './pages/Attendance';
import Forum           from './pages/Forum';
import Community       from './pages/Community';
import Payments        from './pages/Payments';

setupIonicReact();


interface EBState { hasError: boolean; message: string; }

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, EBState> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, message: '' };
    }

    static getDerivedStateFromError(error: Error): EBState {
        return { hasError: true, message: error.message };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[AppErrorBoundary]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', height: '100vh', padding: '2rem',
                    fontFamily: 'sans-serif', textAlign: 'center',
                }}>
                    <h2 style={{ color: '#eb445a', marginBottom: '0.5rem' }}>Une erreur est survenue</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        {this.state.message}
                    </p>
                    <button
                        onClick={() => { this.setState({ hasError: false, message: '' }); window.location.href = '/'; }}
                        style={{
                            padding: '0.6rem 1.5rem', borderRadius: '10px',
                            background: '#3880ff', color: '#fff', border: 'none',
                            cursor: 'pointer', fontSize: '0.9rem',
                        }}
                    >
                        Retour à l'accueil
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}


const ProtectedApp: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Redirect to="/login" />;

    return (
        <IonSplitPane contentId="main-content" className="dashboard-split-pane">
            <SideMenu />
            <IonRouterOutlet id="main-content">

                <Route path="/dashboard">
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                </Route>

                <Route exact path="/courses">
                    <ProtectedRoute><Courses /></ProtectedRoute>
                </Route>
                <Route path="/courses/:id">
                    <ProtectedRoute><CourseDetail /></ProtectedRoute>
                </Route>
                <Route path="/elearning">
                    <ProtectedRoute><ELearning /></ProtectedRoute>
                </Route>
                <Route path="/schedule">
                    <ProtectedRoute><Schedule /></ProtectedRoute>
                </Route>
                <Route path="/library">
                    <ProtectedRoute><Library /></ProtectedRoute>
                </Route>
                <Route path="/messages">
                    <ProtectedRoute><Messages /></ProtectedRoute>
                </Route>
                <Route path="/calendar">
                    <ProtectedRoute><CalendarPage /></ProtectedRoute>
                </Route>
                <Route path="/documents">
                    <ProtectedRoute><Documents /></ProtectedRoute>
                </Route>
                <Route path="/settings">
                    <ProtectedRoute><Settings /></ProtectedRoute>
                </Route>
                <Route path="/grades">
                    <ProtectedRoute allowedRoles={['etudiant_concours', 'etudiant_externe', 'professeur']}>
                        <Grades />
                    </ProtectedRoute>
                </Route>
                <Route path="/attendance">
                    <ProtectedRoute allowedRoles={['etudiant_concours', 'etudiant_externe', 'professeur']}>
                        <Attendance />
                    </ProtectedRoute>
                </Route>
                <Route path="/forum">
                    <ProtectedRoute allowedRoles={['etudiant_concours', 'etudiant_externe', 'professeur']}>
                        <Forum />
                    </ProtectedRoute>
                </Route>
                <Route path="/community">
                    <ProtectedRoute allowedRoles={['etudiant_concours', 'etudiant_externe']}>
                        <Community />
                    </ProtectedRoute>
                </Route>
                <Route path="/payments">
                    <ProtectedRoute><Payments /></ProtectedRoute>
                </Route>

                {/* Redrection admin */}
                <Route path="/admin/users">
                    <ProtectedRoute allowedRoles={['super_admin', 'admin']}><ManageUsers /></ProtectedRoute>
                </Route>
                <Route path="/admin/codes">
                    <ProtectedRoute allowedRoles={['super_admin', 'admin']}><ManageCodes /></ProtectedRoute>
                </Route>
                <Route path="/admin/payments">
                    <ProtectedRoute allowedRoles={['super_admin', 'admin']}><ManagePayments /></ProtectedRoute>
                </Route>
                <Route path="/admin/semesters">
                    <ProtectedRoute allowedRoles={['super_admin', 'admin']}><ManageSemesters /></ProtectedRoute>
                </Route>
                <Route path="/admin/stats">
                    <ProtectedRoute allowedRoles={['super_admin', 'admin']}><AdminStats /></ProtectedRoute>
                </Route>
                <Route path="/admin/audit">
                    <ProtectedRoute allowedRoles={['super_admin', 'admin']}><AuditLog /></ProtectedRoute>
                </Route>


                {/* Redirection racine vers le dashboard */}
                <Route exact path="/">
                    <Redirect to="/dashboard" />
                </Route>

            </IonRouterOutlet>
        </IonSplitPane>
    );
};


const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) return null;

    return (
        <IonRouterOutlet>
            {/* Pages publiques */}
            <Route exact path="/landing" component={Landing} />
            <Route exact path="/login">
                {user ? <Redirect to="/dashboard" /> : <Login />}
            </Route>
            <Route exact path="/register">
                {user ? <Redirect to="/dashboard" /> : <Register />}
            </Route>

            {/* Racine : redirige selon l'état auth */}
            <Route exact path="/">
                {user ? <Redirect to="/dashboard" /> : <Redirect to="/landing" />}
            </Route>

            {/* Toutes les routes privées sont déléguées à ProtectedApp */}
            <Route path={[
                '/dashboard',
                '/courses',
                '/courses/:id',
                '/schedule',
                '/grades',
                '/settings',
                '/documents',
                '/community',
                '/elearning',
                '/messages',
                '/calendar',
                '/attendance',
                '/forum',
                '/library',
                '/payments',
                '/admin/codes',
                '/admin/users',
                '/admin/payments',
                '/admin/stats',
                '/admin/semesters',
                '/admin/audit',
            ]}>
                <ProtectedApp />
            </Route>

            {/* 404 */}
            <Route component={NotFound} />
        </IonRouterOutlet>
    );
};

/* ─────────────────────────────────────────────
   App root
───────────────────────────────────────────── */
const App: React.FC = () => (
  <IonApp>
    <ThemeProvider>
      <AuthProvider>
          <ToastProvider>
              <IonReactRouter>
                  <AppErrorBoundary>
                      <AppRoutes />
                  </AppErrorBoundary>
              </IonReactRouter>
          </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </IonApp>
);

export default App;
