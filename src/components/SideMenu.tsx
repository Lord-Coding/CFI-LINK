import React, { useMemo } from "react";
import {
  IonAccordion,
  IonAccordionGroup,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  logOutOutline,
} from "../lib/ionic";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getNavModules } from "../constants/menu-items";
import { ROLE_LABELS } from "../lib/store";
import "../styles/components/_SideMenu.css";

const SideMenu: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { user, logout } = useAuth();

  const avatarColor = localStorage.getItem("cfi_avatar_color") || "#3880ff";
  const initials = user?.nom_complet.charAt(0).toUpperCase();

  const modules = useMemo(() => (user ? getNavModules(user.role, user.staff_role) : []), [user]);
  const activeModuleId = useMemo(() => {
    if (!user) return undefined;
    for (const mod of modules) {
      if (mod.items.some((item) => item.path === location.pathname))
        return mod.id;
    }
    return modules[0]?.id;
  }, [location.pathname, modules, user]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    history.push("/");
  };

  return (
    <IonMenu contentId="main-content" type="overlay" className="dashboard-menu">
      <div className="menu-brand">
        <div className="menu-brand-logo">
          <img src="/logo.png" alt="CFI-LINK logo" />
        </div>
        <div className="menu-brand-text">
          <span className="menu-brand-name">CFI-LINK</span>
          <span className="menu-brand-sub">CFI-CIRAS</span>
        </div>
      </div>

      <IonContent className="menu-content" fullscreen>
        <IonAccordionGroup
          className="menu-accordion-group"
          value={activeModuleId}
        >
          {modules.map((mod) => {
            const isModuleActive = mod.items.some(
              (item) => item.path === location.pathname,
            );

            if (mod.items.length === 1) {
              const single = mod.items[0];
              const isActive = location.pathname === single.path;
              return (
                <IonMenuToggle key={mod.id} autoHide={false}>
                  <IonItem
                    button
                    detail={false}
                    lines="none"
                    onClick={() => history.push(single.path)}
                    className={`menu-single-item ${isActive ? "menu-single-item--active" : ""}`}
                  >
                    <IonIcon
                      slot="start"
                      icon={
                        isActive
                          ? single.iconFilled || single.icon
                          : single.icon
                      }
                      className="menu-single-icon"
                    />
                    <IonLabel className="menu-single-label">
                      {single.label}
                    </IonLabel>
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
                  <div
                    className={`menu-module-icon-wrap ${isModuleActive ? "menu-module-icon-wrap--active" : ""}`}
                  >
                    <IonIcon
                      icon={
                        isModuleActive ? mod.iconFilled || mod.icon : mod.icon
                      }
                      className="menu-module-icon"
                    />
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
                            lines="none"
                            onClick={() => history.push(item.path)}
                            className={`menu-nav-item ${isActive ? "menu-nav-item--active" : ""}`}
                          >
                            <IonIcon
                              slot="start"
                              icon={
                                isActive
                                  ? item.iconFilled || item.icon
                                  : item.icon
                              }
                              className="menu-nav-icon"
                            />
                            <IonLabel className="menu-nav-label">
                              {item.label}
                            </IonLabel>
                            {isActive && (
                              <div slot="end" className="menu-nav-active-dot" />
                            )}
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
        <IonItem
          className="menu-logout-item"
          button={true}
          lines="none"
          detail={false}
          onClick={handleLogout}
        >
          <IonLabel>
            <IonIcon
              slot="start"
              icon={logOutOutline}
              color="danger"
              className="menu-logout-icon"
            />
            Déconnexion
          </IonLabel>
        </IonItem>
      </div>
    </IonMenu>
  );
};

export default SideMenu;
