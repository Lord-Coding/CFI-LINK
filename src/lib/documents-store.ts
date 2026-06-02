const KEY = 'cfi_doc_requests';

export interface DocumentRequest {
  id: string;
  student_id: string;
  student_name: string;
  type: 'attestation_inscription' | 'releve_notes' | 'certificat_scolarite' | 'attestation_reussite';
  status: 'pending' | 'approved' | 'rejected' | 'ready';
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
}

function getAll(): DocumentRequest[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function saveAll(reqs: DocumentRequest[]) { localStorage.setItem(KEY, JSON.stringify(reqs)); }

export function getDocumentRequests(): DocumentRequest[] {
  return getAll().sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
}

export function getStudentRequests(studentId: string): DocumentRequest[] {
  return getAll().filter(r => r.student_id === studentId).sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
}

export function createDocumentRequest(data: { student_id: string; student_name: string; type: DocumentRequest['type'] }): DocumentRequest {
  const req: DocumentRequest = { ...data, id: crypto.randomUUID(), status: 'pending', requested_at: new Date().toISOString() };
  saveAll([...getAll(), req]);
  return req;
}

export function processRequest(id: string, status: 'approved' | 'rejected' | 'ready', processedBy: string, notes?: string) {
  saveAll(getAll().map(r => r.id === id ? { ...r, status, processed_at: new Date().toISOString(), processed_by: processedBy, notes } : r));
}

export function initializeDocumentRequests() {
  if (getAll().length > 0) return;
}

export const DOC_TYPE_LABELS: Record<string, string> = {
  attestation_inscription: "Attestation d'inscription",
  releve_notes: "Relevé de notes",
  certificat_scolarite: "Certificat de scolarité",
  attestation_reussite: "Attestation de réussite",
};

export const DOC_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté', ready: 'Prêt',
};
