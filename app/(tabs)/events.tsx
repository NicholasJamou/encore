import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Modal, Button, RefreshControl } from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useAuth } from '@clerk/clerk-expo';
import EventItem from '../../components/EventItem';

interface Event {
  _id: string;
  City: string;
  Event: string;
  date: string;
  Image_URL: string;
  Venue: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface EventsResponse {
  events: Event[];
  pagination: PaginationInfo;
}

const EventsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showCityFilter, setShowCityFilter] = useState(false);
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const fetchEvents = async ({ pageParam = 1 }) => {
    const queryParams = new URLSearchParams({
      page: pageParam.toString(),
      limit: '20',
      ...(searchQuery && { search: searchQuery }),
      ...(cityFilter && { city: cityFilter }),
    });
    const url = `http://192.168.0.32:3000/events?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json() as Promise<EventsResponse>;
  };

  const eventsQuery = useInfiniteQuery({
    queryKey: ['events', searchQuery, cityFilter],
    queryFn: fetchEvents,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined,
  });

  const fetchSavedEvents = async () => {
    if (!userId) throw new Error('User not authenticated');
    const response = await fetch(`http://192.168.0.32:3000/user/${userId}/events`);
    if (!response.ok) {
      throw new Error('Failed to fetch saved events');
    }
    return response.json();
  };

  const savedEventsQuery = useQuery({
    queryKey: ['savedEventIds', userId],
    queryFn: fetchSavedEvents,
    enabled: !!userId,
  });

  const saveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch('http://192.168.0.32:3000/user/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, eventIds: [eventId] }),
      });
      if (!response.ok) throw new Error('Failed to save event');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['savedEventIds', userId] });
      queryClient.invalidateQueries({ queryKey: ['savedEventDetails', userId] });
      
      // Optionally, you can show a success message here
    },
    onError: (error) => {
      // Handle error (e.g., show an error message)
      console.error('Failed to save event:', error);
    },
  });

  const removeEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch('http://192.168.0.32:3000/user/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, eventIds: [eventId] }),
      });
      if (!response.ok) throw new Error('Failed to remove event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedEventIds', userId] });
    },
  });



  const debouncedSearch = useMemo(
    () => debounce((search: string) => {
      setSearchQuery(search);
    }, 300),
    []
  );

  const handleCityFilter = useCallback((city: string) => {
    setCityFilter(city);
    setShowCityFilter(false);
  }, []);

  const handleSelectEvent = useCallback((eventId: string) => {
    const savedEventIds = new Set(savedEventsQuery.data);
    if (savedEventIds.has(eventId)) {
      removeEventMutation.mutate(eventId);
    } else {
      saveEventMutation.mutate(eventId);
    }
  }, [savedEventsQuery.data, removeEventMutation, saveEventMutation]);

  const renderEvent = useCallback(({ item }: { item: Event }) => {
    const savedEventIds = new Set(savedEventsQuery.data);
    const isSelected = savedEventIds.has(item._id);
    const isSaving = saveEventMutation.isPending || removeEventMutation.isPending;
    return (
      <EventItem 
        item={item} 
        onSelect={handleSelectEvent}
        isSelected={isSelected}
        isSaving={isSaving}
      />
    );
  }, [savedEventsQuery.data, saveEventMutation.isPending, removeEventMutation.isPending, handleSelectEvent]);

  const keyExtractor = useCallback((item: Event) => item._id, []);

  const handleLoadMore = useCallback(() => {
    if (eventsQuery.hasNextPage) {
      eventsQuery.fetchNextPage();
    }
  }, [eventsQuery]);

  const handleRefresh = useCallback(() => {
    eventsQuery.refetch();
    savedEventsQuery.refetch();
  }, [eventsQuery, savedEventsQuery]);

  const renderContent = () => {
    if (eventsQuery.isLoading) {
      return <Text>Loading events...</Text>;
    }

    if (eventsQuery.isError) {
      return <Text>Error: {eventsQuery.error.message}</Text>;
    }

    const allEvents = eventsQuery.data?.pages.flatMap((page, pageIndex) => 
      page.events.map(event => ({
        ...event,
        uniqueId: `${pageIndex}-${event._id}` // Create a unique ID for each event
      }))
    ) || [];

    if (allEvents.length === 0) {
      return <Text style={styles.noResultsText}>No events found. Try adjusting your search or filters.</Text>;
    }

    return (
      <FlatList
        data={allEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.uniqueId} // Use the new uniqueId as the key
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl 
            refreshing={eventsQuery.isFetching && !eventsQuery.isFetchingNextPage} 
            onRefresh={handleRefresh} 
          />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          onChangeText={debouncedSearch}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowCityFilter(true)}>
          <Text>Filter</Text>
        </TouchableOpacity>
      </View>
      {cityFilter && (
        <View style={styles.activeFilterContainer}>
          <Text>Filtered by: {cityFilter}</Text>
          <TouchableOpacity onPress={() => handleCityFilter('')}>
            <Text style={styles.clearFilterText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
            {renderContent()}
      <Modal
        visible={showCityFilter}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by City</Text>
            <FlatList
              data={['All Cities', ...(eventsQuery.data?.pages[0]?.events.map(event => event.City) || [])]}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => handleCityFilter(item === 'All Cities' ? '' : item)}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => `city-${index}-${item}`} // Add a unique key for city items
            />
            <Button title="Close" onPress={() => setShowCityFilter(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  activeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e6e6e6',
  },
  clearFilterText: {
    color: 'blue',
  },
  eventItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  eventDetails: {
    marginLeft: 10,
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventInfo: {
    fontSize: 14,
    color: '#666',
  },
  checkboxContainer: {
    justifyContent: 'center',
    width: 24,
    height: 24,
    marginLeft: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
  },
  checkboxSelected: {
    backgroundColor: '#000',
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cityItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default EventsScreen;