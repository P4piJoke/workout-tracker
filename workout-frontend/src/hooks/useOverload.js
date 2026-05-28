import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosClient';

export function useOverload() {
  return useQuery({
    queryKey:  ['stats', 'overload'],
    queryFn:   () => apiClient.get('/api/stats/overload').then(r => r.data),
    staleTime: 60_000,
  });
}