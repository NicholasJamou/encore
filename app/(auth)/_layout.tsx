import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function Layout() {
    const { isSignedIn } = useAuth()
    if (isSignedIn) {
        return <Redirect href={'/profile'} />
      }
    
    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
            </Stack>
        </>
    )
}