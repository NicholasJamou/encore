import React, { useCallback, useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useUserData } from '../../hooks/useUserData';
import { useSavedEvents } from '../../hooks/useSavedEvents';
import { UserInfo } from '../../components/UserInfo';
import { SavedEventsList } from '../../components/SavedEventsList';
import { Spinner } from 'tamagui'; // Import Spinner from Tamagui

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session in HomeScreen:', session);
    };
    fetchUser();
    checkSession();
  }, []);

  const { data: userData, isLoading: userLoading, error: userError } = useUserData(user?.id);
  const { savedEventsQuery, removeEventMutation } = useSavedEvents(user?.id);
  
  const handleUnsaveEvent = useCallback((eventId: string) => {
    removeEventMutation.mutate(eventId);
  }, [removeEventMutation]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['userData', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['savedEventDetails', user?.id] });
  }, [queryClient, user?.id]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (userLoading || savedEventsQuery.isLoading) {
    return (
      <View style={[styles.safeArea, styles.spinnerContainer]}>
        <Spinner size="large" color="#006666" />
      </View>
    );
  }

  if (userError || savedEventsQuery.error) {
    return (
      <View style={styles.safeArea}>
        <Text style={styles.errorText}>{userError?.message || savedEventsQuery.error?.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
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
            userEmail={userData?.email || ''}
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
        <TouchableOpacity onPress={handleSignOut} style={styles.button}>
          <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
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
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;