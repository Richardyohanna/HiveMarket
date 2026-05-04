import { Colors, FontSize } from "@/constants/theme";
import { increaseProductViewApi } from "@/src/api/productApi";
import ScrollWithRefresh from "@/hooks/ScrollWithRefresh";
import { useProductStore } from "@/src/store/productStore";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

// ─── Related mini card ────────────────────────────────────────────────────────
const RelatedCard = React.memo(({
  item, isDark, theme, onPress,
}: {
  item: any; isDark: boolean; theme: typeof Colors.light; onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.relatedCard, {
      backgroundColor: theme.sectionBackground,
      borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
    }]}
  >
    <Image
      source={item.pImage ? { uri: item.pImage } : require("../../assets/images/HomeScreen/nike.png")}
      style={styles.relatedImg}
      resizeMode="cover"
    />
    {item.pQuality && (
      <View style={[styles.relatedBadge, {
        backgroundColor: item.pQuality === "NEW" ? PRIMARY : "#b45309",
      }]}>
        <Text style={styles.relatedBadgeText}>{item.pQuality}</Text>
      </View>
    )}
    <View style={styles.relatedBody}>
      <Text numberOfLines={1} style={[styles.relatedName, { color: theme.text }]}>
        {item.pName}
      </Text>
      <View style={styles.relatedMeta}>
        <Text style={[styles.relatedPrice, { color: PRIMARY }]}>
          ₦{Number(item.pAmount).toLocaleString()}
        </Text>
        <Text style={styles.relatedStar}>★ {Number(item.rating || 0).toFixed(1)}</Text>
      </View>
    </View>
  </Pressable>
));

// ─── Main ─────────────────────────────────────────────────────────────────────
const ProductDetail = () => {
  // ── All hooks first ───────────────────────────────────────────────────────
  const scheme  = useColorScheme();
  const isDark  = scheme === "dark";
  const theme   = isDark ? Colors.dark : Colors.light;
  const fs      = FontSize.size;

  const { id } = useLocalSearchParams<{ id: string }>();

  const recentListings     = useProductStore((s) => s.recentListings);
  const loadRecentListings = useProductStore((s) => s.loadRecentListings);
  const loading            = useProductStore((s) => s.loading);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const scrollRef      = useRef<ScrollView>(null);
  const modalScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (recentListings.length === 0) loadRecentListings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const product = useMemo(
    () => recentListings.find((item) => String(item.id) === String(id)),
    [recentListings, id]
  );

  // Related: same category, excluding current
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCat = recentListings.filter(
      (item) => item.id !== product.id // && item.category === product.category
    );
    return sameCat.length >= 2
      ? sameCat.slice(0, 10)
      : recentListings.filter((item) => item.id !== product.id).slice(0, 10);
  }, [recentListings, product]);

  const onBack = useCallback(() => router.back(), []);

  const onBuy = useCallback(() => {
    router.push({ pathname: "/TransactionScreen/TransactionScreen", params: { id } });
  }, [id]);

  const onProfileClicked = useCallback(() => {
    router.push({ pathname: "/ProfileScreen/IndividualProfileScreen", params: { id } });
  }, [id]);

  const onRelatedClicked = useCallback((relatedId: string) => {
    increaseProductViewApi(relatedId);
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id: relatedId } });
  }, []);

  // ── Safe early returns — all hooks declared above ─────────────────────────
  if (loading && !product) {
    return (
      <View style={[styles.stateScreen, { backgroundColor: theme.screenBackground }]}>
        <Text style={[styles.stateText, { color: theme.readColor }]}>Loading...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.stateScreen, { backgroundColor: theme.screenBackground }]}>
        <Text style={[styles.stateText, { color: theme.readColor }]}>Product not found</Text>
      </View>
    );
  }

  const images = product.imageUrls?.length > 0 ? product.imageUrls : ["fallback"];

  return (
    <View style={{ flex: 1, backgroundColor: theme.screenBackground }}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerBtn}>
          <Image
            source={require("../../assets/images/ProductDetail/back.png")}
            style={[styles.headerIcon, { tintColor: theme.text }]}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: fs.md }]}>
          Product Detail
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollWithRefresh onRefresh={loadRecentListings}>
        {/* ── Image carousel ── */}
        <View style={styles.carouselWrapper}>
          <ScrollView
            ref={scrollRef}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setModalVisible(true);
                  setCurrentIndex(index);
                  setTimeout(() => {
                    modalScrollRef.current?.scrollTo({ x: index * width, animated: false });
                  }, 100);
                }}
              >
                <Image
                  source={img === "fallback"
                    ? require("../../assets/images/ProductDetail/Hero Image.png")
                    : { uri: img }}
                  style={{ width, height: 380 }}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>

          {/* Counter */}
          <View style={styles.counterPill}>
            <Text style={styles.counterText}>{currentIndex + 1} / {images.length}</Text>
          </View>

          {/* Dots */}
          <View style={styles.dotsRow}>
            {images.map((_, i) => (
              <View key={i} style={[
                styles.dot,
                i === currentIndex
                  ? { width: 16, backgroundColor: "#fff" }
                  : { width: 6, backgroundColor: "rgba(255,255,255,0.5)" },
              ]} />
            ))}
          </View>
        </View>

        {/* ── Details ── */}
        <View style={styles.details}>
          {/* Price + condition */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: PRIMARY }]}>
              ₦{Number(product.pAmount).toLocaleString()}
            </Text>
            {product.pQuality && (
              <View style={[styles.condBadge, {
                backgroundColor: product.pQuality === "NEW" ? PRIMARY_SOFT : "#fff3e0",
              }]}>
                <Text style={[styles.condText, {
                  color: product.pQuality === "NEW" ? PRIMARY : "#b45309",
                }]}>
                  {product.pQuality}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.productName, { color: theme.text }]}>{product.pName}</Text>

          {/* Rating + views */}
          <View style={styles.metaRow}>
            <Text style={styles.star}>★</Text>
            <Text style={[styles.metaText, { color: theme.readColor }]}>
              {Number(product.rating || 0).toFixed(1)}
            </Text>
            {(product.views ?? 0) > 0 && (
              <Text style={[styles.metaText, { color: theme.readColor }]}>
                · {product.views} views
              </Text>
            )}
            {(product.purchases ?? 0) > 0 && (
              <Text style={[styles.metaText, { color: theme.readColor }]}>
                · {product.purchases} sold
              </Text>
            )}
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: isDark ? "#94A3B8" : "#64748B" }]}>
            {product.pDetail}
          </Text>

          {/* Location */}
          {product.location && (
            <View style={[styles.locationCard, {
              backgroundColor: theme.sectionBackground,
              borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
            }]}>
              <Text style={{ fontSize: 16 }}>📍</Text>
              <Text style={[styles.locationText, { color: theme.text }]}>{product.location}</Text>
            </View>
          )}

          {/* ── Seller card ── */}
          <Text style={[styles.sectionLabel, { color: theme.readColor }]}>SELLER INFORMATION</Text>

          <Pressable
            onPress={onProfileClicked}
            style={[styles.sellerCard, {
              backgroundColor: theme.sectionBackground,
              borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
            }]}
          >
            <Image
              source={product.sellerProfilePicture
                ? { uri: product.sellerProfilePicture }
                : require("../../assets/images/ProductDetail/profilePicture.png")}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerInfo}>
              <Text style={[styles.sellerName, { color: theme.text }]}>
                {product.sellerName || "Unknown Seller"}
              </Text>
              <Text style={[styles.sellerEmail, { color: theme.readColor }]}>
                {product.sellerEmail || ""}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.star}>★</Text>
                <Text style={[styles.metaText, { color: theme.readColor }]}>4.9 · Top Seller</Text>
              </View>
            </View>
            <View style={[styles.profileArrow, { backgroundColor: isDark ? "#0f1f0f" : PRIMARY_SOFT }]}>
              <Text style={[styles.arrowText, { color: PRIMARY }]}>›</Text>
            </View>
          </Pressable>

          {/* ── Related products ── */}
          {relatedProducts.length > 0 && (
            <>
              <View style={styles.relatedHeader}>
                <View style={[styles.relatedAccent, { backgroundColor: PRIMARY }]} />
                <Text style={[styles.relatedTitle, { color: theme.text }]}>You May Also Like</Text>
              </View>

              <FlatList
                data={relatedProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => `rel_${item.id}`}
                contentContainerStyle={styles.relatedList}
                renderItem={({ item }) => (
                  <RelatedCard
                    item={item}
                    isDark={isDark}
                    theme={theme}
                    onPress={() => onRelatedClicked(item.id)}
                  />
                )}
              />
            </>
          )}

          {/* ── Action buttons ── */}
          <View style={styles.actionRow}>
            <Pressable style={[styles.chatBtn, {
              borderColor: PRIMARY,
              backgroundColor: isDark ? "#0f1f0f" : PRIMARY_SOFT,
            }]}>
              <Image
                source={require("../../assets/images/ProductDetail/chat.png")}
                style={[styles.actionIcon, { tintColor: PRIMARY }]}
              />
              <Text style={[styles.chatBtnText, { color: PRIMARY }]}>Chat</Text>
            </Pressable>

            <Pressable onPress={onBuy} style={[styles.buyBtn, { backgroundColor: PRIMARY }]}>
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </Pressable>
          </View>
        </View>
      </ScrollWithRefresh>

      {/* ── Fullscreen modal ── */}
      <Modal visible={modalVisible} transparent={false} animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <Pressable
            onPress={() => setModalVisible(false)}
            style={styles.modalClose}
            hitSlop={16}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </Pressable>
          <ScrollView
            ref={modalScrollRef}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <Image
                key={index}
                source={img === "fallback"
                  ? require("../../assets/images/ProductDetail/Hero Image.png")
                  : { uri: img }}
                style={{ width, height }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          <View style={styles.modalCounter}>
            <Text style={{ color: "#fff", fontSize: 13 }}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  stateScreen: { flex: 1, alignItems: "center", justifyContent: "center" },
  stateText:   { fontSize: 14, fontWeight: "500" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerBtn:   { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerIcon:  { width: 20, height: 20, resizeMode: "contain" },
  headerTitle: { fontWeight: "700" },

  carouselWrapper: { position: "relative" },
  counterPill: {
    position: "absolute", top: 14, right: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  counterText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  dotsRow: {
    position: "absolute", bottom: 12, alignSelf: "center",
    flexDirection: "row", gap: 5, alignItems: "center",
  },
  dot: { height: 6, borderRadius: 3 },

  details: { padding: 16, gap: 12 },

  priceRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price:      { fontSize: 24, fontWeight: "900" },
  condBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  condText:   { fontSize: 11, fontWeight: "800" },
  productName:{ fontSize: 18, fontWeight: "700", lineHeight: 24 },

  metaRow:    { flexDirection: "row", alignItems: "center", gap: 4 },
  star:       { color: "#EAB308", fontSize: 13 },
  metaText:   { fontSize: 12, fontWeight: "500" },

  description: { fontSize: 14, lineHeight: 21 },

  locationCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  locationText: { fontSize: 13, fontWeight: "500", flex: 1 },

  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 4 },

  sellerCard: {
    flexDirection: "row", alignItems: "center",
    padding: 12, borderRadius: 16, borderWidth: 1, gap: 12,
  },
  sellerAvatar:  { width: 52, height: 52, borderRadius: 26 },
  sellerInfo:    { flex: 1, gap: 3 },
  sellerName:    { fontSize: 14, fontWeight: "700" },
  sellerEmail:   { fontSize: 11 },
  profileArrow:  { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  arrowText:     { fontSize: 22, fontWeight: "700", marginTop: -2 },

  // Related
  relatedHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  relatedAccent: { width: 4, height: 18, borderRadius: 2 },
  relatedTitle:  { fontSize: 15, fontWeight: "700" },
  relatedList:   { gap: 10, paddingBottom: 4 },
  relatedCard: {
    width: 148, borderRadius: 14, borderWidth: 1, overflow: "hidden",
    shadowColor: PRIMARY, shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  relatedImg:       { width: "100%", height: 120 },
  relatedBadge:     { position: "absolute", top: 6, left: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  relatedBadgeText: { color: "#fff", fontSize: 8, fontWeight: "800" },
  relatedBody:  { padding: 8, gap: 4 },
  relatedName:  { fontSize: 11, fontWeight: "600" },
  relatedMeta:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  relatedPrice: { fontSize: 12, fontWeight: "800" },
  relatedStar:  { fontSize: 10, color: "#EAB308", fontWeight: "700" },

  actionRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  chatBtn: {
    width: 110, height: 52, borderWidth: 2, borderRadius: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  actionIcon:  { width: 18, height: 18, resizeMode: "contain" },
  chatBtnText: { fontSize: 14, fontWeight: "700" },
  buyBtn: {
    flex: 1, height: 52, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  buyBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  modalClose:      { position: "absolute", top: 44, right: 20, zIndex: 10, padding: 8 },
  modalCloseText:  { color: "#fff", fontSize: 20, fontWeight: "700" },
  modalCounter:    { position: "absolute", bottom: 32, alignSelf: "center" },
});