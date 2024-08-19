import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
  View,
  Platform,
} from "react-native";
import { MaterialIcons, Ionicons, AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { useSignUp } from '@clerk/clerk-expo';
import { router } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';

interface VerificationResult {
  status: string;
  verifications: {
    phoneNumber: { status: string | null };
  };
}

interface SignUpResource {
  create: (params: { 
    emailAddress: string; 
    password: string; 
    phoneNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }) => Promise<any>;
  preparePhoneNumberVerification: (params: { strategy: string }) => Promise<any>;
  attemptPhoneNumberVerification: (params: { code: string }) => Promise<any>;
}

interface SignUpHookResult {
  isLoaded: boolean;
  signUp: SignUpResource;
}

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [pendingVerification, setPendingVerification] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");

  const { signUp, isLoaded } = useSignUp() as SignUpHookResult;

  const isAtLeast18 = (birthDate: Date): boolean => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // if (!isAtLeast18(dateOfBirth)) {
    //   Alert.alert("Age Restriction", "You must be at least 18 years old to register.");
    //   return;
    // }

    try {
      await signUp.create({
        emailAddress: email,
        password,
        phoneNumber,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0], // Format as YYYY-MM-DD
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
      // router.push(`/(tabs)/profile`)
      console.log(`Verifying phone with code: ${code}`);
      const verificationResult = await signUp.attemptPhoneNumberVerification({ code });
  
      console.log(`Verification result:`, verificationResult);
  
      if (verificationResult.status === 'complete' || verificationResult.verifications.phoneNumber.status === 'verified') {
        console.log("Phone verification successful, completing sign-up");
        Alert.alert("Sign-Up Successful", "Your account has been created successfully!");
        router.push(`/(tabs)/profile`)
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
    <View style={styles.container}>
      {!pendingVerification ? (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.form}>
          <Text style={styles.title}>Register for Jivee</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={24} color="black" style={styles.icon} />
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={24} color="black" style={styles.icon} />
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
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

          <Pressable onPress={() => setShowDatePicker(true)} style={styles.inputContainer}>
            <FontAwesome name="calendar" size={24} color="black" style={styles.icon} />
            <Text style={styles.input}>
              {dateOfBirth.toDateString()}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || dateOfBirth;
                setShowDatePicker(Platform.OS === 'ios');
                setDateOfBirth(currentDate);
              }}
            />
          )}

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
            Enter the verification code sent to your phone
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
    </View>
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