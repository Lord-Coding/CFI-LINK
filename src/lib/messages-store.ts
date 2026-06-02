const KEY = 'cfi_messages';

export interface Message {
  id: string;
  from_id: string;
  from_name: string;
  to_id: string;
  to_name: string;
  subject: string;
  body: string;
  read: boolean;
  date: string;
}

function getAll(): Message[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(msgs: Message[]) { localStorage.setItem(KEY, JSON.stringify(msgs)); }

export function getInbox(userId: string): Message[] {
  return getAll().filter(m => m.to_id === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getSent(userId: string): Message[] {
  return getAll().filter(m => m.from_id === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getUnreadCount(userId: string): number {
  return getInbox(userId).filter(m => !m.read).length;
}

export function sendMessage(data: Omit<Message, 'id' | 'date' | 'read'>): Message {
  const msg: Message = { ...data, id: crypto.randomUUID(), date: new Date().toISOString(), read: false };
  saveAll([...getAll(), msg]);
  return msg;
}

export function markMessageRead(id: string) {
  saveAll(getAll().map(m => m.id === id ? { ...m, read: true } : m));
}

export function deleteMessage(id: string) {
  saveAll(getAll().filter(m => m.id !== id));
}

export function initializeMessages() {
  if (getAll().length > 0) return;
  // Seed messages will be created after store init with actual user IDs
}
