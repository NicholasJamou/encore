import React, { useState, useCallback } from 'react';
import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { View } from 'react-native';
import { TamaguiProvider, Theme, Input, Button, Text, YStack, XStack, Spinner } from 'tamagui';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import { AntDesign } from '@expo/vector-icons';
import { HelloWave } from '@/components/HelloWave';

// Error message component
const ErrorMessage = ({ message }) => (
  <Text color="$red10" fontSize="$3" textAlign="center" marginTop="$2">
    {message}
  </Text>
);

// Custom Apple Sign In Button
const AppleSignInButton = ({ onPress, disabled }) => (
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

const PhoneStep = ({ onContinue, isLoading, onSwitchToEmail, error }) => {
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

const EmailStep = ({ onContinue, isLoading, onSwitchToPhone, error }) => {
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

const VerificationStep = ({ identifier, onVerify, isLoading, error }) => {
  const [code, setCode] = useState('');

  return (
    <YStack space="$4" width="100%">
      <Text fontSize="$6" fontWeight="bold">Enter Verification Code</Text>
      <Text fontSize="$4" color="$gray10">Sent to: {identifier}</Text>
      <Input
        value={code}
        placeholder="Verification Code..."
        onChangeText={setCode}
        width="100%"
        keyboardType="number-pad"
      />
      {error && <ErrorMessage message={error} />}
      <Button
        onPress={() => onVerify(code)}
        width="100%"
        themeInverse
        disabled={isLoading}
        pressStyle={{ scale: 0.97 }}
      >
        {isLoading ? <Spinner color="$teal10" /> : "Verify and Sign In"}
      </Button>
    </YStack>
  );
};

export default function LoginPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState('phone');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Setup Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  });

  const getErrorMessage = (err) => {
    switch (err.code) {
      case 'form_identifier_not_found':
        return 'No account found with this email or phone number. Please check and try again.';
      case 'form_param_format_invalid':
        return 'The email or phone number format is invalid. Please enter a valid email or phone number.';
      case 'form_password_incorrect':
        return 'Incorrect password. Please try again.';
      case 'form_identifier_exists':
        return 'An account with this email or phone number already exists.';
      case 'form_code_incorrect':
        return 'The verification code is incorrect. Please try again.';
      case 'form_code_expired':
        return 'The verification code has expired. Please request a new one.';
      case 'rate_limit_exceeded':
        return 'Too many attempts. Please try again later.';
      default:
        return err.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const handleContinue = useCallback(async (identifierInput) => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      const { supportedFirstFactors } = await signIn.create({
        identifier: identifierInput,
      });

      const firstFactor = supportedFirstFactors.find(
        (factor) => factor.strategy === 'phone_code' || factor.strategy === 'email_code'
      );

      if (firstFactor) {
        await signIn.prepareFirstFactor({
          strategy: firstFactor.strategy,
          phoneNumberId: firstFactor.phoneNumberId,
          emailAddressId: firstFactor.emailAddressId,
        });
        setIdentifier(identifierInput);
        setStep('verification');
      } else {
        setError('No supported verification method found for this account.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn]);

  const handleVerify = useCallback(async (code) => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: identifier.includes('@') ? 'email_code' : 'phone_code',
        code,
      });

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        router.replace('/');
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error("Error verifying code:", JSON.stringify(err, null, 2));
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, setActive, router, identifier]);

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError('');
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
        router.replace('/');
      }
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        setError('Apple sign-in was canceled.');
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
    try {
      const result = await promptAsync();
      if (result?.type === 'success') {
        const signInAttempt = await signIn.create({
          strategy: 'oauth_google',
          identifier: result.authentication.accessToken,
        });

        if (signInAttempt.status === 'complete') {
          await setActive({ session: signInAttempt.createdSessionId });
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

  // Custom Apple Sign In Button
const AppleSignInButton = ({ onPress, disabled }) => (
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
const GoogleSignInButton = ({ onPress, disabled }) => (
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

  return (
    <TamaguiProvider>
      <Theme name="light">
        <YStack f={1} jc="flex-start" ai="center" space="$6" p="$4" pt="$8" bg="$blue1">
          <YStack space="$6" width="100%" maxWidth={400}>
            {step === 'phone' && (
              <PhoneStep 
                onContinue={handleContinue} 
                isLoading={isLoading} 
                onSwitchToEmail={() => {setStep('email'); setError('');}}
                error={error}
              />
            )}
            {step === 'email' && (
              <EmailStep 
                onContinue={handleContinue} 
                isLoading={isLoading} 
                onSwitchToPhone={() => {setStep('phone'); setError('');}}
                error={error}
              />
            )}
            {step === 'verification' && (
              <VerificationStep 
                identifier={identifier} 
                onVerify={handleVerify}
                isLoading={isLoading}
                error={error}
              />
            )}
            
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
          </YStack>
        </YStack>
      </Theme>
    </TamaguiProvider>
  );
}