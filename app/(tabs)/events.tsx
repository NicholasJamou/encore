import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity, Modal, Button } from 'react-native';
import debounce from 'lodash/debounce';
import { useAuth } from '@clerk/clerk-expo';

// Define the structure of an Event object
interface Event {
  _id: string;
  City: string;
  Event: string;
  date: string;
  Image_URL: string;
  Venue: string;
}

// Define the structure of pagination information
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// EventItem component: Renders a single event item
// memo is used for performance optimization, preventing unnecessary re-renders
const EventItem = memo(({ item, onSelect, isSelected, isSaving }: { 
  item: Event; 
  onSelect: (id: string) => void; 
  isSelected: boolean; 
  isSaving: boolean 
}) => (
  <TouchableOpacity onPress={() => onSelect(item._id)} style={styles.eventItem} disabled={isSaving}>
    <Image source={{ uri: item.Image_URL }} style={styles.eventImage} />
    <View style={styles.eventDetails}>
      <Text style={styles.eventName}>{item.Event}</Text>
      <Text style={styles.eventInfo}>{item.date}</Text>
      <Text style={styles.eventInfo}>{item.Venue}</Text>
      <Text style={styles.eventInfo}>{item.City}</Text>
    </View>
    <View style={styles.checkboxContainer}>
      {isSaving ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]} />
      )}
    </View>
  </TouchableOpacity>
));

// Main EventsScreen component
const EventsScreen = () => {
  // State variables
  const [events, setEvents] = useState<Event[]>([]); // List of events
  const [loading, setLoading] = useState(false); // Loading state for events
  const [error, setError] = useState<string | null>(null); // Error state
  const [page, setPage] = useState(1); // Current page number
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null); // Pagination information
  const [refreshing, setRefreshing] = useState(false); // Pull-to-refresh state
  const [searchQuery, setSearchQuery] = useState(''); // Search query
  const [cityFilter, setCityFilter] = useState(''); // City filter
  const [showCityFilter, setShowCityFilter] = useState(false); // Show/hide city filter modal
  const [cities, setCities] = useState<string[]>([]); // List of available cities
  const [noResults, setNoResults] = useState(false); // No results state
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set()); // Selected events (unused in this version)
  const [savingEvents, setSavingEvents] = useState<Set<string>>(new Set()); // Events being saved/removed

  // Get the user ID from Clerk authentication
  const { userId } = useAuth();

  // State for saved events
  const [loadingSavedEvents, setLoadingSavedEvents] = useState(false);
  const [savedEventsError, setSavedEventsError] = useState<string | null>(null);
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());

  // Function to fetch saved events for the user
  const fetchSavedEvents = useCallback(async () => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }
  
    setLoadingSavedEvents(true);
    setSavedEventsError(null);
  
    try {
      const response = await fetch(`http://192.168.0.32:3000/user/${userId}/events`);
      if (!response.ok) {
        throw new Error('Failed to fetch saved events');
      }
      const savedEvents = await response.json();
      console.log('Fetched saved events:', savedEvents);
      setSavedEventIds(new Set(savedEvents));
    } catch (err) {
      console.error('Error fetching saved events:', err);
      setSavedEventsError('Failed to load saved events. Please try again.');
    } finally {
      setLoadingSavedEvents(false);
    }
  }, [userId]);

  // Function to fetch events
  const fetchEvents = useCallback(async (pageToFetch = 1, search = searchQuery, city = cityFilter) => {
    if (loading || (paginationInfo && !paginationInfo.hasNextPage && pageToFetch !== 1)) return;
    try {
      setLoading(true);
      setNoResults(false);
      const queryParams = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: '20',
        ...(search && { search }),
        ...(city && { city }),
      });
      const url = `http://192.168.0.32:3000/events?${queryParams}`;
      console.log('Fetching URL:', url);
      
      // Set up a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      
      if (response.status === 404) {
        setNoResults(true);
        setEvents([]);
        setPaginationInfo(null);
        setError(null);
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received data:', JSON.stringify(data, null, 2));
      
      if (pageToFetch === 1) {
        setEvents(data.events);
      } else {
        setEvents(prevEvents => [...prevEvents, ...data.events]);
      }
      setPaginationInfo(data.pagination);
      setPage(pageToFetch + 1);
      setError(null);

      // Update cities list
      const newCities = Array.from(new Set(data.events.map((event: Event) => event.City)));
      setCities(prevCities => Array.from(new Set([...prevCities, ...newCities])) as string[]);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error('Request timed out');
      } else {
        console.error('Error fetching events:', err);
      }
      setError(`Failed to fetch events: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, cityFilter]);

  // Debounce search to prevent too many API calls
  const debouncedSearch = useRef(
    debounce((search: string) => {
      setPage(1);
      fetchEvents(1, search, cityFilter);
    }, 300)
  ).current;

  // Effect to trigger search when searchQuery changes
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Effect to fetch events on initial load
  useEffect(() => {
    console.log('Triggering initial fetch');
    fetchEvents(1);
  }, []);
  
  // Effect to fetch saved events when user ID changes
  useEffect(() => {
    if (userId) {
      console.log('Fetching saved events for user:', userId);
      fetchSavedEvents();
    }
  }, [userId, fetchSavedEvents]);

  // Function to handle loading more events
  const handleLoadMore = useCallback(() => {
    if (!loading && paginationInfo?.hasNextPage) {
      fetchEvents(page);
    }
  }, [loading, paginationInfo, fetchEvents, page]);

  // Function to handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents(1);
    if (userId) {
      fetchSavedEvents();
    }
  }, [fetchEvents, userId, fetchSavedEvents]);

  // Function to handle city filter
  const handleCityFilter = useCallback((city: string) => {
    setCityFilter(city);
    setShowCityFilter(false);
    setPage(1);
    fetchEvents(1, searchQuery, city);
  }, [fetchEvents, searchQuery]);

  // Function to save an event
  const saveEvent = useCallback(async (eventId: string) => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }
  
    setSavingEvents(prev => new Set(prev).add(eventId));
    try {
      const response = await fetch('http://192.168.0.32:3000/user/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          eventIds: [eventId],
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save event');
      }
  
      const result = await response.json();
      console.log('Event saved successfully:', result);
      setSavedEventIds(prev => new Set(prev).add(eventId));
    } catch (err) {
      console.error('Error saving event:', err);
      // Optionally, show an error message to the user
    } finally {
      setSavingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  }, [userId]);

  // Function to remove an event
  const removeEvent = useCallback(async (eventId: string) => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }
  
    setSavingEvents(prev => new Set(prev).add(eventId));
    try {
      const response = await fetch('http://192.168.0.32:3000/user/events', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          eventIds: [eventId],
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to remove event');
      }
  
      const result = await response.json();
      console.log('Event removed successfully:', result);
      setSavedEventIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    } catch (err) {
      console.error('Error removing event:', err);
      // Optionally, show an error message to the user
    } finally {
      setSavingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  }, [userId]);

  // Function to handle selecting/deselecting an event
  const handleSelectEvent = useCallback((eventId: string) => {
    if (savedEventIds.has(eventId)) {
      removeEvent(eventId);
    } else {
      saveEvent(eventId);
    }
  }, [savedEventIds, saveEvent, removeEvent]);
  
  // Function to render a single event item
  const renderEvent = useCallback(({ item }: { item: Event }) => {
    const isSelected = savedEventIds.has(item._id);
    console.log(`Rendering event ${item._id}, isSelected: ${isSelected}`);
    return (
      <EventItem 
        key={item._id}
        item={item} 
        onSelect={handleSelectEvent}
        isSelected={isSelected}
        isSaving={savingEvents.has(item._id)}
      />
    );
  }, [handleSelectEvent, savedEventIds, savingEvents]);

  // Function to extract key for FlatList
  const keyExtractor = useCallback((item: Event) => item._id, []);

  // Function to render footer (loading indicator)
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" />
      </View>
    );
  };

  // Function to render the main content
  const renderContent = () => {
    if (loading && events.length === 0) {
      return <ActivityIndicator size="large" />;
    }
  
    if (loadingSavedEvents) {
      return <ActivityIndicator size="large" />;
    }
  
    if (savedEventsError) {
      return (
        <View>
          <Text>{savedEventsError}</Text>
          <Button title="Retry" onPress={fetchSavedEvents} />
        </View>
      );
    }
  
    if (noResults) {
      return <Text style={styles.noResultsText}>No events found. Try adjusting your search or filters.</Text>;
    }
  
    return (
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={keyExtractor}
        ListEmptyComponent={<Text style={styles.emptyText}>No events found</Text>}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={21}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 100,
          offset: 100 * index,
          index,
        })}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
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
              data={['All Cities', ...cities]}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => handleCityFilter(item === 'All Cities' ? '' : item)}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
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