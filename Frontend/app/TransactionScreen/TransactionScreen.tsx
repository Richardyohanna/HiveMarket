import { Colors, FontSize } from '@/constants/theme';
import { useProductStore } from "@/src/store/productStore";
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

const TransactionScreen = () => {

 const { id } = useLocalSearchParams<{ id: string }>();
    
const scheme = useColorScheme();
const themeSize = FontSize.size;
const theme = scheme === "dark" ? Colors.dark : Colors.light;
const recentListings = useProductStore((state) => state.recentListings);

const product = recentListings.find(
    (item) => String(item.id) === String(id)
);

  if (!product) {
    return console.log("Product is undefine");
  }

    const onBack = () => {
        router.back();
    }

    const onProductClicked = (id: string) => {
      router.push({
        pathname: "/ProductDetail/ProductDetail",
        params: { id },
      });
    };
    

  return (
    <View style={{flex: 1, width: "100%", backgroundColor: theme.screenBackground , gap: 7}}>
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
            Checkout
            </Text>

        </View>

    <Text style={{ color: theme.readColor, marginTop: 5, paddingLeft: 10 }}>
        REVIEW ITEM
    </Text>

    <Pressable
        onPress={() => {onProductClicked(product.id);}}
        style={[
        style.pd,
        {
            margin: 10,
            backgroundColor:
            scheme === "dark" ? "#1E293B" : "#f2f2f26e",
            opacity: product.status === "PENDING" ? 0.7 : 1,
        },
        ]}
    >
            <View
            style={{
                shadowColor: "#00000094",
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 5,
                shadowOpacity: 0.1,
                borderRadius: 20,
                backgroundColor: "white",
                overflow: "hidden",
            }}
            >
            <Image
                source={
                product.pImage
                    ? { uri: product.pImage }
                    : require("../../assets/images/HomeScreen/nike.png")
                }
                style={{
                width: 50,
                height: 50,
                borderRadius: 20,
                }}
                resizeMode="cover"
            />
            </View>

            <View
            style={{
                flexDirection: "column",
                flex: 1,
                width: "100%",
                gap: 5,
            }}
            >
            <View
                style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
                }}
            >
                <Text
                style={{
                    color: theme.text,
                    fontWeight: "700",
                    fontSize: themeSize.md,
                    flex: 1,
                }}
                numberOfLines={1}
                >
                {product.pName}
                </Text>

                <Text
                style={{
                    color:
                    product.status === "FAILED"
                        ? "red"
                        : theme.subText,
                    fontSize: themeSize.sm,
                    fontWeight: "500",
                }}
                >
                {product.status === "PENDING"
                    ? "Uploading..."
                    : product.status === "FAILED"
                    ? "Failed"
                    : product.pQuality}
                </Text>
            </View>

            <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ color: theme.text, fontWeight: "200" }}
            >
                {product.pDetail}
            </Text>
            </View>
        </Pressable>
                    
        <Text style={{ color: theme.readColor, marginTop: 5, paddingLeft: 10 }}>
            SOLD BY
        </Text>
        
        <View
            style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 15,
            alignItems: "center",
            justifyContent: "space-between",
            padding: 10,
            backgroundColor: theme.sectionBackground,
            borderRadius: 10,
            }}
        >
            <Image
            source={require("../../assets/images/ProductDetail/profilePicture.png")}
            style={{ width: 48, height: 48, borderRadius: 50 }}
            />

            <View style={{ flex: 1, gap: 5 }}>
            <Text style={{ color: theme.text, fontSize: themeSize.md }}>
                Seller
            </Text>

            <Text style={{ color: theme.readColor }}>
                Rating not available
            </Text>
            </View>

            <Pressable style={{alignItems: "center", width: 50, justifyContent: "center"}}>
                <Image source={require("../../assets/images/HomeScreen/chat.png")} />
            </Pressable>
        </View>

        <Text style={{ color: theme.readColor, marginTop: 5, paddingLeft: 10 }}>
            PICKUP LOCATION
        </Text>
        <View style={{margin: 10, borderTopLeftRadius: 15, borderTopRightRadius: 15, backgroundColor: theme.sectionBackground, paddingBottom: 10, borderWidth: 1, borderColor: theme.borderColor}}>
            <Image source={require("../../assets/images/Sell/pickupLocation.png")} style={{width: "100%", borderTopLeftRadius: 15, borderTopRightRadius: 15,height: 100}}/>
            <Text style={{color: theme.text, marginTop: 10, fontSize: themeSize.lg, fontWeight: "800", padding: 10 }}>{product.location}</Text>
        </View>

        <Text style={{ color: theme.readColor, marginTop: 5, paddingLeft: 10 }}>
            PAYMENT SUMMARY
        </Text>
        <View style={{gap: 5}}>
            <View style={{flexDirection: "row", justifyContent: "space-between", paddingLeft: 20, paddingRight: 20}}>
                <Text style={{color: theme.borderColor}}>Item Price</Text>
                <Text style={{color: theme.text, fontSize: themeSize.lg, fontWeight: "bold"}}>₦{(Number(product.pAmount)).toLocaleString()}</Text>
            </View>
            <View style={{flexDirection: "row", justifyContent: "space-between", paddingLeft: 20, paddingRight: 20}}>
                <Text style={{color: theme.borderColor}}>Transaction Fee</Text>
                <Text style={{color: theme.text, fontSize: themeSize.sm, fontWeight: "bold"}}>₦50.60</Text>
            </View>
            
            <View style={{flexDirection: "row", justifyContent: "space-between", paddingLeft: 20, paddingRight: 20}}>
                <Text style={{color: theme.borderColor}}>Delivery</Text>
                <Text style={{color: theme.subText, fontSize: themeSize.sm, fontWeight: "400"}}>Free</Text>
            </View>
        </View>

        <View style={{flexDirection: "row", justifyContent: "space-between", paddingLeft: 20, paddingRight: 20}}>
            <Text style={{fontSize: themeSize.md, color: theme.text, fontWeight: "700"}}>Total to pay</Text>
            <View>
                <Text style={{fontSize: themeSize.lg, color: theme.subText, fontWeight: "700"}}>₦{(Number(product.pAmount) + 50.60).toLocaleString()}</Text>
            </View>
        </View>

        <Pressable

            style={{
            backgroundColor: theme.subText,
            padding: 15,
            width: "80%",
            marginTop: 25,
            borderRadius: 20,
            alignItems: "center",
            alignSelf: "center",
            }}
        >
            <Text
            style={{
                color: "white",
                fontSize: themeSize.md,
                fontWeight: "600",
            }}
            >
                Proceed to Payment
            </Text>
        </Pressable>
    </View>
  )
}

export default TransactionScreen

const style = StyleSheet.create({
  rl: {
    width: "100%",
    gap: 15,
    flex: 1,
  },
  rl_heading: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
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
  },
});