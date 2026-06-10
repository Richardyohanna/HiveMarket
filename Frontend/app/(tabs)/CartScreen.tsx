import { Colors, FontSize } from '@/constants/theme';
import { increaseProductViewApi } from '@/src/api/productApi';
import { useCartProduct } from '@/src/hooks/useCartProduct';
import { useProducts } from '@/src/hooks/useProducts';
import { userStore } from '@/src/store/userStore';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";
const DANGER       = "#ef4444";
const AMBER        = "#EAB308";
const DARK_BG      = "#0d150d";
const DARK_CARD    = "#111e11";
const DARK_BORDER  = "rgba(0,180,0,0.18)";

// ─── Swipeable cart card ──────────────────────────────────────────────────────
const CartCard = React.memo(({
  item, isDark, theme, onPress, onBuy, onRemove, removing,
}: {
  item: any;
  isDark: boolean;
  theme: typeof Colors.light;
  onPress:  () => void;
  onBuy:    () => void;
  onRemove: () => void;
  removing: boolean;
}) => {
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animate out when removing
  useEffect(() => {
    if (removing) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0,    duration: 280, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.92, duration: 280, useNativeDriver: true }),
      ]).start();
    }
  }, [removing]);

  const isNew = item.pQuality === "NEW";

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <View style={[cc.card, {
        backgroundColor: isDark ? DARK_CARD : "#fff",
        borderColor:     isDark ? DARK_BORDER : "#e4f0e4",
      }]}>

        {/* ── Image ── */}
        <Pressable onPress={onPress} style={cc.imgWrap}>
          <Image
            source={item.pImage
              ? { uri: item.pImage }
              : require("../../assets/images/ProductDetail/Hero Image.png")}
            style={cc.img}
            resizeMode="cover"
          />
          {/* Condition badge */}
          {item.pQuality && (
            <View style={[cc.condBadge, { backgroundColor: isNew ? PRIMARY : "#b45309" }]}>
              <Text style={cc.condText}>{item.pQuality}</Text>
            </View>
          )}
          {/* Tap-to-view overlay */}
          <View style={cc.viewOverlay}>
            <Text style={cc.viewOverlayText}>View Details →</Text>
          </View>
        </Pressable>

        {/* ── Body ── */}
        <View style={cc.body}>

          {/* Top row: name + remove */}
          <View style={cc.topRow}>
            <Text numberOfLines={2} style={[cc.name, { color: theme.text }]}>
              {item.pName}
            </Text>
            <Pressable
              onPress={onRemove}
              disabled={removing}
              hitSlop={10}
              style={[cc.removeBtn, { backgroundColor: isDark ? "#2a0a0a" : "#fff0f0" }]}
            >
              <Text style={cc.removeIcon}>{removing ? "…" : "🗑️"}</Text>
            </Pressable>
          </View>

          {/* Location */}
          {item.location ? (
            <Text numberOfLines={1} style={[cc.location, { color: theme.readColor }]}>
              📍 {item.location}
            </Text>
          ) : null}

          {/* Seller */}
          {item.sellerName ? (
            <View style={cc.sellerRow}>
              <View style={[cc.sellerDot, { backgroundColor: PRIMARY }]} />
              <Text style={[cc.seller, { color: theme.readColor }]}>{item.sellerName}</Text>
            </View>
          ) : null}

          {/* Rating + views */}
          <View style={cc.metaRow}>
            <Text style={cc.star}>★</Text>
            <Text style={[cc.metaText, { color: theme.readColor }]}>
              {Number(item.rating || 0).toFixed(1)}
            </Text>
            {(item.views ?? 0) > 0 && (
              <Text style={[cc.metaText, { color: theme.readColor }]}>
                · {item.views} views
              </Text>
            )}
            {(item.purchases ?? 0) > 0 && (
              <Text style={[cc.metaText, { color: theme.readColor }]}>
                · {item.purchases} sold
              </Text>
            )}
          </View>

          {/* Divider */}
          <View style={[cc.divider, { backgroundColor: isDark ? "#1a2a1a" : "#f0faf0" }]} />

          {/* Price + Buy */}
          <View style={cc.footer}>
            <View>
              <Text style={[cc.priceLabel, { color: theme.readColor }]}>Price</Text>
              <Text style={[cc.price, { color: PRIMARY }]}>
                ₦{Number(item.pAmount).toLocaleString()}
              </Text>
            </View>
            <Pressable
              onPress={onBuy}
              style={cc.buyBtn}
            >
              <View style={cc.buyShimmer} />
              <Text style={cc.buyText}>Buy Now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

const cc = StyleSheet.create({
  card: {
    borderRadius: 20, borderWidth: 1, overflow: "hidden",
    shadowColor: PRIMARY, shadowOpacity: 0.08,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  imgWrap:   { position: "relative" },
  img:       { width: "100%", height: 190 },
  condBadge: {
    position: "absolute", top: 10, left: 10,
    paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20,
  },
  condText:      { color: "#fff", fontSize: 9, fontWeight: "800" },
  viewOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 6, alignItems: "center",
  },
  viewOverlayText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  body:      { padding: 14, gap: 7 },
  topRow:    { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  name:      { flex: 1, fontSize: 15, fontWeight: "800", lineHeight: 20 },
  removeBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  removeIcon:{ fontSize: 15 },

  location:  { fontSize: 11 },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sellerDot: { width: 5, height: 5, borderRadius: 3 },
  seller:    { fontSize: 11 },

  metaRow:   { flexDirection: "row", alignItems: "center", gap: 4 },
  star:      { color: AMBER, fontSize: 12 },
  metaText:  { fontSize: 11 },

  divider: { height: 1 },
  footer:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", marginBottom: 1 },
  price:   { fontSize: 20, fontWeight: "900" },

  buyBtn: {
    backgroundColor: PRIMARY, paddingHorizontal: 22, paddingVertical: 11,
    borderRadius: 14, overflow: "hidden", position: "relative",
  },
  buyShimmer: {
    position: "absolute", top: 0, left: "10%", width: "30%", height: "100%",
    backgroundColor: "rgba(255,255,255,0.1)", transform: [{ skewX: "-20deg" }],
  },
  buyText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});

// ─── Suggested mini card ──────────────────────────────────────────────────────
const SugCard = React.memo(({
  item, isDark, theme, onPress,
}: {
  item: any; isDark: boolean; theme: typeof Colors.light; onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[sg.card, {
      backgroundColor: isDark ? DARK_CARD : "#fff",
      borderColor: isDark ? DARK_BORDER : "#e4f0e4",
    }]}
  >
    <Image
      source={item.pImage ? { uri: item.pImage } : require("../../assets/images/ProductDetail/Hero Image.png")}
      style={sg.img}
      resizeMode="cover"
    />
    <View style={sg.info}>
      <Text numberOfLines={1} style={[sg.name, { color: theme.text }]}>{item.pName}</Text>
      <Text style={[sg.price, { color: PRIMARY }]}>₦{Number(item.pAmount).toLocaleString()}</Text>
      <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
        <Text style={{ color: AMBER, fontSize: 10 }}>★</Text>
        <Text style={[{ fontSize: 10 }, { color: theme.readColor }]}>
          {Number(item.rating || 0).toFixed(1)}
        </Text>
      </View>
    </View>
  </Pressable>
));

const sg = StyleSheet.create({
  card:  { width: 140, height: 180,borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  img:   { width: "100%", height: 110 },
  info:  { padding: 9, gap: 3 },
  name:  { fontSize: 11, fontWeight: "700" },
  price: { fontSize: 13, fontWeight: "900" },
});

// ─── Main CartScreen ──────────────────────────────────────────────────────────
const CartScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;
  const fs     = FontSize.size;

  const userId = userStore((state) => state.id);
 // const user = userStore.getState();

  //const userId = user.id;

  console.log("Yay! hello i am the userId at the cart screen" , userId);
  //const { email , id: userId} = userStore();
 // const userEmail  = Array.isArray(email) ? email[0] : email;

 
  const {
    products: cartItems,
    loading,
    error,
    fetchCartProduct: fetchCart,
    addToCart,
    removeFromCart,
    isInCart,
    totalValue,
  } = useCartProduct(userId);

  const { products: recentListings} = useProducts(userId);

 // const recentListings = useProductStore((s) => s.recentListings);

  // Track which IDs are mid-removal for animation
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [refreshing,  setRefreshing]  = useState(false);

  useEffect(() => {

   if (userId) fetchCart();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCart();
    setRefreshing(false);
  }, [userId]);

  // Suggested: items NOT in cart
  const suggested = useMemo(
    () => recentListings
      .filter((p) => !isInCart(p.id))
      .sort((a, b) => (b.ratingData.AverageRating ?? 0) - (a.ratingData.AverageRating ?? 0))
      .slice(0, 8),
    [recentListings, cartItems]
  );

  /*
  const totalValue = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.pAmount ?? 0), 0),
    [cartItems]
  ); */

  const onProductClicked = useCallback((id: string) => {
    increaseProductViewApi(id);
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id } });
  }, []);

  const onBuyNow = useCallback((id: string) => {
    router.push({ pathname: "/TransactionScreen/TransactionScreen", params: { id } });
  }, []);

  const onRemove = useCallback((productId: string, sellerEmail: string, displayId: string) => {
    Alert.alert(
      "Remove Item",
      "Remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingIds((prev) => new Set(prev).add(displayId));
            // Small delay so animation plays before item disappears
            await new Promise((r) => setTimeout(r, 300));
            await removeFromCart(userId, productId, sellerEmail);
            setRemovingIds((prev) => {
              const next = new Set(prev);
              next.delete(displayId);
              return next;
            });
          },
        },
      ]
    );
  }, [userId, removeFromCart]);

  const onClearAll = useCallback(() => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            // Remove each item sequentially

                      
            for (const item of cartItems) {

              if(item.sellerEmail == null) return;
              
              await removeFromCart(userId, item.id, item.sellerEmail);
            }
          },
        },
      ]
    );
  }, [cartItems, userId, removeFromCart]);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!loading && cartItems.length === 0) {
    return (
      <View style={[s.root, { backgroundColor: isDark ? DARK_BG : "#f4faf4" }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        {/* Background rings */}
        <View style={s.bgPattern} pointerEvents="none">
          {[...Array(4)].map((_, i) => (
            <View key={i} style={[s.ring, {
              width:  100 + i * 90, height: 100 + i * 90,
              borderRadius: 50 + i * 45,
              borderColor: isDark
                ? `rgba(0,180,0,${0.04 - i * 0.007})`
                : `rgba(0,129,0,${0.05 - i * 0.009})`,
            }]} />
          ))}
        </View>

        <View style={[s.header, { borderColor: isDark ? DARK_BORDER : "#e4f0e4" }]}>
          <Text style={[s.headerTitle, { color: theme.text }]}>My Cart</Text>
          <Text style={[s.headerSub, { color: theme.readColor }]}>0 items</Text>
        </View>

        <View style={s.emptyWrap}>
          <View style={[s.emptyCircle, { backgroundColor: isDark ? "#0a2a0a" : PRIMARY_SOFT }]}>
            <Text style={{ fontSize: 48 }}>🛒</Text>
          </View>
          <Text style={[s.emptyTitle, { color: isDark ? "#e0ffe0" : "#0d1a0d" }]}>
            Your cart is empty
          </Text>
          <Text style={[s.emptySub, { color: theme.readColor }]}>
            Add items you love from the marketplace and find them here when you're ready to buy.
          </Text>
          <Pressable
            style={s.browseBtn}
            onPress={() => router.push("/(tabs)/HomeScreen")}
          >
            <View style={s.btnShimmer} />
            <Text style={s.browseBtnText}>Browse Products</Text>
          </Pressable>
        </View>

        {/* Suggested */}
        {suggested.length > 0 && (
          <View style={{ flex: 1 }}>
            <View style={s.sectionHeader}>
              <View style={[s.accent, { backgroundColor: PRIMARY }]} />
              <Text style={[s.sectionTitle, { color: theme.text }]}>Popular on Campus</Text>
            </View>
            <FlatList
              data={suggested}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `sug_${item.id}`}
              contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingBottom: 20 }}
              renderItem={({ item }) => (
                <SugCard item={item} isDark={isDark} theme={theme} onPress={() => onProductClicked(item.id)} />
              )}
            />
          </View>
        )}
      </View>
    );
  }

  // ── Cart with items ───────────────────────────────────────────────────────
  return (
    <View style={[s.root, { backgroundColor: isDark ? DARK_BG : "#f4faf4" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Background rings */}
      <View style={s.bgPattern} pointerEvents="none">
        {[...Array(4)].map((_, i) => (
          <View key={i} style={[s.ring, {
            width:  100 + i * 90, height: 100 + i * 90,
            borderRadius: 50 + i * 45,
            borderColor: isDark
              ? `rgba(0,180,0,${0.04 - i * 0.007})`
              : `rgba(0,129,0,${0.05 - i * 0.009})`,
          }]} />
        ))}
      </View>

      {/* Header */}
      <View style={[s.header, { borderColor: isDark ? DARK_BORDER : "#e4f0e4" }]}>
        <View>
          <Text style={[s.headerTitle, { color: theme.text }]}>My Cart</Text>
          <Text style={[s.headerSub, { color: theme.readColor }]}>
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <Pressable onPress={onClearAll} style={s.clearBtn}>
          <Text style={s.clearBtnText}>🗑 Clear All</Text>
        </Pressable>
      </View>

      {/* Total value banner */}
      <View style={[s.totalBanner, {
        backgroundColor: isDark ? "#0a1f0a" : PRIMARY_SOFT,
        borderColor: isDark ? DARK_BORDER : "#c8e6c9",
      }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={[s.totalIconWrap, { backgroundColor: isDark ? "#0d2a0d" : "#fff" }]}>
            <Text style={{ fontSize: 18 }}>💰</Text>
          </View>
          <View>
            <Text style={[s.totalLabel, { color: theme.readColor }]}>Total cart value</Text>
            <Text style={[s.totalValue, { color: PRIMARY }]}>
              ₦{totalValue.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={[s.itemCountBadge, { backgroundColor: isDark ? "#1a3a1a" : "#fff" }]}>
          <Text style={[s.itemCountText, { color: PRIMARY }]}>
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Cart list */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => `cart_${item.id}`}
        contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
        renderItem={({ item }) => (
          <CartCard
            item={item}
            isDark={isDark}
            theme={theme}
            removing={removingIds.has(String(item.id))}
            onPress={() => onProductClicked(String(item.id))}
            onBuy={() => onBuyNow(String(item.id))}
            onRemove={() => {if(item.sellerEmail == null) return; onRemove(String(item.id), item.sellerEmail, String(item.id))}}
          />
        )}

        // Suggested at the bottom inside the same scroll
        ListFooterComponent={
          suggested.length > 0 ? (
            <View style={{ marginTop: 10 }}>
              <View style={s.sectionHeader}>
                <View style={[s.accent, { backgroundColor: PRIMARY }]} />
                <Text style={[s.sectionTitle, { color: theme.text }]}>You Might Also Like</Text>
              </View>
              <FlatList
                data={suggested}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => `sug_${item.id}`}
                contentContainerStyle={{ gap: 10, paddingBottom: 8 }}
                renderItem={({ item }) => (
                  <SugCard item={item} isDark={isDark} theme={theme} onPress={() => onProductClicked(item.id)} />
                )}
              />
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default CartScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 , paddingBottom: 50},

  bgPattern: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderWidth: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  headerSub:   { fontSize: 12, marginTop: 2 },
  clearBtn:    {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, backgroundColor: "rgba(239,68,68,0.08)",
  },
  clearBtnText: { color: DANGER, fontSize: 12, fontWeight: "700" },

  totalBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 14, marginTop: 12, marginBottom: 2,
    borderRadius: 16, borderWidth: 1, padding: 14,
  },
  totalIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  totalLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  totalValue: { fontSize: 22, fontWeight: "900", marginTop: 1 },
  itemCountBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  itemCountText:  { fontSize: 12, fontWeight: "800" },

  // Empty state
  emptyWrap:  { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  emptyCircle:{ width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 22, fontWeight: "900", textAlign: "center" },
  emptySub:   { fontSize: 13, textAlign: "center", lineHeight: 21 },
  browseBtn:  {
    backgroundColor: PRIMARY, paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 16, marginTop: 6, overflow: "hidden", position: "relative",
  },
  btnShimmer: {
    position: "absolute", top: 0, left: "10%", width: "30%", height: "100%",
    backgroundColor: "rgba(255,255,255,0.1)", transform: [{ skewX: "-20deg" }],
  },
  browseBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, marginBottom: 12, marginTop: 4,
  },
  accent:       { width: 4, height: 18, borderRadius: 2 },
  sectionTitle: { fontSize: 15, fontWeight: "800" },
});