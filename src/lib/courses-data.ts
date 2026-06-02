import { Filiere, Annee, OptionLIC } from "./store";

export interface CourseData {
  id: string;
  name: string;
  teacher: string;
  filiere: Filiere;
  annee: Annee;
  option?: OptionLIC;
  hours: number;
  progress: number;
  students: number;
  semester: 'S1' | 'S2';
}

export const allCoursesData: CourseData[] = [
  // LIC L1
  { id: "lic-l1-1", name: "Introduction à l'informatique", teacher: "Dr. Owona", filiere: "LIC", annee: "L1", hours: 40, progress: 85, students: 42, semester: "S1" },
  { id: "lic-l1-2", name: "Algorithmique & Programmation C", teacher: "Prof. Mbarga", filiere: "LIC", annee: "L1", hours: 50, progress: 72, students: 42, semester: "S1" },
  { id: "lic-l1-3", name: "Mathématiques pour l'informatique", teacher: "Dr. Talla", filiere: "LIC", annee: "L1", hours: 45, progress: 60, students: 42, semester: "S1" },
  { id: "lic-l1-4", name: "Anglais technique", teacher: "Mme. Fotso", filiere: "LIC", annee: "L1", hours: 25, progress: 65, students: 42, semester: "S1" },
  { id: "lic-l1-5", name: "Architecture des ordinateurs", teacher: "Prof. Essomba", filiere: "LIC", annee: "L1", hours: 35, progress: 50, students: 42, semester: "S2" },
  { id: "lic-l1-6", name: "Programmation Web (HTML/CSS)", teacher: "M. Tabi", filiere: "LIC", annee: "L1", hours: 35, progress: 88, students: 42, semester: "S2" },
  { id: "lic-l1-7", name: "Statistiques & Probabilités", teacher: "Dr. Fouda", filiere: "LIC", annee: "L1", hours: 30, progress: 40, students: 42, semester: "S2" },

  // LIC L2
  { id: "lic-l2-1", name: "Algorithmique avancée", teacher: "Prof. Mbarga", filiere: "LIC", annee: "L2", hours: 45, progress: 72, students: 38, semester: "S1" },
  { id: "lic-l2-2", name: "Base de données", teacher: "Dr. Nkoulou", filiere: "LIC", annee: "L2", hours: 40, progress: 45, students: 38, semester: "S1" },
  { id: "lic-l2-3", name: "Réseaux informatiques", teacher: "Prof. Essomba", filiere: "LIC", annee: "L2", hours: 50, progress: 30, students: 35, semester: "S1" },
  { id: "lic-l2-4", name: "Programmation Orientée Objet (Java)", teacher: "Dr. Owona", filiere: "LIC", annee: "L2", hours: 45, progress: 55, students: 38, semester: "S1" },
  { id: "lic-l2-5", name: "Systèmes d'exploitation", teacher: "Prof. Manga", filiere: "LIC", annee: "L2", hours: 40, progress: 35, students: 38, semester: "S2" },
  { id: "lic-l2-6", name: "Programmation Web (JS/PHP)", teacher: "M. Tabi", filiere: "LIC", annee: "L2", hours: 40, progress: 60, students: 38, semester: "S2" },
  { id: "lic-l2-7", name: "Analyse numérique", teacher: "Dr. Talla", filiere: "LIC", annee: "L2", hours: 30, progress: 25, students: 38, semester: "S2" },

  // LIC L3 GL
  { id: "lic-l3-gl-1", name: "Génie Logiciel", teacher: "Prof. Manga", filiere: "LIC", annee: "L3", option: "GL", hours: 60, progress: 20, students: 20, semester: "S1" },
  { id: "lic-l3-gl-2", name: "Conception UML & Design Patterns", teacher: "Dr. Owona", filiere: "LIC", annee: "L3", option: "GL", hours: 45, progress: 35, students: 20, semester: "S1" },
  { id: "lic-l3-gl-3", name: "Développement Mobile", teacher: "M. Tabi", filiere: "LIC", annee: "L3", option: "GL", hours: 40, progress: 15, students: 20, semester: "S2" },
  { id: "lic-l3-gl-4", name: "Tests & Qualité logicielle", teacher: "Prof. Manga", filiere: "LIC", annee: "L3", option: "GL", hours: 35, progress: 10, students: 20, semester: "S2" },
  { id: "lic-l3-gl-5", name: "Projet de fin d'études", teacher: "Prof. Manga", filiere: "LIC", annee: "L3", option: "GL", hours: 80, progress: 5, students: 20, semester: "S2" },

  // LIC L3 SR
  { id: "lic-l3-sr-1", name: "Administration système", teacher: "Dr. Owona", filiere: "LIC", annee: "L3", option: "SR", hours: 55, progress: 15, students: 18, semester: "S1" },
  { id: "lic-l3-sr-2", name: "Sécurité des réseaux", teacher: "Prof. Essomba", filiere: "LIC", annee: "L3", option: "SR", hours: 50, progress: 25, students: 18, semester: "S1" },
  { id: "lic-l3-sr-3", name: "Cloud & Virtualisation", teacher: "Dr. Owona", filiere: "LIC", annee: "L3", option: "SR", hours: 40, progress: 10, students: 18, semester: "S2" },
  { id: "lic-l3-sr-4", name: "Télécommunications", teacher: "Prof. Essomba", filiere: "LIC", annee: "L3", option: "SR", hours: 45, progress: 20, students: 18, semester: "S2" },
  { id: "lic-l3-sr-5", name: "Projet de fin d'études", teacher: "Prof. Essomba", filiere: "LIC", annee: "L3", option: "SR", hours: 80, progress: 5, students: 18, semester: "S2" },

  // LIC L3 shared (both GL and SR)
  { id: "lic-l3-s-1", name: "Intelligence Artificielle", teacher: "Dr. Nkoulou", filiere: "LIC", annee: "L3", hours: 40, progress: 30, students: 38, semester: "S1" },
  { id: "lic-l3-s-2", name: "Droit du numérique", teacher: "Me. Atangana", filiere: "LIC", annee: "L3", hours: 25, progress: 45, students: 38, semester: "S2" },

  // LAP L1
  { id: "lap-l1-1", name: "Droit administratif", teacher: "Me. Atangana", filiere: "LAP", annee: "L1", hours: 40, progress: 60, students: 30, semester: "S1" },
  { id: "lap-l1-2", name: "Introduction au management", teacher: "Dr. Fouda", filiere: "LAP", annee: "L1", hours: 35, progress: 75, students: 30, semester: "S1" },
  { id: "lap-l1-3", name: "Économie générale", teacher: "M. Biya", filiere: "LAP", annee: "L1", hours: 30, progress: 55, students: 30, semester: "S1" },
  { id: "lap-l1-4", name: "Anglais administratif", teacher: "Mme. Fotso", filiere: "LAP", annee: "L1", hours: 25, progress: 70, students: 30, semester: "S2" },
  { id: "lap-l1-5", name: "Sociologie des organisations", teacher: "Dr. Fouda", filiere: "LAP", annee: "L1", hours: 30, progress: 50, students: 30, semester: "S2" },

  // LAP L2
  { id: "lap-l2-1", name: "Gestion des organisations", teacher: "Dr. Fouda", filiere: "LAP", annee: "L2", hours: 35, progress: 55, students: 28, semester: "S1" },
  { id: "lap-l2-2", name: "Comptabilité publique", teacher: "M. Biya", filiere: "LAP", annee: "L2", hours: 40, progress: 40, students: 25, semester: "S1" },
  { id: "lap-l2-3", name: "Droit constitutionnel", teacher: "Me. Atangana", filiere: "LAP", annee: "L2", hours: 35, progress: 65, students: 28, semester: "S1" },
  { id: "lap-l2-4", name: "Gestion des ressources humaines", teacher: "Dr. Fouda", filiere: "LAP", annee: "L2", hours: 30, progress: 45, students: 28, semester: "S2" },
  { id: "lap-l2-5", name: "Finances publiques", teacher: "M. Biya", filiere: "LAP", annee: "L2", hours: 35, progress: 30, students: 25, semester: "S2" },

  // LAP L3
  { id: "lap-l3-1", name: "Administration publique", teacher: "Me. Atangana", filiere: "LAP", annee: "L3", hours: 45, progress: 35, students: 22, semester: "S1" },
  { id: "lap-l3-2", name: "Politique économique", teacher: "M. Biya", filiere: "LAP", annee: "L3", hours: 40, progress: 25, students: 22, semester: "S1" },
  { id: "lap-l3-3", name: "Droit des marchés publics", teacher: "Me. Atangana", filiere: "LAP", annee: "L3", hours: 35, progress: 20, students: 22, semester: "S2" },
  { id: "lap-l3-4", name: "Management stratégique", teacher: "Dr. Fouda", filiere: "LAP", annee: "L3", hours: 40, progress: 15, students: 22, semester: "S2" },
  { id: "lap-l3-5", name: "Projet de fin d'études", teacher: "Dr. Fouda", filiere: "LAP", annee: "L3", hours: 80, progress: 5, students: 22, semester: "S2" },
];

export function getCoursesForStudent(filiere?: Filiere, annee?: Annee, option?: OptionLIC): CourseData[] {
  if (!filiere || !annee) return allCoursesData;
  return allCoursesData.filter(c => {
    if (c.filiere !== filiere) return false;
    if (c.annee !== annee) return false;
    // For LIC L3, show shared courses + option-specific courses
    if (filiere === 'LIC' && annee === 'L3') {
      if (c.option && c.option !== option) return false;
    }
    return true;
  });
}

export function getCoursesForProfessor(professorName: string): CourseData[] {
  return allCoursesData.filter(c => c.teacher.toLowerCase().includes(professorName.toLowerCase()));
}
