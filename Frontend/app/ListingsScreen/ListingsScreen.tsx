/**
 * ListingsScreen — shown in the bottom tab for non-seller users.
 *
 * ─── WHY THE HOOK ERROR HAPPENED ────────────────────────────────────────────
 * `userStore` is a custom Zustand store with middleware (devtools / persist).
 * When called as a hook — `const { email } = userStore()` — it internally
 * calls useSyncExternalStore + useCallback + useCallback (from middleware).
 * On first render those 3 extra hook slots are allocated. On the next render
 * (triggered by a tab switch or store update) the middleware may fire in a
 * different order, so React sees a different hook at slot 14, crashing.
 *
 * ─── THE FIX ────────────────────────────────────────────────────────────────
 * NEVER call `userStore()` as a hook inside a component.
 * Use `userStore.getState()` — this is a plain synchronous function, not a
 * hook, so it adds ZERO entries to React's hook registry.
 * To re-render when the user store changes, subscribe manually in a useEffect
 * and increment a counter with useState.
 *
 * ─── RULE TO REMEMBER ───────────────────────────────────────────────────────
 * Any Zustand store created with middleware (devtools, persist, immer) must be
 * read with `.getState()` + `.subscribe()` if the hook version causes count
 * instability. The selector form `userStore(s => s.field)` is also unsafe if
 * the middleware adds conditional internal hooks.
 */

import { Colors } from '@/constants/theme';
import { increaseProductViewApi } from '@/src/api/productApi';
import { useProductStore } from '@/src/store/productStore';
import { userStore } from '@/src/store/userStore';
import { RecentListingItem } from '@/src/types/products';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

type FilterKey = "all" | "active" | "pending" | "sold";

// ── Listing card — no hooks ───────────────────────────────────────────────────
const ListingCard = React.memo(({
  item, isDark, theme, onPress, onEdit,
}: {
  item: RecentListingItem;
  isDark: boolean;
  theme: any;
  onPress: () => void;
  onEdit: () => void;
}) => {
  const isSold    = item.pStatus === "SOLD";
  const isPending = item.status === "PENDING";
  const isFailed  = item.status === "FAILED";

  const pillColor = isSold ? "#ef4444"
    : isPending ? "#f59e0b"
    : isFailed  ? "#6b7280"
    : item.pQuality === "NEW" ? PRIMARY
    : "#b45309";

  const pillLabel = isSold ? "SOLD"
    : isPending ? "UPLOADING"
    : isFailed  ? "FAILED"
    : item.pQuality;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, {
        backgroundColor: theme.sectionBackground,
        borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
        opacity: isSold || isFailed ? 0.72 : 1,
      }]}
    >
      <Image
        source={
          item.pImage
            ? { uri: item.pImage }
            : require("../../assets/images/HomeScreen/nike.png")
        }
        style={styles.cardImg}
        resizeMode="cover"
      />

      <View style={[styles.statusPill, { backgroundColor: pillColor }]}>
        <Text style={styles.statusText}>{pillLabel}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={[styles.cardName, { color: theme.text }]}>
          {item.pName}
        </Text>
        <Text style={[styles.cardPrice, { color: PRIMARY }]}>
          ₦{Number(item.pAmount).toLocaleString()}
        </Text>
        <Text style={[styles.cardStat, { color: isDark ? "#64748b" : "#94a3b8" }]}>
          👁 {item.views ?? 0}  ·  🛒 {item.purchases ?? 0}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.cardTime, { color: isDark ? "#475569" : "#94a3b8" }]}>
            {item.pTimePosted}
          </Text>
          {!isSold && !isFailed && (
            <Pressable
              onPress={(e) => { e.stopPropagation?.(); onEdit(); }}
              style={[styles.editBtn, { borderColor: PRIMARY }]}
            >
              <Text style={[styles.editText, { color: PRIMARY }]}>Edit</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
});

// ── Main ──────────────────────────────────────────────────────────────────────
const ListingsScreen = () => {
  // ── H1: colour scheme — always first ─────────────────────────────────────
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;

  // ── H2, H3, H4: product store — standard Zustand, safe as hooks ──────────
  const recentListings     = useProductStore((s) => s.recentListings);   // H2
  const loading            = useProductStore((s) => s.loading);           // H3
  const loadRecentListings = useProductStore((s) => s.loadRecentListings); // H4

  // ── H5: filter state ──────────────────────────────────────────────────────
  const [filter, setFilter] = useState<FilterKey>("all");                 // H5

  // ── H6: re-render counter (triggered by userStore subscription) ───────────
  // userStore is NOT called as a hook — getState() is a plain function call.
  const [, forceUpdate] = useState(0);                                    // H6

  // ── H7: subscribe to userStore externally — zero hook slots consumed ──────
  useEffect(() => {                                                        // H7
    const unsub = (userStore as any).subscribe(() => {
      forceUpdate((n) => n + 1);
    });
    return unsub;
  }, []);

  // ── H8: load listings on mount ────────────────────────────────────────────
  useEffect(() => {                                                        // H8
    if (recentListings.length === 0) loadRecentListings();
  }, []);

  // ── H9, H10: stable callbacks ─────────────────────────────────────────────
  const onProductPress = useCallback((id: string) => {                    // H9
    increaseProductViewApi(id);
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id } });
  }, []);

  const onEdit = useCallback((id: string) => {                            // H10
    router.push({ pathname: "/SellScreen/SellScreen", params: { editId: id } });
  }, []);

  // ── Read user data via getState() — NOT a hook ────────────────────────────
  // Called after all hooks so it can never affect the hook registry.
  const email = userStore.getState().email;

  // ── H11, H12, H13: derived memo values ───────────────────────────────────
  const myListings = useMemo<RecentListingItem[]>(                        // H11
    () => email ? recentListings.filter((p) => p.sellerEmail === email) : [],
    [recentListings, email]
  );

  const counts = useMemo(() => ({                                         // H12
    all:     myListings.length,
    active:  myListings.filter((p) => p.pStatus !== "SOLD" && p.status === "READY").length,
    pending: myListings.filter((p) => p.status === "PENDING" || p.status === "FAILED").length,
    sold:    myListings.filter((p) => p.pStatus === "SOLD").length,
  }), [myListings]);

  const displayed = useMemo(() => {                                        // H13
    switch (filter) {
      case "active":  return myListings.filter((p) => p.pStatus !== "SOLD" && p.status === "READY");
      case "pending": return myListings.filter((p) => p.status === "PENDING" || p.status === "FAILED");
      case "sold":    return myListings.filter((p) => p.pStatus === "SOLD");
      default:        return myListings;
    }
  }, [myListings, filter]);

  // ── No more hooks below this line ─────────────────────────────────────────

  const totalViews     = myListings.reduce((a, p) => a + (p.views     ?? 0), 0);
  const totalPurchases = myListings.reduce((a, p) => a + (p.purchases ?? 0), 0);

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all",     label: "All"     },
    { key: "active",  label: "Active"  },
    { key: "pending", label: "Pending" },
    { key: "sold",    label: "Sold"    },
  ];

  const emptyInfo = {
    sold:    { emoji: "🎉", title: "No sales yet",       sub: "Your sold items will appear here"              },
    pending: { emoji: "⏳", title: "Nothing uploading",  sub: "Items being uploaded appear here"              },
    active:  { emoji: "📦", title: "No active listings", sub: "List something to reach students"              },
    all:     { emoji: "📦", title: "No listings yet",    sub: "List your first item and reach campus students" },
  };
  const empty = emptyInfo[filter];

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <StatusBar
        backgroundColor={theme.screenBackground}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      {/* ── Header ── */}
      <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>My Listings</Text>
          <Text style={[styles.headerSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>
            {myListings.length} item{myListings.length !== 1 ? "s" : ""} on campus
          </Text>
        </View>
        <Pressable
          style={[styles.listBtn, { backgroundColor: PRIMARY }]}
          onPress={() => router.push("/SellScreen/SellScreen")}
        >
          <Text style={styles.listBtnText}>+ List</Text>
        </Pressable>
      </View>

      {/* ── Stats strip — compact horizontal row ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsRow}
      >
        {([
          { label: "Listed",    value: myListings.length, color: PRIMARY,   bg: isDark ? "#0a1f0a" : PRIMARY_SOFT, border: isDark ? PRIMARY_DARK : "#c8e6c9" },
          { label: "Active",    value: counts.active,     color: "#16a34a", bg: isDark ? "#0a1f0a" : "#f0fdf4",   border: isDark ? PRIMARY_DARK : "#bbf7d0" },
          { label: "Sold",      value: counts.sold,       color: "#ef4444", bg: isDark ? "#1a0a0a" : "#fef2f2",   border: isDark ? "#3a1a1a"   : "#fecaca"  },
          { label: "Views",     value: totalViews,        color: "#3b82f6", bg: isDark ? "#0f1a2a" : "#eff6ff",   border: isDark ? "#1e3a5f"   : "#bfdbfe"  },
          { label: "Purchases", value: totalPurchases,    color: "#8b5cf6", bg: isDark ? "#1a1030" : "#f5f3ff",   border: isDark ? "#3a1a5f"   : "#ddd6fe"  },
        ] as const).map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg, borderColor: s.border }]}>
            <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: isDark ? "#64748b" : "#94a3b8" }]}>{s.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* ── Filter tabs ── */}
      <View style={[styles.filterRow, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterTab,
                active && { borderBottomColor: PRIMARY, borderBottomWidth: 2.5 },
              ]}
            >
              <Text style={[styles.filterLabel, {
                color: active ? PRIMARY : (isDark ? "#64748b" : "#94a3b8"),
                fontWeight: active ? "800" : "500",
              }]}>
                {f.label}
              </Text>
              {counts[f.key] > 0 && (
                <View style={[styles.badge, {
                  backgroundColor: active ? PRIMARY : (isDark ? "#334155" : "#e2e8f0"),
                }]}>
                  <Text style={[styles.badgeText, {
                    color: active ? "#fff" : (isDark ? "#94a3b8" : "#64748b"),
                  }]}>
                    {counts[f.key]}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* ── Content ── */}
      {displayed.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>{empty.emoji}</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>{empty.title}</Text>
          <Text style={[styles.emptySub, { color: isDark ? "#64748b" : "#94a3b8" }]}>
            {empty.sub}
          </Text>
          {(filter === "all" || filter === "active") && (
            <Pressable
              style={[styles.emptyBtn, { backgroundColor: PRIMARY }]}
              onPress={() => router.push("/SellScreen/SellScreen")}
            >
              <Text style={styles.emptyBtnText}>+ List Something</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadRecentListings}
              tintColor={PRIMARY}
              colors={[PRIMARY]}
            />
          }
          renderItem={({ item }) => (
            <ListingCard
              item={item}
              isDark={isDark}
              theme={theme}
              onPress={() => onProductPress(item.id)}
              onEdit={() => onEdit(item.id)}
            />
          )}
        />
      )}
    </View>
  );
};

export default ListingsScreen;

const styles = StyleSheet.create({
  screen: { flex: 1,  flexDirection: "column", justifyContent: "flex-start"},

  header: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.4 },
  headerSub:   { fontSize: 12, marginTop: 1 },
  listBtn:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  listBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // ── Stat strip — compact: fixed small height, horizontal numbers ──────────
  statsRow: { gap: 8, paddingHorizontal: 14, paddingVertical: 10,  height: 70, },
  statCard: {
    flexDirection: "row",       // ← number + label side-by-side (was column)
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,         // reduced from 12
    borderRadius: 12,           // slightly tighter
    borderWidth: 1,
    minWidth: 0,                // let content size it
   
  },
  statNum:   { fontSize: 15, fontWeight: "900" },           // was 20
  statLabel: { fontSize: 11, fontWeight: "600" },

  filterRow: {
    flexDirection: "row", borderBottomWidth: 1,
    marginHorizontal: 14, marginBottom: 4,
    
  },
  filterTab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 10,
    borderBottomWidth: 2.5, borderBottomColor: "transparent",
  },
  filterLabel: { fontSize: 12 },
  badge:       { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  badgeText:   { fontSize: 9, fontWeight: "800" },

  grid:    { padding: 14, gap: 10, paddingBottom: 110 },
  gridRow: { gap: 10, justifyContent: "space-between" },

  card: {
    flex: 1, maxWidth: "49%", borderRadius: 16, borderWidth: 1, overflow: "hidden",
    shadowColor: PRIMARY, shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardImg:    { width: "100%", height: 130 },
  statusPill: {
    position: "absolute", top: 8, left: 8,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  statusText:  { color: "#fff", fontSize: 8, fontWeight: "800" },
  cardBody:    { padding: 10, gap: 3 },
  cardName:    { fontSize: 12, fontWeight: "600" },
  cardPrice:   { fontSize: 13, fontWeight: "900" },
  cardStat:    { fontSize: 10 },
  cardFooter:  {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginTop: 5,
  },
  cardTime:  { fontSize: 9 },
  editBtn:   { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  editText:  { fontSize: 10, fontWeight: "700" },

  empty:        { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 30 },
  emptyEmoji:   { fontSize: 52 },
  emptyTitle:   { fontSize: 18, fontWeight: "800" },
  emptySub:     { fontSize: 13, textAlign: "center", lineHeight: 19 },
  emptyBtn:     { marginTop: 8, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});