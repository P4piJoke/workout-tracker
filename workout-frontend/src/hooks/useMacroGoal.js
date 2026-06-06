import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosClient';

export function useMacroGoal() {
    return useQuery({
        queryKey: ['macro-goal'],
        queryFn: () =>
            apiClient.get('/api/macro-goal').then(r => r.status === 204 ? null : r.data),
        staleTime: 300_000,
    });
}

export function useSaveMacroGoal() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) =>
            apiClient.put('/api/macro-goal', payload).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['macro-goal'] }),
    });
}