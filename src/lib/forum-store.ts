const KEY = 'cfi_forum';

export interface ForumPost {
  id: string;
  course_id: string;   // 'general' pour le fil unique
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
  replies?: ForumReply[];   // réponses imbriquées (1 niveau)
}

function getAll(): ForumPost[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(posts: ForumPost[]) { localStorage.setItem(KEY, JSON.stringify(posts)); }

/** Fil général (course_id === 'general'), triés épinglés en premier puis date DESC. */
export function getForumPosts(courseId = 'general'): ForumPost[] {
  return getAll().filter(p => p.course_id === courseId)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

/** 20 derniers posts pour le fil général (pagination initiale). */
export function getRecentPosts(limit = 20, offset = 0): ForumPost[] {
  return getForumPosts('general').slice(offset, offset + limit);
}

export function getTotalPostCount(): number {
  return getAll().filter(p => p.course_id === 'general').length;
}

export function createForumPost(data: Omit<ForumPost, 'id' | 'date' | 'replies' | 'pinned'>): ForumPost {
  const post: ForumPost = { ...data, course_id: data.course_id || 'general', id: crypto.randomUUID(), date: new Date().toISOString(), replies: [], pinned: false };
  saveAll([...getAll(), post]);
  return post;
}

export function addReply(postId: string, data: Omit<ForumReply, 'id' | 'date'>): ForumReply {
  const reply: ForumReply = { ...data, id: crypto.randomUUID(), date: new Date().toISOString() };
  saveAll(getAll().map(p => p.id === postId ? { ...p, replies: [...p.replies, reply] } : p));
  return reply;
}

/** Répondre à une réponse existante (thread imbriqué, 1 niveau). */
export function addNestedReply(postId: string, parentReplyId: string, data: Omit<ForumReply, 'id' | 'date'>): void {
  const reply: ForumReply = { ...data, id: crypto.randomUUID(), date: new Date().toISOString() };
  saveAll(getAll().map(p => {
    if (p.id !== postId) return p;
    return {
      ...p,
      replies: p.replies.map(r =>
        r.id === parentReplyId
          ? { ...r, replies: [...(r.replies ?? []), reply] }
          : r
      ),
    };
  }));
}

export function deleteForumPost(id: string) { saveAll(getAll().filter(p => p.id !== id)); }

export function togglePinPost(id: string) {
  saveAll(getAll().map(p => p.id === id ? { ...p, pinned: !p.pinned } : p));
}

export function initializeForum() {
  if (getAll().length > 0) return;
  const seeds: Omit<ForumPost, 'id' | 'date' | 'pinned'>[] = [
    {
      course_id: 'general', author_id: 'system', author_name: 'Jean Kamga',
      title: 'Bienvenue sur le forum CFI-LINK !',
      content: 'Bonjour à tous ! Ce forum est réservé aux étudiants. Posez vos questions, partagez vos expériences et entraidez-vous.',
      replies: [
        { id: crypto.randomUUID(), author_id: 's2', author_name: 'Paul Essomba', content: 'Merci pour l\'initiative ! Je suis prêt à aider mes camarades.', date: new Date(Date.now() - 3600000).toISOString() },
        { id: crypto.randomUUID(), author_id: 's3', author_name: 'Sophie Ateba', content: 'Super ! Hâte d\'échanger avec vous tous.', date: new Date(Date.now() - 1800000).toISOString() },
      ],
    },
    {
      course_id: 'general', author_id: 's2', author_name: 'Paul Essomba',
      title: 'Conseils pour les révisions d\'algorithmique',
      content: 'Quelqu\'un a des ressources sur les arbres binaires et les graphes ? Le TD noté approche et je cherche des exercices corrigés.',
      replies: [
        { id: crypto.randomUUID(), author_id: 's3', author_name: 'Sophie Ateba', content: 'Regarde sur le site du MIT OpenCourseWare, ils ont de super exercices sur les structures de données.', date: new Date(Date.now() - 7200000).toISOString() },
      ],
    },
  ];
  seeds.forEach(s => {
    const post = createForumPost({ course_id: s.course_id, author_id: s.author_id, author_name: s.author_name, title: s.title, content: s.content });
    const all = getAll();
    const target = all.find(p => p.id === post.id);
    if (target) { target.replies = s.replies; saveAll(all); }
  });
}
