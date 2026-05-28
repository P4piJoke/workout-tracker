import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosClient';

export function usePreferences() {
  return useQuery({
    queryKey:  ['preferences'],
    queryFn:   () => apiClient.get('/api/preferences').then(r => r.data),
    staleTime: 300_000,  // preferences rarely change — cache 5 min
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiClient.put('/api/preferences', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preferences'] });
      qc.invalidateQueries({ queryKey: ['stats', 'overload'] });  // re-run engine with new ranges
    },
  });
}