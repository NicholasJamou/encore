import React from 'react';
import { Stack } from "expo-router";

const Layout: React.FC = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="chat" />
    </Stack>
  );
};

export default Layout;