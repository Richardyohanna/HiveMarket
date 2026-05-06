import { Colors, FontSize } from '@/constants/theme';
import { increaseProductViewApi } from '@/src/api/productApi';
import { useProductStore } from '@/src/store/productStore';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from 'react-native';



const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

// ─── Category definitions — HiveMarket student context ───────────────────────
const CATEGORIES = [
  { id: "electronics",  name: "Electronics",       emoji: "📱", color: "#3b82f6", soft: "#eff6ff" },
  { id: "academics",    name: "Books & Academics",  emoji: "📚", color: "#8b5cf6", soft: "#f5f3ff" },
  { id: "fashion",      name: "Fashion",            emoji: "👗", color: "#ec4899", soft: "#fdf2f8" },
  { id: "hostel",       name: "Hostel & Rooms",     emoji: "🏠", color: "#f97316", soft: "#fff7ed" },
  { id: "beauty",       name: "Beauty & Care",      emoji: "💄", color: "#db2777", soft: "#fdf2f8" },
  { id: "food",         name: "Food & Snacks",      emoji: "🍔", color: "#d97706", soft: "#fffbeb" },
  { id: "services",     name: "Services",           emoji: "🛠️", color: "#0891b2", soft: "#ecfeff" },
  { id: "accessories",  name: "Accessories",        emoji: "⌚", color: "#7c3aed", soft: "#f5f3ff" },
  { id: "sport",        name: "Sports & Fitness",   emoji: "⚽", color: "#16a34a", soft: "#f0fdf4" },
  { id: "furniture",    name: "Furniture",          emoji: "🪑", color: "#92400e", soft: "#fef3c7" },
  { id: "vehicle",      name: "Vehicles",           emoji: "🚗", color: "#374151", soft: "#f9fafb" },
  { id: "others",       name: "Others",             emoji: "🎁", color: "#6b7280", soft: "#f9fafb" },
];

const TRENDING = [
  "Calculus Textbook", "iPhone Charger", "Laptop Bag", "Hostel Mattress", "WAEC Past Questions",
];

// ─── Category card ────────────────────────────────────────────────────────────
const CategoryCard = React.memo(({
  cat, isDark, theme, onPress,
}: {
  cat: typeof CATEGORIES[number];
  isDark: boolean;
  theme: typeof Colors.light;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.catCard, {
      backgroundColor: isDark ? "#111d11" : cat.soft,
      borderColor: isDark ? PRIMARY_DARK : cat.color + "30",
    }]}
  >
    <View style={[styles.catIconWrap, {
      backgroundColor: isDark ? cat.color + "22" : cat.color + "18",
    }]}>
      <Text style={styles.catEmoji}>{cat.emoji}</Text>
    </View>
    <Text style={[styles.catName, { color: isDark ? "#e2e8f0" : "#1e293b" }]} numberOfLines={2}>
      {cat.name}
    </Text>
  </Pressable>
));

// ─── Product mini card ────────────────────────────────────────────────────────
const ProductCard = React.memo(({
  item, isDark, theme, onPress,
}: {
  item: any; isDark: boolean; theme: typeof Colors.light; onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.productCard, {
      backgroundColor: theme.sectionBackground,
      borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
    }]}
  >
    <Image
      source={item.pImage ? { uri: item.pImage } : require("../../assets/images/HomeScreen/nike.png")}
      style={styles.productImg}
      resizeMode="cover"
    />
    {item.pQuality && (
      <View style={[styles.qualityPill, {
        backgroundColor: item.pQuality === "NEW" ? PRIMARY : "#b45309",
      }]}>
        <Text style={styles.qualityText}>{item.pQuality}</Text>
      </View>
    )}
    <View style={styles.productInfo}>
      <Text numberOfLines={1} style={[styles.productName, { color: theme.text }]}>{item.pName}</Text>
      <Text style={[styles.productPrice, { color: PRIMARY }]}>₦{Number(item.pAmount).toLocaleString()}</Text>
    </View>
  </Pressable>
));

// ─── Main ─────────────────────────────────────────────────────────────────────
const CategoryScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;
  const fs     = FontSize.size;

  const recentListings = useProductStore((s) => s.recentListings);

  const [search,          setSearch]          = useState("");
  const [selectedCat,     setSelectedCat]     = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter products by selected category and search
  const filteredProducts = useMemo(() => {
    let items = recentListings;
    if (selectedCat) {
      items = items.filter((item) =>
        item.category?.toLowerCase().includes(selectedCat.toLowerCase())
      ); 
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((item) =>
        item.pName?.toLowerCase().includes(q) ||
        item.pDetail?.toLowerCase().includes(q)
      );
    }
    return items.slice(0, 30);
  }, [recentListings, selectedCat, search]);

  const onCatPress = useCallback((catId: string) => {
    setSelectedCat((prev) => (prev === catId ? null : catId));
    setSearch("");
  }, []);

  const onProductPress = useCallback((id: string) => {
    increaseProductViewApi(id);
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id } });
  }, []);

  const selectedCatData = CATEGORIES.find((c) => c.id === selectedCat);

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Explore</Text>
          <Text style={[styles.headerSub, { color: theme.readColor }]}>
            {recentListings.length} items on campus
          </Text>
        </View>
        <Pressable style={[styles.headerSellBtn, { backgroundColor: PRIMARY }]}
          onPress={() => router.push("/SellScreen/SellScreen")}>
          <Text style={styles.headerSellText}>+ Sell</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── Search bar ── */}
        <View style={[styles.searchBar, {
          backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
          borderColor: isSearchFocused ? PRIMARY : (isDark ? "#334155" : "#E2E8F0"),
          borderWidth: isSearchFocused ? 1.5 : 1,
        }]}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={(t) => { setSearch(t); setSelectedCat(null); }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search textbooks, phones, clothes..."
            placeholderTextColor={theme.readColor}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Text style={[styles.clearBtn, { color: theme.readColor }]}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* ── Trending chips (only when no selection) ── */}
        {!selectedCat && !search && (
          <>
            <View style={styles.sectionLabel}>
              <View style={[styles.sectionAccent, { backgroundColor: PRIMARY }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>🔥 Trending on Campus</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
              {TRENDING.map((term) => (
                <Pressable
                  key={term}
                  onPress={() => setSearch(term)}
                  style={[styles.trendingChip, {
                    backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT,
                    borderColor: isDark ? "#2d5a2d" : "#c8e6c9",
                  }]}
                >
                  <Text style={[styles.trendingText, { color: PRIMARY }]}>{term}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Category grid ── */}
        {!search && (
          <>
            <View style={styles.sectionLabel}>
              <View style={[styles.sectionAccent, { backgroundColor: PRIMARY }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Browse Categories</Text>
              {selectedCat && (
                <Pressable onPress={() => setSelectedCat(null)} style={styles.clearCatBtn}>
                  <Text style={[styles.clearCatText, { color: PRIMARY }]}>Clear ✕</Text>
                </Pressable>
              )}
            </View>

            <FlatList
              data={CATEGORIES}
              keyExtractor={(c) => c.id}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.catRow}
              contentContainerStyle={styles.catGrid}
              renderItem={({ item }) => (
                <View style={[styles.catCardWrapper, selectedCat && selectedCat !== item.id && styles.catDimmed]}>
                  <CategoryCard
                    cat={item}
                    isDark={isDark}
                    theme={theme}
                    onPress={() => onCatPress(item.id)}
                  />
                  {selectedCat === item.id && (
                    <View style={[styles.catSelectedBar, { backgroundColor: item.color }]} />
                  )}
                </View>
              )}
            />
          </>
        )}

        {/* ── Results header ── */}
        {(selectedCat || search) && (
          <View style={styles.sectionLabel}>
            <View style={[styles.sectionAccent, { backgroundColor: PRIMARY }]} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {selectedCatData
                ? `${selectedCatData.emoji} ${selectedCatData.name}`
                : `Results for "${search}"`}
            </Text>
            <Text style={[styles.resultCount, { color: theme.readColor }]}>
              {filteredProducts.length} found
            </Text>
          </View>
        )}

        {/* ── Product results ── */}
        {(selectedCat || search) && (
          filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Nothing here yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.readColor }]}>
                Be the first to list in this category
              </Text>
              <Pressable
                style={[styles.emptyAction, { backgroundColor: PRIMARY }]}
                onPress={() => router.push("/SellScreen/SellScreen")}
              >
                <Text style={styles.emptyActionText}>+ Sell an Item</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.productRow}
              contentContainerStyle={styles.productGrid}
              renderItem={({ item }) => (
                <ProductCard
                  item={item} isDark={isDark} theme={theme}
                  onPress={() => onProductPress(item.id)}
                />
              )}
            />
          )
        )}

        {/* ── All categories promo (default view) ── */}
        {!selectedCat && !search && (
          <View style={[styles.promoCard, {
            backgroundColor: isDark ? "#0a1f0a" : PRIMARY_SOFT,
            borderColor: isDark ? PRIMARY_DARK : "#c8e6c9",
          }]}>
            <Text style={styles.promoEmoji}>🐝</Text>
            <Text style={[styles.promoTitle, { color: PRIMARY }]}>HiveMarket</Text>
            <Text style={[styles.promoSubtitle, { color: theme.readColor }]}>
              Your campus marketplace. Buy, sell, and swap with fellow students safely.
            </Text>
            <Pressable
              style={[styles.promoBtn, { backgroundColor: PRIMARY }]}
              onPress={() => router.push("/SellScreen/SellScreen")}
            >
              <Text style={styles.promoBtnText}>Start Selling Today →</Text>
            </Pressable>
          </View>
        )}

        
      </ScrollView>
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1,
  },
  headerTitle:   { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  headerSub:     { fontSize: 12, marginTop: 1 },
  headerSellBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  headerSellText:{ color: "#fff", fontSize: 13, fontWeight: "700" },

  // Search
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 14, marginTop: 14, marginBottom: 4,
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 14 },
  clearBtn: { fontSize: 14, padding: 2 },

  // Section labels
  sectionLabel: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 14, marginTop: 18, marginBottom: 10,
  },
  sectionAccent: { width: 4, height: 18, borderRadius: 2 },
  sectionTitle:  { fontSize: 15, fontWeight: "800", flex: 1 },
  resultCount:   { fontSize: 12, fontWeight: "500" },
  clearCatBtn:   { paddingHorizontal: 8, paddingVertical: 3 },
  clearCatText:  { fontSize: 12, fontWeight: "700" },

  // Trending
  trendingRow:  { gap: 8, paddingHorizontal: 14, paddingBottom: 4 },
  trendingChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  trendingText: { fontSize: 12, fontWeight: "600" },

  // Category grid
  catGrid:        { paddingHorizontal: 14, gap: 10 },
  catRow:         { gap: 10, justifyContent: "space-between" },
  catCardWrapper: { flex: 1, position: "relative" },
  catDimmed:      { opacity: 0.4 },
  catSelectedBar: {
    position: "absolute", bottom: 0, left: 8, right: 8, height: 3, borderRadius: 2,
  },
  catCard: {
    borderRadius: 16, borderWidth: 1,
    padding: 12, alignItems: "center", gap: 8, minHeight: 96,
  },
  catIconWrap: {
    width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center",
  },
  catEmoji: { fontSize: 22 },
  catName:  { fontSize: 11, fontWeight: "600", textAlign: "center", lineHeight: 14 },

  // Product grid
  productGrid: { paddingHorizontal: 14, gap: 10 },
  productRow:  { gap: 10, justifyContent: "space-between" },
  productCard: {
    flex: 1, maxWidth: "49%", borderRadius: 14, borderWidth: 1,
    overflow: "hidden",
    shadowColor: PRIMARY, shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  productImg:  { width: "100%", height: 140 },
  qualityPill: {
    position: "absolute", top: 7, left: 7,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  qualityText: { color: "#fff", fontSize: 8, fontWeight: "800" },
  productInfo: { padding: 9, gap: 4 },
  productName: { fontSize: 12, fontWeight: "600" },
  productPrice:{ fontSize: 13, fontWeight: "900" },

  // Promo
  promoCard: {
    marginHorizontal: 14, marginTop: 20,
    borderRadius: 20, borderWidth: 1,
    padding: 22, alignItems: "center", gap: 8,
  },
  promoEmoji:    { fontSize: 36 },
  promoTitle:    { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  promoSubtitle: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  promoBtn:      { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  promoBtnText:  { color: "#fff", fontSize: 14, fontWeight: "700" },

  // Empty
  emptyState:    { alignItems: "center", paddingTop: 40, paddingHorizontal: 30, gap: 8 },
  emptyEmoji:    { fontSize: 40 },
  emptyTitle:    { fontSize: 17, fontWeight: "800" },
  emptySubtitle: { fontSize: 13, textAlign: "center" },
  emptyAction:   { marginTop: 10, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  emptyActionText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});