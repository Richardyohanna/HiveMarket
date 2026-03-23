import { Colors, FontSize } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

type FeaturedProductProp = {
    id: string,
    pImage: ImageSourcePropType,
    pName: string,
    pAmount: string,
    pReview: string,
}

const FPData: FeaturedProductProp[] = [
     {
        id: "fet1",
        pImage: require("../../assets/images/HomeScreen/fet2.png"),
        pName: "Premium Headset New",
        pAmount: "50, 000",
        pReview: "4.5,"
    },
      {
        id: "fet2",
        pImage: require("../../assets/images/HomeScreen/fet1.png"),
        pName: "Smart Watch Pro",
        pAmount: "70, 000",
        pReview: "4.3"
    },
         {
        id: "fet3",
        pImage: require("../../assets/images/HomeScreen/fet2.png"),
        pName: "Premium Headset New",
        pAmount: "500, 000",
        pReview: "4.5,"
    },
      {
        id: "fet4",
        pImage: require("../../assets/images/HomeScreen/fet1.png"),
        pName: "Smart Watch Pro",
        pAmount: "700, 000",
        pReview: "4.3"
    }

] 

const FeaturedProductSection = () => {

    const scheme = useColorScheme();
    const themeSize = FontSize.size;
    const theme = scheme === "dark" ? Colors.dark : Colors.light;

    const onProductClicked = () => {
        router.push("/ProductDetail/ProductDetail");
    }

  return (
    <View style={style.fp}>
      <View style={style.fp_heading}>
        <Text style={{color: theme.text, fontSize: themeSize.lg, fontWeight: "700"}}>Featured Product</Text>
        <Text style={{color: theme.subText, fontSize: 15, fontWeight: "600"}}>View all</Text>
      </View>

    {/** Featured Product List */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={style.pd_list}
       >

        {FPData.map((item) => (

            <Pressable key={item.id} 
                onPress={onProductClicked}
                style={[
                    style.pd, 
                    {
                      backgroundColor: scheme === "dark" ? "#1E293B" : "#f2f2f26e"
            }]}>
                <Pressable onPress={onProductClicked}>
                    <Image source={item.pImage} style={{width: 135, height: 169 , borderRadius: 20}} />
                </Pressable>
                
                <Text onPress={onProductClicked} numberOfLines={1} ellipsizeMode='tail' style={{color: theme.text, fontWeight: "700"}}>{item.pName}</Text>
                <View style={{flexDirection: "row", width: "100%", justifyContent: "space-between", alignItems: "center"}}>
                    <Text style={{color: theme.subText, flex: 1, fontWeight: "bold"}}>₦{item.pAmount}</Text>
                    <Text style={{fontSize: themeSize.xsm, fontWeight: "700", color: theme.text}}><Text style={{color: "#EAB308"}}>★</Text>{item.pReview}</Text>
                </View>
                <Pressable style={{position: "absolute", top: 35, right: 25, backgroundColor:  scheme === "dark" ? "#1E293B" : "#fffcfc", padding: 8, borderRadius: 50 }}>
                    <Image source={require("../../assets/images/HomeScreen/react.png") } />
                </Pressable>
            </Pressable>
        ))}

      </ScrollView>
    </View>
  )
}

export default FeaturedProductSection;

const style = StyleSheet.create({
    fp: {
        width: "100%",
        gap: 15
    },
    fp_heading: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between"
    },
    pd_list: {
               
        flexDirection: "row", 
        gap: 20,
        
    },
    pd: {
        padding: 20,
        borderWidth: 1,
        width: 161,
        alignItems: "center",
        borderRadius: 20,
        borderColor: "#4241412c",
        position: "relative",
        gap: 10,
        
    }
})