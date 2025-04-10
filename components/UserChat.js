import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { UserType } from '../UserContext';

const UserChat = ({ item }) => {
  const navigation = useNavigation();
  const { userId } = useContext(UserType);
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://192.168.1.180:8000/messages/${userId}/${item._id}`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data);
      } else {
        console.log("Error showing messages", response.status.message);
      }
    } catch (error) {
      console.log("Error fetching messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000); // Optional: re-fetch every 5 seconds

    return () => clearInterval(interval);
  }, [userId, item._id]); // re-fetch if userId or item changes

  const lastMessage = [...messages]
    .filter((message) => message.messageType === "text")
    .pop(); // gets the last text message

  const formatTime = (time) => {
    const date = new Date(time);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const options = { hour: "2-digit", minute: "2-digit" };

    if (isToday) {
      return `Today at ${date.toLocaleTimeString("en-US", options)}`;
    } else {
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString("en-US", options)}`;
    }
  };

  return (
    <Pressable
      onPress={() => navigation.navigate("Messages", { recepientId: item._id })}
      style={styles.container}
    >
      <Image style={styles.avatar} source={{ uri: item?.image }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item?.name}</Text>
        {lastMessage && (
          <Text style={styles.message}>{lastMessage?.message}</Text>
        )}
      </View>
      <View>
        {lastMessage && (
          <Text style={styles.timestamp}>
            {formatTime(lastMessage?.timeStamp)}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

export default UserChat;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 0.7,
    borderColor: "#D0D0D0",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    padding: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "cover",
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
  },
  message: {
    marginTop: 3,
    color: "gray",
    fontWeight: "500",
  },
  timestamp: {
    fontSize: 11,
    fontWeight: "400",
    color: "#585858",
  },
});
