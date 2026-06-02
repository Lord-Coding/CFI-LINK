const KEY = 'cfi_library';

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  category: 'book' | 'article' | 'thesis' | 'guide' | 'manual';
  filiere?: string;
  description: string;
  file_type: 'pdf' | 'doc' | 'video';
  size: string;
  downloads: number;
  added_at: string;
  added_by: string;
}

function getAll(): LibraryItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(items: LibraryItem[]) { localStorage.setItem(KEY, JSON.stringify(items)); }

export function getLibraryItems(): LibraryItem[] {
  return getAll().sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime());
}

export function searchLibrary(query: string): LibraryItem[] {
  const q = query.toLowerCase();
  return getLibraryItems().filter(i =>
    i.title.toLowerCase().includes(q) || i.author.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
  );
}

export function addLibraryItem(data: Omit<LibraryItem, 'id' | 'downloads' | 'added_at'>): LibraryItem {
  const item: LibraryItem = { ...data, id: crypto.randomUUID(), downloads: 0, added_at: new Date().toISOString() };
  saveAll([...getAll(), item]);
  return item;
}

export function incrementDownload(id: string) {
  saveAll(getAll().map(i => i.id === id ? { ...i, downloads: i.downloads + 1 } : i));
}

export function deleteLibraryItem(id: string) {
  saveAll(getAll().filter(i => i.id !== id));
}

export function initializeLibrary() {
  if (getAll().length > 0) return;
  const seeds: Omit<LibraryItem, 'id' | 'downloads' | 'added_at'>[] = [
    { title: "Introduction à l'algorithmique", author: "Thomas H. Cormen", category: "book", filiere: "LIC", description: "Manuel de référence pour l'algorithmique et les structures de données.", file_type: "pdf", size: "15.2 MB", added_by: "Prof. Mbarga" },
    { title: "SQL pour les débutants", author: "Dr. Nkoulou", category: "guide", filiere: "LIC", description: "Guide complet pour apprendre SQL de A à Z.", file_type: "pdf", size: "3.4 MB", added_by: "Dr. Nkoulou" },
    { title: "Droit administratif camerounais", author: "Me. Atangana", category: "book", filiere: "LAP", description: "Cours complet de droit administratif appliqué au contexte camerounais.", file_type: "pdf", size: "8.7 MB", added_by: "Me. Atangana" },
    { title: "Architecture des microprocesseurs", author: "Prof. Essomba", category: "manual", filiere: "LIC", description: "Manuel technique sur l'architecture x86 et ARM.", file_type: "pdf", size: "12.1 MB", added_by: "Prof. Essomba" },
    { title: "Mémoire PFE - Système de gestion scolaire", author: "Promotion 2023", category: "thesis", filiere: "LIC", description: "Mémoire de fin d'études sur la conception d'un ERP scolaire.", file_type: "pdf", size: "4.5 MB", added_by: "Dr. Owona" },
    { title: "Gestion des organisations publiques", author: "Dr. Fouda", category: "book", filiere: "LAP", description: "Principes de management appliqués aux organisations publiques.", file_type: "pdf", size: "6.3 MB", added_by: "Dr. Fouda" },
    { title: "Tutoriel Java - Programmation OOP", author: "Dr. Owona", category: "guide", filiere: "LIC", description: "Vidéo tutoriel sur la programmation orientée objet en Java.", file_type: "video", size: "245 MB", added_by: "Dr. Owona" },
    { title: "Comptabilité publique - Cours complet", author: "M. Biya", category: "manual", filiere: "LAP", description: "Manuel de comptabilité publique et finances.", file_type: "doc", size: "2.8 MB", added_by: "M. Biya" },
  ];
  seeds.forEach(s => addLibraryItem(s));
}

export const CATEGORY_LABELS: Record<string, string> = {
  book: 'Livre', article: 'Article', thesis: 'Mémoire/Thèse', guide: 'Guide', manual: 'Manuel',
};
