import api from '../api';

export interface ApiLibraryItem {
    id: number;
    title: string;
    author: string;
    category: 'book' | 'article' | 'thesis' | 'guide' | 'manual';
    filiere?: string;
    description?: string;
    file_type: 'pdf' | 'doc' | 'video';
    size?: string;
    file_url?: string;
    downloads: number;
    added_by?: number;
    created_at: string;
}

export const libraryService = {
    list: (params?: Record<string, string>) =>
        api.get<ApiLibraryItem[]>('/library', { params }).then(r => r.data),
    create: (data: Partial<ApiLibraryItem>) =>
        api.post<ApiLibraryItem>('/library', data).then(r => r.data),
    incrementDownload: (id: number) =>
        api.patch<{ downloads: number }>(`/library/${id}/download`).then(r => r.data),
    delete: (id: number) =>
        api.delete(`/library/${id}`).then(r => r.data),
};
