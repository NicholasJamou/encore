import React, { useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl, Button, TouchableOpacity } from 'react-native';
import { SignedOut, useClerk, useUser } from '@clerk/clerk-expo';
import { useQueryClient } from '@tanstack/react-query';
import { useUserData } from '../../hooks/useUserData';
import { useSavedEvents } from '../../hooks/useSavedEvents';
import { UserInfo } from '../../components/UserInfo';
import { SavedEventsList } from '../../components/SavedEventsList';
import { router } from 'expo-router';

const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { signOut } = useClerk();

  const { data: userData, isLoading: userLoading, error: userError } = useUserData(user?.id);
  const { savedEventsQuery, removeEventMutation } = useSavedEvents(user?.id);

  const handleUnsaveEvent = useCallback((eventId: string) => {
    removeEventMutation.mutate(eventId);
  }, [removeEventMutation]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['userData', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['savedEventDetails', user?.id] });
  }, [queryClient, user?.id]);

  if (userLoading || savedEventsQuery.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (userError || savedEventsQuery.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{userError?.message || savedEventsQuery.error?.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={userLoading || savedEventsQuery.isLoading} 
          onRefresh={handleRefresh}
        />
      }
    >
      <Text style={styles.title}>User Profile</Text>

      {userData && (
        <UserInfo 
          userData={userData} 
          userEmail={user?.emailAddresses[0].emailAddress || ''}
        />
      )}

      <Text style={styles.sectionTitle}>Saved Events</Text>
      {savedEventsQuery.data && (
        <SavedEventsList 
          events={savedEventsQuery.data}
          onUnsaveEvent={handleUnsaveEvent}
          isSaving={removeEventMutation.isPending}
        />
      )}
      <TouchableOpacity onPress={() => { signOut(); router.replace('/'); }} style={styles.button}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

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
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProfileScreen;