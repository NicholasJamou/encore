import { useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';
import { EventsResponse, InfiniteEventsResponse } from '../types/types';

interface UseEventsProps {
  searchQuery: string;
  cityFilter: string;
}

const useEvents = ({ searchQuery, cityFilter }: UseEventsProps): UseInfiniteQueryResult<InfiniteEventsResponse, Error> => {
  return useInfiniteQuery<EventsResponse, Error, InfiniteEventsResponse>({
    queryKey: ['events', searchQuery, cityFilter],
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        ...(searchQuery && { search: searchQuery }),
        ...(cityFilter && { city: cityFilter }),
      });
      const url = `http://192.168.0.32:3000/events?${queryParams}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined,
  });
};

export default useEvents;