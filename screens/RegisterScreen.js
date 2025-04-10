import {
    StyleSheet,
    Text,
    View,
    TextInput,
    KeyboardAvoidingView,
    Pressable,
    Alert,
    Image,
  } from "react-native";
  import React, { useState } from "react";
  import { useNavigation } from "@react-navigation/native";
  import axios from "axios";
  import * as ImagePicker from "expo-image-picker";
  
  const RegisterScreen = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState(null); // Will store image URI
    const navigation = useNavigation();
  
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
  
      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    };
  
    const handleRegister = async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
  
      if (image) {
        formData.append("image", {
          uri: image.uri,
          type: "image/jpeg",
          name: "profile.jpg",
        });
      }
  
      try {
        const response = await axios.post("http://192.168.1.180:8000/register", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        Alert.alert("Registration successful", "You have been registered successfully");
        setName("");
        setEmail("");
        setPassword("");
        setImage(null);
      } catch (error) {
        Alert.alert("Registration Error", "An error occurred while registering");
        console.error("Registration failed", error);
      }
    };
  
    return (
      <View style={styles.container}>
        <KeyboardAvoidingView>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitle}>Register to your Account</Text>
          </View>
  
          <View style={{ marginTop: 50 }}>
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="gray"
              />
            </View>
  
            <View>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="gray"
              />
            </View>
  
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="gray"
              />
            </View>
  
            <Pressable onPress={pickImage} style={styles.imagePicker}>
              <Text style={{ color: "white", fontWeight: "bold" }}>Pick Image</Text>
            </Pressable>
  
            {image && (
              <Image
                source={{ uri: image.uri }}
                style={{ width: 100, height: 100, marginTop: 10, borderRadius: 10 }}
              />
            )}
  
            <Pressable onPress={handleRegister} style={styles.registerButton}>
              <Text style={styles.registerText}>Register</Text>
            </Pressable>
  
            <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 15 }}>
              <Text style={styles.signinLink}>Already have an account? Sign in</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  };
  
  export default RegisterScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "white",
      padding: 10,
      alignItems: "center",
    },
    headerContainer: {
      marginTop: 100,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      color: "#4A55A2",
      fontSize: 17,
      fontWeight: "600",
    },
    subtitle: {
      fontSize: 17,
      fontWeight: "600",
      marginTop: 15,
    },
    label: {
      fontSize: 18,
      fontWeight: "600",
      color: "gray",
    },
    input: {
      fontSize: 18,
      borderBottomColor: "gray",
      borderBottomWidth: 1,
      marginVertical: 10,
      width: 300,
    },
    imagePicker: {
      marginTop: 20,
      backgroundColor: "#4A55A2",
      padding: 10,
      borderRadius: 6,
      alignItems: "center",
    },
    registerButton: {
      width: 200,
      backgroundColor: "#4A55A2",
      padding: 15,
      marginTop: 40,
      alignSelf: "center",
      borderRadius: 6,
    },
    registerText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
    signinLink: {
      textAlign: "center",
      color: "gray",
      fontSize: 16,
    },
  });
  