import { Colors } from '@/constants/theme'
import ScrollWithRefresh from '@/hooks/ScrollWithRefresh'
import { useProductStore } from '@/src/store/productStore'
import { router } from 'expo-router'
import React from 'react'
import { Image, Pressable, StatusBar, StyleSheet, TextInput, useColorScheme, View } from 'react-native'
import FeaturedProductSection from './FeaturedProductSection'
import HeaderSection from './HeaderSection'
import RecentListingSection from './RecentListingSection'
import { userStore } from '@/src/store/userStore'



const HomeScreen = () => {

 

 const scheme = useColorScheme();
 const loadingRecentListings = useProductStore((state) => state.loading);

 const theme = scheme === "dark" ? Colors.dark : Colors.light

 

 const onNotificationClicked = () => {
    router.push("/NotificationScreen/NotificationScreen")
 }
 

  return (
    <View style={{backgroundColor: scheme === "dark" ? "#0B120E" : "white", flex: 1, paddingLeft: 10, paddingRight: 10, paddingTop: 5, gap: 20}}>
      <StatusBar 
        backgroundColor={scheme === "dark" ? "#0B120E" : "white"} 
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
      />

      <HeaderSection  onNotificationClicked={onNotificationClicked}/>
       
      <ScrollWithRefresh horizontal={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} contentContainerStyle={{gap: 20}}
        onRefresh={() => {
          loadingRecentListings ? console.log("Already loading recent listings") : useProductStore.getState().loadRecentListings();
        }}
      >
         
        {/** Search Section */}
        <View style={[style.search, {backgroundColor: scheme === "dark" ? "#1E293B" : "#f2f2f26e"}]}>
          <Pressable>
              <Image source={require("../../assets/images/HomeScreen/search.png")}/>
          </Pressable>
          <TextInput 
              placeholder='Search for items'
              placeholderTextColor={scheme === "dark" ? "#ffffff92" : "#0000008b"}
              style={{flex: 1}}
          />
          <View style={{width: 2, height: 20, backgroundColor: scheme === "dark" ? "#525e70cd" : "#62626294"  }}></View>
          <Pressable>
              <Image source={require("../../assets/images/HomeScreen/searchSetting.png")} />
          </Pressable>
        </View>

        {/* <CategorySection /> */}
        <FeaturedProductSection />
        <RecentListingSection />
      </ScrollWithRefresh>
    </View>
  )
}

export default HomeScreen;

const style = StyleSheet.create({

    search : {
        width: "100%",
        padding: 15,
        borderRadius: 20,
        flexDirection: "row",
        gap: 15,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#00000086"
    }
})