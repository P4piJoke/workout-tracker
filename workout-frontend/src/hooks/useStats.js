import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosClient';

export function usePersonalRecords() {
  return useQuery({
    queryKey:  ['stats', 'personal-records'],
    queryFn:   () => apiClient.get('/api/stats/personal-records').then(r => r.data),
    staleTime: 60_000,
  });
}

export function useExerciseProgress(exerciseId) {
  return useQuery({
    queryKey:  ['stats', 'exercise-progress', exerciseId],
    queryFn:   () =>
      apiClient
        .get('/api/stats/exercise-progress', { params: { exerciseId } })
        .then(r => r.data),
    enabled:   !!exerciseId,
    staleTime: 60_000,
  });
}

export function useMuscleBalance() {
  return useQuery({
    queryKey:  ['stats', 'muscle-balance'],
    queryFn:   () => apiClient.get('/api/stats/muscle-balance').then(r => r.data),
    staleTime: 60_000,
  });
}