import api from '../api';

export interface ApiCourse {
    id: number;
    name: string;
    teacher_id?: number;
    teacher?: { id: number; nom_complet: string };
    filiere: string;
    annee: string;
    option_lic?: string;
    hours: number;
    semester: string;
    description?: string;
    lessons?: ApiLesson[];
}

export interface ApiLesson {
    id: number;
    course_id: number;
    title: string;
    type: 'video' | 'document' | 'quiz' | 'exam';
    duration?: string;
    file_url?: string;
    locked: boolean;
    order: number;
    quiz_data?: unknown;
}

export interface ApiLessonProgress {
    id: number;
    student_id: number;
    lesson_id: number;
    course_id: number;
    completed: boolean;
    score?: number;
    completed_at?: string;
}

export const courseService = {
    list: (params?: Record<string, string>) =>
        api.get<ApiCourse[]>('/courses', { params }).then(r => r.data),

    get: (id: number) =>
        api.get<ApiCourse>(`/courses/${id}`).then(r => r.data),

    create: (data: Partial<ApiCourse>) =>
        api.post<ApiCourse>('/courses', data).then(r => r.data),

    update: (id: number, data: Partial<ApiCourse>) =>
        api.put<ApiCourse>(`/courses/${id}`, data).then(r => r.data),

    delete: (id: number) =>
        api.delete(`/courses/${id}`).then(r => r.data),

    lessons: (courseId: number) =>
        api.get<ApiLesson[]>(`/courses/${courseId}/lessons`).then(r => r.data),

    progress: (courseId: number) =>
        api.get<{ total: number; completed: number; percentage: number }>(`/courses/${courseId}/progress`).then(r => r.data),

    markLessonComplete: (lessonId: number, score?: number) =>
        api.post<ApiLessonProgress>(`/lessons/${lessonId}/progress`, { score }).then(r => r.data),
};
