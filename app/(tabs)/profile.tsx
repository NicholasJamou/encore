import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useUser } from '@clerk/clerk-expo'

const profile = () => {
  const { user } = useUser()
  
  return (
    <View>
      <Text>profileScreen {user?.emailAddresses[0].emailAddress}</Text>
    </View>
  )
}

export default profile

const styles = StyleSheet.create({})