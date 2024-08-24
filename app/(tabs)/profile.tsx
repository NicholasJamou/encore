import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EventItem from '../../components/EventItem';

// Define the structure of user data
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

// Define the structure of an Event object
interface Event {
  _id: string;
  City: string;
  Event: string;
  date: string;
  Image_URL: string;
  Venue: string;
}

const Profile = () => {
  // Get the current user from Clerk authentication
  const { user } = useUser();
  // Get the query client instance for managing React Query cache
  const queryClient = useQueryClient();

  // Function to fetch user data from the API
  const fetchUserData = async (clerkId: string): Promise<UserData> => {
    const response = await axios.get(`http://192.168.0.32:3000/user/${clerkId}`);
    return response.data;
  };

  // Function to fetch saved events for the user
  const fetchSavedEvents = async (userId: string): Promise<Event[]> => {
    // First, fetch the list of saved event IDs
    const response = await axios.get(`http://192.168.0.32:3000/user/${userId}/events`);
    const eventIds = response.data;
    // Then, fetch the details for each event ID
    const events = await Promise.all(eventIds.map(async (id: string) => {
      const eventResponse = await axios.get(`http://192.168.0.32:3000/events/${id}`);
      return eventResponse.data;
    }));
    // Filter out any null responses (in case an event was not found)
    return events.filter(event => event !== null);
  };

  // Use React Query to fetch and manage user data
  const { data: userData, isLoading: userLoading, error: userError } = useQuery<UserData, Error>({
    queryKey: ['userData', user?.id],
    queryFn: () => fetchUserData(user?.id!),
    enabled: !!user?.id, // Only run the query if we have a user ID
  });

  // Use React Query to fetch and manage saved events data
  const { data: savedEvents, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useQuery<Event[], Error>({
    queryKey: ['savedEventDetails', user?.id],
    queryFn: () => fetchSavedEvents(user?.id!),
    enabled: !!user?.id, // Only run the query if we have a user ID
    refetchOnWindowFocus: true, // Refetch when the window regains focus
    staleTime: 0, // Consider the data stale immediately (always refetch when possible)
  });

  // Mutation for removing a saved event
  const unsaveEventMutation = useMutation({
    mutationFn: (eventId: string) =>
      axios.delete('http://192.168.0.32:3000/user/events', {
        data: { userId: user?.id, eventIds: [eventId] },
      }),
    onSuccess: () => {
      // Invalidate and refetch the saved events query when an event is unsaved
      queryClient.invalidateQueries({ queryKey: ['savedEventDetails', user?.id] });
    },
  });

  // Handle the selection (unsaving) of an event
  const handleSelectEvent = useCallback((eventId: string) => {
    unsaveEventMutation.mutate(eventId);
  }, [unsaveEventMutation]);

  // Render an individual event item
  const renderEvent = useCallback(({ item }: { item: Event }) => (
    <EventItem
      key={item._id}
      item={item}
      onSelect={handleSelectEvent}
      isSelected={true}
      isSaving={unsaveEventMutation.isPending}
    />
  ), [handleSelectEvent, unsaveEventMutation.isPending]);

  // Show loading indicator while data is being fetched
  if (userLoading || eventsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Show error message if there's an error fetching data
  if (userError || eventsError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{userError?.message || eventsError?.message}</Text>
      </View>
    );
  }

  // Render the main profile content
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={userLoading || eventsLoading} 
          onRefresh={() => {
            // Manually trigger a refetch of user data and saved events
            queryClient.invalidateQueries({ queryKey: ['userData', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['savedEventDetails', user?.id] });
          }} 
        />
      }
    >
      <Text style={styles.title}>User Profile</Text>
      
      {/* Display user's email */}
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{user?.emailAddresses[0].emailAddress}</Text>
      
      {/* Display user data if available */}
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
          
          {/* Display gender if available */}
          {userData.gender && (
            <>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>{userData.gender}</Text>
            </>
          )}
          
          <Text style={styles.label}>Verified:</Text>
          <Text style={styles.value}>{userData.verified ? 'Yes' : 'No'}</Text>
          
          {/* Display bio if available */}
          {userData.bio && (
            <>
              <Text style={styles.label}>Bio:</Text>
              <Text style={styles.value}>{userData.bio}</Text>
            </>
          )}
          
          {/* Display hobbies if available */}
          {userData.hobbies.length > 0 && (
            <>
              <Text style={styles.label}>Hobbies:</Text>
              <Text style={styles.value}>{userData.hobbies.join(', ')}</Text>
            </>
          )}
        </>
      )}

      {/* Saved Events section */}
      <Text style={styles.sectionTitle}>Saved Events</Text>
      {savedEvents && savedEvents.length > 0 ? (
        <FlatList
          style={styles.eventsList}
          data={savedEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item._id}
          scrollEnabled={false} // Disable scrolling as it's inside a ScrollView
        />
      ) : (
        <Text style={styles.emptyText}>No saved events found</Text>
      )}
    </ScrollView>
  );
};

// Styles for the component
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