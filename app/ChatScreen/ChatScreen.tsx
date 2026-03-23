import { Colors, FontSize } from '@/constants/theme';
import React, { useState } from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';

type ChatPropType = {
    id: string;
    profilePicture: ImageSourcePropType;
    fullName: string;
    message: string;
    timeSend: string;
    online: boolean;
    read: boolean;
}

const ChatListData: ChatPropType[] = [

    {
        id: "1",
        profilePicture: require("../../assets/images/Chat/user.png"),
        fullName: "Alex Rivera",
        message: "Is the calculus textbook still available",
        timeSend: "Just now",
        online: true,
        read: false,
    },
        {
        id: "2",
        profilePicture: require("../../assets/images/Chat/user.png"),
        fullName: "Sarah Chen",
        message: "i can meet at the campus library by 2pm",
        timeSend: "10:45 AM",
        online: false,
        read: true,
    },
        {
        id: "3",
        profilePicture: require("../../assets/images/Chat/user.png"),
        fullName: "Jordan Smith",
        message: "Would you take N5,000 for the book",
        timeSend: "Yesterday",
        online: true,
        read: false,
    },
        {
        id: "4",
        profilePicture: require("../../assets/images/Chat/user.png"),
        fullName: "Alex Rivera",
        message: "Is the calculus textbook still available",
        timeSend: "Just now",
        online: true,
        read: true,
    },
        {
        id: "5",
        profilePicture: require("../../assets/images/Chat/user.png"),
        fullName: "Sarah Chen",
        message: "i can meet at the campus library by 2pm",
        timeSend: "10:45 AM",
        online: false,
        read: true,
    },
        {
        id: "6",
        profilePicture: require("../../assets/images/Chat/user.png"),
        fullName: "Jordan Smith",
        message: "Would you take N5,000 for the book",
        timeSend: "Yesterday",
        online: true,
        read: true,
    },

            {
        id: "7",
        profilePicture: require("../../assets/images/Chat/user.png"),
        fullName: "Alex Rivera",
        message: "Is the calculus textbook still available",
        timeSend: "Just now",
        online: true,
        read: true,
    },
        {
        id: "8",
        profilePicture: require("../../assets/images/Chat/user.png"),
        fullName: "Sarah Chen",
        message: "i can meet at the campus library by 2pm",
        timeSend: "10:45 AM",
        online: false,
        read: true,
    },
        {
        id: "9",
        profilePicture: require("../../assets/images/Chat/user.png"),
        fullName: "Jordan Smith",
        message: "Would you take N5,000 for the book",
        timeSend: "Yesterday",
        online: true,
        read: true,
    } 
]

const ChatScreen = () => {

const scheme = useColorScheme();
const themeSize = FontSize.size;
const theme = scheme === "dark" ? Colors.dark : Colors.light

const [activeChat, setActiveChat] = useState<string>("")
  return (
    <View style={{flex: 1, backgroundColor: theme.background, width: "100%"}}>
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderColor: "#aeaeaea1",
                borderBottomWidth: 1,
                paddingBottom: 15,
                width: "100%", padding: 10
                }}
            >
            <Pressable style={{ width: 20 }}>
                <Image
                    source={require("../../assets/images/Chat/menu.png")}
                    style={{ tintColor: theme.text }}
                />
            </Pressable>

            <Text
                style={{
                    textAlign: "center",
                    alignSelf: "center",
                    flex: 1,
                    color: theme.text,
                    fontSize: themeSize.md,
                    fontWeight: "700",
                }}
            >
            Messages
            </Text>

            <Pressable style={{width: 20, alignSelf: "flex-end", alignItems: "center"}}>
                <Image
                    source={require("../../assets/images/Chat/mini-menu.png")}
                    style={{ tintColor: theme.text }}
                />
            </Pressable>
        </View>

        <View  style={{backgroundColor: theme.screenBackground, padding: 10}}>

        {/** Search Section */}
        <View style={[style.search, {backgroundColor: scheme === "dark" ? "#1E293B" : "#f2f2f26e", borderColor: theme.borderColor}]}>
        <Pressable>
            <Image source={require("../../assets/images/HomeScreen/search.png")}/>
        </Pressable>
        <TextInput 
            placeholder='Search for message'
            placeholderTextColor={scheme === "dark" ? "#ffffff92" : "#0000008b"}
            style={{flex: 1}}
        />
        </View>

        {/** Chat List */}
        <ScrollView
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{gap: 10}}
        >

            { ChatListData.map((list) => {
                
                return (
                    <Pressable
                        key={list.id}
                        onPress={() => setActiveChat(list.id)}
                        style={{
                            width: "100%", flexDirection: "row", gap: 10, justifyContent: "center",
                            backgroundColor: activeChat === list.id ? theme.sectionBackground : "",
                            paddingTop: 10, paddingBottom: 10
                            }}>
                        <Pressable style={{width: 56, height: 56, borderRadius: 50}}>
                            <Image source={list.profilePicture} />
                        </Pressable>
                        <View style={{flex: 1, gap: 10, justifyContent: "center"}}>
                            <View style={{flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{color: theme.text, fontSize: themeSize.md, fontWeight: "700"}}>{list.fullName}</Text>
                                <Text style={{color: list.read ? theme.readColor : theme.subText}}>{list.timeSend}</Text>
                            </View>
                            <Text numberOfLines={1} ellipsizeMode='tail' style={{width: 230, color: list.read ? theme.readColor : theme.text, fontWeight: "bold"}}>{list.message}</Text>
                        </View>

                        {/** UnRead Message */}
                        {!list.read && (
                            <View style={{width: 12, height: 12, backgroundColor: theme.subText, borderRadius: 50, alignSelf: "center"}}>

                            </View>
                        )}
                    </Pressable>

            )})}


        </ScrollView>
        </View>

        
    </View>
  )
}

export default ChatScreen;

const style = StyleSheet.create({

    search : {
        width: "100%",
        padding: 15,
        borderRadius: 20,
        flexDirection: "row",
        gap: 15,
        alignItems: "center",
        borderWidth: 1,
        
    }
})