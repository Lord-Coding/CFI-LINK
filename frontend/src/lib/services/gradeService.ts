import api from '../api';

export interface ApiGrade {
    id: number;
    student_id: number;
    student?: { id: number; nom_complet: string };
    course_id: number;
    course?: { id: number; name: string };
    semestre: string;
    filiere: string;
    annee: string;
    cc: number | null;
    tp: number | null;
    exam: number | null;
    coef: number;
    status: 'draft' | 'published';
    created_by?: number;
    updated_at: string;
}

export const gradeService = {
    list: (params?: Record<string, string>) =>
        api.get<ApiGrade[]>('/grades', { params }).then(r => r.data),

    upsert: (data: Partial<ApiGrade>) =>
        api.put<ApiGrade>('/grades/upsert', data).then(r => r.data),

    publish: (courseId: number) =>
        api.post(`/grades/publish/${courseId}`).then(r => r.data),

    unpublish: (courseId: number) =>
        api.post(`/grades/unpublish/${courseId}`).then(r => r.data),

    delete: (id: number) =>
        api.delete(`/grades/${id}`).then(r => r.data),
};
