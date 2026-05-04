import { Colors, FontSize } from "@/constants/theme";
import { increaseProductViewApi } from "@/src/api/productApi";
import { useProductStore } from "@/src/store/productStore";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";   // light tint
const PRIMARY_DARK = "#1a3a1a";   // dark tint

const FeaturedProductSection = () => {
  const scheme  = useColorScheme();
  const isDark  = scheme === "dark";
  const theme   = isDark ? Colors.dark : Colors.light;
  const fs      = FontSize.size;

  const products = useProductStore((state) => state.recentListings);

  // ── Featured algorithm: weighted score ──
  const featuredProducts = useMemo(() => {
    return [...products]
      .map((p) => ({
        ...p,
        score:
          0.5 * (p.views     || 0) +
          2.0 * (p.purchases || 0) +
          0.2 * (p.rating    || 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [products]);

  const onProductClicked = (id: string) => {
    increaseProductViewApi(id);
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id } });
  };

  if (featuredProducts.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.titleAccent, { backgroundColor: PRIMARY }]} />
          <Text style={[styles.title, { color: theme.text, fontSize: fs.lg }]}>
            Featured Products
          </Text>
        </View>
        <Pressable>
          <Text style={[styles.viewAll, { color: PRIMARY }]}>View all</Text>
        </Pressable>
      </View>

      {/* ── Horizontal list ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {featuredProducts.map((item, index) => {
          const isNew = item.pQuality === "NEW";

          return (
            <Pressable
              key={item.id}
              onPress={() => onProductClicked(item.id)}
              style={[
                styles.card,
                {
                  backgroundColor: theme.sectionBackground,
                  borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
                },
              ]}
            >
              {/* ── Image ── */}
              <View style={styles.imgWrapper}>
                <Image
                  source={
                    item.pImage
                      ? { uri: item.pImage }
                      : require("../../assets/images/HomeScreen/nike.png")
                  }
                  style={styles.img}
                  resizeMode="cover"
                />

                {/* Rank badge — top 3 get a medal */}
                {index < 3 && (
                  <View style={[styles.rankBadge, { backgroundColor: PRIMARY }]}>
                    <Text style={styles.rankText}>
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                    </Text>
                  </View>
                )}

                {/* Condition pill */}
                {item.pQuality && (
                  <View
                    style={[
                      styles.conditionPill,
                      { backgroundColor: isNew ? PRIMARY : "#b45309" },
                    ]}
                  >
                    <Text style={styles.conditionText}>{item.pQuality}</Text>
                  </View>
                )}

                {/* Wishlist */}
                <Pressable
                  style={[
                    styles.wishlistBtn,
                    { backgroundColor: isDark ? PRIMARY_DARK : "#fff" },
                  ]}
                >
                  <Text style={{ fontSize: 13 }}>🤍</Text>
                </Pressable>
              </View>

              {/* ── Card body ── */}
              <View style={styles.cardBody}>
                {/* Name */}
                <Text numberOfLines={1} style={[styles.cardName, { color: theme.text }]}>
                  {item.pName}
                </Text>

                {/* Location */}
                {item.location ? (
                  <View style={styles.locationRow}>
                    <Text style={[styles.locationPin, { color: PRIMARY }]}>📍</Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.locationText, { color: theme.readColor }]}
                    >
                      {item.location}
                    </Text>
                  </View>
                ) : null}

                {/* Price + Rating */}
                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: PRIMARY }]}>
                    ₦{Number(item.pAmount).toLocaleString()}
                  </Text>
                  <View style={styles.ratingPill}>
                    <Text style={styles.star}>★</Text>
                    <Text style={[styles.ratingText, { color: theme.readColor }]}>
                      {Number(item.rating || 0).toFixed(1)}
                    </Text>
                  </View>
                </View>

                {/* Views */}
                {(item.views ?? 0) > 0 && (
                  <Text style={[styles.views, { color: theme.readColor }]}>
                    👁  {item.views} views
                  </Text>
                )}

                {/* Buy button */}
                <Pressable
                  style={styles.buyBtn}
                  onPress={() => onProductClicked(item.id)}
                >
                  <Text style={styles.buyBtnText}>Buy Now</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FeaturedProductSection;

const styles = StyleSheet.create({
  container: { width: "100%", gap: 14 },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleAccent: { width: 4, height: 20, borderRadius: 2 },
  title: { fontWeight: "800", letterSpacing: -0.3 },
  viewAll: { fontSize: 13, fontWeight: "700" },

  // Horizontal list
  list: { gap: 12, paddingBottom: 4 },

  // Card
  card: {
    width: 175,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#008100",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  // Image
  imgWrapper: { position: "relative" },
  img: { width: "100%", height: 165, borderTopLeftRadius: 16, borderTopRightRadius: 16 },

  rankBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontSize: 14 },

  conditionPill: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  conditionText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },

  wishlistBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Body
  cardBody: { padding: 11, gap: 5 },
  cardName: { fontSize: 13, fontWeight: "700" },

  locationRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  locationPin: { fontSize: 10 },
  locationText: { fontSize: 10, flex: 1 },

  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: 14, fontWeight: "800" },
  ratingPill: { flexDirection: "row", alignItems: "center", gap: 2 },
  star: { color: "#EAB308", fontSize: 11 },
  ratingText: { fontSize: 11, fontWeight: "600" },

  views: { fontSize: 10 },

  buyBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 9,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 2,
  },
  buyBtnText: { color: "#fff", fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
});