import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, StyleSheet, Dimensions, Image } from "react-native";
import React from "react";
import Swiper from "react-native-swiper";
import { onboarding } from "@/constants";
import { router } from "expo-router";
import { Video } from 'expo-av';
import { Button } from 'tamagui';

const { height, width } = Dimensions.get('window');

const Onboarding = () => {
    const handleSignIn = () => {
        // Navigate to login screen
        router.push("/login");
    };

    const handleSignUp = () => {
        // Navigate to login screen
        router.push("/register");
    };
    return (
        <View style={styles.container}>
            <Video
                source={require('../../assets/video/background.mp4')}
                style={styles.backgroundVideo}
                resizeMode="cover"
                shouldPlay
                isLooping
                isMuted
            />
            <View style={styles.overlay} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/images/logoWhite.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.appName}>Encore</Text>
                    </View>
                    <Swiper
                        loop={false}
                        dot={<View style={styles.dot} />}
                        activeDot={<View style={styles.activeDot} />}
                        paginationStyle={styles.pagination}
                    >
                        {onboarding.map((item) => (
                            <View key={item.id} style={styles.slide}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.description}>{item.description}</Text>
                                </View>
                            </View>
                        ))}
                    </Swiper>
                    <Button
                        size="$5"
                        onPress={handleSignUp}
                        style={styles.buttonCreateAccount}
                        backgroundColor="#008080"
                    >
                        Create an account
                    </Button>
                    <Button
                        size="$5"
                        onPress={handleSignIn}
                        style={styles.button}
                        borderWidth={0}
                    >
                        Sign In
                    </Button>
                </View>
            </SafeAreaView>
        </View>
        );
    };
    
    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        backgroundVideo: {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
        },
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        safeArea: {
            flex: 1,
        },
        content: {
            flex: 1,
            justifyContent: 'space-between',
        },
        logoContainer: {
            height: height / 2,
            justifyContent: 'center',
            alignItems: 'center',
        },
        logo: {
            width: width * 0.35,
            height: width * 0.3,
            marginBottom: 5,
        },
        appName: {
            color: 'white',
            fontSize: 30,
            fontWeight: 'bold',
        },
        slide: {
            flex: 1,
            justifyContent: 'flex-end',
            paddingBottom: 60,
        },
        textContainer: {
            alignItems: 'center',
            paddingHorizontal: 50,
        },
        title: {
            color: 'white',
            fontSize: 23,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 10,
        },
        description: {
            color: '#E0E0E0',
            fontSize: 14,
            textAlign: 'center',
        },
        dot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginHorizontal: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
        },
        activeDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginHorizontal: 4,
            backgroundColor: 'white',
        },
        pagination: {
            bottom: 30,
        },
        button: {
            outline: 'none',
            fontWeight: 'bold',
            color: 'teal',
            backgroundColor: 'transparent',
            alignSelf: 'center',
            marginBottom: 20,
            width: '80%',
        },
        buttonCreateAccount: {
            fontWeight: 'bold',
            color: 'white',
            alignSelf: 'center',
            width: '60%',
            borderRadius: 30, // Add this line to make it round
        },
    });
    
    export default Onboarding;