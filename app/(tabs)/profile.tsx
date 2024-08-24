import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EventItem from '../../components/EventItem';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender?: string;
  verified: boolean;
  bio?: string;
  hobbies: string[];
}

interface Event {
  _id: string;
  City: string;
  Event: string;
  date: string;
  Image_URL: string;
  Venue: string;
}

const Profile = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const fetchUserData = async (clerkId: string): Promise<UserData> => {
    const response = await axios.get(`http://192.168.0.32:3000/user/${clerkId}`);
    return response.data;
  };

  const fetchSavedEvents = async (userId: string): Promise<Event[]> => {
    const response = await axios.get(`http://192.168.0.32:3000/user/${userId}/events`);
    const eventIds = response.data;
    const events = await Promise.all(eventIds.map(async (id: string) => {
      const eventResponse = await axios.get(`http://192.168.0.32:3000/events/${id}`);
      return eventResponse.data;
    }));
    return events.filter(event => event !== null);
  };

  const { data: userData, isLoading: userLoading, error: userError } = useQuery<UserData, Error>({
    queryKey: ['userData', user?.id],
    queryFn: () => fetchUserData(user?.id!),
    enabled: !!user?.id,
  });

  const { data: savedEvents, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useQuery<Event[], Error>({
    queryKey: ['savedEventDetails', user?.id],
    queryFn: () => fetchSavedEvents(user?.id!),
    enabled: !!user?.id,
  });

  const unsaveEventMutation = useMutation({
    mutationFn: (eventId: string) =>
      axios.delete('http://192.168.0.32:3000/user/events', {
        data: { userId: user?.id, eventIds: [eventId] },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedEventDetails', user?.id] });
    },
  });

  const handleSelectEvent = useCallback((eventId: string) => {
    unsaveEventMutation.mutate(eventId);
  }, [unsaveEventMutation]);

  const renderEvent = useCallback(({ item }: { item: Event }) => (
    <EventItem
      key={item._id}
      item={item}
      onSelect={handleSelectEvent}
      isSelected={true}
      isSaving={unsaveEventMutation.isPending}
    />
  ), [handleSelectEvent, unsaveEventMutation.isPending]);

  if (userLoading || eventsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (userError || eventsError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{userError?.message || eventsError?.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={userLoading || eventsLoading} 
          onRefresh={() => {
            queryClient.invalidateQueries({ queryKey: ['userData', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['savedEventDetails', user?.id] });
          }} 
        />
      }
    >
      <Text style={styles.title}>User Profile</Text>
      
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{user?.emailAddresses[0].emailAddress}</Text>
      
      {userData && (
        <>
          <Text style={styles.label}>First Name:</Text>
          <Text style={styles.value}>{userData.firstName}</Text>
          
          <Text style={styles.label}>Last Name:</Text>
          <Text style={styles.value}>{userData.lastName}</Text>
          
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{userData.phoneNumber}</Text>
          
          <Text style={styles.label}>Date of Birth:</Text>
          <Text style={styles.value}>{new Date(userData.dateOfBirth).toLocaleDateString()}</Text>
          
          {userData.gender && (
            <>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>{userData.gender}</Text>
            </>
          )}
          
          <Text style={styles.label}>Verified:</Text>
          <Text style={styles.value}>{userData.verified ? 'Yes' : 'No'}</Text>
          
          {userData.bio && (
            <>
              <Text style={styles.label}>Bio:</Text>
              <Text style={styles.value}>{userData.bio}</Text>
            </>
          )}
          
          {userData.hobbies.length > 0 && (
            <>
              <Text style={styles.label}>Hobbies:</Text>
              <Text style={styles.value}>{userData.hobbies.join(', ')}</Text>
            </>
          )}
        </>
      )}

      <Text style={styles.sectionTitle}>Saved Events</Text>
      {savedEvents && savedEvents.length > 0 ? (
        <FlatList
          style={styles.eventsList}
          data={savedEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.emptyText}>No saved events found</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  eventsList: {
    marginBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default Profile;