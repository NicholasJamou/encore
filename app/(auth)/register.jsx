import {
  StyleSheet,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { React, useState } from "react";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";

const register = () => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleRegister = () => {
    const user = {
      name: name,
      email: email,
      password: password,
    };
    axios
      .post("http://192.168.0.32:3000/register", user)
      .then((response) => {
        console.log(response);
        Alert.alert(
          "Registration successful",
          "You have been registered Successfully"
        );
        setName("");
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        Alert.alert(
          "Registration Error",
          "An error occurred while registering"
        );
        console.log("registration failed", error);
      });
  };
 
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
      >
        <SafeAreaView style={{ height: 200, width: "100%" }}>
          <SafeAreaView
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 25,
            }}
          >
            
          </SafeAreaView>
          <Text
            style={{
              marginTop: 20,
              textAlign: "center",
              fontSize: 20,
            }}
          >
            Jivee
          </Text>
        </SafeAreaView>
  
        <KeyboardAvoidingView>
          <SafeAreaView style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "bold",
                marginTop: 25,
                color: "#0353a4",
              }}
            >
              Welcome to Jivee!
            </Text>
          </SafeAreaView>
  
          <SafeAreaView
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            
          </SafeAreaView>
  
          <SafeAreaView style={{ marginTop: 20 }}>
          <SafeAreaView
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "#FFFFFF",
              paddingVertical: 5,
              borderRadius: 5,
              marginTop: 30,
            }}
          >
            <Ionicons
              style={{ marginLeft: 8 }}
              name="person-sharp"
              size={24}
              color="black"
            />
            <TextInput
              value={name}
              onChangeText={(text) => setName(text)}
              placeholder="Enter your name"
              placeholderTextColor={"black"}
              style={{
                color: "black",
                marginVertical: 10,
                width: 300,
                fontSize: name ? 17 : 17,
              }}
            />
          </SafeAreaView>
            <SafeAreaView
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "#FFFFFF",
                paddingVertical: 5,
                borderRadius: 5,
                marginTop: 30,
              }}
            >
              <MaterialIcons
                style={{ marginLeft: 8 }}
                name="email"
                size={24}
                color="black"
              />
              <TextInput
                value={email}
                onChangeText={(text) => setEmail(text)}
                placeholder="Enter your email"
                placeholderTextColor={"black"}
                style={{
                  color: "black",
                  marginVertical: 10,
                  width: 300,
                  fontSize: password ? 17 : 17,
                }}
              />
            </SafeAreaView>
            
  
            <SafeAreaView style={{}}>
              <SafeAreaView
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: "#FFFFFF",
                  paddingVertical: 5,
                  borderRadius: 5,
                  marginTop: 30,
                }}
              >
                <AntDesign
                  style={{ marginLeft: 8 }}
                  name="lock1"
                  size={24}
                  color="black"
                />
                <TextInput
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  secureTextEntry={true}
                  placeholder="Enter your password"
                  style={{
                    color: "black",
                    marginVertical: 10,
                    width: 300,
                    fontSize: password ? 17 : 17,
                  }}
                  placeholderTextColor="black"
                />
              </SafeAreaView>
            </SafeAreaView>
  
            <SafeAreaView style={{ marginTop: 50 }} />
  
            <Pressable
              onPress={handleRegister}
              style={{
                width: 200,
                backgroundColor: "#000000",
                borderRadius: 6,
                marginLeft: "auto",
                marginRight: "auto",
                padding: 15,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Register
              </Text>
            </Pressable>
  
            <Pressable
              onPress={() => router.replace("/login")}
              style={{ marginTop: 12 }}
            >
              <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
                Already have an account? Sign In
              </Text>
            </Pressable>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  )
}

export default register

const styles = StyleSheet.create({})