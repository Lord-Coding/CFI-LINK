const KEY = 'cfi_forum';

export interface ForumPost {
  id: string;
  course_id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  date: string;
  replies: ForumReply[];
  pinned: boolean;
}

export interface ForumReply {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  date: string;
}

function getAll(): ForumPost[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(posts: ForumPost[]) { localStorage.setItem(KEY, JSON.stringify(posts)); }

export function getForumPosts(courseId: string): ForumPost[] {
  return getAll().filter(p => p.course_id === courseId)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

export function createForumPost(data: Omit<ForumPost, 'id' | 'date' | 'replies' | 'pinned'>): ForumPost {
  const post: ForumPost = { ...data, id: crypto.randomUUID(), date: new Date().toISOString(), replies: [], pinned: false };
  saveAll([...getAll(), post]);
  return post;
}

export function addReply(postId: string, data: Omit<ForumReply, 'id' | 'date'>): ForumReply {
  const reply: ForumReply = { ...data, id: crypto.randomUUID(), date: new Date().toISOString() };
  saveAll(getAll().map(p => p.id === postId ? { ...p, replies: [...p.replies, reply] } : p));
  return reply;
}

export function deleteForumPost(id: string) { saveAll(getAll().filter(p => p.id !== id)); }

export function togglePinPost(id: string) {
  saveAll(getAll().map(p => p.id === id ? { ...p, pinned: !p.pinned } : p));
}

export function initializeForum() {
  if (getAll().length > 0) return;
  const seeds: Omit<ForumPost, 'id' | 'date' | 'pinned'>[] = [
    {
      course_id: "lic-l2-1", author_id: "system", author_name: "Prof. Mbarga",
      title: "Consignes pour le TD noté", content: "Le TD noté portera sur les arbres binaires et les graphes. Préparez les exercices des chapitres 3 et 4.",
      replies: [
        { id: crypto.randomUUID(), author_id: "s1", author_name: "Jean Kamga", content: "Merci professeur ! Est-ce que les algorithmes de Dijkstra seront inclus ?", date: new Date(Date.now() - 3600000).toISOString() },
        { id: crypto.randomUUID(), author_id: "system", author_name: "Prof. Mbarga", content: "Oui, Dijkstra et Bellman-Ford sont au programme.", date: new Date(Date.now() - 1800000).toISOString() },
      ],
    },
    {
      course_id: "lic-l2-2", author_id: "system", author_name: "Dr. Nkoulou",
      title: "Projet Base de données - Groupes", content: "Formez des groupes de 3 pour le projet. Thème : système de gestion de bibliothèque. Rendu le 15 du mois prochain.",
      replies: [
        { id: crypto.randomUUID(), author_id: "s2", author_name: "Paul Essomba", content: "On peut choisir un autre sujet ?", date: new Date(Date.now() - 7200000).toISOString() },
      ],
    },
  ];
  seeds.forEach(s => {
    const post = createForumPost({ course_id: s.course_id, author_id: s.author_id, author_name: s.author_name, title: s.title, content: s.content });
    // Add replies manually
    const all = getAll();
    const target = all.find(p => p.id === post.id);
    if (target) { target.replies = s.replies; saveAll(all); }
  });
}
