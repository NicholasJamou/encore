import React, { useCallback } from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';
import EventItem from './EventItem';
import { Event } from '../types/types';

interface SavedEventsListProps {
  events: Event[];
  onUnsaveEvent: (eventId: string) => void;
  isSaving: boolean;
}

export const SavedEventsList: React.FC<SavedEventsListProps> = ({ events, onUnsaveEvent, isSaving }) => {
  const renderEvent = useCallback(({ item }: { item: Event }) => (
    <EventItem
      key={item._id}
      item={item}
      onSelect={() => onUnsaveEvent(item._id)}
      isSelected={true}
      isSaving={isSaving}
    />
  ), [onUnsaveEvent, isSaving]);

  if (events.length === 0) {
    return <Text style={styles.emptyText}>No saved events found</Text>;
  }

  return (
    <FlatList
      style={styles.eventsList}
      data={events}
      renderItem={renderEvent}
      keyExtractor={(item) => item._id}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  eventsList: {
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});