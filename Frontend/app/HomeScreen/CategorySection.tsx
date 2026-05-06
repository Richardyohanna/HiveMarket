import { Colors, FontSize } from "@/constants/theme";
import { increaseProductViewApi } from "@/src/api/productApi";
import { useProductStore } from "@/src/store/productStore";
import { RecentListingItem } from "@/src/types/products";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from "react-native";

import { buildBlock, FeedBlock, GridBlockView,  RecentStrip, shuffle } from "../../components/ui/productLayout";
import { BLOCKS_BEFORE_REFETCH , FETCH_COOLDOWN_MS, PRIMARY, PRODUCTS_PER_BLOCK, } from "@/constants/theme";


// ─── Main Component ───────────────────────────────────────────────────────────
const CategorySection = () => {
  // ── ALL hooks first — no early returns before this block ends ────────────
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;
  const fs     = FontSize.size;

  const products           = useProductStore((s) => s.recentListings);
  const storeLoading       = useProductStore((s) => s.loading);
  const loadRecentListings = useProductStore((s) => s.loadRecentListings);

  const [feed,           setFeed]           = useState<FeedBlock[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  // refreshToken is a plain number we increment to signal "a real fetch just completed"
  // Using state (not a ref) so the useEffect that watches it actually re-runs
  const [refreshToken, setRefreshToken] = useState(0);

  const seedRef        = useRef<number[]>([]);
  const offsetRef      = useRef(0);
  const initialisedRef = useRef(false);
  const fetchingRef    = useRef(false);
  const blocksBuiltRef = useRef(0);
  const lastFetchedAt  = useRef(0);
  const productsRef    = useRef<RecentListingItem[]>([]);
  productsRef.current  = products;

  // ── Effect 1: Build initial feed when products first arrive ──────────────
  useEffect(() => {
    if (initialisedRef.current || products.length === 0) return;
    initialisedRef.current = true;

    seedRef.current        = shuffle(Array.from({ length: products.length }, (_, i) => i));
    offsetRef.current      = PRODUCTS_PER_BLOCK;
    blocksBuiltRef.current = 1;

    const [grid, strip] = buildBlock(products, seedRef.current, 0);
    setFeed([grid, strip]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  // ── Effect 2: Rebuild feed after a real server refresh ───────────────────
  // refreshToken increments only inside handleLoadMore after a confirmed fetch,
  // so this only runs when the user has genuinely scrolled far enough to
  // trigger a server call — never on store background updates.
  useEffect(() => {
    if (refreshToken === 0 || products.length === 0) return;

    seedRef.current        = shuffle(Array.from({ length: products.length }, (_, i) => i));
    offsetRef.current      = PRODUCTS_PER_BLOCK;
    blocksBuiltRef.current = 1;

    const [grid, strip] = buildBlock(products, seedRef.current, 0);
    setFeed([grid, strip]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  // ── Append one block from cache — zero network calls ─────────────────────
  const appendLocalBlock = useCallback(() => {
    const fresh  = productsRef.current;
    if (fresh.length === 0) return;

    if (fresh.length > seedRef.current.length) {
      seedRef.current = shuffle(Array.from({ length: fresh.length }, (_, i) => i));
    }

    const offset = offsetRef.current;
    const [grid, strip] = buildBlock(fresh, seedRef.current, offset);
    offsetRef.current      = offset + PRODUCTS_PER_BLOCK;
    blocksBuiltRef.current += 1;
    setFeed((prev) => [...prev, grid, strip]);
  }, []);

  // ── Load more ─────────────────────────────────────────────────────────────
  // Always appends a local block immediately (no spinner, no network).
  // Only hits the server after BLOCKS_BEFORE_REFETCH blocks + cooldown.
  const handleLoadMore = useCallback(async () => {
    if (fetchingRef.current || productsRef.current.length === 0) return;
    fetchingRef.current = true;

    appendLocalBlock();

    const now             = Date.now();
    const cooldownElapsed = now - lastFetchedAt.current > FETCH_COOLDOWN_MS;
    const shouldFetch     = blocksBuiltRef.current >= BLOCKS_BEFORE_REFETCH
                          && cooldownElapsed
                          && !storeLoading;

    if (shouldFetch) {
      setIsFetchingMore(true);
      lastFetchedAt.current  = now;
      blocksBuiltRef.current = 0;

      try {
        await loadRecentListings();
        // Increment state token → triggers Effect 2 to rebuild feed with fresh data
        setRefreshToken((t) => t + 1);
      } catch (_) {
        // Silent — local cache is still usable
      } finally {
        setIsFetchingMore(false);
      }
    }

    setTimeout(() => { fetchingRef.current = false; }, 400);
  }, [storeLoading, loadRecentListings, appendLocalBlock]);

  const onProductClicked = useCallback((id: string) => {
    increaseProductViewApi(id);
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id } });
  }, []);

  const renderBlock = useCallback(({ item }: { item: FeedBlock }) => {
    if (item.type === "recent_strip") {
      return (
        <RecentStrip items={item.items} isDark={isDark} theme={theme} onPress={onProductClicked} />
      );
    }
    return (
      <GridBlockView items={item.items} isDark={isDark} theme={theme} onPress={onProductClicked} />
    );
  }, [isDark, theme, onProductClicked]);

  const ListFooter = useCallback(() => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.loaderBlock}>
        <ActivityIndicator size="small" color={PRIMARY} />
        <Text style={[styles.loaderText, { color: theme.readColor }]}>
          Checking for new products...
        </Text>
      </View>
    );
  }, [isFetchingMore, theme.readColor]);

  // ── Early return is SAFE here — all hooks above are already called ────────
  if (feed.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.titleAccent, { backgroundColor: PRIMARY }]} />
          <Text style={[styles.sectionTitle, { color: theme.text, fontSize: fs.lg }]}>
            Explore Products
          </Text>
        </View>
        <Text style={[styles.sectionCount, { color: PRIMARY }]}>
          {products.length} items
        </Text>
      </View>

      <FlatList
        data={feed}
        keyExtractor={(item) => item.key}
        renderItem={renderBlock}
        ListFooterComponent={ListFooter}
        scrollEnabled={false}
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        extraData={isDark}
        windowSize={21}
        initialNumToRender={feed.length}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={100}
      />
    </View>
  );
};

export default CategorySection;

// ─── Styles ──────────────r─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:       { width: "100%", gap: 14 },
  feedContainer:   { gap: 20 },
  sectionHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleAccent:     { width: 4, height: 20, borderRadius: 2 },
  sectionTitle:    { fontWeight: "800", letterSpacing: -0.3 },
  sectionCount:    { fontSize: 13, fontWeight: "600" },

  gridBlock: { gap: 10 },
  gridRow:   { flexDirection: "row", gap: 10, justifyContent: "space-between" },

  card: {
    flex: 1, maxWidth: "49%", borderRadius: 14, borderWidth: 1, overflow: "hidden",
    shadowColor: PRIMARY, shadowOpacity: 0.07, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  cardImgWrapper: { position: "relative" },
  cardImg:        { width: "100%", height: 155 },
  conditionPill:  { position: "absolute", bottom: 7, left: 7, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  conditionText:  { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  wishlistBtn:    { position: "absolute", top: 7, right: 7, width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  cardBody:       { padding: 9, gap: 4 },
  cardName:       { fontSize: 12, fontWeight: "600", lineHeight: 17 },
  locationRow:    { flexDirection: "row", alignItems: "center", gap: 2 },
  locationPin:    { fontSize: 10 },
  locationText:   { fontSize: 10, flex: 1 },
  cardPrice:      { fontSize: 14, fontWeight: "800" },
  metaRow:        { flexDirection: "row", alignItems: "center", gap: 3 },
  star:           { color: "#EAB308", fontSize: 11 },
  ratingVal:      { fontSize: 11, fontWeight: "600" },
  viewCount:      { fontSize: 10 },
  buyBtn:         { backgroundColor: PRIMARY, borderRadius: 8, paddingVertical: 8, alignItems: "center", marginTop: 2 },
  buyBtnText:     { color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  cardPlaceholder:{ flex: 1, maxWidth: "49%" },

  stripOuter:     { padding: 14, gap: 10, borderRadius: 14 },
  stripHeader:    { flexDirection: "row", alignItems: "center", gap: 8 },
  stripAccent:    { width: 4, height: 17, borderRadius: 2, backgroundColor: PRIMARY },
  stripTitle:     { fontSize: 14, fontWeight: "700" },
  stripList:      { gap: 10, paddingBottom: 2 },
  stripCard:      { width: 130, borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  stripImg:       { width: "100%", height: 95 },
  stripCardInfo:  { padding: 7, gap: 3 },
  stripCardName:  { fontSize: 11, fontWeight: "600" },
  stripCardPrice: { fontSize: 12, fontWeight: "800" },

  loaderBlock: { alignItems: "center", paddingVertical: 24, gap: 8 },
  loaderText:  { fontSize: 13, fontWeight: "500" },
});