import React from 'react'
import { Avatar, Badge, Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components';
import {
    alertCircleOutline, arrowForwardOutline, bookOutline, calendarOutline, cardOutline,
    desktopOutline, documentTextOutline, IonButton, IonCol, IonGrid, IonIcon, IonItem,
    IonLabel, IonList, IonProgressBar, IonRow, keyOutline, notificationsOutline, peopleOutline,
    personCircleOutline, schoolOutline, timeOutline, trendingUpOutline
} from '../lib/ionic';
import { useHistory } from 'react-router-dom';
import { getUsers, isStudent, isProfessor, isStaff, getConcoursCodes, getValidationCodes, ROLE_LABELS, FILIERE_LABELS } from '../lib/store';
import { getNotifications } from '../lib/notifications';
import { useAuth } from '../hooks/useAuth';
import { getCoursesForProfessor, getCoursesForStudent } from '../lib/courses-data';
import DashboardLayout from '../components/DashboardLayout';

interface StatCardProps {
    icon: string;
    label: string;
    value: string;
    color: string;
    desc?: string;
}

interface ActionCardProps {
    to: string;
    icon: string;
    color: string;
    title: string;
    desc: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, desc }) => (
    <Card variant="default" hoverable className="stat-card">
        <CardContent padding="md" className="stat-card-content">
            <div className={`stat-card-icon stat-card-icon--${color}`}>
                <IonIcon icon={icon} />
            </div>
            <p className="stat-catd-value">{value}</p>
            <p className="stat-catd-label">{label}</p>
            <p className="stat-catd-desc">{desc}</p>
        </CardContent>
    </Card>
);

const ActionCard: React.FC<ActionCardProps> = ({ to, icon, color, title, desc }) => {
    const history = useHistory();
    return (
        <Card variant="default" hoverable clickable onClick={() => history.push(to)} className="action-card">
            <CardContent>
                <IonIcon icon={icon} className={`action-card-icon action-card-icon--${color}`}></IonIcon>
                <h3 className="action-card-title">{title}</h3>
                <p className="action-card-desc">{desc}</p>
            </CardContent>
        </Card>
    )
};

function SuperAdminDashboard() {
    const users = getUsers();
    const students = users.filter(u => isStudent(u.role));
    const professors = users.filter(u => isProfessor(u.role));
    const staff = users.filter(u => isStaff(u.role));
    const pending = users.filter(u => !u.is_active);
    const blocked = users.filter(u => u.payment_blocked);
    const concoursCodes = getConcoursCodes();
    const validationCodes = getValidationCodes();

    const stats = [
        { icon: peopleOutline,       label: "Étudiants",        value: String(students.length),   color: "primary", desc: `${pending.filter(u => isStudent(u.role)).length} en attente` },
        { icon: schoolOutline,       label: "Professeurs",      value: String(professors.length), color: "success", desc: "Comptes actifs" },
        { icon: personCircleOutline, label: "Personnel",        value: String(staff.length),      color: "info",    desc: "Membres admin." },
        { icon: alertCircleOutline,  label: "Bloqués",          value: String(blocked.length),    color: "warning", desc: "Scolarité impayée" },
        { icon: keyOutline,          label: "Codes concours",   value: `${concoursCodes.filter(c => !c.used).length}/${concoursCodes.length}`,      color: "primary", desc: "Disponibles" },
        { icon: cardOutline,         label: "Codes validation", value: `${validationCodes.filter(c => !c.used).length}/${validationCodes.length}`,  color: "success", desc: "Disponibles" },
    ];

    return (
        <div className="dashboard-body">
            <div className="dashboard-welcome">
                <h1 className="dashboard-title">Super Administration 🛡️</h1>
                <p className="dashboard-subtitle">Contrôle total de la plateforme CFI-LINK.</p>
            </div>

            <IonGrid className="ion-no-padding">
                <IonRow>
                    {stats.map(s => (
                        <IonCol key={s.label} size="6" sizeLg="4">
                            <StatCard {...s} />
                        </IonCol>
                    ))}
                </IonRow>
            </IonGrid>

            <IonGrid className="ion-no-padding">
                <IonRow>
                    {[
                        { to: "/admin/users",    icon: personCircleOutline, color: "primary", title: "Utilisateurs",   desc: "Créer, activer et gérer les comptes." },
                        { to: "/admin/codes",    icon: keyOutline,          color: "success", title: "Codes",          desc: "Codes concours et validation." },
                        { to: "/admin/payments", icon: cardOutline,         color: "warning", title: "Paiements",      desc: "Scolarité et codes de paiement." },
                        { to: "/elearning",      icon: desktopOutline,      color: "info",    title: "E-Learning",     desc: "Vidéos, quiz et examens." },
                    ].map(item => (
                        <IonCol key={item.to} size="6" sizeLg="3">
                            <ActionCard {...item} />
                        </IonCol>
                    ))}
                </IonRow>
            </IonGrid>

            {pending.length > 0 && (
                <Card variant="default" className="dashboard-card">
                    <CardHeader>
                        <div className="dashboard-card-header">
                            <IonIcon icon={notificationsOutline} className="dashboard-card-header-icon--warning" />
                            <CardTitle>Comptes en attente</CardTitle>
                            <Badge variant="warning" size="sm" pill>{pending.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent padding="md">
                        <IonList lines="none" className="pending-list">
                            {pending.slice(0, 5).map(u => (
                                <IonItem key={u.id} className="pending-item">
                                    <Avatar
                                        slot="start"
                                        fallback={u.nom_complet.charAt(0).toUpperCase()}
                                        size="sm"
                                        color="var(--ion-color-primary)"
                                    />
                                    <IonLabel>
                                        <h3 className="pending-name">{u.nom_complet}</h3>
                                        <p className="pending-meta">{u.email} — {ROLE_LABELS[u.role]}</p>
                                    </IonLabel>
                                    <Badge slot="end" variant="warning" size="sm" dot>En attente</Badge>
                                </IonItem>
                            ))}
                        </IonList>
                    </CardContent>
                    <CardFooter align="end">
                        <IonButton fill="clear" size="small" routerLink="/admin/users">
                            Gérer tous les comptes
                            <IonIcon slot="end" icon={arrowForwardOutline} />
                        </IonButton>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}


function AdminDashboard() {
    const users = getUsers();
    const students = users.filter(u => isStudent(u.role));
    const professors = users.filter(u => isProfessor(u.role));
    const pending = users.filter(u => !u.is_active);
    const blocked = students.filter(u => u.payment_blocked);

    const stats = [
        { icon: peopleOutline,      label: "Étudiants",   value: String(students.length),   color: "primary" },
        { icon: schoolOutline,      label: "Professeurs", value: String(professors.length), color: "success" },
        { icon: timeOutline,        label: "En attente",  value: String(pending.length),    color: "warning" },
        { icon: alertCircleOutline, label: "Bloqués",     value: String(blocked.length),    color: "danger"  },
    ];

    return (
        <div className="dashboard-body">
            <div className="dashboard-welcome">
                <h1 className="dashboard-title">Panneau du Directeur 🏛️</h1>
                <p className="dashboard-subtitle">Vue d'ensemble de l'institution.</p>
            </div>

            <IonGrid className="ion-no-padding">
                <IonRow>
                    {stats.map(s => (
                        <IonCol key={s.label} size="6" sizeLg="3">
                            <StatCard {...s} />
                        </IonCol>
                    ))}
                </IonRow>
            </IonGrid>

            <IonGrid className="ion-no-padding">
                <IonRow>
                    {[
                        { to: "/admin/users",    icon: personCircleOutline, color: "primary", title: "Utilisateurs", desc: "Gérer les comptes." },
                        { to: "/admin/codes",    icon: keyOutline,          color: "success", title: "Codes",        desc: "Concours & validation." },
                        { to: "/admin/payments", icon: cardOutline,         color: "warning", title: "Paiements",    desc: "Scolarité étudiants." },
                        { to: "/courses",        icon: bookOutline,         color: "info",    title: "Cours",        desc: "Voir les cours." },
                    ].map(item => (
                        <IonCol key={item.to} size="6" sizeLg="3">
                            <ActionCard {...item} />
                        </IonCol>
                    ))}
                </IonRow>
            </IonGrid>

            {pending.length > 0 && (
                <Card variant="default" className="dashboard-card">
                    <CardHeader>
                        <div className="dashboard-card-header">
                            <CardTitle>Comptes en attente</CardTitle>
                            <Badge variant="warning" size="sm" pill>{pending.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent padding="md">
                        <IonList lines="none" className="pending-list">
                            {pending.slice(0, 5).map(u => (
                                <IonItem key={u.id} className="pending-item">
                                    <Avatar
                                        slot="start"
                                        fallback={u.nom_complet.charAt(0).toUpperCase()}
                                        size="sm"
                                        color="var(--ion-color-primary)"
                                    />
                                    <IonLabel>
                                        <h3 className="pending-name">{u.nom_complet}</h3>
                                        <p className="pending-meta">{u.email}</p>
                                    </IonLabel>
                                    <Badge slot="end" variant="secondary" size="sm">{ROLE_LABELS[u.role]}</Badge>
                                </IonItem>
                            ))}
                        </IonList>
                    </CardContent>
                    <CardFooter align="end">
                        <IonButton fill="clear" size="small" routerLink="/admin/users">
                            Tout voir <IonIcon slot="end" icon={arrowForwardOutline} />
                        </IonButton>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}


function StudentDashboard() {
    const { user } = useAuth();
    if (!user) return null;

    const courses = getCoursesForStudent(user.filiere, user.annee, user.option);
    const notifs = getNotifications(user.id, user.role).filter(n => !n.read);
    const avProgress = courses.length > 0 ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length) : 0;

    const stats = [
        { icon: bookOutline,          label: "Cours actifs",   value: String(courses.length),                         color: "primary" },
        { icon: timeOutline,          label: "Heures totales", value: `${courses.reduce((a, c) => a + c.hours, 0)}h`, color: "warning" },
        { icon: trendingUpOutline,    label: "Progression",    value: `${avProgress}%`,                               color: "success" },
        { icon: notificationsOutline, label: "Notifications",  value: String(notifs.length),                          color: "danger"  },
    ];

    const todaySchedule = [
        { time: "08:00", subject: courses[0]?.name || "—", room: "Salle A1" },
        { time: "10:00", subject: courses[1]?.name || "—", room: "Labo Info" },
        { time: "14:00", subject: courses[2]?.name || "—", room: "Salle B3" },
    ];

    return (
        <div className="dashboard-body">
            <div className="dashboard-welcome">
                <h1 className="dashboard-title">Bonjour, {user.nom_complet} 👋</h1>
                <p className="dashboard-subtitle">
                    {user.filiere && `${FILIERE_LABELS[user.filiere]} — ${user.annee}`}
                    {user.option  && ` (${user.option})`}
                    {" • "}
                    <Badge variant={user.role === "etudiant_concours" ? "default" : "info"} size="sm">
                        {user.role === "etudiant_concours" ? "Concours" : "Externe"}
                    </Badge>
                </p>
            </div>

            <IonGrid className="ion-no-padding">
                <IonRow>
                    {stats.map(s => (
                        <IonCol key={s.label} size="6" sizeLg="3">
                            <StatCard {...s} />
                        </IonCol>
                    ))}
                </IonRow>
            </IonGrid>

            <IonGrid className="ion-no-padding">
                <IonRow>
                    <IonCol size="12" sizeLg="8">
                        <Card variant="default" className="dashboard-card">
                            <CardHeader>
                                <div className="dashboard-card-header">
                                    <CardTitle>Mes cours</CardTitle>
                                    <IonButton fill="clear" size="small" routerLink="/courses" className="dashboard-see-all">
                                        Voir tout <IonIcon slot="end" icon={arrowForwardOutline} />
                                    </IonButton>
                                </div>
                            </CardHeader>
                            <CardContent padding="md">
                                <div className="courses-list">
                                    {courses.slice(0, 4).map(c => (
                                        <div key={c.id} className="course-item">
                                            <div className="course-item-icon">
                                                <IonIcon icon={bookOutline} />
                                            </div>
                                            <div className="course-item-body">
                                                <p className="course-item-name">{c.name}</p>
                                                <p className="course-item-meta">{c.teacher} • {c.semester}</p>
                                            </div>
                                            <div className="course-item-progress">
                                                <span className="course-progress-pct">{c.progress}%</span>
                                                <IonProgressBar value={c.progress / 100} className="course-progress-bar" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </IonCol>

                    <IonCol size="12" sizeLg="4">
                        <Card variant="default" className="dashboard-card">
                            <CardHeader>
                                <div className="dashboard-card-header">
                                    <IonIcon icon={calendarOutline} className="dashboard-card-header-icon--primary" />
                                    <CardTitle>Aujourd'hui</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent padding="md">
                                <div className="schedule-timeline">
                                    {todaySchedule.map((s, i) => (
                                        <div key={i} className="schedule-item">
                                            <div className="schedule-dots">
                                                <div className="schedule-dot" />
                                                {i < todaySchedule.length - 1 && <div className="schedule-line" />}
                                            </div>
                                            <div className="schedule-body">
                                                <p className="schedule-time">{s.time}</p>
                                                <p className="schedule-subject">{s.subject}</p>
                                                <p className="schedule-room">{s.room}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <IonButton expand="block" fill="outline" size="small" routerLink="/schedule" className="schedule-full-btn">
                                    Voir l'emploi du temps
                                </IonButton>
                            </CardFooter>
                        </Card>
                    </IonCol>
                </IonRow>
            </IonGrid>

            <IonGrid className="ion-no-padding">
                <IonRow>
                    {[
                        { to: "/elearning", icon: desktopOutline,      color: "primary", title: "E-Learning", desc: "" },
                        { to: "/grades",    icon: schoolOutline,        color: "success", title: "Notes",      desc: "" },
                        { to: "/payments",  icon: cardOutline,          color: "warning", title: "Scolarité",  desc: "" },
                        { to: "/documents", icon: documentTextOutline,  color: "info",    title: "Documents",  desc: "" },
                    ].map(a => (
                        <IonCol key={a.to} size="6" sizeLg="3">
                            <ActionCard {...a} />
                        </IonCol>
                    ))}
                </IonRow>
            </IonGrid>
        </div>
    );
}


function ProfessorDashboard() {
    const { user } = useAuth();
    if (!user) return null;

    const myCourses = getCoursesForProfessor(user.nom_complet);
    const totalStudents = myCourses.reduce((a, c) => a + c.students, 0);
    const notifs = getNotifications(user.id, user.role).filter(n => !n.read);

    const stats = [
        { icon: bookOutline,          label: "Mes matières",     value: String(myCourses.length), color: "primary" },
        { icon: peopleOutline,        label: "Étudiants suivis", value: String(totalStudents),    color: "success" },
        { icon: timeOutline,          label: "Heures totales",   value: `${myCourses.reduce((a, c) => a + c.hours, 0)}h`, color: "warning" },
        { icon: notificationsOutline, label: "Notifications",    value: String(notifs.length),    color: "info"    },
    ];

    return (
        <div className="dashboard-body">
            <div className="dashboard-welcome">
                <h1 className="dashboard-title">Bonjour, {user.nom_complet} 📚</h1>
                <p className="dashboard-subtitle">
                    {user.specialite && `Spécialité : ${user.specialite}`}
                    {user.grade      && ` — ${user.grade}`}
                </p>
            </div>

            <IonGrid className="ion-no-padding">
                <IonRow>
                    {stats.map(s => (
                        <IonCol key={s.label} size="6" sizeLg="3">
                            <StatCard {...s} />
                        </IonCol>
                    ))}
                </IonRow>
            </IonGrid>

            <Card variant="default" className="dashboard-card">
                <CardHeader>
                    <div className="dashboard-card-header">
                        <CardTitle>Mes matières</CardTitle>
                        <IonButton fill="clear" size="small" routerLink="/courses" className="dashboard-see-all">
                        Voir tout <IonIcon slot="end" icon={arrowForwardOutline} />
                        </IonButton>
                    </div>
                </CardHeader>
                <CardContent padding="md">
                    <IonGrid className="ion-no-padding">
                        <IonRow>
                            {myCourses.slice(0, 6).map(c => (
                                <IonCol key={c.id} size="12" sizeSm="6">
                                    <div className="prof-course-item">
                                        <div className="prof-course-icon">
                                            <IonIcon icon={bookOutline} />
                                        </div>
                                        <div className="prof-course-body">
                                            <p className="prof-course-name">{c.name}</p>
                                            <p className="prof-course-meta">
                                                {c.filiere} {c.annee}
                                                <Badge variant="secondary" size="sm" style={{ marginLeft: "0.4rem" }}>
                                                {c.students} étudiants
                                                </Badge>
                                            </p>
                                        </div>
                                    </div>
                                </IonCol>
                            ))}
                        </IonRow>
                    </IonGrid>
                </CardContent>
            </Card>

            <IonGrid className="ion-no-padding">
                <IonRow>
                    {[
                        { to: "/grades",    icon: schoolOutline,   color: "success", title: "Notes & résultats", desc: "Saisir et consulter les notes." },
                        { to: "/elearning", icon: desktopOutline,  color: "primary", title: "E-Learning",        desc: "Vidéos, quiz et examens." },
                        { to: "/schedule",  icon: calendarOutline, color: "warning", title: "Emploi du temps",   desc: "Voir le planning." },
                    ].map(item => (
                        <IonCol key={item.to} size="12" sizeMd="4">
                            <ActionCard {...item} />
                        </IonCol>
                    ))}
                </IonRow>
            </IonGrid>
        </div>
    );
}


function StaffDashboard() {
    const { user } = useAuth();
    if (!user) return null;

    const users = getUsers();
    const students = users.filter(u => isStudent(u.role));
    const notifs = getNotifications(user.id, user.role).filter(n => !n.read);

    const stats = [
        { icon: documentTextOutline,  label: "Documents traités",  value: "28",                    color: "primary" },
        { icon: timeOutline,          label: "En attente",         value: "5",                     color: "warning" },
        { icon: peopleOutline,        label: "Dossiers étudiants", value: String(students.length), color: "success" },
        { icon: notificationsOutline, label: "Notifications",      value: String(notifs.length),   color: "info"    },
    ];

    return (
        <div className="dashboard-body">
            <div className="dashboard-welcome">
                <h1 className="dashboard-title">Bonjour, {user.nom_complet} 🏢</h1>
                <p className="dashboard-subtitle">{user.service && `Service : ${user.service}`}</p>
            </div>

            <IonGrid className="ion-no-padding">
                <IonRow>
                    {stats.map(s => (
                        <IonCol key={s.label} size="6" sizeLg="3">
                            <StatCard {...s} />
                        </IonCol>
                    ))}
                </IonRow>
            </IonGrid>

            <IonGrid className="ion-no-padding">
                <IonRow>
                    {[
                        { to: "/documents", icon: documentTextOutline, color: "primary", title: "Documents",           desc: "Gérer les attestations et certificats." },
                        { to: "/schedule",  icon: calendarOutline,     color: "warning", title: "Emploi du temps",     desc: "Consulter le planning." },
                        { to: "/payments",  icon: cardOutline,         color: "success", title: "Paiements étudiants", desc: "Suivi des scolarités." },
                    ].map(item => (
                        <IonCol key={item.to} size="12" sizeMd="4">
                            <ActionCard {...item} />
                        </IonCol>
                    ))}
                </IonRow>
            </IonGrid>
        </div>
    );
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;

  return (
    <DashboardLayout>
        {user.role === "super_admin" && <SuperAdminDashboard />}
        {user.role === "admin" && <AdminDashboard />}
        {isStudent(user.role) && <StudentDashboard />}
        {isProfessor(user.role) && <ProfessorDashboard />}
        {isStaff(user.role) && <StaffDashboard />}
    </DashboardLayout>
  );
};

export default Dashboard;
