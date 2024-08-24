import React, { memo } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

interface Event {
  _id: string;
  City: string;
  Event: string;
  date: string;
  Image_URL: string;
  Venue: string;
}

interface EventItemProps {
  item: Event;
  onSelect: (id: string) => void;
  isSelected: boolean;
  isSaving: boolean;
}

const EventItem = memo(({ item, onSelect, isSelected, isSaving }: EventItemProps) => (
  <TouchableOpacity onPress={() => onSelect(item._id)} style={styles.eventItem} disabled={isSaving}>
    <Image source={{ uri: item.Image_URL }} style={styles.eventImage} />
    <View style={styles.eventDetails}>
      <Text style={styles.eventName}>{item.Event}</Text>
      <Text style={styles.eventInfo}>{new Date(item.date).toLocaleDateString()}</Text>
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