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
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { MaterialIcons, Ionicons, AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../lib/supabase';
import axios from 'axios';

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const isAtLeast18 = (birthDate: Date): boolean => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const formatPhoneNumber = (number: string): string => {
    // Remove all non-digit characters
    const digits = number.replace(/\D/g, '');
    
    // Remove the leading '0' if present
    const nationalNumber = digits.startsWith('0') ? digits.slice(1) : digits;
    
    // Ensure the phone number always includes the country code
    return `+61${nationalNumber}`;
  };

  const onSignUpPress = async () => {
    // if (!isAtLeast18(dateOfBirth)) {
    //   Alert.alert("Age Restriction", "You must be at least 18 years old to register.");
    //   return;
    // }

    try {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      console.log("Attempting to sign up with phone number:", formattedPhoneNumber);

      const { data, error } = await supabase.auth.signUp({
        phone: formattedPhoneNumber,
        password,
        options: {
          data: {
            email,
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth.toISOString().split('T')[0],
          }
        }
      });

      if (error) throw error;

      if (data) {
        console.log("Sign-up initiated, phone verification required");
        setIsVerifying(true);
      }
    } catch (err: any) {
      console.error("Error signing up:", err.message);
      Alert.alert("Sign-Up Error", err.message || "An error occurred while setting up your account. Please try again.");
    }
  };

  const onVerifyPress = async () => {
    try {
      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhoneNumber,
        token: verificationCode,
        type: 'sms'
      });

      if (error) throw error;

      if (data.user) {
        try {
          const userData = {
            supabaseId: data.user.id,
            email,
            phoneNumber,
            firstName,
            lastName,
            dateOfBirth: dateOfBirth.toISOString().split('T')[0],
          };

          const response = await axios.post("http://192.168.0.32:3000/register", userData);
          
          console.log("MongoDB successfully registered user");
          Alert.alert("Sign-Up Successful", "Your account has been created and verified successfully!");
          router.push(`/(tabs)/profile`);
        } catch (error) {
          console.error("Error registering user in MongoDB:", error);
          if (axios.isAxiosError(error)) {
            console.error("Axios error details:", error.response?.data || error.message);
          }
          Alert.alert("Registration Error", "Failed to register user in the database. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Verification error:", err.message);
      Alert.alert("Verification Error", err.message || "An error occurred during verification. Please try again.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, width: '100%' }}
        >
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {!isVerifying ? (
              <View style={styles.form}>
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
            onChangeText={(text) => {
              // Remove any non-digit characters
              const cleaned = text.replace(/\D/g, '');
              setPhoneNumber(cleaned);
            }}
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
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={styles.title}>Verify Your Phone</Text>
                <Text style={styles.verificationText}>
                  Enter the verification code sent to your phone
                </Text>
                <View style={styles.inputContainer}>
                  <AntDesign name="Safety" size={24} color="black" style={styles.icon} />
                  <TextInput
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="Enter verification code"
                    keyboardType="number-pad"
                    style={styles.input}
                  />
                </View>
                <Pressable onPress={onVerifyPress} style={styles.button}>
                  <Text style={styles.buttonText}>Verify</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
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
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
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