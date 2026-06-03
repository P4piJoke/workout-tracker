import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosClient';

export function useExercisePreferences() {
  return useQuery({
    queryKey:  ['preferences', 'exercises'],
    queryFn:   () => apiClient.get('/api/preferences/exercises').then(r => r.data),
    staleTime: 300_000,
  });
}

export function useUpsertExercisePreference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseId, ...payload }) =>
      apiClient.put(`/api/preferences/exercises/${exerciseId}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preferences', 'exercises'] });
      qc.invalidateQueries({ queryKey: ['stats', 'overload'] });
    },
  });
}

export function useDeleteExercisePreference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId) =>
      apiClient.delete(`/api/preferences/exercises/${exerciseId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preferences', 'exercises'] });
      qc.invalidateQueries({ queryKey: ['stats', 'overload'] });
    },
  });
}