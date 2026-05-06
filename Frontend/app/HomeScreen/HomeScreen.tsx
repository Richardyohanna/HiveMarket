import { Colors } from '@/constants/theme';
import ScrollWithRefresh from '@/hooks/ScrollWithRefresh';
import { useProductStore } from '@/src/store/productStore';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import CategorySection from './CategorySection';
import FeaturedProductSection from './FeaturedProductSection';
import HeaderSection from './HeaderSection';
import RecentListingSection from './RecentListingSection';

const PRIMARY = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

// ── Quick filter chips for search ────────────────────────────────────────────
const QUICK_FILTERS = ["All", "Books", "Electronics", "Fashion", "Food", "Services"];

const HomeScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;

  const loading            = useProductStore((s) => s.loading);
  const loadRecentListings = useProductStore((s) => s.loadRecentListings);
  const recentListings     = useProductStore((s) => s.recentListings);

  const [search,         setSearch]         = useState("");
  const [activeFilter,   setActiveFilter]   = useState("All");
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [showResults,    setShowResults]    = useState(false);

  // Animated bar width on focus
  const barAnim = useRef(new Animated.Value(0)).current;
  const onFocus = () => {
    setSearchFocused(true);
    Animated.spring(barAnim, { toValue: 1, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setSearchFocused(false);
    if (!search) Animated.spring(barAnim, { toValue: 0, useNativeDriver: false }).start();
  };

  useEffect(() => {
    if (recentListings.length === 0) loadRecentListings();
  }, []);

  // Navigate to category with search pre-filled
  const handleSearch = useCallback(() => {
    if (!search.trim()) return;
    router.push({ pathname: "/CategoryScreen/CategoryScreen", params: { q: search } });
  }, [search]);

  const onNotificationClicked = useCallback(() => {
    router.push("/NotificationScreen/NotificationScreen");
  }, []);

  const handleRefresh = useCallback(async () => {
    if (loading) return;
    await loadRecentListings();
  }, [loading, loadRecentListings]);

  // Filter suggestion pills from store when searching
  const suggestions = search.trim()
    ? recentListings
        .filter((p) =>
          p.pName?.toLowerCase().includes(search.toLowerCase()) ||
          p.category?.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <StatusBar
        backgroundColor={theme.screenBackground}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <HeaderSection onNotificationClicked={onNotificationClicked} />

      {/* ── Sticky search block ───────────────────────────────────────────── */}
      <View style={styles.searchWrapper}>
        {/* Search bar */}
        <Animated.View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
              borderColor: searchFocused ? PRIMARY : (isDark ? "#334155" : "#E2E8F0"),
              borderWidth: searchFocused ? 1.8 : 1,
              shadowColor: PRIMARY,
              shadowOpacity: searchFocused ? 0.15 : 0,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: searchFocused ? 4 : 0,
            },
          ]}
        >
          <Text style={styles.searchEmoji}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={(t) => { setSearch(t); setShowResults(true); }}
            onFocus={onFocus}
            onBlur={onBlur}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholder="Search textbooks, gadgets, clothes…"
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {search.length > 0 ? (
            <Pressable
              onPress={() => { setSearch(""); setShowResults(false); }}
              style={styles.clearBtn}
            >
              <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}>✕</Text>
            </Pressable>
          ) : (
            <View style={[styles.searchDivider, { backgroundColor: isDark ? "#334155" : "#CBD5E1" }]} />
          )}
          <Pressable
            onPress={handleSearch}
            style={[styles.searchGoBtn, { backgroundColor: search ? PRIMARY : "transparent" }]}
          >
            <Text style={{ color: search ? "#fff" : (isDark ? "#64748b" : "#94a3b8"), fontSize: 11, fontWeight: "700" }}>
              GO
            </Text>
          </Pressable>
        </Animated.View>

        {/* Live suggestion dropdown */}
        {showResults && search.length > 1 && suggestions.length > 0 && (
          <View style={[styles.suggestBox, {
            backgroundColor: isDark ? "#1E293B" : "#fff",
            borderColor: isDark ? "#334155" : "#E2E8F0",
          }]}>
            {suggestions.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.suggestItem, { borderBottomColor: isDark ? "#334155" : "#f1f5f9" }]}
                onPress={() => {
                  router.push({ pathname: "/ProductDetail/ProductDetail", params: { id: item.id } });
                  setShowResults(false);
                  setSearch("");
                }}
              >
                <Text style={{ fontSize: 14 }}>🔍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.suggestName, { color: theme.text }]} numberOfLines={1}>
                    {item.pName}
                  </Text>
                  <Text style={[styles.suggestCat, { color: isDark ? "#64748b" : "#94a3b8" }]}>
                    {item.category} · ₦{Number(item.pAmount).toLocaleString()}
                  </Text>
                </View>
                <Text style={[styles.suggestArrow, { color: PRIMARY }]}>→</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.suggestSeeAll, { borderTopColor: isDark ? "#334155" : "#f1f5f9" }]}
              onPress={handleSearch}
            >
              <Text style={{ color: PRIMARY, fontSize: 13, fontWeight: "700" }}>
                See all results for "{search}" →
              </Text>
            </Pressable>
          </View>
        )}

        {/* Quick-filter chips */}
        <View style={styles.chipRow}>
          {QUICK_FILTERS.map((f) => {
            const active = activeFilter === f;
            return (
              <Pressable
                key={f}
                onPress={() => {
                  setActiveFilter(f);
                  if (f !== "All") {
                    router.push({ pathname: "/CategoryScreen/CategoryScreen", params: { cat: f.toLowerCase() } });
                  }
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? PRIMARY : (isDark ? "#1e293b" : "#F1F5F9"),
                    borderColor: active ? PRIMARY : (isDark ? "#334155" : "#E2E8F0"),
                  },
                ]}
              >
                <Text style={[
                  styles.chipText,
                  { color: active ? "#fff" : (isDark ? "#94a3b8" : "#64748b") },
                ]}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Scrollable content ─────────────────────────────────────────────── */}
      <ScrollWithRefresh
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onRefresh={handleRefresh}
      >
        {/* Banner strip */}
        <View style={[styles.banner, {
          backgroundColor: isDark ? "#0a1f0a" : PRIMARY_SOFT,
          borderColor: isDark ? PRIMARY_DARK : "#c8e6c9",
        }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerEyebrow, { color: PRIMARY }]}>🐝 Campus Marketplace</Text>
            <Text style={[styles.bannerTitle, { color: isDark ? "#e2e8f0" : "#1e293b" }]}>
              Buy & Sell{"\n"}with Students
            </Text>
            <Pressable
              style={[styles.bannerBtn, { backgroundColor: PRIMARY }]}
              onPress={() => router.push("/SellScreen/SellScreen")}
            >
              <Text style={styles.bannerBtnText}>Start Selling →</Text>
            </Pressable>
          </View>
          <Text style={styles.bannerEmoji}>🎓</Text>
        </View>

        <FeaturedProductSection />
        <RecentListingSection />
        <CategorySection />
      </ScrollWithRefresh>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  // ── Search wrapper (sticky above scroll) ────────────────────────────────
  searchWrapper: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    zIndex: 100,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchEmoji:  { fontSize: 16 },
  searchInput:  { flex: 1, fontSize: 14 },
  clearBtn:     { padding: 4 },
  searchDivider:{ width: 1.5, height: 18, marginHorizontal: 2 },
  searchGoBtn:  {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10,
  },

  // suggestion dropdown
  suggestBox: {
    borderRadius: 14, borderWidth: 1,
    marginTop: 6,
    overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  suggestItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1,
  },
  suggestName:   { fontSize: 13, fontWeight: "600" },
  suggestCat:    { fontSize: 11, marginTop: 1 },
  suggestArrow:  { fontSize: 14, fontWeight: "700" },
  suggestSeeAll: {
    paddingHorizontal: 14, paddingVertical: 12,
    borderTopWidth: 1, alignItems: "center",
  },

  // quick filter chips
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    flexWrap: "nowrap",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "600" },

  // ── Scroll ──────────────────────────────────────────────────────────────
  scrollContent: {
    gap: 20,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 40,
  },

  // Banner
  banner: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  bannerEyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 4 },
  bannerTitle:   { fontSize: 22, fontWeight: "900", lineHeight: 27, marginBottom: 14 },
  bannerBtn:     { alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12 },
  bannerBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  bannerEmoji:   { fontSize: 64, marginLeft: 10 },
});