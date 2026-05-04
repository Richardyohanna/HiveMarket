import { Colors, FontSize } from '@/constants/theme';
import { increaseProductViewApi } from "@/src/api/productApi";
import { useProductStore } from '@/src/store/productStore';
import { RecentListingItem } from "@/src/types/products";
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';

const { width } = Dimensions.get("window");
const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";
const CARD_WIDTH   = (width - 36) / 2; // 10 padding each side + 16 gap

// ─── Tab type ─────────────────────────────────────────────────────────────────
type Tab = "listings" | "sold";

// ─── Small product card ───────────────────────────────────────────────────────
const MiniCard = React.memo(({
  item, isDark, theme, onPress,
}: {
  item: RecentListingItem;
  isDark: boolean;
  theme: typeof Colors.light;
  onPress: () => void;
}) => {
  const isNew = item.pQuality === "NEW";
  return (
    <Pressable onPress={onPress} style={[styles.miniCard, {
      backgroundColor: theme.sectionBackground,
      borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
    }]}>
      {/* Image */}
      <View style={styles.miniImgWrapper}>
        <Image
          source={item.pImage ? { uri: item.pImage } : require("../../assets/images/HomeScreen/nike.png")}
          style={styles.miniImg}
          resizeMode="cover"
        />
        {item.pQuality && (
          <View style={[styles.conditionPill, { backgroundColor: isNew ? PRIMARY : "#b45309" }]}>
            <Text style={styles.conditionText}>{item.pQuality}</Text>
          </View>
        )}


        {/* Sold overlay
        {item.status === "SOLD" && (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldOverlayText}>SOLD</Text>
          </View>
        )}  */}
      </View>

      {/* Info */}
      <View style={styles.miniBody}>
        <Text numberOfLines={1} style={[styles.miniName, { color: theme.text }]}>
          {item.pName}
        </Text>
        <View style={styles.miniFooter}>
          <Text style={[styles.miniPrice, { color: PRIMARY }]}>
            ₦{Number(item.pAmount).toLocaleString()}
          </Text>
          <View style={styles.miniRating}>
            <Text style={styles.miniStar}>★</Text>
            <Text style={[styles.miniRatingVal, { color: theme.readColor }]}>
              {Number(item.rating || 0).toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

// ─── Stat box ─────────────────────────────────────────────────────────────────
const StatBox = ({
  label, value, icon, isDark, theme,
}: {
  label: string; value: string | number; icon: string;
  isDark: boolean; theme: typeof Colors.light;
}) => (
  <View style={[styles.statBox, { backgroundColor: theme.sectionBackground }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.readColor }]}>{label}</Text>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const IndividualProfileScreen = () => {
  const scheme  = useColorScheme();
  const isDark  = scheme === "dark";
  const theme   = isDark ? Colors.dark : Colors.light;
  const fs      = FontSize.size;

  const { id } = useLocalSearchParams<{ id: string }>();

  const recentListings = useProductStore((s) => s.recentListings);

  const [activeTab, setActiveTab] = useState<Tab>("listings");

  // Find the product to get seller info
  const product = useMemo(
    () => recentListings.find((item) => String(item.id) === String(id)),
    [recentListings, id]
  );

  // All products by this seller
  const sellerEmail = product?.sellerEmail ?? "";

  const sellerListings = useMemo(
    () => recentListings.filter(
      (item) => item.sellerEmail === sellerEmail //&& item.status !== "SOLD"
    ),
    [recentListings, sellerEmail]
  );

  const sellerSold = useMemo(
    () => recentListings.filter(
      (item) => item.sellerEmail === sellerEmail //&& item.status === "SOLD"
    ),
    [recentListings, sellerEmail]
  );

  const displayedItems = activeTab === "listings" ? sellerListings : sellerSold;

  const onProductClicked = useCallback((productId: string) => {
    increaseProductViewApi(productId);
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id: productId } });
  }, []);

  const onBack = useCallback(() => router.back(), []);

  const onChat = useCallback(() => {
    router.push({
      pathname: "/ChatScreen/ChatScreen",
      params: { sellerEmail, sellerName: product?.sellerName },
    });
  }, [sellerEmail, product?.sellerName]);

  // ── Empty state ──────────────────────────────────────────────────────────
  const EmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>
        {activeTab === "listings" ? "🛍️" : "📦"}
      </Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {activeTab === "listings" ? "No active listings" : "No sold items"}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.readColor }]}>
        {activeTab === "listings"
          ? "This seller has no active listings right now"
          : "This seller hasn't sold anything yet"}
      </Text>
    </View>
  ), [activeTab, theme]);

  const renderItem = useCallback(({ item }: { item: RecentListingItem }) => (
    <MiniCard
      item={item}
      isDark={isDark}
      theme={theme}
      onPress={() => onProductClicked(item.id)}
    />
  ), [isDark, theme, onProductClicked]);

  if (!product) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: theme.screenBackground }]}>
        <Text style={[styles.loadingText, { color: theme.readColor }]}>Loading profile...</Text>
      </View>
    );
  }

  const avatarSource = product.sellerProfilePicture
    ? { uri: product.sellerProfilePicture }
    : require("@/assets/images/CreateAccount/user.png");

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      {/* ── Top nav bar ── */}
      <View style={[styles.navbar, { borderColor: isDark ? "#1a2a1a" : "#e4f0e4" }]}>
        <Pressable onPress={onBack} style={styles.navBtn} hitSlop={12}>
          <Image
            source={require("../../assets/images/ProductDetail/back.png")}
            style={[styles.navIcon, { tintColor: theme.text }]}
          />
        </Pressable>
        <Text style={[styles.navTitle, { color: theme.text }]}>Seller Profile</Text>
        <Pressable style={styles.navBtn} hitSlop={12}>
          <Image
            source={require("../../assets/images/Profile/share.png")}
            style={[styles.navIcon, { tintColor: theme.text }]}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Profile hero ── */}
        <View style={[styles.heroCard, {
          backgroundColor: isDark ? "#0d200d" : PRIMARY_SOFT,
          borderColor: isDark ? PRIMARY_DARK : "#c8e6c9",
        }]}>
          {/* Green accent strip at top */}
          <View style={[styles.heroAccent, { backgroundColor: PRIMARY }]} />

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image source={avatarSource} style={styles.avatar} />
            {/* Online dot */}
            <View style={[styles.onlineDot, { backgroundColor: PRIMARY, borderColor: theme.screenBackground }]} />
          </View>

          {/* Name + badges */}
          <Text style={[styles.sellerName, { color: theme.text }]}>
            {product.sellerName || "Unknown Seller"}
          </Text>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: isDark ? PRIMARY_DARK : "#c8e6c9" }]}>
              <Text style={[styles.badgeText, { color: PRIMARY }]}>✓ Verified</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: isDark ? "#1a1a2e" : "#fff3e0" }]}>
              <Text style={[styles.badgeText, { color: "#b45309" }]}>⭐ Top Seller</Text>
            </View>
          </View>

          <Text style={[styles.sellerEmail, { color: theme.readColor }]}>
            {product.sellerEmail || "No email available"}
          </Text>

          {product.location ? (
            <View style={styles.locationRow}>
              <Text style={[styles.locationPin, { color: PRIMARY }]}>📍</Text>
              <Text style={[styles.locationText, { color: theme.readColor }]}>
                {product.location}
              </Text>
            </View>
          ) : null}

          <Text style={[styles.memberSince, { color: theme.readColor }]}>
            Member since 2023
          </Text>
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <StatBox
            label="Listings" value={sellerListings.length}
            icon="🛍️" isDark={isDark} theme={theme}
          />
          <StatBox
            label="Sold" value={sellerSold.length}
            icon="📦" isDark={isDark} theme={theme}
          />
          <StatBox
            label="Rating" value="4.9"
            icon="⭐" isDark={isDark} theme={theme}
          />
        </View>

        {/* ── Chat button ── */}
        <Pressable style={[styles.chatBtn, { backgroundColor: PRIMARY }]} onPress={onChat}>
          <Image
            source={require("../../assets/images/ProductDetail/chat.png")}
            style={styles.chatIcon}
          />
          <Text style={styles.chatBtnText}>Chat with Seller</Text>
        </Pressable>

        {/* ── Tabs ── */}
        <View style={[styles.tabRow, {
          backgroundColor: theme.sectionBackground,
          borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
        }]}>
          {(["listings", "sold"] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, isActive && { borderBottomColor: PRIMARY, borderBottomWidth: 2 }]}
              >
                <Text style={[
                  styles.tabText,
                  { color: isActive ? PRIMARY : theme.readColor },
                  isActive && { fontWeight: "800" },
                ]}>
                  {tab === "listings" ? `Active (${sellerListings.length})` : `Sold (${sellerSold.length})`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Product grid ── */}
        {displayedItems.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={displayedItems}
            keyExtractor={(item) => `${item.id}_${activeTab}`}
            renderItem={renderItem}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default IndividualProfileScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:      { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  loadingScreen: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText:   { fontSize: 14, fontWeight: "500" },

  // Navbar
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navBtn:   { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  navIcon:  { width: 20, height: 20, resizeMode: "contain" },
  navTitle: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },

  // Hero card
  heroCard: {
    marginHorizontal: 14,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    paddingBottom: 24,
    overflow: "hidden",
  },
  heroAccent: { width: "100%", height: 6, marginBottom: 0 },
  avatarWrapper: {
    position: "relative",
    marginTop: 20,
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: PRIMARY,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  sellerName: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3, marginBottom: 8 },
  badgeRow:   { flexDirection: "row", gap: 8, marginBottom: 8 },
  badge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:  { fontSize: 11, fontWeight: "700" },
  sellerEmail:{ fontSize: 12, marginBottom: 6 },
  locationRow:{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  locationPin:{ fontSize: 12 },
  locationText:{ fontSize: 12 },
  memberSince:{ fontSize: 11, marginTop: 2 },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 14,
    marginTop: 14,
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statIcon:  { fontSize: 20 },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },

  // Chat button
  chatBtn: {
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  chatIcon:    { width: 20, height: 20, resizeMode: "contain", tintColor: "#fff" },
  chatBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },

  // Tabs
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 14,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  tab:     { flex: 1, paddingVertical: 13, alignItems: "center" },
  tabText: { fontSize: 13 },

  // Grid
  grid:    { paddingHorizontal: 14, paddingTop: 12, gap: 12 },
  gridRow: { gap: 12, justifyContent: "space-between" },

  // Mini card
  miniCard: {
    width: CARD_WIDTH,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: PRIMARY,
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  miniImgWrapper: { position: "relative" },
  miniImg:        { width: "100%", height: 140 },
  conditionPill:  {
    position: "absolute", bottom: 6, left: 6,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  conditionText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },

  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldOverlayText: { color: "#fff", fontSize: 14, fontWeight: "900", letterSpacing: 2 },

  miniBody: { padding: 9, gap: 5 },
  miniName: { fontSize: 12, fontWeight: "700" },
  miniFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  miniPrice:  { fontSize: 13, fontWeight: "800" },
  miniRating: { flexDirection: "row", alignItems: "center", gap: 2 },
  miniStar:   { color: "#EAB308", fontSize: 11 },
  miniRatingVal: { fontSize: 11, fontWeight: "600" },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    gap: 8,
    marginHorizontal: 14,
  },
  emptyEmoji:    { fontSize: 40 },
  emptyTitle:    { fontSize: 16, fontWeight: "700" },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 18 },
});