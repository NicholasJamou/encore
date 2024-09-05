import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, RefreshControl } from 'react-native';
import BigList from 'react-native-big-list';
import debounce from 'lodash/debounce';
import { supabase } from '../../lib/supabase'; // Assume this is set up correctly

import EventItem from '../../components/EventItem';
import SearchBar from '../../components/SearchBar';
import FilterButton from '../../components/FilterButton';
import ActiveFilter from '../../components/ActiveFilter';
import CityFilterModal from '../../components/CityFilterModal';
import useEvents from '../../hooks/useEvents';
import { useSavedEvents } from '../../hooks/useSavedEvents';
import { Event } from '../../types/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatePresence, YStack } from 'tamagui';
import { MotiView } from 'moti';

interface EventWithUniqueId extends Event {
  uniqueId: string;
}

const EventsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

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
    ['All Cities', 'Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide', 'Hobart', 'Darwin', 'Canberra'],
    []
  );

  const renderContent = () => {
    if (eventsQuery.isLoading) {
      return <Text style={styles.messageText}>Loading events...</Text>;
    }

    if (eventsQuery.isError) {
      return <Text style={styles.messageText}>Error: {eventsQuery.error.message}</Text>;
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
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <AnimatePresence>
          <MotiView
            from={{ opacity: 0, translateY: 25 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 750, delay: 100 }}
          >
            <Text
              style={styles.title}
            >
              Events
            </Text>
          </MotiView>
          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 750, delay: 250 }}
          >
            <Text
              style={styles.body}
            >
              See who else is going: Click on your upcoming events to view attendees in your feed
            </Text>
          </MotiView>
        </AnimatePresence>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
            <SearchBar onChangeText={debouncedSearch} />
            <FilterButton onPress={() => setShowCityFilter(true)} />
          </View>
          
          {cityFilter && (
            <ActiveFilter cityFilter={cityFilter} onClear={() => handleCityFilter('')} />
          )}
          
          <View style={{ flex: 1, paddingTop: 10 }}>
            {renderContent()}
          </View>
          
          <CityFilterModal
            visible={showCityFilter}
            onClose={() => setShowCityFilter(false)}
            cities={uniqueCities}
            onSelectCity={handleCityFilter}
          />
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  messageText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 20,
    marginTop: 30,
  },
  body: {
    fontSize: 11,
    color: '#999',
    marginBottom: 30,
    marginLeft: 20,
  },
});

export default EventsScreen;