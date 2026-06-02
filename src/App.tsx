import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import './styles/responsive.css';

import { AuthProvider } from "./components/providers/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

/* Import des pages et components */
import NotFound from './components/NotFound';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';

setupIonicReact();

const App: React.FC = () => (
<AuthProvider>
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/" component={Landing} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />

          <Route path="/dashboard">
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          </Route>
          {/* <Route path="/courses">
            <ProtectedRoute><Courses /></ProtectedRoute>
          </Route>
          <Route path="/schedule">
            <ProtectedRoute><Schedule /></ProtectedRoute>
          </Route>
          <Route path="/grades">
            <ProtectedRoute allowedRoles={["etudiant_concours", "etudiant_externe", "professeur"]}>
              <Grades />
            </ProtectedRoute>
          </Route>
          <Route path="/settings">
            <ProtectedRoute><Settings /></ProtectedRoute>
          </Route>
          <Route path="/documents">
            <ProtectedRoute><Documents /></ProtectedRoute>
          </Route>
          <Route path="/community">
            <ProtectedRoute allowedRoles={["etudiant_concours", "etudiant_externe"]}>
              <Community />
            </ProtectedRoute>
          </Route>
          <Route path="/elearning">
            <ProtectedRoute><ELearning /></ProtectedRoute>
          </Route>
          <Route path="/messages">
            <ProtectedRoute><Messages /></ProtectedRoute>
          </Route>
          <Route path="/calendar">
            <ProtectedRoute><CalendarPage /></ProtectedRoute>
          </Route>
          <Route path="/attendance">
            <ProtectedRoute allowedRoles={["etudiant_concours", "etudiant_externe", "professeur"]}>
              <Attendance />
            </ProtectedRoute>
          </Route>
          <Route path="/forum">
            <ProtectedRoute allowedRoles={["etudiant_concours", "etudiant_externe", "professeur"]}>
              <Forum />
            </ProtectedRoute>
          </Route>
          <Route path="/library">
            <ProtectedRoute><LibraryPage /></ProtectedRoute>
          </Route>
          <Route path="/payments">
            <ProtectedRoute><Payments /></ProtectedRoute>
          </Route> */}

          {/* Routes admin
          <Route path="/admin/codes">
            <ProtectedRoute allowedRoles={["super_admin", "admin"]}><ManageCodes /></ProtectedRoute>
          </Route>
          <Route path="/admin/users">
            <ProtectedRoute allowedRoles={["super_admin", "admin"]}><ManageUsers /></ProtectedRoute>
          </Route>
          <Route path="/admin/payments">
            <ProtectedRoute allowedRoles={["super_admin", "admin"]}><ManagePayments /></ProtectedRoute>
          </Route>
          <Route path="/admin/stats">
            <ProtectedRoute allowedRoles={["super_admin", "admin"]}><AdminStats /></ProtectedRoute>
          </Route>
          <Route path="/admin/semesters">
            <ProtectedRoute allowedRoles={["super_admin", "admin"]}><ManageSemesters /></ProtectedRoute>
          </Route>
          <Route path="/admin/audit">
            <ProtectedRoute allowedRoles={["super_admin", "admin"]}><AuditLog /></ProtectedRoute>
          </Route> */}

          <Route component={NotFound} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  </AuthProvider>);

export default App;
