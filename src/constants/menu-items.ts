import {
  barChart,
  barChartOutline,
  book,
  bookOutline,
  calendarNumber,
  calendarNumberOutline,
  calendar,
  calendarOutline,
  card,
  cardOutline,
  chatbubbles,
  chatbubblesOutline,
  clipboard,
  clipboardOutline,
  cog,
  cogOutline,
  construct,
  constructOutline,
  desktop,
  desktopOutline,
  documentText,
  documentTextOutline,
  grid,
  gridOutline,
  key,
  keyOutline,
  library,
  libraryOutline,
  mail,
  mailOutline,
  people,
  peopleOutline,
  personCircle,
  personCircleOutline,
  school,
  schoolOutline,
  settings,
  settingsOutline,
  shield,
  shieldOutline,
  statsChart,
  statsChartOutline,
} from "../lib/ionic";
import { Role } from "../lib/store";

interface NavItem {
  icon: string;
  iconFilled?: string;
  label: string;
  path: string;
}
interface NavModule {
  id: string;
  icon: string;
  iconFilled?: string;
  label: string;
  items: NavItem[];
}

export function getNavModules(role: Role): NavModule[] {
  const moduleDashboard: NavModule = {
    id: "dashboard",
    icon: gridOutline,
    label: "Accueil",
    items: [
      {
        icon: gridOutline,
        iconFilled: grid,
        label: "Tableau de bord",
        path: "/dashboard",
      },
    ],
  };

  if (role === "super_admin")
    return [
      {
        id: "administration",
        icon: shieldOutline,
        label: "Gestion",
        items: [
          {
            icon: gridOutline,
            iconFilled: grid,
            label: "Tableau de bord",
            path: "/dashboard",
          },
          {
            icon: personCircleOutline,
            iconFilled: personCircle,
            label: "Utilisateurs",
            path: "/admin/users",
          },
          {
            icon: keyOutline,
            iconFilled: key,
            label: "Codes d'accès",
            path: "/admin/codes",
          },
          {
            icon: cardOutline,
            iconFilled: card,
            label: "Paiements",
            path: "/admin/payments",
          },
          {
            icon: calendarNumberOutline,
            iconFilled: calendarNumber,
            label: "Semestres",
            path: "/admin/semesters",
          },
        ],
      },
      {
        id: "pedagogie",
        icon: bookOutline,
        iconFilled: book,
        label: "Pédagogie",
        items: [
          {
            icon: bookOutline,
            iconFilled: book,
            label: "Cours",
            path: "/courses",
          },
          {
            icon: desktopOutline,
            iconFilled: desktop,
            label: "E-Learning",
            path: "/elearning",
          },
          {
            icon: calendarOutline,
            iconFilled: calendar,
            label: "Emploi du temps",
            path: "/schedule",
          },
          {
            icon: libraryOutline,
            iconFilled: library,
            label: "Bibliothèque",
            path: "/library",
          },
        ],
      },
      {
        id: "communication",
        icon: mailOutline,
        iconFilled: mail,
        label: "Communication",
        items: [
          {
            icon: mailOutline,
            iconFilled: mail,
            label: "Messagerie",
            path: "/messages",
          },
          {
            icon: calendarNumberOutline,
            iconFilled: calendarNumber,
            label: "Calendrier",
            path: "/calendar",
          },
          {
            icon: documentTextOutline,
            iconFilled: documentText,
            label: "Documents",
            path: "/documents",
          },
        ],
      },
      {
        id: "monitoring",
        icon: statsChartOutline,
        iconFilled: statsChart,
        label: "Paramètres",
        items: [
          {
            icon: barChartOutline,
            iconFilled: barChart,
            label: "Statistiques",
            path: "/admin/stats",
          },
          {
            icon: shieldOutline,
            iconFilled: shield,
            label: "Journal d'audit",
            path: "/admin/audit",
          },
          {
            icon: settingsOutline,
            iconFilled: settings,
            label: "Paramètres",
            path: "/settings",
          },
        ],
      },
    ];

  if (role === "admin")
    return [
      {
        id: "administration",
        icon: constructOutline,
        label: "Gestion",
        items: [
          {
            icon: gridOutline,
            iconFilled: grid,
            label: "Tableau de bord",
            path: "/dashboard",
          },
          {
            icon: personCircleOutline,
            iconFilled: personCircle,
            label: "Utilisateurs",
            path: "/admin/users",
          },
          {
            icon: keyOutline,
            iconFilled: key,
            label: "Codes d'accès",
            path: "/admin/codes",
          },
          {
            icon: cardOutline,
            iconFilled: card,
            label: "Paiements",
            path: "/admin/payments",
          },
          {
            icon: calendarNumberOutline,
            iconFilled: calendarNumber,
            label: "Semestres",
            path: "/admin/semesters",
          },
          {
            icon: barChartOutline,
            iconFilled: barChart,
            label: "Statistiques",
            path: "/admin/stats",
          },
          {
            icon: shieldOutline,
            iconFilled: shield,
            label: "Audit",
            path: "/admin/audit",
          },
        ],
      },
      {
        id: "pedagogie",
        icon: bookOutline,
        label: "Pédagogie",
        items: [
          {
            icon: bookOutline,
            iconFilled: book,
            label: "Cours",
            path: "/courses",
          },
          {
            icon: desktopOutline,
            iconFilled: desktop,
            label: "E-Learning",
            path: "/elearning",
          },
          {
            icon: calendarOutline,
            iconFilled: calendar,
            label: "Emploi du temps",
            path: "/schedule",
          },
          {
            icon: libraryOutline,
            iconFilled: library,
            label: "Bibliothèque",
            path: "/library",
          },
        ],
      },
      {
        id: "communication",
        icon: mailOutline,
        label: "Communication",
        items: [
          {
            icon: mailOutline,
            iconFilled: mail,
            label: "Messagerie",
            path: "/messages",
          },
          {
            icon: calendarNumberOutline,
            iconFilled: calendarNumber,
            label: "Calendrier",
            path: "/calendar",
          },
          {
            icon: documentTextOutline,
            iconFilled: documentText,
            label: "Documents",
            path: "/documents",
          },
        ],
      },
      {
        id: "monitoring",
        icon: statsChartOutline,
        label: "Paramètres",
        items: [
          {
            icon: settingsOutline,
            iconFilled: settings,
            label: "Paramètres",
            path: "/settings",
          },
        ],
      },
    ];

  if (role === "professeur")
    return [
      {
        id: "enseignement",
        icon: bookOutline,
        label: "Enseignement",
        items: [
          {
            icon: gridOutline,
            iconFilled: grid,
            label: "Tableau de bord",
            path: "/dashboard",
          },
          {
            icon: bookOutline,
            iconFilled: book,
            label: "Mes cours",
            path: "/courses",
          },
          {
            icon: desktopOutline,
            iconFilled: desktop,
            label: "E-Learning",
            path: "/elearning",
          },
          {
            icon: schoolOutline,
            iconFilled: school,
            label: "Notes",
            path: "/grades",
          },
          {
            icon: clipboardOutline,
            iconFilled: clipboard,
            label: "Présences",
            path: "/attendance",
          },
          {
            icon: calendarOutline,
            iconFilled: calendar,
            label: "Emploi du temps",
            path: "/schedule",
          },
        ],
      },
      {
        id: "communication",
        icon: chatbubblesOutline,
        label: "Communication",
        items: [
          {
            icon: chatbubblesOutline,
            iconFilled: chatbubbles,
            label: "Forum",
            path: "/forum",
          },
          {
            icon: mailOutline,
            iconFilled: mail,
            label: "Messagerie",
            path: "/messages",
          },
          {
            icon: calendarNumberOutline,
            iconFilled: calendarNumber,
            label: "Calendrier",
            path: "/calendar",
          },
        ],
      },
      {
        id: "ressources",
        icon: libraryOutline,
        label: "Ressources",
        items: [
          {
            icon: libraryOutline,
            iconFilled: library,
            label: "Bibliothèque",
            path: "/library",
          },
          {
            icon: documentTextOutline,
            iconFilled: documentText,
            label: "Documents",
            path: "/documents",
          },
        ],
      },
      {
        id: "monitoring",
        icon: statsChartOutline,
        label: "Paramètres",
        items: [
          {
            icon: settingsOutline,
            iconFilled: settings,
            label: "Paramètres",
            path: "/settings",
          },
        ],
      },
    ];

  if (role === "membre_administratif")
    return [
      {
        id: "gestion",
        icon: documentTextOutline,
        label: "Gestion",
        items: [
          {
            icon: gridOutline,
            iconFilled: grid,
            label: "Tableau de bord",
            path: "/dashboard",
          },
          {
            icon: documentTextOutline,
            iconFilled: documentText,
            label: "Documents",
            path: "/documents",
          },
          {
            icon: cardOutline,
            iconFilled: card,
            label: "Paiements",
            path: "/payments",
          },
          {
            icon: calendarOutline,
            iconFilled: calendar,
            label: "Emploi du temps",
            path: "/schedule",
          },
        ],
      },
      {
        id: "communication",
        icon: mailOutline,
        label: "Communication",
        items: [
          {
            icon: mailOutline,
            iconFilled: mail,
            label: "Messagerie",
            path: "/messages",
          },
          {
            icon: calendarNumberOutline,
            iconFilled: calendarNumber,
            label: "Calendrier",
            path: "/calendar",
          },
          {
            icon: libraryOutline,
            iconFilled: library,
            label: "Bibliothèque",
            path: "/library",
          },
        ],
      },
      {
        id: "monitoring",
        icon: statsChartOutline,
        label: "Paramètres",
        items: [
          {
            icon: settingsOutline,
            iconFilled: settings,
            label: "Paramètres",
            path: "/settings",
          },
        ],
      },
    ];

  // Étudiant (concours & externe)
  return [
    {
      id: "scolarite",
      icon: schoolOutline,
      label: "Scolarité",
      items: [
        {
          icon: gridOutline,
          iconFilled: grid,
          label: "Tableau de bord",
          path: "/dashboard",
        },
        {
          icon: bookOutline,
          iconFilled: book,
          label: "Mes cours",
          path: "/courses",
        },
        {
          icon: desktopOutline,
          iconFilled: desktop,
          label: "E-Learning",
          path: "/elearning",
        },
        {
          icon: schoolOutline,
          iconFilled: school,
          label: "Notes",
          path: "/grades",
        },
        {
          icon: clipboardOutline,
          iconFilled: clipboard,
          label: "Présences",
          path: "/attendance",
        },
        {
          icon: calendarOutline,
          iconFilled: calendar,
          label: "Emploi du temps",
          path: "/schedule",
        },
        {
          icon: cardOutline,
          iconFilled: card,
          label: "Scolarité",
          path: "/payments",
        },
      ],
    },
    {
      id: "communaute",
      icon: peopleOutline,
      label: "Communauté",
      items: [
        {
          icon: chatbubblesOutline,
          iconFilled: chatbubbles,
          label: "Forum",
          path: "/forum",
        },
        {
          icon: mailOutline,
          iconFilled: mail,
          label: "Messagerie",
          path: "/messages",
        },
        {
          icon: peopleOutline,
          iconFilled: people,
          label: "Communauté",
          path: "/community",
        },
      ],
    },
    {
      id: "ressources",
      icon: libraryOutline,
      label: "Ressources",
      items: [
        {
          icon: calendarNumberOutline,
          iconFilled: calendarNumber,
          label: "Calendrier",
          path: "/calendar",
        },
        {
          icon: libraryOutline,
          iconFilled: library,
          label: "Bibliothèque",
          path: "/library",
        },
        {
          icon: documentTextOutline,
          iconFilled: documentText,
          label: "Documents",
          path: "/documents",
        },
      ],
    },
    {
      id: "monitoring",
      icon: statsChartOutline,
      label: "Paramètres",
      items: [
        {
          icon: settingsOutline,
          iconFilled: settings,
          label: "Paramètres",
          path: "/settings",
        },
      ],
    },
  ];
}
