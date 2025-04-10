import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';
import HomeScreen from './screens/HomeScreen.js';
import FriendsScreen from './screens/FriendsScreen.js';
import ChatsScreen from './screens/ChatsScreen.js';
import ChatMessageScreen from './screens/ChatMessageScreen.js';

const StackNavigator = () => {
    const Stack = createNativeStackNavigator();
    return (
      <NavigationContainer>
        <Stack.Navigator>
          
          <Stack.Screen name="Login" component={LoginScreen}  options={{headerShown:false}}/>
          <Stack.Screen name="Register" component={RegisterScreen} options={{headerShown:false}} />
          <Stack.Screen name="Home" component={HomeScreen}  />
          <Stack.Screen name="Friends" component={FriendsScreen}  />
          <Stack.Screen name="Chats" component={ChatsScreen}  />
          <Stack.Screen name="Messages" component={ChatMessageScreen}  />

        </Stack.Navigator>
      </NavigationContainer>
    );
  };

export default StackNavigator

const styles = StyleSheet.create({})