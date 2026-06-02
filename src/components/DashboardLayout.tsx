import React, { useEffect, useMemo } from 'react';
import { barChartOutline, bookOutline, calendarNumberOutline, calendarOutline, cardOutline, chatbubblesOutline, clipboardOutline, cogOutline, constructOutline, desktopOutline, documentTextOutline, gridOutline, IonAccordion, IonAccordionGroup, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuButton, IonMenuToggle, IonPage, IonSplitPane, IonToolbar, keyOutline, libraryOutline, mailOutline, peopleOutline, personCircleOutline, schoolOutline, settingsOutline, shieldOutline, statsChartOutline } from '../lib/ionic';
import { useHistory, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS, Role } from '../lib/store';
import PaymentBlockedOverlay from './PaymentBlockedOverlay';
import NotificationPanel from './NotificationsPanel';
import "../styles/_DashboardLayout.css";

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

interface NavModule {
  id: string;
  icon: string;
  label: string;
  items: NavItem[];
}

function getNavModules(role: Role): NavModule[] {
  const moduleDashboard: NavModule = {
    id: "dashboard", icon: gridOutline, label: "Acceuil", items: [{ icon: gridOutline, label: "Tableau de bord", path: "/dashboard" }],
  };

  if (role === "super_admin") {
    return [
      moduleDashboard,
      {
        id: "administration", icon: shieldOutline, label: "Administration",
        items: [
          { icon: personCircleOutline, label: "Utilisateurs",    path: "/admin/users" },
          { icon: keyOutline,          label: "Codes d'accès",   path: "/admin/codes" },
          { icon: cardOutline,         label: "Paiements",       path: "/admin/payments" },
          { icon: calendarNumberOutline, label: "Semestres",     path: "/admin/semesters" },
        ],
      },
      {
        id: "monitoring", icon: statsChartOutline, label: "Supervision",
        items: [
          { icon: barChartOutline, label: "Statistiques",   path: "/admin/stats" },
          { icon: shieldOutline,   label: "Journal d'audit", path: "/admin/audit" },
        ],
      },
      {
        id: "pedagogie", icon: bookOutline, label: "Pédagogie",
        items: [
          { icon: bookOutline,    label: "Cours",          path: "/courses" },
          { icon: desktopOutline, label: "E-Learning",     path: "/elearning" },
          { icon: calendarOutline, label: "Emploi du temps", path: "/schedule" },
          { icon: libraryOutline, label: "Bibliothèque",   path: "/library" },
        ],
      },
      {
        id: "communication", icon: mailOutline, label: "Communication",
        items: [
          { icon: mailOutline,           label: "Messagerie", path: "/messages" },
          { icon: calendarNumberOutline, label: "Calendrier", path: "/calendar" },
          { icon: documentTextOutline,   label: "Documents",  path: "/documents" },
        ],
      },
      {
        id: "parametres", icon: cogOutline, label: "Paramètres",
        items: [
          { icon: settingsOutline, label: "Paramètres", path: "/settings" },
        ],
      },
    ];
  }

  if (role === "admin") {
    return [
      moduleDashboard,
      {
        id: "administration", icon: constructOutline, label: "Administration",
        items: [
          { icon: personCircleOutline, label: "Utilisateurs",  path: "/admin/users" },
          { icon: keyOutline,          label: "Codes d'accès", path: "/admin/codes" },
          { icon: cardOutline,         label: "Paiements",     path: "/admin/payments" },
          { icon: calendarNumberOutline, label: "Semestres",   path: "/admin/semesters" },
          { icon: barChartOutline,     label: "Statistiques",  path: "/admin/stats" },
          { icon: shieldOutline,       label: "Audit",         path: "/admin/audit" },
        ],
      },
      {
        id: "pedagogie", icon: bookOutline, label: "Pédagogie",
        items: [
          { icon: bookOutline,     label: "Cours",            path: "/courses" },
          { icon: desktopOutline,  label: "E-Learning",       path: "/elearning" },
          { icon: calendarOutline, label: "Emploi du temps",  path: "/schedule" },
          { icon: libraryOutline,  label: "Bibliothèque",     path: "/library" },
        ],
      },
      {
        id: "communication", icon: mailOutline, label: "Communication",
        items: [
          { icon: mailOutline,           label: "Messagerie", path: "/messages" },
          { icon: calendarNumberOutline, label: "Calendrier", path: "/calendar" },
          { icon: documentTextOutline,   label: "Documents",  path: "/documents" },
        ],
      },
      {
        id: "parametres", icon: cogOutline, label: "Paramètres",
        items: [{ icon: settingsOutline, label: "Paramètres", path: "/settings" }],
      },
    ];
  }

  if (role === "professeur") {
    return [
      moduleDashboard,
      {
        id: "enseignement", icon: bookOutline, label: "Enseignement",
        items: [
          { icon: bookOutline,    label: "Mes cours",   path: "/courses" },
          { icon: desktopOutline, label: "E-Learning",  path: "/elearning" },
          { icon: schoolOutline,  label: "Notes",       path: "/grades" },
          { icon: clipboardOutline, label: "Présences", path: "/attendance" },
          { icon: calendarOutline, label: "Emploi du temps", path: "/schedule" },
        ],
      },
      {
        id: "communication", icon: chatbubblesOutline, label: "Communication",
        items: [
          { icon: chatbubblesOutline,    label: "Forum",      path: "/forum" },
          { icon: mailOutline,           label: "Messagerie", path: "/messages" },
          { icon: calendarNumberOutline, label: "Calendrier", path: "/calendar" },
        ],
      },
      {
        id: "ressources", icon: libraryOutline, label: "Ressources",
        items: [
          { icon: libraryOutline,      label: "Bibliothèque", path: "/library" },
          { icon: documentTextOutline, label: "Documents",    path: "/documents" },
        ],
      },
      {
        id: "parametres", icon: cogOutline, label: "Paramètres",
        items: [{ icon: settingsOutline, label: "Paramètres", path: "/settings" }],
      },
    ];
  }

  if (role === "membre_administratif") {
    return [
      moduleDashboard,
      {
        id: "gestion", icon: documentTextOutline, label: "Gestion",
        items: [
          { icon: documentTextOutline, label: "Documents",       path: "/documents" },
          { icon: cardOutline,         label: "Paiements",       path: "/payments" },
          { icon: calendarOutline,     label: "Emploi du temps", path: "/schedule" },
        ],
      },
      {
        id: "communication", icon: mailOutline, label: "Communication",
        items: [
          { icon: mailOutline,           label: "Messagerie", path: "/messages" },
          { icon: calendarNumberOutline, label: "Calendrier", path: "/calendar" },
          { icon: libraryOutline,        label: "Bibliothèque", path: "/library" },
        ],
      },
      {
        id: "parametres", icon: cogOutline, label: "Paramètres",
        items: [{ icon: settingsOutline, label: "Paramètres", path: "/settings" }],
      },
    ];
  }

  return [
     moduleDashboard,
    {
      id: "scolarite", icon: schoolOutline, label: "Scolarité",
      items: [
        { icon: bookOutline,      label: "Mes cours",        path: "/courses" },
        { icon: desktopOutline,   label: "E-Learning",       path: "/elearning" },
        { icon: schoolOutline,    label: "Notes",            path: "/grades" },
        { icon: clipboardOutline, label: "Présences",        path: "/attendance" },
        { icon: calendarOutline,  label: "Emploi du temps",  path: "/schedule" },
        { icon: cardOutline,      label: "Scolarité",        path: "/payments" },
      ],
    },
    {
      id: "communaute", icon: peopleOutline, label: "Communauté",
      items: [
        { icon: chatbubblesOutline, label: "Forum",       path: "/forum" },
        { icon: mailOutline,        label: "Messagerie",  path: "/messages" },
        { icon: peopleOutline,      label: "Communauté",  path: "/community" },
      ],
    },
    {
      id: "ressources", icon: libraryOutline, label: "Ressources",
      items: [
        { icon: calendarNumberOutline, label: "Calendrier",   path: "/calendar" },
        { icon: libraryOutline,        label: "Bibliothèque", path: "/library" },
        { icon: documentTextOutline,   label: "Documents",    path: "/documents" },
      ],
    },
    {
      id: "parametres", icon: cogOutline, label: "Paramètres",
      items: [{ icon: settingsOutline, label: "Paramètres", path: "/settings" }],
    },
  ];
};

const MENU_ID = "dashboard-menu"

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const history = useHistory();
  const { user, logout} = useAuth();

  const avatarColor = localStorage.getItem("cfi_avatar_color") || "#3880ff";
  const initials = user?.nom_complet.charAt(0).toUpperCase();

  useEffect(() => {
    const saved = localStorage.getItem("cfi_theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
  }, []);

  const modules = useMemo(() => user ? getNavModules(user.role) : [], [user]);
  const activeModuleId = useMemo(() => {
    if (!user) return null;
    for (const mod of modules) {
      if (mod.items.some(item => item.path === location.pathname)) {
        return mod.id;
      }
    }
    return modules[0]?.id ?? null;
  }, [location.pathname, modules, user]);

  if (!user) return null;

  const handleLogout = () => { 
    logout(); 
    history.push("/auth/login");
  };

  return (
    <IonSplitPane contentId={MENU_ID} className="dashboard-split-pane">
      <PaymentBlockedOverlay></PaymentBlockedOverlay>


      <IonMenu contentId={MENU_ID} className="dashboard-menu">
        <div className="menu-brand">
          <div className="menu-brand-logo">
            <IonIcon icon={schoolOutline}></IonIcon>
          </div>
          <div className="menu-brand-text">
            <span className="menu-brand-name">CFI-LINK</span>
            <span className="menu-brand-sub">CFI-CIRAS</span>
          </div>
        </div>


        <IonContent className="menu-content">
          <IonAccordionGroup
            className="menu-accordion-group"
            value={activeModuleId ?? undefined}
          >
            {modules.map((mod) => {
              const isModuleActive = mod.items.some(
                item => item.path === location.pathname
              );
              if (mod.items.length === 1) {
                const single     = mod.items[0];
                const isActive   = location.pathname === single.path;
                return (
                  <IonMenuToggle key={mod.id} autoHide={false}>
                    <IonItem
                      button
                      detail={false}
                      onClick={() => history.push(single.path)}
                      lines="none"
                      className={`menu-single-item ${isActive ? "menu-single-item--active" : ""}`}
                    >
                      <IonIcon slot="start" icon={single.icon} className="menu-single-icon" />
                      <IonLabel className="menu-single-label">{single.label}</IonLabel>
                    </IonItem>
                  </IonMenuToggle>
                );
              }
 
              return (
                <IonAccordion
                  key={mod.id}
                  value={mod.id}
                  className={`menu-accordion ${isModuleActive ? "menu-accordion--active" : ""}`}
                >
                  <IonItem
                    slot="header"
                    lines="none"
                    className={`menu-module-header ${isModuleActive ? "menu-module-header--active" : ""}`}
                  >
                    <div className={`menu-module-icon-wrap ${isModuleActive ? "menu-module-icon-wrap--active" : ""}`}>
                      <IonIcon icon={mod.icon} className="menu-module-icon" />
                    </div>
                    <IonLabel className="menu-module-label">{mod.label}</IonLabel>
                  </IonItem>
 
                  <div slot="content" className="menu-accordion-content">
                    <IonList lines="none" className="menu-items-list">
                      {mod.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <IonMenuToggle key={item.path} autoHide={false}>
                            <IonItem
                              button
                              detail={false}
                              onClick={() => history.push(item.path)}
                              lines="none"
                              className={`menu-nav-item ${isActive ? "menu-nav-item--active" : ""}`}
                            >
                              <IonIcon slot="start" icon={item.icon} className="menu-nav-icon" />
                              <IonLabel className="menu-nav-label">{item.label}</IonLabel>
                              {isActive && <div slot="end" className="menu-nav-active-dot" />}
                            </IonItem>
                          </IonMenuToggle>
                        );
                      })}
                    </IonList>
                  </div>
                </IonAccordion>
              );
            })}
          </IonAccordionGroup>
        </IonContent>

        <div className="menu-footer">
          <div className="menu-user-info">
            <div className="menu-avatar" style={{ backgroundColor: avatarColor }}>
                {initials}
            </div>
            <div className="menu-user-text">
              <span className="menu-user-name">{user.nom_complet}</span>
              <span className="menu-user-role">{ROLE_LABELS[user.role]}</span>
            </div>
          </div>
          <IonItem className="menu-logout-item" button={true} lines="none" onClick={handleLogout} detail={false}>
            <IonIcon slot="start" icon={cogOutline} className="menu-logout-icon"></IonIcon>
            <IonLabel>Déconnexion</IonLabel>
          </IonItem>
        </div>
      </IonMenu>

      <IonPage id={MENU_ID}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton className="dashboard-menu-btn"></IonMenuButton>
            </IonButtons>
            <IonButtons slot="end" className="dashboard-header-actions">
              <NotificationPanel></NotificationPanel>
              <div className="dashboard-header-user">
                <span className="dashboard-header-name">{user.nom_complet}</span>
                <span className="dashboard-header-role">{ROLE_LABELS[user.role]}</span>
              </div>
              <div className="dashboard-header-avatar" style={{ backgroundColor: avatarColor }}>
                {initials}
              </div>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="dashboard-main-content">
          <div className="dashboard-page-body">
            {children}
          </div>
        </IonContent>
      </IonPage>
    </IonSplitPane>
  )
}

export default DashboardLayout;
