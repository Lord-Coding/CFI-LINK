/**
 * community-store.ts
 * Posts et likes de la page Communauté, persistés en localStorage.
 */

const KEY = 'cfi_community';

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  date: string;
  likes: string[]; // tableau des user_ids ayant liké
}

function getAll(): CommunityPost[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(posts: CommunityPost[]) { localStorage.setItem(KEY, JSON.stringify(posts)); }

export function getCommunityPosts(): CommunityPost[] {
  return getAll().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addCommunityPost(data: Omit<CommunityPost, 'id' | 'date' | 'likes'>): CommunityPost {
  const post: CommunityPost = {
    ...data,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    likes: [],
  };
  saveAll([post, ...getAll()]);
  return post;
}

export function toggleLike(postId: string, userId: string): void {
  saveAll(getAll().map(p => {
    if (p.id !== postId) return p;
    const liked = p.likes.includes(userId);
    return { ...p, likes: liked ? p.likes.filter(id => id !== userId) : [...p.likes, userId] };
  }));
}

export function deleteCommunityPost(postId: string): void {
  saveAll(getAll().filter(p => p.id !== postId));
}

export function initializeCommunity() {
  if (getAll().length > 0) return;
  const seeds: Omit<CommunityPost, 'id' | 'date' | 'likes'>[] = [
    { author_id: 'seed-1', author_name: 'Jean Kamga',    content: "Quelqu'un a les notes du TD d'algorithmique de la semaine dernière ?" },
    { author_id: 'seed-2', author_name: 'Marie Nkoulou', content: "Le projet tutoré de base de données est à rendre vendredi. N'oubliez pas !" },
    { author_id: 'seed-3', author_name: 'Paul Essomba',  content: "Super cours de réseaux aujourd'hui ! Le prof a bien expliqué les sous-réseaux." },
    { author_id: 'seed-4', author_name: 'Sophie Mbarga', content: "Qui est intéressé par un groupe d'étude pour les examens de fin de semestre ?" },
  ];
  // On insère dans l'ordre inverse pour que le plus récent soit en tête
  [...seeds].reverse().forEach(s => addCommunityPost(s));
}
