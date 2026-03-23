import { Colors, FontSize } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

type RecentListingProp = {
    id: string,
    pImage: ImageSourcePropType;
    pName: string;
    pDetail: string;
    pAmount: string;
    pTimePosted: string;
    pQuality: string;
}

const RLData: RecentListingProp[] = [
    {
        id: "rl1",
        pImage: require("../../assets/images/HomeScreen/nike.png"),
        pName: "Nike Air Max",
        pAmount: "5,000",
        pDetail: "Barely used, size 10, Original nike, black polished",
        pTimePosted: "2h ago",
        pQuality: "NEW"
    },
        {
        id: "rl2",
        pImage: require("../../assets/images/HomeScreen/chair.png"),
        pName: "Office Chair - Ergonomic",
        pAmount: "150,000",
        pDetail: "Adjustable lumbar support Yellow mesh",
        pTimePosted: "5h ago",
        pQuality: "USED"
    },
        {
        id: "rl3",
        pImage: require("../../assets/images/HomeScreen/ipad.png"),
        pName: "iPad Air 4th Gen",
        pAmount: "102,000",
        pDetail: "64GB, Space Gray, Like new",
        pTimePosted: "yesterday",
        pQuality: "USED"
    },
]

const RecentListingSection = () => {
    const scheme = useColorScheme();
    const themeSize = FontSize.size;
    const theme = scheme === "dark" ? Colors.dark : Colors.light;

    const onProductCLicked = () => {
        router.push("/ProductDetail/ProductDetail");
    }


  return (
    <View style={style.rl}>
      <View style={style.rl_heading}>
        <Text style={{color: theme.text, fontSize: themeSize.lg, fontWeight: "700"}}>Recent Listings</Text>
        <Text style={{color: "#626161", fontSize: 15, fontWeight: "600"}}>View all</Text>
      </View>

      {/** recent product list */}
      <ScrollView 
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={style.rl_list}
      >

        {RLData.map((item) => (
        <Pressable onPress={onProductCLicked} key={item.id} style={[style.pd, { backgroundColor: scheme === "dark" ? "#1E293B" : "#f2f2f26e"}]}>
            <View
            style={{
                shadowColor: "#00000094",
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 5,
                shadowOpacity: 0.1,
                borderRadius: 20,
                backgroundColor: "white", // 👈 VERY IMPORTANT
            }}
            >
            <Image
                source={item.pImage}
                style={{
                borderRadius: 20,
                }}
            />
            </View>
            <View style={{flexDirection: "column", flex: 1, width: "100%", gap: 5, }}>
                <View style={{flexDirection: "row", width: "100%", justifyContent: "space-between"}}>
                    <Text style={{color: theme.text, fontWeight: "700", fontSize: themeSize.md}}>{item.pName}</Text>
                    <Text style={{color: theme.subText, fontSize: themeSize.sm, fontWeight: "500"}}>{item.pQuality}</Text>
                </View>
                <Text numberOfLines={1} ellipsizeMode='tail' style={{color: theme.text, fontWeight: "200"}}>{item.pDetail}</Text>
                <View style={{flexDirection: "row", width: "100%", justifyContent: "space-between"}}>
                    <Text  style={{color: theme.subText, flex: 1, fontSize: themeSize.md, fontWeight: "bold"}}>₦{item.pAmount}</Text>
                    <Text style={{color: "#757575", fontWeight: "200"}}>{item.pTimePosted}</Text>
                </View>
            </View>
        </Pressable>
        ))}
        
      </ScrollView>
    </View>
  )
}

export default RecentListingSection;

const style = StyleSheet.create( {
    rl: {
        width: "100%",
        gap: 15,
        flex: 1
    },
    rl_heading: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between"
    },
    rl_list: {
        flexDirection: "column",
        gap: 20,
        
    },
    pd: {
        flexDirection: "row",
        padding: 10,
        borderWidth: 1,
        alignItems: "center",
        borderRadius: 20,
        borderColor: "#4241412c",
        gap: 10,
        
    }
})