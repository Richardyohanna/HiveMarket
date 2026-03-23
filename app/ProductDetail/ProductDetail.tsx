import { Colors, FontSize } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';

type productDetailProp = {
    id: string;
    pImage: ImageSourcePropType;
    pAmount: string;
    pDiscount: string;
    pName: string;
    pCondition: string;
    pDetail: string;
    sProfilePicture: ImageSourcePropType;
    sFullName: string;
    sReview: string;
    sReviewNumber: string;
}

const productData: productDetailProp = {

    id: "1",
    pImage: require("../../assets/images/ProductDetail/Hero Image.png"),
    pAmount: "₦100,000",
    pDiscount: "₦50,000",
    pName: "Premium Noise-Canceling Wireless Headphones",
    pCondition: "LIKE NEW",
pDetail: `Selling my premium noise-canceling
headphones. These were purchased 3 months
ago and have only been used a handful of
times in an office environment. They are in
pristine "Like New" condition with no scratches
or signs of wear.
        
    Active Noise Cancellation (ANC) for
    immersive sound
    
    Up to 30 hours of battery life
    
    USB-C fast charging support
        
Includes original carrying case and cables
Perfect for commuting, traveling, or focusing in
a noisy workspace. Shipping within 24 hours
of purchase. `,
    sProfilePicture: require("../../assets/images/ProductDetail/profilePicture.png"),
    sFullName: "Alex Rivera",
    sReview: "4.9",
    sReviewNumber: "128"
}

const ProductDetail = () => {

const scheme = useColorScheme();
const themeSize = FontSize.size;
const theme = scheme === "dark" ? Colors.dark : Colors.light

const onBack = () => {
    router.back();
}

  return (
    <View style={{flex: 1, width: "100%"}}>
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
            Product Detail
            </Text>

            {/** share */}
            <Pressable style={{width: 30, alignSelf: "flex-end", alignItems: "center"}}>
                <Image
                    source={require("../../assets/images/ProductDetail/share.png")}
                    style={{ tintColor: theme.text }}
                />
            </Pressable>

            {/** React */}
            <Pressable style={{width: 30, alignSelf: "flex-end", alignItems: "center"}}>
                <Image
                    source={require("../../assets/images/ProductDetail/react.png")}
                    style={{ tintColor: theme.text }}
                />
            </Pressable>
        </View>

        <ScrollView 
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{}}
            style={{backgroundColor: theme.screenBackground}}
        >
            <Image source={productData.pImage} style={{width: "100%", height: 400}}/>
            <View style={{padding: 10, gap: 15}}>
                <View style= {{flexDirection: "row", alignItems: "flex-end", gap: 5}}>
                     <Text style={{fontSize: themeSize.xlg, color: theme.subText}}>{productData.pDiscount}</Text>
                     <Text style={{fontSize: themeSize.md, color: theme.readColor, textDecorationLine: "line-through"}}> {productData.pAmount} </Text>
                </View>
               <Text style={{color: theme.text, fontSize: themeSize.xlg, fontWeight: "500"}}>{productData.pName}</Text>
               <Text style={{color: theme.subText, gap: 15, alignItems: "center"}}><Image source={require("../../assets/images/ProductDetail/check.png")} style={{tintColor: theme.subText ,alignSelf: "center", alignItems: "center"}}/> {productData.pCondition}</Text>
               


               {/** Description */}
              <Text style={{color: theme.text, fontSize: themeSize.md, fontWeight: "600", marginTop: 20}}>DESCRIPTION:</Text>
              <Text style={{color: theme.text, fontWeight: "300"}}>
                {productData.pDetail}
              </Text>

                {/** SellerInformation */}
               <View style={{borderTopWidth: 1, borderColor: theme.borderColor}}>
                    <Text style={{color: theme.readColor, marginTop: 10}}>SELLER INFORMATION</Text>
                    <View style={{flexDirection: "row", gap: 10, marginTop: 15, alignItems: "center", justifyContent: "space-between", padding: 10, backgroundColor: theme.sectionBackground, borderRadius: 10}}>
                        <Image source={productData.sProfilePicture} style={{width: 48, height: 48, borderRadius: 50}}/>
                        <View style={{flex: 1, gap: 5}}>
                            <Text style={{color: theme.text, fontSize: themeSize.md}}>{productData.sFullName}</Text>
                            <Text style={{color: theme.text}}><Image source={require("../../assets/images/Profile/star.png")} style={{width: 11, height: 11, }}/>{productData.sReview}<Text style={{color: theme.readColor, }}>({productData.sReviewNumber} reviews)</Text></Text>
                        </View>
                        <Pressable>
                            <Text style={{color: theme.subText}}>View Profile</Text>
                        </Pressable>
                    </View>
               </View>

                 {/** Location */}
              <Text style={{color: theme.text, fontSize: themeSize.md, fontWeight: "600", marginTop: 20}}>LOCATION:</Text>
              <Image source={require("../../assets/images/ProductDetail/map.png")} />

                {/** Buttons  */}
              <View style={{flexDirection: "row", gap: 20}}>
                <Pressable style={{backgroundColor: "transparent", flexDirection: "row", borderWidth: 2, borderColor: theme.subText, width: 118, height: 56, justifyContent: "center", alignItems: "center", borderRadius: 40, gap: 10}}>
                    <Image source={require("../../assets/images/ProductDetail/chat.png")} style={{tintColor: theme.subText}}/>
                    <Text style={{color: theme.subText, fontSize: themeSize.md, fontWeight: "700"}}>Chat</Text>
                </Pressable>
                <Pressable style={{flex: 1, height: 56, backgroundColor: theme.subText, alignItems: "center", justifyContent: "center", borderRadius: 40}}>
                    <Text style={{color: "white", fontSize: themeSize.md, fontWeight: "700"}}>Buy Now</Text>
                </Pressable>
              </View>
            </View>
        </ScrollView>
    </View>
  )
}

export default ProductDetail