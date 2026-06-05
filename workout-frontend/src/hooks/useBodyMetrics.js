import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosClient';

export function useMetricsHistory() {
  return useQuery({
    queryKey: ['metrics', 'history'],
    queryFn: () => apiClient.get('/api/metrics/history').then(r => r.data),
    staleTime: 60_000,
  });
}

export function useMetricsSummary() {
  return useQuery({
    queryKey: ['metrics', 'summary'],
    queryFn: () => apiClient.get('/api/metrics/summary').then(r => r.data),
    staleTime: 60_000,
  });
}

export function useLogMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.post('/api/metrics', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
}

export function useDeleteMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date) => apiClient.delete(`/api/metrics/${date}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['metrics'] }),
  });
}