import { Colors, FontSize } from "@/constants/theme";
import { useProductStore } from "@/src/store/productStore";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";

const RecentListingSection = () => {

  const scheme = useColorScheme();
  const themeSize = FontSize.size;
  const theme = scheme === "dark" ? Colors.dark : Colors.light;

  const recentListings = useProductStore((state) => state.recentListings);
  const loadRecentListings = useProductStore((state) => state.loadRecentListings);
  const loading = useProductStore((state) => state.loading);
  const error = useProductStore((state) => state.error);

  useEffect(() => {
    loadRecentListings();
  }, [loadRecentListings]);

  if (loading) {
    return <Text>Loading recent listings...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (recentListings.length === 0) {
    return <Text>No recent listing found</Text>;
  }



  

const onProductClicked = (id: string) => {
  router.push({
    pathname: "/ProductDetail/ProductDetail",
    params: { id },
  });
};

  return (
    <View style={style.rl}>
      <View style={style.rl_heading}>
        <Text
          style={{
            color: theme.text,
            fontSize: themeSize.lg,
            fontWeight: "700",
          }}
        >
          Recent Listings
        </Text>
        <Text
          style={{
            color: "#626161",
            fontSize: 15,
            fontWeight: "600",
          }}
        >
          View all
        </Text>
      </View>

      <ScrollView
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={style.rl_list}
      >
        {recentListings.length === 0 ? (
          <Text style={{ color: theme.text, opacity: 0.6 }}>
            No recent listings yet
          </Text>
        ) : (
          recentListings.map((item) => (
            <Pressable
              onPress={() => {onProductClicked(item.id); console.log(item.id, "quick check")}}
              key={item.id}
              style={[
                style.pd,
                {
                  backgroundColor:
                    scheme === "dark" ? "#1E293B" : "#f2f2f26e",
                  opacity: item.status === "PENDING" ? 0.7 : 1,
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
                    item.pImage
                      ? { uri: item.pImage }
                      : require("../../assets/images/HomeScreen/nike.png")
                  }
                  style={{
                    width: 90,
                    height: 90,
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
                    {item.pName}
                  </Text>

                  <Text
                    style={{
                      color:
                        item.status === "FAILED"
                          ? "red"
                          : theme.subText,
                      fontSize: themeSize.sm,
                      fontWeight: "500",
                    }}
                  >
                    {item.status === "PENDING"
                      ? "Uploading..."
                      : item.status === "FAILED"
                      ? "Failed"
                      : item.pQuality}
                  </Text>
                </View>

                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ color: theme.text, fontWeight: "200" }}
                >
                  {item.pDetail}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: theme.subText,
                      flex: 1,
                      fontSize: themeSize.md,
                      fontWeight: "bold",
                    }}
                  >
                    ₦{item.pAmount}
                  </Text>
                  <Text style={{ color: "#757575", fontWeight: "200" }}>
                    {item.pTimePosted}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default RecentListingSection;

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