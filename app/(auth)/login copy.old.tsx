// import {
//   StyleSheet,
//   Text,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   TextInput,
//   Pressable,
//   Alert,
// } from "react-native";
// import { React, useState } from "react";
// import { MaterialIcons } from "@expo/vector-icons";
// import { AntDesign } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import * as SecureStore from 'expo-secure-store';
// import axios from "axios";

// const login = () => {

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const router = useRouter();
//   const handleLogin = async () => {
//     const user = {
//       email: email,
//       password: password,
//     };

//     try {
//       const response = await axios.post("http://192.168.0.32:3000/login", user);
      
//       console.log('Login response:', response.data);
  
//       if (response.data && response.data.token) {
//         // Ensure the token is a string
//         const token = String(response.data.token);
        
//         await SecureStore.setItemAsync('token', token);
        
//         Alert.alert("Login successful");
        
//         // You might want to navigate to another screen here
//         // navigation.navigate('Home');
//       } else {
//         throw new Error('No token received from server');
//       }
//     } catch (error) {
//       console.error("Login error:", error);
      
//       let errorMessage = "An error occurred while logging in";
//       if (error.response) {
//         // The request was made and the server responded with a status code
//         // that falls out of the range of 2xx
//         errorMessage = error.response.data.message || errorMessage;
//       } else if (error.request) {
//         // The request was made but no response was received
//         errorMessage = "No response received from server";
//       } else {
//         // Something happened in setting up the request that triggered an Error
//         errorMessage = error.message;
//       }
  
//       Alert.alert("Login Error", errorMessage);
//     }
//   };

//   return (
//     <SafeAreaView
//       style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
//     >
//       <SafeAreaView style={{ height: 200, width: "100%" }}>
//         <SafeAreaView
//           style={{
//             justifyContent: "center",
//             alignItems: "center",
//             marginTop: 25,
//           }}
//         >
          
//         </SafeAreaView>
//         <Text
//           style={{
//             marginTop: 20,
//             textAlign: "center",
//             fontSize: 20,
//           }}
//         >
//           Jivee
//         </Text>
//       </SafeAreaView>

//       <KeyboardAvoidingView>
//         <SafeAreaView style={{ alignItems: "center" }}>
//           <Text
//             style={{
//               fontSize: 17,
//               fontWeight: "bold",
//               marginTop: 25,
//               color: "#0353a4",
//             }}
//           >
//             Log in to your Account
//           </Text>
//         </SafeAreaView>

//         <SafeAreaView
//           style={{
//             justifyContent: "center",
//             alignItems: "center",
//             marginTop: 20,
//           }}
//         >
          
//         </SafeAreaView>

//         <SafeAreaView style={{ marginTop: 20 }}>
//           <SafeAreaView
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               gap: 5,
//               backgroundColor: "#FFFFFF",
//               paddingVertical: 5,
//               borderRadius: 5,
//               marginTop: 30,
//             }}
//           >
//             <MaterialIcons
//               style={{ marginLeft: 8 }}
//               name="email"
//               size={24}
//               color="black"
//             />
//             <TextInput
//               value={email}
//               onChangeText={(text) => setEmail(text)}
//               placeholder="Enter your email"
//               placeholderTextColor={"black"}
//               style={{
//                 color: "black",
//                 marginVertical: 10,
//                 width: 300,
//                 fontSize: password ? 17 : 17,
//               }}
//             />
//           </SafeAreaView>

//           <SafeAreaView style={{}}>
//             <SafeAreaView
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 gap: 5,
//                 backgroundColor: "#FFFFFF",
//                 paddingVertical: 5,
//                 borderRadius: 5,
//                 marginTop: 30,
//               }}
//             >
//               <AntDesign
//                 style={{ marginLeft: 8 }}
//                 name="lock1"
//                 size={24}
//                 color="black"
//               />
//               <TextInput
//                 value={password}
//                 onChangeText={(text) => setPassword(text)}
//                 secureTextEntry={true}
//                 placeholder="Enter your password"
//                 style={{
//                   color: "black",
//                   marginVertical: 10,
//                   width: 300,
//                   fontSize: password ? 17 : 17,
//                 }}
//                 placeholderTextColor="black"
//               />
//             </SafeAreaView>
//           </SafeAreaView>

//           <SafeAreaView
//             style={{
//               marginTop: 12,
//               flexDirection: "row",
//               alignItems: "center",
//               justifyContent: "space-between",
//             }}
//           >
//             <Text>Keep me logged in</Text>

//             <Text style={{ color: "#007FFF", fontWeight: "500" }}>
//               Forgot Password
//             </Text>
//           </SafeAreaView>

//           <SafeAreaView style={{ marginTop: 50 }} />

//           <Pressable
//             onPress={handleLogin}
//             style={{
//               width: 200,
//               backgroundColor: "#000000",
//               borderRadius: 6,
//               marginLeft: "auto",
//               marginRight: "auto",
//               padding: 15,
//             }}
//           >
//             <Text
//               style={{
//                 textAlign: "center",
//                 color: "white",
//                 fontSize: 16,
//                 fontWeight: "bold",
//               }}
//             >
//               Login
//             </Text>
//           </Pressable>

//           <Pressable
//             onPress={() => router.replace("/register")}
//             style={{ marginTop: 12 }}
//           >
//             <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
//               Don't have an account? Sign Up
//             </Text>
//           </Pressable>
//         </SafeAreaView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default login;

// const styles = StyleSheet.create({});
