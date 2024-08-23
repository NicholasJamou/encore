import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';

// Define the structure of our user data
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

// Function to fetch user data from our backend
const fetchUserData = async (clerkId: string): Promise<UserData> => {
  try {
    const response = await axios.get(`http://192.168.0.32:3000/user/${clerkId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

const Profile = () => {
  const { user } = useUser();
  // State to hold our fetched user data
  const [userData, setUserData] = useState<UserData | null>(null);
  // State to track if we're loading data
  const [loading, setLoading] = useState(true);
  // State to hold any error messages
  const [error, setError] = useState<string | null>(null);

  // Effect hook to fetch user data when the component mounts or user ID changes
  useEffect(() => {
    const loadUserData = async () => {
      // Only fetch data if we have a user ID
      if (user?.id) {
        try {
          const data = await fetchUserData(user.id);
          setUserData(data);
        } catch (err) {
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [user?.id]); // This effect runs when user.id changes

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Show error message if data fetch failed
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Render the user profile
  return (
    <ScrollView style={styles.container}>
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
          
          {/* Only show gender if it exists */}
          {userData.gender && (
            <>
              <Text style={styles.label}>Gender:</Text>
              <Text style={styles.value}>{userData.gender}</Text>
            </>
          )}
          
          <Text style={styles.label}>Verified:</Text>
          <Text style={styles.value}>{userData.verified ? 'Yes' : 'No'}</Text>
          
          {/* Only show bio if it exists */}
          {userData.bio && (
            <>
              <Text style={styles.label}>Bio:</Text>
              <Text style={styles.value}>{userData.bio}</Text>
            </>
          )}
          
          {/* Only show hobbies if they exist */}
          {userData.hobbies.length > 0 && (
            <>
              <Text style={styles.label}>Hobbies:</Text>
              <Text style={styles.value}>{userData.hobbies.join(', ')}</Text>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

// Styles for our component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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
});

export default Profile;