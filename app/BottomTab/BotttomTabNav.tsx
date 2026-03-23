import { Colors, FontSize } from '@/constants/theme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, useColorScheme } from 'react-native';
import CategoryScreen from '../CategoryScreen/CategoryScreen';
import ChatScreen from '../ChatScreen/ChatScreen';
import HomeScreen from '../HomeScreen/HomeScreen';
import ProfileScreen from '../ProfileScreen/ProfileScreen';
import SellScreen from '../SellScreen/SellScreen';


const imageSource = {
    home: require("../../assets/images/HomeScreen/home.png"),
    category: require("../../assets/images/HomeScreen/category.png"),
    chat: require("../../assets/images/HomeScreen/chat.png"),
    profile: require("../../assets/images/HomeScreen/profile.png")
}

export type BottomTabProp = {
    Home: undefined;
    Category: undefined;
    Sell: undefined;
    Chat: undefined;
    profile: undefined;

};

 const Tab = createBottomTabNavigator<BottomTabProp>();

const BotttomTabNav = () => {

    const scheme = useColorScheme();
    const themeSize = FontSize.size;
    const theme = scheme === "dark" ? Colors.dark : Colors.light;

  return (
    
        <Tab.Navigator screenOptions={{
            headerShown : false,
            
            tabBarStyle : {
                height: 60,
                backgroundColor: theme.background
            },
            
            tabBarActiveTintColor: theme.subText,
            tabBarInactiveTintColor: theme.text,

            

            }}>
            <Tab.Screen name='Home' component={HomeScreen} 
                options={{
                    tabBarIcon: ({focused}) => (
                        <Image source={imageSource.home} style={{tintColor: focused ? theme.subText : theme.text }}/>
                    ),

                }}
            />
            <Tab.Screen name="Category" component={CategoryScreen} 
                options={{
                    tabBarIcon: ({focused}) => (
                        <Image source={imageSource.category} style={{tintColor: focused ? theme.subText : theme.text }}/>
                    )
                }}
            />


          <Tab.Screen
            name="Sell"
            component={SellScreen}
            options={{
                tabBarLabel: "Sell",                
                tabBarButton: () => (
                <>
                <Pressable  
                    onPress = {() => { router.navigate("/SellScreen/SellScreen")}}        
                    
                    style={{
                    borderRadius: 25,
                    width: 50,
                    height: 50,
                    backgroundColor: theme.subText ,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: -25,
                    borderWidth: 2.5,
                    borderColor: "white",
                    shadowColor:
                        scheme === "dark"
                        ? "rgb(255, 249, 249)"
                        : "rgba(10, 10, 10, 0.3)",
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: scheme === "dark" ? 8: 7,
                    shadowOpacity: scheme === "dark" ? 0.5 : 0.8,
                    alignSelf: "center"
                    }}
                >
                    <Text
                    style={{
                        color: "white" ,
                        fontSize: themeSize.xlg_md,
                    }}
                    >
                    +
                    </Text>
                </Pressable>
                <Text style={{color: theme.text, alignSelf: "center", marginTop: 5, fontSize: themeSize.sm}}>Sell</Text>
                </>
                ),
                tabBarLabelStyle: {
                fontSize: 12,
                marginTop: 2,
                },
            }}
            />
            <Tab.Screen name="Chat" component={ChatScreen} 
                options={{
                    tabBarIcon: ({focused}) => (
                        <Image source={imageSource.chat} style={{tintColor: focused ? theme.subText : theme.text }} />
                    )
                }}
            />
            <Tab.Screen name="profile" component={ProfileScreen} 
                 options={{
                    tabBarIcon: ({focused}) => (
                        <Image source={imageSource.profile} style={{tintColor: focused ? theme.subText : theme.text }} />
                    ),

                }}
            />            
        </Tab.Navigator>
   
  )
}

export default BotttomTabNav