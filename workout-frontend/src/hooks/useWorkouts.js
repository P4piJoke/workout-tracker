import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axiosClient';

export function useMyWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn:  () => apiClient.get('/api/workouts/me').then(r => r.data),
  });
}

export function useCreateWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.post('/api/workouts', payload).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['workouts'] }),
  });
}

export function useUpdateWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiClient.put(`/api/workouts/${id}`, payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workouts'] }),
  });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/api/workouts/${id}`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['workouts'] }),
  });
}