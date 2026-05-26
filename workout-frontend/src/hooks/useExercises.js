import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosClient';

export function useExerciseSearch(query) {
  return useQuery({
    queryKey:  ['exercises', 'search', query],
    queryFn:   () =>
      apiClient
        .get('/api/exercises/search', { params: { q: query } })
        .then(r => r.data),
    enabled:   query.length > 1,
    staleTime: 30_000,
  });
}

export function useAllExercises({ muscle, type } = {}) {
  return useQuery({
    queryKey:  ['exercises', 'all', muscle, type],
    queryFn:   () => {
      const params = {};
      if (muscle) params.muscle = muscle;
      if (type)   params.type   = type;
      return apiClient.get('/api/exercises', { params }).then(r => r.data);
    },
    staleTime: 60_000,
  });
}