import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';
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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [savingEvents, setSavingEvents] = useState<Set<string>>(new Set());

  const fetchUserData = async (clerkId: string): Promise<UserData> => {
    try {
      const response = await axios.get(`http://192.168.0.32:3000/user/${clerkId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  const fetchSavedEvents = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }
    try {
      console.log(`Fetching saved events for user: ${user.id}`);
      const response = await axios.get(`http://192.168.0.32:3000/user/${user.id}/events`);
      console.log('Saved events response:', response.data);
  
      if (!Array.isArray(response.data)) {
        console.error('Expected an array of event IDs, but received:', response.data);
        setError('Invalid data format for saved events');
        return;
      }
  
      const events = await Promise.all(response.data.map(async (id: string) => {
        try {
          console.log(`Fetching details for event ID: ${id}`);
          const eventResponse = await axios.get(`http://192.168.0.32:3000/events/${id}`);
          return eventResponse.data;
        } catch (eventError) {
          console.error(`Error fetching event ${id}:`, eventError);
          return null;  // Return null for failed event fetches
        }
      }));
  
      const validEvents = events.filter(event => event !== null);
      console.log(`Successfully fetched ${validEvents.length} out of ${response.data.length} events`);
      setSavedEvents(validEvents);
    } catch (err) {
      console.error('Error fetching saved events:', err);
      if (axios.isAxiosError(err)) {
        console.error('Axios error details:', err.response?.data);
      }
      setError('Failed to load saved events');
    }
  }, [user?.id]);

  const loadData = useCallback(async () => {
    if (user?.id) {
      try {
        setLoading(true);
        const [userDataResponse, savedEventsResponse] = await Promise.all([
          fetchUserData(user.id),
          fetchSavedEvents()
        ]);
        setUserData(userDataResponse);
        setError(null);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
  }, [user?.id, fetchSavedEvents]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, [loadData]);

  const handleSelectEvent = useCallback(async (eventId: string) => {
    if (!user?.id) return;

    setSavingEvents(prev => new Set(prev).add(eventId));
    try {
      await axios.delete('http://192.168.0.32:3000/user/events', {
        data: {
          userId: user.id,
          eventIds: [eventId]
        }
      });
      setSavedEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Error unsaving event:', error);
    } finally {
      setSavingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  }, [user?.id]);

  const renderEvent = useCallback(({ item }: { item: Event }) => (
    <EventItem
      key={item._id}
      item={item}
      onSelect={handleSelectEvent}
      isSelected={true} // Always true for saved events
      isSaving={savingEvents.has(item._id)}
    />
  ), [handleSelectEvent, savingEvents]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.title}>User Profile</Text>
      
      {/* Display email from Clerk */}
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{user?.emailAddresses[0].emailAddress}</Text>
      
      {/* Display data from our database if it exists */}
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
      {savedEvents.length > 0 ? (
        <FlatList style={styles.eventsList}
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
  eventsList : {
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