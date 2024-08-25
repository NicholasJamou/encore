import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { UserData } from '../types/types';

export const useUserData = (userId: string | undefined) => {
  return useQuery<UserData, Error>({
    queryKey: ['userData', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await axios.get(`http://192.168.0.32:3000/user/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};