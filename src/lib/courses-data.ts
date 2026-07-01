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
  semester: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
  description?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'exam';
  duration: string;
  file_url?: string;
  completed: boolean;
  locked: boolean;
  order: number;
  quizQuestions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

/* ── Seed data ── */
const SEED_COURSES: CourseData[] = [
  // LIC L1
  { id: "lic-l1-1", name: "Introduction à l'informatique", teacher: "Dr. Owona", filiere: "LIC", annee: "L1", hours: 40, progress: 85, students: 42, semester: "S1", description: "Bases de l'informatique, systèmes d'exploitation et logiciels." },
  { id: "lic-l1-2", name: "Algorithmique & Programmation C", teacher: "Prof. Mbarga", filiere: "LIC", annee: "L1", hours: 50, progress: 72, students: 42, semester: "S1", description: "Algorithmes fondamentaux et programmation en langage C." },
  { id: "lic-l1-3", name: "Mathématiques pour l'informatique", teacher: "Dr. Talla", filiere: "LIC", annee: "L1", hours: 45, progress: 60, students: 42, semester: "S1" },
  { id: "lic-l1-4", name: "Anglais technique", teacher: "Mme. Fotso", filiere: "LIC", annee: "L1", hours: 25, progress: 65, students: 42, semester: "S1" },
  { id: "lic-l1-5", name: "Architecture des ordinateurs", teacher: "Prof. Essomba", filiere: "LIC", annee: "L1", hours: 35, progress: 50, students: 42, semester: "S2" },
  { id: "lic-l1-6", name: "Programmation Web (HTML/CSS)", teacher: "M. Tabi", filiere: "LIC", annee: "L1", hours: 35, progress: 88, students: 42, semester: "S2" },
  { id: "lic-l1-7", name: "Statistiques & Probabilités", teacher: "Dr. Fouda", filiere: "LIC", annee: "L1", hours: 30, progress: 40, students: 42, semester: "S2" },

  // LIC L2
  { id: "lic-l2-1", name: "Algorithmique avancée", teacher: "Prof. Mbarga", filiere: "LIC", annee: "L2", hours: 45, progress: 72, students: 38, semester: "S3", description: "Structures de données avancées, complexité algorithmique et programmation dynamique." },
  { id: "lic-l2-2", name: "Base de données", teacher: "Dr. Nkoulou", filiere: "LIC", annee: "L2", hours: 40, progress: 45, students: 38, semester: "S3", description: "Modélisation, SQL avancé, normalisation et administration de bases de données." },
  { id: "lic-l2-3", name: "Réseaux informatiques", teacher: "Prof. Essomba", filiere: "LIC", annee: "L2", hours: 50, progress: 30, students: 35, semester: "S3" },
  { id: "lic-l2-4", name: "Programmation Orientée Objet (Java)", teacher: "Dr. Owona", filiere: "LIC", annee: "L2", hours: 45, progress: 55, students: 38, semester: "S3" },
  { id: "lic-l2-5", name: "Systèmes d'exploitation", teacher: "Prof. Manga", filiere: "LIC", annee: "L2", hours: 40, progress: 35, students: 38, semester: "S4" },
  { id: "lic-l2-6", name: "Programmation Web (JS/PHP)", teacher: "M. Tabi", filiere: "LIC", annee: "L2", hours: 40, progress: 60, students: 38, semester: "S4" },
  { id: "lic-l2-7", name: "Analyse numérique", teacher: "Dr. Talla", filiere: "LIC", annee: "L2", hours: 30, progress: 25, students: 38, semester: "S4" },

  // LIC L3 GL
  { id: "lic-l3-gl-1", name: "Génie Logiciel", teacher: "Prof. Manga", filiere: "LIC", annee: "L3", option: "GL", hours: 60, progress: 20, students: 20, semester: "S5" },
  { id: "lic-l3-gl-2", name: "Conception UML & Design Patterns", teacher: "Dr. Owona", filiere: "LIC", annee: "L3", option: "GL", hours: 45, progress: 35, students: 20, semester: "S5" },
  { id: "lic-l3-gl-3", name: "Développement Mobile", teacher: "M. Tabi", filiere: "LIC", annee: "L3", option: "GL", hours: 40, progress: 15, students: 20, semester: "S6" },
  { id: "lic-l3-gl-4", name: "Tests & Qualité logicielle", teacher: "Prof. Manga", filiere: "LIC", annee: "L3", option: "GL", hours: 35, progress: 10, students: 20, semester: "S6" },
  { id: "lic-l3-gl-5", name: "Projet de fin d'études", teacher: "Prof. Manga", filiere: "LIC", annee: "L3", option: "GL", hours: 80, progress: 5, students: 20, semester: "S6" },

  // LIC L3 SR
  { id: "lic-l3-sr-1", name: "Administration système", teacher: "Dr. Owona", filiere: "LIC", annee: "L3", option: "SR", hours: 55, progress: 15, students: 18, semester: "S5" },
  { id: "lic-l3-sr-2", name: "Sécurité des réseaux", teacher: "Prof. Essomba", filiere: "LIC", annee: "L3", option: "SR", hours: 50, progress: 25, students: 18, semester: "S5" },
  { id: "lic-l3-sr-3", name: "Cloud & Virtualisation", teacher: "Dr. Owona", filiere: "LIC", annee: "L3", option: "SR", hours: 40, progress: 10, students: 18, semester: "S6" },
  { id: "lic-l3-sr-4", name: "Télécommunications", teacher: "Prof. Essomba", filiere: "LIC", annee: "L3", option: "SR", hours: 45, progress: 20, students: 18, semester: "S6" },
  { id: "lic-l3-sr-5", name: "Projet de fin d'études", teacher: "Prof. Essomba", filiere: "LIC", annee: "L3", option: "SR", hours: 80, progress: 5, students: 18, semester: "S6" },

  // LIC L3 shared
  { id: "lic-l3-s-1", name: "Intelligence Artificielle", teacher: "Dr. Nkoulou", filiere: "LIC", annee: "L3", hours: 40, progress: 30, students: 38, semester: "S5" },
  { id: "lic-l3-s-2", name: "Droit du numérique", teacher: "Me. Atangana", filiere: "LIC", annee: "L3", hours: 25, progress: 45, students: 38, semester: "S6" },

  // LAP L1
  { id: "lap-l1-1", name: "Droit administratif", teacher: "Me. Atangana", filiere: "LAP", annee: "L1", hours: 40, progress: 60, students: 30, semester: "S1", description: "Principes du droit administratif, actes administratifs et contentieux." },
  { id: "lap-l1-2", name: "Introduction au management", teacher: "Dr. Fouda", filiere: "LAP", annee: "L1", hours: 35, progress: 75, students: 30, semester: "S1" },
  { id: "lap-l1-3", name: "Économie générale", teacher: "M. Biya", filiere: "LAP", annee: "L1", hours: 30, progress: 55, students: 30, semester: "S1" },
  { id: "lap-l1-4", name: "Anglais administratif", teacher: "Mme. Fotso", filiere: "LAP", annee: "L1", hours: 25, progress: 70, students: 30, semester: "S2" },
  { id: "lap-l1-5", name: "Sociologie des organisations", teacher: "Dr. Fouda", filiere: "LAP", annee: "L1", hours: 30, progress: 50, students: 30, semester: "S2" },

  // LAP L2
  { id: "lap-l2-1", name: "Gestion des organisations", teacher: "Dr. Fouda", filiere: "LAP", annee: "L2", hours: 35, progress: 55, students: 28, semester: "S3" },
  { id: "lap-l2-2", name: "Comptabilité publique", teacher: "M. Biya", filiere: "LAP", annee: "L2", hours: 40, progress: 40, students: 25, semester: "S3" },
  { id: "lap-l2-3", name: "Droit constitutionnel", teacher: "Me. Atangana", filiere: "LAP", annee: "L2", hours: 35, progress: 65, students: 28, semester: "S3" },
  { id: "lap-l2-4", name: "Gestion des ressources humaines", teacher: "Dr. Fouda", filiere: "LAP", annee: "L2", hours: 30, progress: 45, students: 28, semester: "S4" },
  { id: "lap-l2-5", name: "Finances publiques", teacher: "M. Biya", filiere: "LAP", annee: "L2", hours: 35, progress: 30, students: 25, semester: "S4" },

  // LAP L3
  { id: "lap-l3-1", name: "Administration publique", teacher: "Me. Atangana", filiere: "LAP", annee: "L3", hours: 45, progress: 35, students: 22, semester: "S5" },
  { id: "lap-l3-2", name: "Politique économique", teacher: "M. Biya", filiere: "LAP", annee: "L3", hours: 40, progress: 25, students: 22, semester: "S5" },
  { id: "lap-l3-3", name: "Droit des marchés publics", teacher: "Me. Atangana", filiere: "LAP", annee: "L3", hours: 35, progress: 20, students: 22, semester: "S6" },
  { id: "lap-l3-4", name: "Management stratégique", teacher: "Dr. Fouda", filiere: "LAP", annee: "L3", hours: 40, progress: 15, students: 22, semester: "S6" },
  { id: "lap-l3-5", name: "Projet de fin d'études", teacher: "Dr. Fouda", filiere: "LAP", annee: "L3", hours: 80, progress: 5, students: 22, semester: "S6" },
];

const SEED_LESSONS: Lesson[] = [
  // Algorithmique avancée (lic-l2-1)
  { id: "ll-1",  courseId: "lic-l2-1", title: "Introduction aux structures avancées",    type: "video",    duration: "45 min", completed: true,  locked: false, order: 1 },
  { id: "ll-2",  courseId: "lic-l2-1", title: "Supports de cours — Chapitre 1",          type: "document", duration: "15 min", completed: true,  locked: false, order: 2 },
  { id: "ll-3",  courseId: "lic-l2-1", title: "Arbres binaires de recherche",             type: "video",    duration: "50 min", completed: true,  locked: false, order: 3 },
  { id: "ll-4",  courseId: "lic-l2-1", title: "Quiz — Arbres & Graphes",                  type: "quiz",     duration: "20 min", completed: true,  locked: false, order: 4,
    quizQuestions: [
      { id: "q1", question: "Quelle est la complexité d'un BFS ?", options: ["O(n)","O(n log n)","O(V+E)","O(n²)"], correctIndex: 2 },
      { id: "q2", question: "Algorithme pour le plus court chemin ?", options: ["DFS","BFS","Dijkstra","Bubble Sort"], correctIndex: 2 },
      { id: "q3", question: "Structure LIFO ?", options: ["File","Pile","Liste","Arbre"], correctIndex: 1 },
    ],
  },
  { id: "ll-5",  courseId: "lic-l2-1", title: "Graphes : parcours & plus courts chemins", type: "video",    duration: "55 min", completed: true,  locked: false, order: 5 },
  { id: "ll-6",  courseId: "lic-l2-1", title: "Tables de hachage",                        type: "video",    duration: "40 min", completed: true,  locked: false, order: 6 },
  { id: "ll-7",  courseId: "lic-l2-1", title: "Programmation dynamique",                  type: "video",    duration: "60 min", completed: true,  locked: false, order: 7 },
  { id: "ll-8",  courseId: "lic-l2-1", title: "Quiz — Programmation dynamique",           type: "quiz",     duration: "25 min", completed: false, locked: false, order: 8,
    quizQuestions: [
      { id: "q4", question: "La programmation dynamique résout des problèmes à...", options: ["Structure linéaire","Sous-problèmes chevauchants","Problèmes indépendants","Graphes uniquement"], correctIndex: 1 },
    ],
  },
  { id: "ll-9",  courseId: "lic-l2-1", title: "Algorithmes de tri avancés",               type: "video",    duration: "50 min", completed: false, locked: false, order: 9 },
  { id: "ll-10", courseId: "lic-l2-1", title: "Complexité NP",                            type: "video",    duration: "55 min", completed: false, locked: true,  order: 10 },
  { id: "ll-11", courseId: "lic-l2-1", title: "Examen final — Algorithmique",             type: "exam",     duration: "2h",     completed: false, locked: true,  order: 11 },

  // Base de données (lic-l2-2)
  { id: "lb-1",  courseId: "lic-l2-2", title: "Modèle relationnel",          type: "video",    duration: "40 min", completed: true,  locked: false, order: 1 },
  { id: "lb-2",  courseId: "lic-l2-2", title: "SQL — Les fondamentaux",       type: "video",    duration: "50 min", completed: true,  locked: false, order: 2 },
  { id: "lb-3",  courseId: "lic-l2-2", title: "Quiz — SQL Basics",            type: "quiz",     duration: "15 min", completed: true,  locked: false, order: 3,
    quizQuestions: [
      { id: "q5", question: "Que fait SELECT * ?", options: ["Sélectionne tout","Crée une table","Supprime des données","Rien"], correctIndex: 0 },
    ],
  },
  { id: "lb-4",  courseId: "lic-l2-2", title: "Jointures et sous-requêtes",   type: "video",    duration: "45 min", completed: true,  locked: false, order: 4 },
  { id: "lb-5",  courseId: "lic-l2-2", title: "Normalisation (1NF-3NF)",      type: "video",    duration: "55 min", completed: false, locked: false, order: 5 },
  { id: "lb-6",  courseId: "lic-l2-2", title: "Supports — Normalisation",     type: "document", duration: "20 min", completed: false, locked: false, order: 6 },
  { id: "lb-7",  courseId: "lic-l2-2", title: "Examen final — BDD",           type: "exam",     duration: "2h",     completed: false, locked: true,  order: 7 },

  // Droit administratif (lap-l1-1)
  { id: "ld-1",  courseId: "lap-l1-1", title: "Introduction au droit administratif", type: "video",    duration: "35 min", completed: true,  locked: false, order: 1 },
  { id: "ld-2",  courseId: "lap-l1-1", title: "L'organisation administrative",       type: "video",    duration: "45 min", completed: true,  locked: false, order: 2 },
  { id: "ld-3",  courseId: "lap-l1-1", title: "Les actes administratifs",            type: "video",    duration: "50 min", completed: true,  locked: false, order: 3 },
  { id: "ld-4",  courseId: "lap-l1-1", title: "Quiz — Actes administratifs",         type: "quiz",     duration: "15 min", completed: true,  locked: false, order: 4,
    quizQuestions: [
      { id: "q6", question: "Un acte administratif unilatéral est ?", options: ["Une décision","Un contrat","Une loi","Un traité"], correctIndex: 0 },
    ],
  },
  { id: "ld-5",  courseId: "lap-l1-1", title: "Le service public",                   type: "video",    duration: "40 min", completed: true,  locked: false, order: 5 },
  { id: "ld-6",  courseId: "lap-l1-1", title: "Le contentieux administratif",        type: "video",    duration: "55 min", completed: false, locked: false, order: 6 },
  { id: "ld-7",  courseId: "lap-l1-1", title: "Examen final — Droit admin",          type: "exam",     duration: "2h",     completed: false, locked: true,  order: 7 },
];

/* ── LocalStorage keys ── */
const COURSES_KEY = 'cfi_courses';
const LESSONS_KEY = 'cfi_lessons';
const INIT_KEY    = 'cfi_courses_initialized';

function getItem<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function setItem<T>(key: string, v: T) { localStorage.setItem(key, JSON.stringify(v)); }

export function initializeCourseStore() {
  if (getItem(INIT_KEY, false)) return;
  setItem(COURSES_KEY, SEED_COURSES);
  setItem(LESSONS_KEY, SEED_LESSONS);
  setItem(INIT_KEY, true);
}

/* ── Courses CRUD ── */
export function getAllCourses(): CourseData[] {
  return getItem<CourseData[]>(COURSES_KEY, SEED_COURSES);
}

export function getCourseById(id: string): CourseData | undefined {
  return getAllCourses().find(c => c.id === id);
}

export function addCourse(data: Omit<CourseData, 'id' | 'progress' | 'students'>): CourseData {
  const course: CourseData = { ...data, id: crypto.randomUUID(), progress: 0, students: 0 };
  setItem(COURSES_KEY, [...getAllCourses(), course]);
  return course;
}

export function updateCourse(id: string, data: Partial<Omit<CourseData, 'id'>>) {
  setItem(COURSES_KEY, getAllCourses().map(c => c.id === id ? { ...c, ...data } : c));
}

export function deleteCourse(id: string) {
  setItem(COURSES_KEY, getAllCourses().filter(c => c.id !== id));
  setItem(LESSONS_KEY, getLessons().filter(l => l.courseId !== id));
}

/* ── Lessons CRUD ── */
export function getLessons(): Lesson[] {
  return getItem<Lesson[]>(LESSONS_KEY, SEED_LESSONS);
}

export function getLessonsForCourse(courseId: string): Lesson[] {
  return getLessons().filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
}

export function addLesson(data: Omit<Lesson, 'id'>): Lesson {
  const lesson: Lesson = { ...data, id: crypto.randomUUID() };
  setItem(LESSONS_KEY, [...getLessons(), lesson]);
  return lesson;
}

export function updateLesson(id: string, data: Partial<Omit<Lesson, 'id'>>) {
  setItem(LESSONS_KEY, getLessons().map(l => l.id === id ? { ...l, ...data } : l));
}

export function deleteLesson(id: string) {
  setItem(LESSONS_KEY, getLessons().filter(l => l.id !== id));
}

export function markLessonComplete(id: string) {
  updateLesson(id, { completed: true });
}

/* ── Filtered views ── */
export function getCoursesForStudent(filiere?: Filiere, annee?: Annee, option?: OptionLIC): CourseData[] {
  const all = getAllCourses();
  if (!filiere || !annee) return all;
  return all.filter(c => {
    if (c.filiere !== filiere) return false;
    if (c.annee !== annee) return false;
    if (filiere === 'LIC' && annee === 'L3' && c.option && c.option !== option) return false;
    return true;
  });
}

export function getCoursesForProfessor(professorName: string): CourseData[] {
  return getAllCourses().filter(c => c.teacher.toLowerCase().includes(professorName.toLowerCase()));
}

/* Keep backward-compatible export */
export const allCoursesData = SEED_COURSES;
