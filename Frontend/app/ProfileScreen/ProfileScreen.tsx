import { Colors, FontSize } from '@/constants/theme';
import { userStore } from '@/src/store/userStore';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, useColorScheme, View } from 'react-native';

const ProfileScreen = () => {

const {profile_picture, full_name, university, campus, email, location, gender} = userStore();

const scheme = useColorScheme();
const themeSize = FontSize.size;
const theme = scheme === "dark" ? Colors.dark : Colors.light;

    const onBack = () => {
        router.back();
    }

  return (
    <View style={{backgroundColor: theme.background, flex: 1}}>
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderColor: "#aeaeaea1",
                borderBottomWidth: 1,
                paddingBottom: 15,
                padding: 10,
                width: "100%",
                }}
            >

            <Pressable onPress={onBack} style={{ width: 40 }}>
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
            Profile
            </Text>

            <Pressable style={{width: 40, alignSelf: "center", alignItems: "center"}}>
                <Image
                    source={require("../../assets/images/Profile/share.png")}
                    style={{ tintColor: theme.text }}
                />
            </Pressable>
        </View>

        <View style={{backgroundColor: theme.screenBackground , flex: 1}}>
            <View style={{ justifyContent: "center", alignItems: "center"}}>
                <Image                 
                    source={
                            profile_picture != ""
                            ? { uri: profile_picture } :
                            gender === "Female" ?
                            require('@/assets/images/CreateAccount/femaleUser.png')
                            : require('@/assets/images/CreateAccount/user.png')
                    }                     
                    style={{
                        alignSelf: "center", 
                        marginTop: 25, 
                        width: 128, 
                        height: 128, 
                        borderRadius: 50}} 
                        />
                <Text style={{color: theme.text, fontSize: themeSize.lg, fontWeight: "bold", marginTop: 5}}>{full_name}</Text>
                <Text style={{color: theme.subText, }}>{university} {campus} </Text>
                <Text style={{color: theme.subText, }}> {email}</Text>
                <Text style={{color: theme.readColor}}> Member since 2023</Text>
            </View>

            <View style={{flexDirection: "row", justifyContent: "space-around", marginTop: 20}}>
                {/** Item Sold */}
                <View style ={{width:"40%", padding: 20, backgroundColor: theme.sectionBackground, borderRadius: 20, gap: 10}} >
                    <Text style={{color: theme.readColor}}>ITEMS SOLD</Text>
                    <Pressable style={{flexDirection: "row", gap: 10}}>
                        <Image source={require("../../assets/images/Profile/item.png")}/>
                        <Text style={{color: theme.text, fontSize: themeSize.lg}}>24</Text>
                    </Pressable>
                </View>

                {/** Reviews */}
                <View style ={{width:"40%", padding: 20, backgroundColor: theme.sectionBackground, borderRadius: 20, gap: 10}} >
                    <Text style={{color: theme.readColor}}>REVIEWS</Text>
                    <Pressable style={{flexDirection: "row", gap: 10}}>

                        <Image source={require("../../assets/images/Profile/star.png")}/>
                        <Text style={{color: theme.text, fontSize: themeSize.lg}}>4.9<Text style={{color: theme.readColor, fontSize: themeSize.sm}}>/5</Text></Text>
                    </Pressable>
                </View>
            </View>

            {/** Account Settings */}
            <View style={{padding: 10, marginTop: 20, gap: 20}}>
                <Text style={{color: theme.text, fontSize: themeSize.lg, fontWeight: "bold"}}>Account Settings</Text>

                {/** WishList */}
                <Pressable style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, paddingLeft: 15, paddingRight: 15}}>
                    <View style={{width: 40, height: 40, backgroundColor: theme.iconBackground, justifyContent: "center", alignItems: "center", borderRadius: 10}}>
                        <Image source={require("../../assets/images/Profile/wishlist.png")}/>
                    </View>
                    <Text style={{flex: 1, color: theme.text, fontSize: themeSize.md, fontWeight: "500"}}>Wishlist</Text> 
                    <Image source={require("../../assets/images/Profile/goto.png")} style={{}}/>          
                </Pressable>

                 {/**Settings */}
                <Pressable style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, paddingLeft: 15, paddingRight: 15}}>
                    <View style={{width: 40, height: 40, backgroundColor: theme.iconBackground, justifyContent: "center", alignItems: "center", borderRadius: 10}}>
                        <Image source={require("../../assets/images/Profile/setting.png")}/>
                    </View>
                    <Text style={{flex: 1, color: theme.text, fontSize: themeSize.md, fontWeight: "500"}}>Settings</Text> 
                    <Image source={require("../../assets/images/Profile/goto.png")} style={{}}/>          
                </Pressable>

                 {/** Help Center */}
                <Pressable style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, paddingLeft: 15, paddingRight: 15}}>
                    <View style={{width: 40, height: 40, backgroundColor: theme.iconBackground, justifyContent: "center", alignItems: "center", borderRadius: 10}}>
                        <Image source={require("../../assets/images/Profile/help.png")}/>
                    </View>
                    <Text style={{flex: 1, color: theme.text, fontSize: themeSize.md, fontWeight: "500"}}>Help Center</Text> 
                    <Image source={require("../../assets/images/Profile/goto.png")} style={{}}/>          
                </Pressable>
                {/** Logout */}
                <Pressable style={{flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, paddingLeft: 15, paddingRight: 15, alignSelf: "center", }}>
                    <View style={{width: 40, height: 40, backgroundColor: "#ff15003f", justifyContent: "center", alignItems: "center", borderRadius: 10}}>
                        <Image source={require("../../assets/images/Profile/logout.png")}/>
                    </View>
                    <Text style={{flex: 1, color: "#ff0000", fontSize: themeSize.md, fontWeight: "500"}}>Log Out</Text> 
                    
                </Pressable>
            </View>

        </View>
    </View>
  )
}

export default ProfileScreen