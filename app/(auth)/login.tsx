import React, { useState, useCallback } from 'react';
import { Link, useRouter } from 'expo-router';
import { Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { TamaguiProvider, Theme, Input, Button, Text, YStack, XStack, Spinner, AnimatePresence, Stack } from 'tamagui';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import { AntDesign } from '@expo/vector-icons';
import { HelloWave } from '@/components/HelloWave';
import { OtpInput } from "react-native-otp-entry";
import { supabase } from '../../lib/supabase'; // Assume this is set up correctly
import axios from 'axios';

// Define types for props and state
type ErrorMessageProps = { message: string };
type AnimatedViewProps = { children: React.ReactNode; isVisible: boolean; [key: string]: any };
type ButtonProps = { onPress: () => void; disabled: boolean };
type StepProps = { onContinue: (identifier: string) => void; isLoading: boolean; onSwitchToEmail?: () => void; onSwitchToPhone?: () => void; error: string };
type VerificationStepProps = { identifier: string; onVerify: (code: string) => void; isLoading: boolean; error: string };

// Error message component
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <Text color="$red10" fontSize="$3" textAlign="center" marginTop="$2">
    {message}
  </Text>
);

// Animated view component for smooth transitions
const AnimatedView: React.FC<AnimatedViewProps> = ({ children, isVisible, ...props }) => (
  <AnimatePresence>
    {isVisible && (
      <Stack
        animation="quick"
        enterStyle={{ opacity: 0, scale: 0.95, y: 10 }}
        exitStyle={{ opacity: 0, scale: 0.95, y: 10 }}
        y={0}
        opacity={1}
        scale={1}
        {...props}
      >
        {children}
      </Stack>
    )}
  </AnimatePresence>
);

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ children, ...props }) => {
  return (
    <Button
      animation="quick"
      pressStyle={{ scale: 0.97 }}
      {...props}
    >
      {children}
    </Button>
  );
};

// Update other components to use AnimatedButton
const AppleSignInButton: React.FC<ButtonProps> = (props) => (
  <AnimatedButton
    width="100%"
    backgroundColor="black"
    color="white"
    {...props}
  >
    <AntDesign name="apple1" size={24} color="white" />
    <Text color="white" marginLeft="$2">Sign in with Apple</Text>
  </AnimatedButton>
);

const GoogleSignInButton: React.FC<ButtonProps> = (props) => (
  <AnimatedButton
    width="100%"
    backgroundColor="white"
    color="black"
    borderColor="$gray5"
    borderWidth={1}
    {...props}
  >
    <AntDesign name="google" size={24} color="red" />
    <Text color="black" marginLeft="$2">Sign in with Google</Text>
  </AnimatedButton>
);

// Update the PhoneStep component to ensure it always includes the country code
const PhoneStep: React.FC<StepProps> = ({ onContinue, isLoading, onSwitchToEmail, error }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneContinue = () => {
    // Remove the leading '0' if present
    const trimmedNumber = phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber;
    
    // Ensure the phone number always includes the country code
    const fullPhoneNumber = '+61' + trimmedNumber;
    
    console.log('Continuing with phone number:', fullPhoneNumber);
    onContinue(fullPhoneNumber);
  };

  return (
    <YStack space="$4" width="100%">
      <Text fontSize="$10" fontWeight="bold">Welcome to Encore, sign in below</Text>
      <XStack width="100%" alignItems="center">
        <XStack 
          borderWidth={1} 
          borderColor="$gray5" 
          borderRadius="$2" 
          paddingHorizontal="$2" 
          paddingVertical="$1" 
          marginRight="$2"
          alignItems="center"
        >
          <Text>🇦🇺</Text>
          <Text marginLeft="$1">+61</Text>
        </XStack>
        <Input
          flex={1}
          value={phoneNumber}
          placeholder="Phone Number"
          onChangeText={(text) => {
            // Remove any non-digit characters
            const cleaned = text.replace(/\D/g, '');
            setPhoneNumber(cleaned);
          }}
          keyboardType="phone-pad"
        />
      </XStack>
      {error && <ErrorMessage message={error} />}
      <AnimatedButton
        onPress={handlePhoneContinue}
        width="100%"
        backgroundColor="teal"
        color="white"
        borderRadius="30"
        disabled={isLoading}
      >
        {isLoading ? <Spinner color="white" /> : <Text color="white">Continue</Text>}
      </AnimatedButton>
      <XStack justifyContent="center" space="$2">
        <Text>Don't have an account?</Text>
        <Link href="/register">
          <Text color="$blue10">Sign up</Text>
        </Link>
      </XStack>
      <Button
        onPress={onSwitchToEmail}
        width="100%"
        variant="outlined"
        pressStyle={{ scale: 0.97 }}
        borderRadius="30"
      >
        Sign in with Email instead
      </Button>
    </YStack>
  );
};

const EmailStep: React.FC<StepProps> = ({ onContinue, isLoading, onSwitchToPhone, error }) => {
  const [email, setEmail] = useState('');

  return (
    <YStack space="$4" width="100%">
      <Text fontSize="$10" fontWeight="bold"><HelloWave /> Welcome to Encore, sign in below</Text>
      <Input
        value={email}
        placeholder="Email"
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {error && <ErrorMessage message={error} />}
      <Button
        onPress={() => onContinue(email)}
        width="100%"
        themeInverse
        disabled={isLoading}
        pressStyle={{ scale: 0.97 }}
        backgroundColor="teal"
        borderRadius="30"
      >
        {isLoading ? <Spinner color="$teal10" /> : "Continue"}
      </Button>
      <XStack justifyContent="center" space="$2">
        <Text>Don't have an account?</Text>
        <Link href="/register">
          <Text color="$blue10">Sign up</Text>
        </Link>
      </XStack>
      <Button
        onPress={onSwitchToPhone}
        width="100%"
        variant="outlined"
        pressStyle={{ scale: 0.97 }}
        borderRadius="30"
      >
        Sign in with Phone instead
      </Button>
    </YStack>
  );
};

const VerificationStep: React.FC<VerificationStepProps> = ({ identifier, onVerify, isLoading, error }) => {
  return (
    <YStack space="$4" width="100%" alignItems="center">
      <Text fontSize="$6" fontWeight="bold" textAlign="center">Enter Verification Code</Text>
      <Text fontSize="$4" color="$gray10" textAlign="center">Sent to: {identifier}</Text>
      <OtpInput 
        numberOfDigits={6}
        onFilled={(code) => {
          console.log('Code filled:', code);
          onVerify(code);
        }}
        focusColor="teal"
        textInputProps={{accessibilityLabel: "One-Time Password"}}
        containerStyle={{
          width: '100%',
          marginVertical: 20,
        }}
        pinCodeContainerStyle={{
          borderColor: '$gray5',
          borderWidth: 1,
          borderRadius: 8,
        }}
        pinCodeTextStyle={{
          fontSize: 20,
          color: '$gray12',
        }}
      />
      {error && <ErrorMessage message={error} />}
      {isLoading && <Spinner size="large" color="teal" />}
    </YStack>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'email' | 'verification'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [, , promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  const getErrorMessage = (err: any): string => {
    console.error('Error details:', JSON.stringify(err, null, 2));
    
    if (err.message === 'User does not exist. Please sign up first.') {
      return err.message;
    }
  
    if (err.status === 400 && err.code === 'validation_failed') {
      return 'Please enter a valid email address or phone number.';
    }
    
    if (err.message.includes('rate limit')) {
      return 'Too many attempts. Please try again later.';
    }
  
    return err.message || 'An unexpected error occurred. Please try again.';
  };

  const normalizePhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Remove leading '0' if present
    const withoutLeadingZero = digits.startsWith('0') ? digits.slice(1) : digits;
    // Add '+61' if not already present
    return withoutLeadingZero.startsWith('61') ? `+${withoutLeadingZero}` : `+61${withoutLeadingZero}`;
  };
  
  const handleContinue = useCallback(async (identifierInput: string) => {
    setIsLoading(true);
    setError('');
    console.log('Attempting to sign in with identifier:', identifierInput);
  
    try {
      const normalizedIdentifier = identifierInput.includes('@') 
        ? identifierInput 
        : normalizePhoneNumber(identifierInput);
  
      console.log('Normalized identifier:', normalizedIdentifier);
  
      // Check if the user exists in MongoDB
      const response = await axios.post('http://192.168.0.32:3000/check-user', {
        identifier: normalizedIdentifier
      });
  
      console.log('User check response:', response.data);
  
      if (!response.data.exists) {
        throw new Error('User does not exist. Please sign up first.');
      }
  
      // User exists, proceed with Supabase OTP sign-in
      let { data, error } = await supabase.auth.signInWithOtp({
        phone: normalizedIdentifier
      });
  
      if (error) throw error;
  
      setIdentifier(normalizedIdentifier);
      setStep('verification');
      console.log('Verification step prepared for:', normalizedIdentifier);
    } catch (err: any) {
      console.error('Error in handleContinue:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleVerify = useCallback(async (code: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    console.log('Attempting to verify code for:', identifier);
  
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: identifier.includes('@') ? undefined : identifier,
        email: identifier.includes('@') ? identifier : undefined,
        token: code,
        type: 'sms'
      });
  
      if (error) throw error;
  
      if (data.session) {
        console.log('Verification successful. Session:', data.session);
        router.replace('/(tabs)/profile');
      } else {
        setError('Verification failed. Please try again.');
        console.log('Verification failed for:', identifier);
      }
    } catch (err: any) {
      console.error('Error in handleVerify:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [identifier, router, isLoading]);

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError('');
    console.log('Attempting Apple Sign In');

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });

      if (error) throw error;

      if (data.user) {
        console.log('Apple Sign In successful, redirecting to home');
        router.replace('/(tabs)/profile');
      }
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        setError('Apple sign-in was canceled.');
        console.log('Apple Sign In canceled');
      } else {
        setError(getErrorMessage(e));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    console.log('Attempting Google Sign In');

    try {
      const result = await promptAsync();
      if (result?.type === 'success') {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: result.authentication?.accessToken!,
        });

        if (error) throw error;

        if (data.user) {
          console.log('Google Sign In successful, redirecting to home');
          router.replace('/(tabs)/profile');
        }
      }
    } catch (err: any) {
      console.error("Error signing in with Google", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const isVerificationStep = step === 'verification';

  const switchToEmail = () => {
    setStep('email');
    setError('');
    console.log('Switched to email sign-in');
  };

  const switchToPhone = () => {
    setStep('phone');
    setError('');
    console.log('Switched to phone sign-in');
  };

  return (
    <TamaguiProvider>
      <Theme name="light">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <YStack f={1} jc="center" ai="center" p="$4" space="$6">
              <YStack space="$1" width="100%" maxWidth={400}>
                <AnimatedView 
                  isVisible={!isVerificationStep} 
                  position="relative"
                  height={500}
                >
                  <AnimatedView isVisible={step === 'phone'} position="absolute" top={0} left={0} right={0}>
                    <PhoneStep 
                      onContinue={handleContinue} 
                      isLoading={isLoading} 
                      onSwitchToEmail={switchToEmail}
                      error={error}
                    />
                  </AnimatedView>
                  <AnimatedView isVisible={step === 'email'} position="absolute" top={0} left={0} right={0}>
                    <EmailStep 
                      onContinue={handleContinue} 
                      isLoading={isLoading} 
                      onSwitchToPhone={switchToPhone}
                      error={error}
                    />
                  </AnimatedView>
                </AnimatedView>

                <AnimatedView 
                  isVisible={isVerificationStep}
                  position="relative"
                  height={350}
                >
                  <VerificationStep 
                    identifier={identifier} 
                    onVerify={handleVerify}
                    isLoading={isLoading}
                    error={error}
                  />
                </AnimatedView>
                
                <AnimatedView isVisible={!isVerificationStep} width="100%">
                  <YStack space="$2" width="100%">
                    <AppleSignInButton 
                      onPress={handleAppleSignIn}
                      disabled={isLoading}
                      borderRadius="30"
                    />
                    <GoogleSignInButton 
                      onPress={handleGoogleSignIn}
                      disabled={isLoading}
                      borderRadius="30"
                    />
                  </YStack>
                </AnimatedView>
              </YStack>
            </YStack>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Theme>
    </TamaguiProvider>
  );
}