import { Colors, FontSize } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';

const NotificationScreen = () => {
    const scheme = useColorScheme();
    const themeSize = FontSize.size;
    const theme = scheme === "dark" ? Colors.dark : Colors.light

    const onBack = () => {
        router.back();
    }
  return (
<View style={{flex: 1, backgroundColor: theme.background}}>
    <View
        style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderColor: "#aeaeaea1",
            borderBottomWidth: 1,
            paddingBottom: 15,
            width: "100%", padding: 10,
            gap: 15
            }}
        >
        <Pressable onPress={onBack} style={{ width: 20 }}>
            <Image
                source={require("../../assets/images/ProductDetail/back.png")}
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
            Notifications
        </Text>


        {/** Mini Menu*/}
        <Pressable style={{width: 30, alignSelf: "flex-end", alignItems: "center"}}>
            <Image
                source={require("../../assets/images/Chat/mini-menu.png")}
                style={{ tintColor: theme.text }}
            />
        </Pressable>
     </View>    

     <View style={{padding: 10,marginTop: 20, backgroundColor: theme.background, flex : 1, flexDirection: "column"}}>
        
        <ScrollView>

            <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                <Text style={{color: theme.text, fontWeight: "700", fontSize: themeSize.lg}}>RECENT UPDATES</Text>
                <Text style={{color: theme.subText, fontSize: themeSize.md, fontWeight: "400"}}>Mark all as read</Text>
            </View>
        

            {/**Notification 1 */}
            <View style={{flexDirection: "row", gap: 10, justifyContent: "space-between", backgroundColor: theme.sectionBackground, padding: 15, borderWidth: 1, borderColor: theme.borderColor, borderRadius: 20, marginTop: 15}}>
                <View style={{backgroundColor: theme.iconBackground, width: 48, height: 48, borderRadius: 15, justifyContent: "center", alignItems: "center"}}>
                    <Image source={require("../../assets/images/Notification/chat.png")} />
                </View>
                <View style={{flex: 1, gap: 5}}>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                        <Text style={{color: theme.text, fontSize: themeSize.md, fontWeight: "500"}}>New message from Sarah</Text>
                        <Text style={{color: theme.readColor}}>2m ago</Text>
                    </View>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{color: theme.text}}>"Is te vintage lamp stil available</Text>
                </View>
            </View>

             {/**Notification 1 */}
            <View style={{flexDirection: "row", gap: 10, justifyContent: "space-between", backgroundColor: theme.sectionBackground, padding: 15, borderWidth: 1, borderColor: theme.borderColor, borderRadius: 20, marginTop: 15}}>
                <View style={{backgroundColor: theme.iconBackground, width: 48, height: 48, borderRadius: 15, justifyContent: "center", alignItems: "center"}}>
                    <Image source={require("../../assets/images/Notification/item.png")} />
                </View>
                <View style={{flex: 1, gap: 5}}>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                        <Text style={{color: theme.text, fontSize: themeSize.md, fontWeight: "500"}}>Price drop on saved item</Text>
                        <Text style={{color: theme.readColor}}>1h ago</Text>
                    </View>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{color: theme.text}}>The Mid-century chair is now 15% off</Text>
                </View>
            </View>

                        {/**Notification 1 */}
            <View style={{flexDirection: "row", gap: 10, justifyContent: "space-between", backgroundColor: theme.sectionBackground, padding: 15, borderWidth: 1, borderColor: theme.borderColor, borderRadius: 20, marginTop: 15}}>
                <View style={{backgroundColor: theme.iconBackground, width: 48, height: 48, borderRadius: 15, justifyContent: "center", alignItems: "center"}}>
                    <Image source={require("../../assets/images/Notification/live.png")} />
                </View>
                <View style={{flex: 1, gap: 5}}>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                        <Text style={{color: theme.text, fontSize: themeSize.md, fontWeight: "500"}}>Your listing is live</Text>
                        <Text style={{color: theme.readColor}}>2m ago</Text>
                    </View>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{color: theme.text}}>"Is te vintage lamp stil available</Text>
                </View>
            </View>

             <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                <Text style={{color: theme.readColor, fontWeight: "700", fontSize: themeSize.lg, marginTop: 20}}>YESTERDAY</Text>
            </View>
        

            {/**Notification 1 */}
            <View style={{flexDirection: "row", gap: 10, justifyContent: "space-between", backgroundColor: theme.sectionBackground, padding: 15, borderWidth: 1, borderColor: theme.borderColor, borderRadius: 20, marginTop: 15}}>
                <View style={{backgroundColor: theme.borderColor, width: 48, height: 48, borderRadius: 15, justifyContent: "center", alignItems: "center"}}>
                    <Image source={require("../../assets/images/Notification/react.png")} />
                </View>
                <View style={{flex: 1, gap: 5}}>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                        <Text style={{color: theme.readColor, fontSize: themeSize.md, fontWeight: "500"}}>New message from Sarah</Text>
                        <Text style={{color: theme.readColor}}>2m ago</Text>
                    </View>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{color: theme.text}}>"Is te vintage lamp stil available</Text>
                </View>
            </View>
        </ScrollView>
     </View>
</View>
  )
}

export default NotificationScreen