import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import BigList from 'react-native-big-list';
import debounce from 'lodash/debounce';

import EventItem from '../../components/EventItem';
import SearchBar from '../../components/SearchBar';
import FilterButton from '../../components/FilterButton';
import ActiveFilter from '../../components/ActiveFilter';
import CityFilterModal from '../../components/CityFilterModal';
import useEvents from '../../hooks/useEvents';
import { useSavedEvents } from '../../hooks/useSavedEvents';
import { Event } from '../../types/types';

interface EventWithUniqueId extends Event {
  uniqueId: string;
}

const EventsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showCityFilter, setShowCityFilter] = useState(false);
  
  const { userId } = useAuth();

  const eventsQuery = useEvents({ searchQuery, cityFilter });
  const { savedEventsQuery, saveEventMutation, removeEventMutation } = useSavedEvents(userId);

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
    if (!userId) {
      console.error('User not authenticated');
      return;
    }
    const savedEventIds = new Set((savedEventsQuery.data || []).map(event => event._id));
    if (savedEventIds.has(eventId)) {
      removeEventMutation.mutate(eventId);
    } else {
      saveEventMutation.mutate(eventId);
    }
  }, [userId, savedEventsQuery.data, removeEventMutation, saveEventMutation]);

  const renderEvent = useCallback(({ item }: { item: EventWithUniqueId }) => {
    const savedEventIds = new Set((savedEventsQuery.data || []).map(event => event._id));
    const isSelected = savedEventIds.has(item._id);
    const isSaving = saveEventMutation.isPending || removeEventMutation.isPending;
    return (
      <EventItem 
        item={item} 
        onSelect={() => handleSelectEvent(item._id)}
        isSelected={isSelected}
        isSaving={isSaving}
      />
    );
  }, [savedEventsQuery.data, saveEventMutation.isPending, removeEventMutation.isPending, handleSelectEvent]);

  const handleLoadMore = useCallback(() => {
    if (eventsQuery.hasNextPage) {
      eventsQuery.fetchNextPage();
    }
  }, [eventsQuery]);

  const handleRefresh = useCallback(() => {
    eventsQuery.refetch();
    savedEventsQuery.refetch();
  }, [eventsQuery, savedEventsQuery]);

  const allEvents = useMemo<EventWithUniqueId[]>(() => 
    eventsQuery.data?.pages.flatMap((page, pageIndex: number) => 
      page.events.map((event: Event) => ({
        ...event,
        uniqueId: `${pageIndex}-${event._id}`
      }))
    ) || [],
    [eventsQuery.data]
  );

  const uniqueCities = useMemo(() => 
    ['All Cities', 'Melbounre', 'Sydney', 'Brisbane', 'Perth', 'Adelaide', 'Hobart', 'Darwin', 'Canberra'],
    [allEvents]
  );

  const renderContent = () => {
    if (eventsQuery.isLoading) {
      return <Text>Loading events...</Text>;
    }

    if (eventsQuery.isError) {
      return <Text>Error: {eventsQuery.error.message}</Text>;
    }

    if (allEvents.length === 0) {
      return <Text style={styles.noResultsText}>No events found. Try adjusting your search or filters.</Text>;
    }

    return (
      <BigList
        data={allEvents}
        renderItem={renderEvent}
        itemHeight={100}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl 
            refreshing={eventsQuery.isFetching && !eventsQuery.isFetchingNextPage} 
            onRefresh={handleRefresh} 
          />
        }
        renderHeader={() => null}
        renderFooter={() => null}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar onChangeText={debouncedSearch} />
        <FilterButton onPress={() => setShowCityFilter(true)} />
      </View>
      
      {cityFilter && (
        <ActiveFilter cityFilter={cityFilter} onClear={() => handleCityFilter('')} />
      )}
      
      {renderContent()}
      
      <CityFilterModal
        visible={showCityFilter}
        onClose={() => setShowCityFilter(false)}
        cities={uniqueCities}
        onSelectCity={handleCityFilter}
      />
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
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default EventsScreen;