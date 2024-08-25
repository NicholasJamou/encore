import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { Event } from '../types/types';

interface UseSavedEventsResult {
  savedEventsQuery: UseQueryResult<Event[], Error>;
  saveEventMutation: UseMutationResult<AxiosResponse<any, any>, Error, string, unknown>;
  removeEventMutation: UseMutationResult<AxiosResponse<any, any>, Error, string, unknown>;
}

export const useSavedEvents = (userId: string | null | undefined): UseSavedEventsResult => {
  const queryClient = useQueryClient();

  const savedEventsQuery = useQuery<Event[], Error>({
    queryKey: ['savedEventDetails', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await axios.get(`http://192.168.0.32:3000/user/${userId}/events`);
      const eventIds = response.data;
      const events = await Promise.all(eventIds.map(async (id: string) => {
        const eventResponse = await axios.get(`http://192.168.0.32:3000/events/${id}`);
        return eventResponse.data;
      }));
      return events.filter(event => event !== null);
    },
    enabled: !!userId,
  });

  const saveEventMutation = useMutation<AxiosResponse<any, any>, Error, string, unknown>({
    mutationFn: async (eventId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return axios.post('http://192.168.0.32:3000/user/events', { userId, eventIds: [eventId] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedEventDetails', userId] });
    },
  });

  const removeEventMutation = useMutation<AxiosResponse<any, any>, Error, string, unknown>({
    mutationFn: async (eventId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return axios.delete('http://192.168.0.32:3000/user/events', {
        data: { userId, eventIds: [eventId] },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedEventDetails', userId] });
    },
  });

  return {
    savedEventsQuery,
    saveEventMutation,
    removeEventMutation,
  };
};