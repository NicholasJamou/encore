import { StyleSheet, Text, SafeAreaView } from 'react-native'
import React from 'react'
import { useUser } from '@clerk/clerk-expo'

const profile = () => {
  const { user } = useUser()
  
  return (
    <SafeAreaView>
      <Text>profileScreen {user?.emailAddresses[0].emailAddress}</Text>
    </SafeAreaView>
  )
}

export default profile

const styles = StyleSheet.create({})