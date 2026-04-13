import { Colors, FontSize } from "@/constants/theme";
import ScrollWithRefresh from "@/hooks/ScrollWithRefresh";
import { useProductStore } from "@/src/store/productStore";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  Pressable,
  Text,
  useColorScheme,
  View
} from "react-native";

const ProductDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const scheme = useColorScheme();
  const themeSize = FontSize.size;
  const theme = scheme === "dark" ? Colors.dark : Colors.light;

  const recentListings = useProductStore((state) => state.recentListings);
  const loadRecentListings = useProductStore((state) => state.loadRecentListings);
  const loading = useProductStore((state) => state.loading);

  useEffect(() => {
    if (recentListings.length === 0) {
      loadRecentListings();
    }
  }, [recentListings.length, loadRecentListings]);

  console.log("Route id:", id);
  console.log("Recent listings:", recentListings);

  const product = recentListings.find(
    (item) => String(item.id) === String(id)
  );

  if (loading && recentListings.length === 0) {
    return <Text style={{ color: theme.text }}>Loading product...</Text>;
  }

  if (!id) {
    return <Text style={{ color: theme.text }}>No product id was passed</Text>;
  }

  if (!product) {
    return <Text style={{ color: theme.text }}>Product not found</Text>;
  }

  const onBack = () => {
    router.back();
  };

  const onBuy = () => {
   
          router.push({
            pathname: "/TransactionScreen/TransactionScreen",
            params: { id },
          });
        }  


  return (
    <View style={{ flex: 1, width: "100%", backgroundColor: theme.screenBackground }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderColor: "#aeaeaea1",
          borderBottomWidth: 1,
          paddingBottom: 15,
          width: "100%",
          padding: 10,
          gap: 15,
        }}
      >
        <Pressable onPress={onBack} style={{ width: 30, height: "100%",padding:5}}>
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

        <Pressable style={{ width: 30, alignSelf: "flex-end", alignItems: "center" }}>
          <Image
            source={require("../../assets/images/ProductDetail/share.png")}
            style={{ tintColor: theme.text }}
          />
        </Pressable>

        <Pressable style={{ width: 30, alignSelf: "flex-end", alignItems: "center" }}>
          <Image
            source={require("../../assets/images/ProductDetail/react.png")}
            style={{ tintColor: theme.text }}
          />
        </Pressable>
      </View>

      <ScrollWithRefresh
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: theme.screenBackground }}
        onRefresh={()=> {
             if (recentListings.length === 0) {
                loadRecentListings();
              }
        }}
      >
        <Image
          source={
            product.pImage
              ? { uri: product.pImage }
              : require("../../assets/images/ProductDetail/Hero Image.png")
          }
          style={{ width: "100%", height: 400 }}
          resizeMode="cover"
        />

        <View style={{ padding: 10, gap: 15 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 5 }}>
            {!!product.pDiscount && (
              <Text style={{ fontSize: themeSize.xlg, color: theme.subText }}>
                ₦{product.pDiscount}
              </Text>
            )}

            <Text
              style={{
                fontSize: themeSize.md,
                color: theme.readColor,
                textDecorationLine: product.pDiscount ? "line-through" : "none",
              }}
            >
              ₦{product.pAmount}
            </Text>
          </View>

          <Text
            style={{
              color: theme.text,
              fontSize: themeSize.xlg,
              fontWeight: "500",
            }}
          >
            {product.pName}
          </Text>

          <Text style={{ color: theme.subText }}>
            {product.pQuality}
          </Text>

          <Text
            style={{
              color: theme.readColor,
              fontSize: themeSize.sm,
            }}
          >
            Posted {product.pTimePosted}
          </Text>

          <Text
            style={{
              color: theme.text,
              fontSize: themeSize.md,
              fontWeight: "600",
              marginTop: 20,
            }}
          >
            DESCRIPTION:
          </Text>

          <Text style={{ color: theme.text, fontWeight: "300" }}>
            {product.pDetail}
          </Text>

          <View style={{ borderTopWidth: 1, borderColor: theme.borderColor }}>
            <Text style={{ color: theme.readColor, marginTop: 10 }}>
              SELLER INFORMATION
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

              <Pressable>
                <Text style={{ color: theme.subText }}>View Profile</Text>
              </Pressable>
            </View>
          </View>

          <Text
            style={{
              color: theme.text,
              fontSize: themeSize.md,
              fontWeight: "600",
              marginTop: 20,
            }}
          >
            LOCATION:
          </Text>

          <Text style={{ color: theme.text }}>
            {product.location || "Location not available"}
          </Text>

          <View style={{ flexDirection: "row", gap: 20, marginTop: 20 }}>
            <Pressable
              style={{
                backgroundColor: "transparent",
                flexDirection: "row",
                borderWidth: 2,
                borderColor: theme.subText,
                width: 118,
                height: 56,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 40,
                gap: 10,
              }}
            >
              <Image
                source={require("../../assets/images/ProductDetail/chat.png")}
                style={{ tintColor: theme.subText }}
              />
              <Text
                style={{
                  color: theme.subText,
                  fontSize: themeSize.md,
                  fontWeight: "700",
                }}
              >
                Chat
              </Text>
            </Pressable>

            <Pressable

              onPress={onBuy}
              style={{
                flex: 1,
                height: 56,
                backgroundColor: theme.subText,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 40,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: themeSize.md,
                  fontWeight: "700",
                }}
              >
                Buy Now
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollWithRefresh>
    </View>
  );
};

export default ProductDetail;