import api from '../api';

export interface ApiDocumentRequest {
    id: number;
    student_id: number;
    student?: { id: number; nom_complet: string; filiere?: string; annee?: string };
    type: 'attestation_inscription' | 'releve_notes' | 'certificat_scolarite' | 'attestation_reussite';
    status: 'pending' | 'approved' | 'rejected' | 'ready';
    requested_at: string;
    processed_at?: string;
    processed_by?: number;
    notes?: string;
}

export const documentService = {
    list: () => api.get<ApiDocumentRequest[]>('/document-requests').then(r => r.data),
    create: (type: ApiDocumentRequest['type']) =>
        api.post<ApiDocumentRequest>('/document-requests', { type }).then(r => r.data),
    process: (id: number, status: string, notes?: string) =>
        api.patch<ApiDocumentRequest>(`/document-requests/${id}/process`, { status, notes }).then(r => r.data),
};
