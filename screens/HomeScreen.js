import { StyleSheet, Text, View } from "react-native";
import React, { useLayoutEffect, useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import User from "../components/User";
const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>AlumNITD Chat</Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons  onPress={() => navigation.navigate("Chats")} name="chatbox-ellipses-outline" size={24} color="black" />
          <MaterialIcons 
            onPress={() => navigation.navigate("Friends")}
            name="people-outline"
            size={24}
            color="black"
          />
        </View>
      ),
    });
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem("authToken");
  
      if (!token) {
        console.error("No token found in AsyncStorage!");
        return;
      }
  
      console.log("Raw Token:", token);
  
      try {
        const decodedToken = jwtDecode(token); // Use jwt_decode properly
        console.log("Decoded Token:", decodedToken);
  
        const userId = decodedToken?.userId;
        if (!userId) {
          console.error("Invalid token structure:", decodedToken);
          return;
        }
  
        setUserId(userId);
  
        axios
          .get(`http://192.168.1.180:8000/users/${userId}`)
          .then((response) => {
            setUsers(response.data);
          })
          .catch((error) => {
            console.log("Error retrieving users:", error);
          });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };
  
    fetchUsers();
  }, []);
  

  console.log("users", users);
  return (
    <View>
      <View style={{ padding: 10 }}>
        {users.map((item, index) => (
          <User key={index} item={item} />
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});