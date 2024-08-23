import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, Button, RefreshControl, TextInput, TouchableOpacity, Modal } from 'react-native';
import debounce from 'lodash/debounce';

interface Event {
  city: string;
  event: string;
  date: string;
  image: string;
  venue: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const EventItem = memo(({ item }: { item: Event }) => (
  <View style={styles.eventItem}>
    <Image source={{ uri: item.image }} style={styles.eventImage} />
    <View style={styles.eventDetails}>
      <Text style={styles.eventName}>{item.event}</Text>
      <Text style={styles.eventInfo}>{item.date}</Text>
      <Text style={styles.eventInfo}>{item.venue}</Text>
      <Text style={styles.eventInfo}>{item.city}</Text>
    </View>
  </View>
));

const EventsScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [noResults, setNoResults] = useState(false);

  const fetchEvents = useCallback(async (pageToFetch = 1, search = searchQuery, city = cityFilter) => {
    if (paginationInfo && !paginationInfo.hasNextPage && pageToFetch !== 1) return;
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
      
      const response = await fetch(url);
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
      const newCities = Array.from(new Set(data.events.map((event: Event) => event.city)));
      setCities(prevCities => Array.from(new Set([...prevCities, ...newCities])) as string[]);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(`Failed to fetch events: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, cityFilter, paginationInfo]);

  const debouncedSearch = useRef(
    debounce((search: string) => {
      setPage(1);
      fetchEvents(1, search, cityFilter);
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    fetchEvents(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && paginationInfo?.hasNextPage) {
      fetchEvents(page);
    }
  }, [loading, paginationInfo, fetchEvents, page]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents(1);
  }, [fetchEvents]);

  const handleCityFilter = useCallback((city: string) => {
    setCityFilter(city);
    setShowCityFilter(false);
    setPage(1);
    fetchEvents(1, searchQuery, city);
  }, [fetchEvents, searchQuery]);

  const renderEvent = useCallback(({ item }: { item: Event }) => (
    <EventItem item={item} />
  ), []);

  const keyExtractor = useCallback((item: Event) => item.event, []);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" />
      </View>
    );
  };

  const renderContent = () => {
    if (loading && events.length === 0) {
      return <ActivityIndicator size="large" />;
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