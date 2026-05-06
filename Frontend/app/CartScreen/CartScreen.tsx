/**
 * CartScreen — Favourites · Purchased · Sold
 *
 * Data sources:
 *  - Favourites: local Zustand slice (cartStore) — persisted client-side
 *  - Purchased:  recentListings filtered by pStatus === "SOLD" where buyerEmail === email
 *                (you'll need to expose buyerEmail on RecentListingItem once your backend supports it)
 *  - Sold:       recentListings where sellerEmail === email && pStatus === "SOLD"
 *
 * NOTE: The payment flow is already wired via initializePayment / verifyPayment.
 * This screen does NOT trigger payment — it just shows the history.
 *
 * A thin cartStore is defined inline here. Move it to src/store/cartStore.ts once stable.
 */

import { Colors } from '@/constants/theme';
import { increaseProductViewApi } from '@/src/api/productApi';
import { useProductStore } from '@/src/store/productStore';
import { userStore } from '@/src/store/userStore';
import { RecentListingItem } from '@/src/types/products';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { create } from 'zustand';

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

// ── Tiny cart store (move to src/store/cartStore.ts) ─────────────────────────
interface CartStore {
  favourites: RecentListingItem[];
  addFavourite: (item: RecentListingItem) => void;
  removeFavourite: (id: string) => void;
  isFavourite: (id: string) => boolean;
}

export const useCartStore = create<CartStore>((set, get) => ({
  favourites: [],

  addFavourite: (item) =>
    set((s) => ({
      favourites: s.favourites.find((f) => f.id === item.id)
        ? s.favourites
        : [item, ...s.favourites],
    })),

  removeFavourite: (id) =>
    set((s) => ({ favourites: s.favourites.filter((f) => f.id !== id) })),

  isFavourite: (id) => get().favourites.some((f) => f.id === id),
}));

// ── Types ─────────────────────────────────────────────────────────────────────
type TabKey = "favourites" | "purchased" | "sold";

// ── Product card (reusable mini card) ─────────────────────────────────────────
const MiniCard = React.memo(({
  item, isDark, theme, onPress, rightSlot,
}: {
  item: RecentListingItem;
  isDark: boolean;
  theme: any;
  onPress: () => void;
  rightSlot?: React.ReactNode;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.miniCard, {
      backgroundColor: theme.sectionBackground ?? (isDark ? "#1e293b" : "#fff"),
      borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
    }]}
  >
    <Image
      source={item.pImage ? { uri: item.pImage } : require("../../assets/images/HomeScreen/nike.png")}
      style={styles.miniImg}
      resizeMode="cover"
    />
    <View style={styles.miniInfo}>
      <Text numberOfLines={1} style={[styles.miniName, { color: theme.text }]}>{item.pName}</Text>
      <Text style={[styles.miniPrice, { color: PRIMARY }]}>
        ₦{Number(item.pAmount).toLocaleString()}
      </Text>
      <Text style={[styles.miniMeta, { color: isDark ? "#64748b" : "#94a3b8" }]}>
        {item.category}  ·  {item.pTimePosted}
      </Text>
      {item.location && (
        <Text style={[styles.miniMeta, { color: isDark ? "#475569" : "#94a3b8" }]}>
          📍 {item.location}
        </Text>
      )}
    </View>
    {rightSlot && (
      <View style={styles.miniRight}>{rightSlot}</View>
    )}
  </Pressable>
));

// ── Heart button ──────────────────────────────────────────────────────────────
const HeartBtn = ({ item }: { item: RecentListingItem }) => {
  const removeFavourite = useCartStore((s) => s.removeFavourite);
  return (
    <Pressable
      onPress={() => removeFavourite(item.id)}
      style={[styles.heartBtn, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}
    >
      <Text style={{ fontSize: 16 }}>💔</Text>
    </Pressable>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({
  emoji, title, sub, action, onAction,
}: {
  emoji: string; title: string; sub: string; action?: string; onAction?: () => void;
}) => (
  <View style={styles.empty}>
    <Text style={styles.emptyEmoji}>{emoji}</Text>
    <Text style={[styles.emptyTitle]}>{title}</Text>
    <Text style={[styles.emptySub]}>{sub}</Text>
    {action && onAction && (
      <Pressable style={[styles.emptyBtn, { backgroundColor: PRIMARY }]} onPress={onAction}>
        <Text style={styles.emptyBtnText}>{action}</Text>
      </Pressable>
    )}
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const CartScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;

  const { email } = userStore();
  const recentListings = useProductStore((s) => s.recentListings);
  const favourites     = useCartStore((s) => s.favourites);

  const [tab, setTab] = useState<TabKey>("favourites");

  // Items this user BOUGHT (backend needs to expose buyerEmail — fallback to empty until it does)
  const purchased = useMemo<RecentListingItem[]>(() =>
    recentListings.filter(
      (p) => (p as any).buyerEmail === email && p.pStatus === "SOLD"
    ),
    [recentListings, email]
  );

  // Items this user SOLD
  const sold = useMemo<RecentListingItem[]>(() =>
    recentListings.filter(
      (p) => p.sellerEmail === email && p.pStatus === "SOLD"
    ),
    [recentListings, email]
  );

  const onProductPress = useCallback((id: string) => {
    increaseProductViewApi(id);
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id } });
  }, []);

  const totalSpent = purchased.reduce((a, p) => a + Number(p.pAmount), 0);
  const totalEarned = sold.reduce((a, p) => a + Number(p.pAmount), 0);

  const TABS: { key: TabKey; label: string; emoji: string; count: number }[] = [
    { key: "favourites", label: "Saved",     emoji: "❤️",  count: favourites.length },
    { key: "purchased",  label: "Purchased", emoji: "🛒",  count: purchased.length },
    { key: "sold",       label: "Sold",      emoji: "💸",  count: sold.length },
  ];

  const renderContent = () => {
    if (tab === "favourites") {
      return favourites.length === 0 ? (
        <EmptyState
          emoji="❤️"
          title="No saved items"
          sub="Tap the heart on any product to save it here for later"
          action="Browse Items"
          onAction={() => router.push("/CategoryScreen/CategoryScreen")}
        />
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MiniCard
              item={item}
              isDark={isDark}
              theme={theme}
              onPress={() => onProductPress(item.id)}
              rightSlot={<HeartBtn item={item} />}
            />
          )}
        />
      );
    }

    if (tab === "purchased") {
      return purchased.length === 0 ? (
        <EmptyState
          emoji="🛒"
          title="No purchases yet"
          sub="Items you buy will appear here after payment is confirmed"
          action="Shop Now"
          onAction={() => router.push("/CategoryScreen/CategoryScreen")}
        />
      ) : (
        <>
          {/* Spend summary */}
          <View style={[styles.summaryCard, {
            backgroundColor: isDark ? "#0f1a2a" : "#eff6ff",
            borderColor: isDark ? "#1e3a5f" : "#bfdbfe",
          }]}>
            <Text style={[styles.summaryLabel, { color: isDark ? "#93c5fd" : "#3b82f6" }]}>
              Total Spent
            </Text>
            <Text style={[styles.summaryAmount, { color: "#3b82f6" }]}>
              ₦{totalSpent.toLocaleString()}
            </Text>
            <Text style={[styles.summarySub, { color: isDark ? "#64748b" : "#94a3b8" }]}>
              across {purchased.length} purchase{purchased.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <FlatList
            data={purchased}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <MiniCard
                item={item}
                isDark={isDark}
                theme={theme}
                onPress={() => onProductPress(item.id)}
                rightSlot={
                  <View style={[styles.soldBadge, { backgroundColor: "#dcfce7" }]}>
                    <Text style={[styles.soldBadgeText, { color: "#16a34a" }]}>Bought</Text>
                  </View>
                }
              />
            )}
          />
        </>
      );
    }

    // sold tab
    return sold.length === 0 ? (
      <EmptyState
        emoji="💸"
        title="Nothing sold yet"
        sub="Items you've sold to other students will appear here"
        action="List an Item"
        onAction={() => router.push("/SellScreen/SellScreen")}
      />
    ) : (
      <>
        {/* Earnings summary */}
        <View style={[styles.summaryCard, {
          backgroundColor: isDark ? "#0a1f0a" : PRIMARY_SOFT,
          borderColor: isDark ? PRIMARY_DARK : "#c8e6c9",
        }]}>
          <Text style={[styles.summaryLabel, { color: PRIMARY }]}>Total Earned</Text>
          <Text style={[styles.summaryAmount, { color: PRIMARY }]}>
            ₦{totalEarned.toLocaleString()}
          </Text>
          <Text style={[styles.summarySub, { color: isDark ? "#64748b" : "#94a3b8" }]}>
            from {sold.length} sale{sold.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <FlatList
          data={sold}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MiniCard
              item={item}
              isDark={isDark}
              theme={theme}
              onPress={() => onProductPress(item.id)}
              rightSlot={
                <View style={[styles.soldBadge, { backgroundColor: "#fef2f2" }]}>
                  <Text style={[styles.soldBadgeText, { color: "#ef4444" }]}>Sold</Text>
                </View>
              }
            />
          )}
        />
      </>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <StatusBar
        backgroundColor={theme.screenBackground}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      {/* ── Header ── */}
      <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: isDark ? "#94a3b8" : "#475569" }]}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>My Activity</Text>
          <Text style={[styles.headerSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>
            Saved · Purchases · Sales
          </Text>
        </View>
        <View style={[styles.beeBadge, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}>
          <Text style={{ fontSize: 18 }}>🐝</Text>
        </View>
      </View>

      {/* ── Summary strip ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsRow}
      >
        {[
          { label: "Saved",     value: favourites.length,   color: "#ef4444", bg: isDark ? "#1a0a0a" : "#fef2f2",   border: isDark ? "#3a1a1a" : "#fecaca"  },
          { label: "Purchased", value: purchased.length,    color: "#3b82f6", bg: isDark ? "#0f1a2a" : "#eff6ff",   border: isDark ? "#1e3a5f" : "#bfdbfe"  },
          { label: "Sold",      value: sold.length,         color: PRIMARY,   bg: isDark ? "#0a1f0a" : PRIMARY_SOFT, border: isDark ? PRIMARY_DARK : "#c8e6c9" },
          { label: "Spent ₦",  value: `${(totalSpent/1000).toFixed(1)}k`,  color: "#8b5cf6", bg: isDark ? "#1a1030" : "#f5f3ff", border: isDark ? "#3a1a5f" : "#ddd6fe" },
          { label: "Earned ₦", value: `${(totalEarned/1000).toFixed(1)}k`, color: "#16a34a", bg: isDark ? "#0a1f0a" : "#f0fdf4", border: isDark ? PRIMARY_DARK : "#bbf7d0" },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg, borderColor: s.border }]}>
            <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: isDark ? "#64748b" : "#94a3b8" }]}>{s.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* ── Tabs ── */}
      <View style={[styles.tabRow, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tabBtn, active && { borderBottomColor: PRIMARY, borderBottomWidth: 2.5 }]}
            >
              <Text style={styles.tabEmoji}>{t.emoji}</Text>
              <Text style={[styles.tabLabel, { color: active ? PRIMARY : (isDark ? "#64748b" : "#94a3b8") }]}>
                {t.label}
              </Text>
              {t.count > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: active ? PRIMARY : (isDark ? "#334155" : "#e2e8f0") }]}>
                  <Text style={[styles.tabBadgeText, { color: active ? "#fff" : (isDark ? "#94a3b8" : "#64748b") }]}>
                    {t.count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* ── Tab content ── */}
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn:     { padding: 4 },
  backArrow:   { fontSize: 22, fontWeight: "300" },
  headerTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.4 },
  headerSub:   { fontSize: 12, marginTop: 1 },
  beeBadge:    { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },

  // Stats
  statsRow: { gap: 10, paddingHorizontal: 14, paddingVertical: 14 },
  statCard: {
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 16, borderWidth: 1, alignItems: "center", minWidth: 72,
  },
  statNum:   { fontSize: 18, fontWeight: "900" },
  statLabel: { fontSize: 10, fontWeight: "600", marginTop: 2 },

  // Tabs
  tabRow: {
    flexDirection: "row", borderBottomWidth: 1,
    marginHorizontal: 14, marginBottom: 4,
  },
  tabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 4, paddingVertical: 10,
    borderBottomWidth: 2.5, borderBottomColor: "transparent",
  },
  tabEmoji:     { fontSize: 14 },
  tabLabel:     { fontSize: 12, fontWeight: "700" },
  tabBadge:     { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  tabBadgeText: { fontSize: 9, fontWeight: "800" },

  // List
  list: { padding: 14, gap: 10, paddingBottom: 110 },

  // Mini card (horizontal layout)
  miniCard: {
    flexDirection: "row",
    borderRadius: 16, borderWidth: 1,
    overflow: "hidden",
    shadowColor: PRIMARY, shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  miniImg:   { width: 90, height: 90 },
  miniInfo:  { flex: 1, padding: 12, gap: 2, justifyContent: "center" },
  miniName:  { fontSize: 13, fontWeight: "700" },
  miniPrice: { fontSize: 14, fontWeight: "900" },
  miniMeta:  { fontSize: 10 },
  miniRight: { justifyContent: "center", paddingRight: 12 },

  // Heart button
  heartBtn: {
    width: 36, height: 36, borderRadius: 12, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },

  // Sold / bought badge
  soldBadge:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  soldBadgeText: { fontSize: 11, fontWeight: "800" },

  // Summary card
  summaryCard: {
    marginHorizontal: 14, marginTop: 10, marginBottom: 4,
    borderRadius: 16, borderWidth: 1,
    padding: 16, alignItems: "center",
  },
  summaryLabel:  { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  summaryAmount: { fontSize: 28, fontWeight: "900" },
  summarySub:    { fontSize: 11, marginTop: 2 },

  // Empty
  empty:        { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 30 },
  emptyEmoji:   { fontSize: 52 },
  emptyTitle:   { fontSize: 18, fontWeight: "800", color: "#1e293b" },
  emptySub:     { fontSize: 13, textAlign: "center", lineHeight: 19, color: "#94a3b8" },
  emptyBtn:     { marginTop: 8, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});