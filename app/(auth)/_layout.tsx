import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthLayout() {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        // You might want to show a loading spinner here
        return null;
    }

    if (isSignedIn) {
        return <Redirect href={'/(tabs)/profile'} />
    }
    
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen options={{ headerShown: false }} name="welcome" />
            <Stack.Screen options={{ headerShown: false }} name="login" />
            <Stack.Screen options={{ headerShown: false }} name="register" />
        </Stack>
    )
}