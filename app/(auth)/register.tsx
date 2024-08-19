import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
  View,
} from "react-native";
import { MaterialIcons, Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter, Router } from "expo-router";

type RouterInterface = Pick<Router, 'replace'>;

interface VerificationResult {
  status: string;
  verifications: {
    phoneNumber: { status: string | null };
  };
}

interface SignUpResource {
  create: (params: { emailAddress: string; password: string; phoneNumber: string }) => Promise<any>;
  prepareEmailAddressVerification: (params: { strategy: string }) => Promise<any>;
  attemptEmailAddressVerification: (params: { code: string }) => Promise<any>;
  preparePhoneNumberVerification: (params: { strategy: string }) => Promise<any>;
  attemptPhoneNumberVerification: (params: { code: string }) => Promise<any>;
}

interface SignUpHookResult {
  isLoaded: boolean;
  signUp: SignUpResource;
}

const Register: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [pendingVerification, setPendingVerification] = useState<boolean>(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');
  const [code, setCode] = useState<string>("");

  const router = useRouter() as RouterInterface;
  const { signUp, isLoaded } = useSignUp() as SignUpHookResult;

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: email,
        password,
        phoneNumber,
      });
    
      // Prepare phone verification
      await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });

      console.log("Sign-up initialized, phone verification prepared");
      setPendingVerification(true);
    } catch (err: any) {
      console.error("Error initializing sign-up:", JSON.stringify(err, null, 2));
      Alert.alert("Sign-Up Error", err.errors?.[0]?.message || "An error occurred while setting up your account. Please try again.");
    }
  };
  const onPressVerify = async () => {
    if (!isLoaded || !signUp) {
      console.log("SignUp is not loaded");
      return;
    }
  
    try {
      console.log(`Verifying phone with code: ${code}`);
      const verificationResult = await signUp.attemptPhoneNumberVerification({ code: code });
  
      console.log(`Verification result:`, verificationResult);
  
      if (verificationResult.status === 'complete' || verificationResult.verifications.phoneNumber.status === 'verified') {
        console.log("Phone verification successful, completing sign-up");
        
        try {
          // Complete the sign-up process
          const completeSignUp = await signUp.create({
            phoneNumber,
            password,
            emailAddress: email // optional
          });
  
          console.log("Sign-up completed:", completeSignUp);
  
          if (completeSignUp.status === 'complete') {
            console.log("User successfully created");
            Alert.alert("Sign-Up Successful", "Your account has been created successfully!");
            router.replace('/profile');
          } else {
            console.log("Unexpected status after sign-up completion:", completeSignUp.status);
            Alert.alert("Sign-Up Issue", "Your account was created but there might be additional steps required. Please check your email or contact support.");
          }
        } catch (createError: any) {
          console.error("Error completing sign-up:", JSON.stringify(createError, null, 2));
          Alert.alert("Sign-Up Error", createError.errors?.[0]?.message || "An error occurred while creating your account. Please try again.");
        }
      } else {
        console.log("Verification incomplete");
        Alert.alert("Verification Incomplete", "Please try verifying your phone number again.");
      }
    } catch (err: any) {
      console.error("Verification error:", JSON.stringify(err, null, 2));
      Alert.alert("Verification Error", err.errors?.[0]?.message || "An unknown error occurred during verification.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!pendingVerification ? (
        <KeyboardAvoidingView behavior="padding" style={styles.form}>
          <Text style={styles.title}>Register for Jivee</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={24} color="black" style={styles.icon} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={24} color="black" style={styles.icon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="phone" size={24} color="black" style={styles.icon} />
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <AntDesign name="lock1" size={24} color="black" style={styles.icon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              style={styles.input}
            />
          </View>

          <Pressable onPress={onSignUpPress} style={styles.button}>
            <Text style={styles.buttonText}>Register</Text>
          </Pressable>

          <Pressable onPress={() => router.replace("/login")} style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Already have an account? Sign In</Text>
          </Pressable>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.verificationContainer}>
          <Text style={styles.verificationText}>
            Enter the verification code sent to your {verificationMethod === 'email' ? 'email' : 'phone'}
          </Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Verification Code"
            keyboardType="number-pad"
            style={styles.verificationInput}
          />
          <Pressable onPress={onPressVerify} style={styles.button}>
            <Text style={styles.buttonText}>Verify</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    width: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#000000",
    borderRadius: 6,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 15,
  },
  linkButtonText: {
    color: "gray",
    fontSize: 16,
    textAlign: 'center',
  },
  verificationContainer: {
    width: '80%',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  verificationInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    fontSize: 16,
    marginBottom: 20,
  },
});

export default Register;