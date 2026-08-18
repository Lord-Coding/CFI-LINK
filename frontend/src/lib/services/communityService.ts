import api from '../api';

export interface ApiCommunityPost {
    id: number;
    author_id: number;
    author?: { id: number; nom_complet: string };
    content: string;
    likes_count: number;
    created_at: string;
}

export interface ApiForumPost {
    id: number;
    course_id: string;
    author_id: number;
    author?: { id: number; nom_complet: string };
    title: string;
    content: string;
    pinned: boolean;
    created_at: string;
    replies?: ApiForumReply[];
}

export interface ApiForumReply {
    id: number;
    post_id: number;
    parent_id?: number;
    author_id: number;
    author?: { id: number; nom_complet: string };
    content: string;
    created_at: string;
    child_replies?: ApiForumReply[];
}

export const communityService = {
    list: () => api.get<ApiCommunityPost[]>('/community').then(r => r.data),
    create: (content: string) => api.post<ApiCommunityPost>('/community', { content }).then(r => r.data),
    toggleLike: (id: number) => api.patch<{ likes: number }>(`/community/${id}/like`).then(r => r.data),
    delete: (id: number) => api.delete(`/community/${id}`).then(r => r.data),
};

export const forumService = {
    list: (params?: Record<string, string>) =>
        api.get<{ data: ApiForumPost[]; total: number }>('/forum', { params }).then(r => r.data),
    create: (data: { title: string; content: string; course_id?: string }) =>
        api.post<ApiForumPost>('/forum', data).then(r => r.data),
    reply: (postId: number, data: { content: string; parent_id?: number }) =>
        api.post<ApiForumReply>(`/forum/${postId}/reply`, data).then(r => r.data),
    togglePin: (postId: number) =>
        api.patch<ApiForumPost>(`/forum/${postId}/pin`).then(r => r.data),
    delete: (postId: number) =>
        api.delete(`/forum/${postId}`).then(r => r.data),
};
