import api from '../api';

export interface ApiConcoursCode {
    id: number;
    code: string;
    nom_complet: string;
    filiere: string;
    annee: string;
    option_lic?: string;
    used: boolean;
    used_by?: number;
    created_at: string;
}

export interface ApiValidationCode {
    id: number;
    code: string;
    used: boolean;
    used_by?: number;
    expires_at: string;
    created_at: string;
}

export const codesService = {
    // Concours
    listConcours: () =>
        api.get<ApiConcoursCode[]>('/codes/concours').then(r => r.data),

    createConcours: (data: { nom_complet: string; filiere: string; annee: string; option_lic?: string }) =>
        api.post<ApiConcoursCode>('/codes/concours', data).then(r => r.data),

    deleteConcours: (id: number) =>
        api.delete(`/codes/concours/${id}`).then(r => r.data),

    // Validation
    listValidation: () =>
        api.get<ApiValidationCode[]>('/codes/validation').then(r => r.data),

    createValidation: (expires_in_days?: number) =>
        api.post<ApiValidationCode>('/codes/validation', { expires_in_days }).then(r => r.data),

    deleteValidation: (id: number) =>
        api.delete(`/codes/validation/${id}`).then(r => r.data),
};
