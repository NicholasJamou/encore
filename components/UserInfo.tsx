import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserData } from '../types/types';

interface UserInfoProps {
  userData: UserData;
  userEmail: string;
}

export const UserInfo: React.FC<UserInfoProps> = ({ userData, userEmail }) => (
  <View>
    <Text style={styles.label}>Email:</Text>
    <Text style={styles.value}>{userEmail}</Text>
    
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
    
    {userData.hobbies && userData.hobbies.length > 0 && (
      <>
        <Text style={styles.label}>Hobbies:</Text>
        <Text style={styles.value}>{userData.hobbies.join(', ')}</Text>
      </>
    )}
  </View>
);

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
});
