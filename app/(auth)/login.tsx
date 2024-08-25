import React, { useState, useCallback } from 'react';
import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { TamaguiProvider, Theme, Input, Button, Text, YStack, XStack, Spinner, AnimatePresence } from 'tamagui';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import { AntDesign } from '@expo/vector-icons';
import { HelloWave } from '@/components/HelloWave';
import { OtpInput } from "react-native-otp-entry";
import { Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';

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
      <YStack
        animation="quick"
        enterStyle={{ opacity: 0, scale: 0.95 }}
        exitStyle={{ opacity: 0, scale: 0.95 }}
        opacity={1}
        scale={1}
        {...props}
      >
        {children}
      </YStack>
    )}
  </AnimatePresence>
);

// Custom Apple Sign In Button
const AppleSignInButton: React.FC<ButtonProps> = ({ onPress, disabled }) => (
  <Button
    onPress={onPress}
    width="100%"
    disabled={disabled}
    pressStyle={{ scale: 0.97 }}
    backgroundColor="black"
    color="white"
    icon={<AntDesign name="apple1" size={24} color="white" />}
  >
    Sign in with Apple
  </Button>
);

// Custom Google Sign In Button
const GoogleSignInButton: React.FC<ButtonProps> = ({ onPress, disabled }) => (
  <Button
    onPress={onPress}
    width="100%"
    disabled={disabled}
    pressStyle={{ scale: 0.97 }}
    backgroundColor="white"
    color="black"
    borderColor="$gray5"
    borderWidth={1}
    icon={<AntDesign name="google" size={24} color="red" />}
  >
    Sign in with Google
  </Button>
);

// Phone input step component
const PhoneStep: React.FC<StepProps> = ({ onContinue, isLoading, onSwitchToEmail, error }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <YStack space="$4" width="100%">
      <Text fontSize="$10" fontWeight="bold"><HelloWave /> Welcome to Encore, sign in below</Text>
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
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      </XStack>
      {error && <ErrorMessage message={error} />}
      <Button
        onPress={() => onContinue('+61' + phoneNumber)}
        width="100%"
        themeInverse
        disabled={isLoading}
        pressStyle={{ scale: 0.97 }}
        backgroundColor="teal"
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
        onPress={onSwitchToEmail}
        width="100%"
        variant="outlined"
        pressStyle={{ scale: 0.97 }}
      >
        Sign in with Email instead
      </Button>
    </YStack>
  );
};

// Email input step component
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
      >
        Sign in with Phone instead
      </Button>
    </YStack>
  );
};

// Verification step component
const VerificationStep: React.FC<VerificationStepProps> = ({ identifier, onVerify, isLoading, error }) => {
  return (
    <YStack space="$4" width="100%" alignItems="center">
      <Text fontSize="$6" fontWeight="bold" textAlign="center">Enter Verification Code</Text>
      <Text fontSize="$4" color="$gray10" textAlign="center">Sent to: {identifier}</Text>
      <OtpInput 
        numberOfDigits={6}
        onFilled={(code) => {
          console.log('Code filled:', code); // Logging
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

// Main LoginPage component
export default function LoginPage() {
  // Clerk authentication hooks
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  // State management
  const [step, setStep] = useState<'phone' | 'email' | 'verification'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Setup Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  // Function to get user-friendly error messages
// Function to get user-friendly error messages
// Function to get user-friendly error messages
const getErrorMessage = (err: any): string => {
  console.error('Error details:', JSON.stringify(err, null, 2));
  console.error('Error type:', typeof err);
  console.error('Error keys:', Object.keys(err));

  if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    const firstError = err.errors[0];
    switch (firstError.code) {
      case 'form_code_incorrect':
        return 'The verification code is incorrect. Please try again.';
      case 'form_identifier_not_found':
        return 'No account found with this email or phone number. Please check and try again.';
      case 'form_param_format_invalid':
        return 'The email or phone number format is invalid. Please enter a valid email or phone number.';
      case 'form_password_incorrect':
        return 'Incorrect password. Please try again.';
      case 'form_identifier_exists':
        return 'An account with this email or phone number already exists.';
      case 'form_code_expired':
        return 'The verification code has expired. Please request a new one.';
      case 'rate_limit_exceeded':
        return 'Too many attempts. Please try again later.';
      case 'form_param_nil':
        return 'Please enter a valid email or phone number.';
      default:
        return firstError.longMessage || firstError.message || 'An unexpected error occurred. Please try again.';
    }
  }

  // Fallback for other types of errors
  return err.message || 'An unexpected error occurred. Please try again.';
};


  // Handle continue button press (for both phone and email)
  // Update handleContinue and handleVerify to use the improved error handling
const handleContinue = useCallback(async (identifierInput: string) => {
  if (!isLoaded) return;
  setIsLoading(true);
  setError('');
  console.log('Attempting to sign in with identifier:', identifierInput);

  try {
    const { supportedFirstFactors } = await signIn.create({
      identifier: identifierInput,
    });

    const firstFactor = supportedFirstFactors.find(
      (factor: any) => factor.strategy === 'phone_code' || factor.strategy === 'email_code'
    );

    if (firstFactor) {
      await signIn.prepareFirstFactor({
        strategy: firstFactor.strategy,
        phoneNumberId: firstFactor.phoneNumberId,
        emailAddressId: firstFactor.emailAddressId,
      });
      setIdentifier(identifierInput);
      setStep('verification');
      console.log('Verification step prepared for:', identifierInput);
    } else {
      setError('No supported verification method found for this account.');
      console.log('No supported verification method found for:', identifierInput);
    }
  } catch (err: any) {
    console.error('Error in handleContinue:', err);
    setError(getErrorMessage(err));
  } finally {
    setIsLoading(false);
  }
}, [isLoaded, signIn]);

// Update handleVerify to use the improved error handling
const handleVerify = useCallback(async (code: string) => {
  if (!isLoaded || isLoading) return;
  setIsLoading(true);
  setError('');
  console.log('Attempting to verify code for:', identifier);

  try {
    const completeSignIn = await signIn.attemptFirstFactor({
      strategy: identifier.includes('@') ? 'email_code' : 'phone_code',
      code,
    });

    if (completeSignIn.status === 'complete') {
      await setActive({ session: completeSignIn.createdSessionId });
      console.log('Sign in successful, redirecting to home');
      router.replace('/');
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
}, [isLoaded, signIn, setActive, router, identifier, isLoading]);

  // Handle Apple Sign In
  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError('');
    console.log('Attempting Apple Sign In'); // Logging

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const signInAttempt = await signIn.create({
        strategy: 'oauth_apple',
        identifier: credential.identityToken,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        console.log('Apple Sign In successful, redirecting to home'); // Logging
        router.replace('/');
      }
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        setError('Apple sign-in was canceled.');
        console.log('Apple Sign In canceled'); // Logging
      } else {
        setError(getErrorMessage(e));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    console.log('Attempting Google Sign In'); // Logging

    try {
      const result = await promptAsync();
      if (result?.type === 'success') {
        const signInAttempt = await signIn.create({
          strategy: 'oauth_google',
          identifier: result.authentication.accessToken,
        });

        if (signInAttempt.status === 'complete') {
          await setActive({ session: signInAttempt.createdSessionId });
          console.log('Google Sign In successful, redirecting to home'); // Logging
          router.replace('/');
        }
      }
    } catch (err) {
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
    console.log('Switched to email sign-in'); // Logging
  };

  const switchToPhone = () => {
    setStep('phone');
    setError('');
    console.log('Switched to phone sign-in'); // Logging
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
                {/* Animated container for Phone and Email steps */}
                <AnimatedView 
                  isVisible={!isVerificationStep} 
                  position="relative"
                  height={500} // Increased height to accommodate content
                >
                  {/* Phone step */}
                  <AnimatedView isVisible={step === 'phone'} position="absolute" top={0} left={0} right={0}>
                    <PhoneStep 
                      onContinue={handleContinue} 
                      isLoading={isLoading} 
                      onSwitchToEmail={switchToEmail}
                      error={error}
                    />
                  </AnimatedView>
                  {/* Email step */}
                  <AnimatedView isVisible={step === 'email'} position="absolute" top={0} left={0} right={0}>
                    <EmailStep 
                      onContinue={handleContinue} 
                      isLoading={isLoading} 
                      onSwitchToPhone={switchToPhone}
                      error={error}
                    />
                  </AnimatedView>
                </AnimatedView>

                {/* Verification step */}
                <AnimatedView 
                  isVisible={isVerificationStep}
                  position="relative"
                  height={350} // Increased height for VerificationStep
                >
                  <VerificationStep 
                    identifier={identifier} 
                    onVerify={handleVerify}
                    isLoading={isLoading}
                    error={error}
                  />
                </AnimatedView>
                
                {/* Social sign-in buttons */}
                <AnimatedView isVisible={!isVerificationStep} width="100%">
                  <YStack space="$2" width="100%">
                    <AppleSignInButton 
                      onPress={handleAppleSignIn}
                      disabled={isLoading}
                    />
                    <GoogleSignInButton 
                      onPress={handleGoogleSignIn}
                      disabled={isLoading}
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