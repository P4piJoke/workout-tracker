import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosClient';

export function useTemplates() {
    return useQuery({
        queryKey: ['templates'],
        queryFn: () => apiClient.get('/api/templates').then(r => r.data),
        staleTime: 120_000,
    });
}

export function useCreateTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => apiClient.post('/api/templates', payload).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
    });
}

export function useCloneTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiClient.post(`/api/templates/${id}/clone`).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
    });
}

export function useDeleteTemplate() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiClient.delete(`/api/templates/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
    });
}