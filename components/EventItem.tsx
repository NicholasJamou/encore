import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Event } from '../types/types';

interface EventItemProps {
  item: Event;
  onSelect: (eventId: string) => void;
  isSelected: boolean;
  isSaving: boolean;
}

const EventItem: React.FC<EventItemProps> = ({ item, onSelect, isSelected, isSaving }) => {
  return (
    <TouchableOpacity onPress={() => onSelect(item._id)} disabled={isSaving}>
      <View style={styles.eventItem}>
        <Image source={{ uri: item.Image_URL }} style={styles.eventImage} />
        <View style={styles.eventDetails}>
          <Text style={styles.eventName}>{item.Event}</Text>
          <Text style={styles.eventInfo}>{item.City} - {item.Venue}</Text>
          <Text style={styles.eventInfo}>{item.date}</Text>
        </View>
        <View style={styles.checkboxContainer}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'center',
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
});

export default EventItem;