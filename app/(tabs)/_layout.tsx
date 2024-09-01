import { Tabs, useRouter } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Image, ImageSourcePropType, View, Animated, Easing } from "react-native";
import { icons } from "@/constants";
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase'; // Adjust the import path as needed

const AnimatedImage = Animated.createAnimatedComponent(Image);

const TabIcon = ({
  source,
  focused,
  routeName,
}: {
  source: ImageSourcePropType;
  focused: boolean;
  routeName: string;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      const currentRoute = e.data.state.routes[e.data.state.index];
      if (currentRoute.name === routeName) {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ]).start();
      } else {
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      }
    });

    return unsubscribe;
  }, [navigation, routeName]);

  return (
    <View className="flex-1 items-center justify-center">
      <View
        className={`flex flex-row justify-center items-center rounded-full ${focused ? "bg-teal-400" : ""}`}
      >
        <Animated.View
          className={`rounded-full w-12 h-12 items-center justify-center ${focused ? "bg-teal-400" : ""}`}
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <AnimatedImage
            source={source}
            tintColor="white"
            resizeMode="contain"
            className="w-7 h-7"
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/(auth)/login');
      }
    };
    checkSession();
  }, []);
  
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#333333",
          borderRadius: 50,
          paddingBottom: 0, // ios only
          overflow: "hidden",
          marginHorizontal: 20,
          marginBottom: 20,
          height: 78,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen
        name="friendFeed"
        options={{
          title: "Feed",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.search} focused={focused} routeName="friendFeed" />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.calendar} focused={focused} routeName="events" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.chat} focused={focused} routeName="chat" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} routeName="profile" />
          ),
        }}
      />
    </Tabs>
  );
}