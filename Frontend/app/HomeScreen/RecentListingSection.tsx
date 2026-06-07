import { Colors, FontSize } from "@/constants/theme";
import { increaseProductViewApi } from "@/src/api/productApi";
import { useProductStore } from "@/src/store/productStore";
import { RecentListingItem } from "@/src/types/products";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";
const PRODUCTS_PER_BLOCK   = 12; // 6 rows × 2 cols
const RECENT_PREVIEW_COUNT = 4;

// How many blocks can be shown from local data before we ask the server again.
// e.g. 3 means the user sees 36 products (3 × 12) before a server call is made.
const BLOCKS_BEFORE_REFETCH = 3;

// Minimum milliseconds between server fetches — prevents hammering the API
const FETCH_COOLDOWN_MS = 30_000; // 30 seconds

// ─── Types ────────────────────────────────────────────────────────────────────
type GridBlock  = { type: "grid";         items: RecentListingItem[]; key: string };
type StripBlock = { type: "recent_strip"; items: RecentListingItem[]; key: string };
type FeedBlock  = GridBlock | StripBlock;

// ─── Global key counter — survives re-renders, guarantees uniqueness ──────────
let _keyCounter = 0;
const nextKey = (t: "g" | "s") => `${t}_${++_keyCounter}_${Date.now()}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds one grid + one strip from already-cached products.
 * Never calls the network. Wraps around the product list so we
 * can show unlimited blocks from a finite product set.
 */
function buildBlock(
  all: RecentListingItem[],
  seed: number[],
  offset: number,
): [GridBlock, StripBlock] {
  const len       = seed.length;
  const gridItems = Array.from({ length: PRODUCTS_PER_BLOCK }, (_, i) =>
    all[seed[(offset + i) % len]]
  );
  const stripItems = shuffle(all).slice(0, RECENT_PREVIEW_COUNT);
  return [
    { type: "grid",         items: gridItems,  key: nextKey("g") },
    { type: "recent_strip", items: stripItems, key: nextKey("s") },
  ];
}

// ─── ProductCard ─────────────────────────────────────────────────────────────
const ProductCard = React.memo(({
  item, isDark, theme, onPress,
}: {
  item: RecentListingItem;
  isDark: boolean;
  theme: typeof Colors.light;
  onPress: () => void;
}) => {
  const isNew = item.pQuality === "NEW";
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, {
        backgroundColor: theme.sectionBackground,
        borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
      }]}
    >
      <View style={styles.cardImgWrapper}>
        <Image
          source={item.pImage ? { uri: item.pImage } : require("../../assets/images/HomeScreen/nike.png")}
          style={styles.cardImg}
          resizeMode="cover"
        />
        {item.pQuality && (
          <View style={[styles.conditionPill, { backgroundColor: isNew ? PRIMARY : "#b45309" }]}>
            <Text style={styles.conditionText}>{item.pQuality}</Text>
          </View>
        )}
        <View style={[styles.wishlistBtn, { backgroundColor: isDark ? "#0f1f0f" : "#fff" }]}>
          <Text style={{ fontSize: 13 }}>🤍</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={[styles.cardName, { color: theme.text }]}>
          {item.pName}
        </Text>
        {item.location ? (
          <View style={styles.locationRow}>
            <Text style={[styles.locationPin, { color: PRIMARY }]}>📍</Text>
            <Text numberOfLines={1} style={[styles.locationText, { color: theme.readColor }]}>
              {item.location}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.cardPrice, { color: PRIMARY }]}>
          ₦{Number(item.pAmount).toLocaleString()}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.star}>★</Text>
          <Text style={[styles.ratingVal, { color: theme.readColor }]}>
            {Number(item.rating || 0).toFixed(1)}
          </Text>
          {(item.views ?? 0) > 0 && (
            <Text style={[styles.viewCount, { color: theme.readColor }]}>
              · {item.views} views
            </Text>
          )}
        </View>
        <Pressable style={styles.buyBtn} onPress={onPress}>
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}, (p, n) => p.item.id === n.item.id && p.isDark === n.isDark);

// ─── RecentStrip ─────────────────────────────────────────────────────────────
const RecentStrip = React.memo(({
  items, isDark, theme, onPress,
}: {
  items: RecentListingItem[];
  isDark: boolean;
  theme: typeof Colors.light;
  onPress: (id: string) => void;
}) => (
  <View style={[styles.stripOuter, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}>
    <View style={styles.stripHeader}>
      <View style={styles.stripAccent} />
      <Text style={[styles.stripTitle, { color: isDark ? "#c8e6c9" : PRIMARY }]}>
        Recently Listed
      </Text>
    </View>
    <FlatList
      data={items}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(it, i) => `si_${it.id}_${i}`}
      contentContainerStyle={styles.stripList}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPress(item.id)}
          style={[styles.stripCard, {
            backgroundColor: theme.sectionBackground,
            borderColor: isDark ? PRIMARY_DARK : "#c8e6c9",
          }]}
        >
          <Image
            source={item.pImage ? { uri: item.pImage } : require("../../assets/images/HomeScreen/nike.png")}
            style={styles.stripImg}
            resizeMode="cover"
          />
          <View style={styles.stripCardInfo}>
            <Text numberOfLines={1} style={[styles.stripCardName, { color: theme.text }]}>
              {item.pName}
            </Text>
            <Text style={[styles.stripCardPrice, { color: PRIMARY }]}>
              ₦{Number(item.pAmount).toLocaleString()}
            </Text>
          </View>
        </Pressable>
      )}
    />
  </View>
), (p, n) => p.isDark === n.isDark && p.items === n.items);

// ─── GridBlockView ────────────────────────────────────────────────────────────
const GridBlockView = React.memo(({
  items, isDark, theme, onPress,
}: {
  items: RecentListingItem[];
  isDark: boolean;
  theme: typeof Colors.light;
  onPress: (id: string) => void;
}) => {
  const pairs: [RecentListingItem, RecentListingItem | null][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push([items[i], items[i + 1] ?? null]);
  }
  return (
    <View style={styles.gridBlock}>
      {pairs.map((pair, rowIdx) => (
        <View key={`row_${rowIdx}`} style={styles.gridRow}>
          <ProductCard
            item={pair[0]} isDark={isDark} theme={theme}
            onPress={() => onPress(pair[0].id)}
          />
          {pair[1] ? (
            <ProductCard
              item={pair[1]} isDark={isDark} theme={theme}
              onPress={() => onPress(pair[1]!.id)}
            />
          ) : (
            <View style={styles.cardPlaceholder} />
          )}
        </View>
      ))}
    </View>
  );
}, (p, n) => p.isDark === n.isDark && p.items === n.items);

// ─── Main ─────────────────────────────────────────────────────────────────────
const CategorySection = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;
  const fs     = FontSize.size;

  const products           = useProductStore((s) => s.recentListings);
  const storeLoading       = useProductStore((s) => s.loading);
  const loadRecentListings = useProductStore((s) => s.loadRecentListings);

  const [feed,           setFeed]           = useState<FeedBlock[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // ── All mutation state in refs — no stale closures ───────────────────────
  const seedRef        = useRef<number[]>([]);
  const offsetRef      = useRef(0);
  const initialisedRef = useRef(false);
  const fetchingRef    = useRef(false);
  const blocksBuiltRef = useRef(0);         // total blocks shown since last server fetch
  const lastFetchedAt  = useRef(0);         // timestamp of last successful server call
  const productsRef    = useRef<RecentListingItem[]>([]);
  productsRef.current  = products;          // always current, no stale closure

  // ── Init: build first block exactly once when products arrive ───────────
  // Uses products.length as the dependency — safe because we guard with
  // initialisedRef so the body only ever executes once.
  useEffect(() => {
    if (initialisedRef.current || products.length === 0) return;
    initialisedRef.current = true;

    seedRef.current = shuffle(Array.from({ length: products.length }, (_, i) => i));

    const [grid, strip] = buildBlock(products, seedRef.current, 0);
    offsetRef.current      = PRODUCTS_PER_BLOCK;
    blocksBuiltRef.current = 1;
    setFeed([grid, strip]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  // ── Reset: rebuild feed when user pulls-to-refresh ────────────────────────
  // The store replaces recentListings with a fresh array on each fetch.
  // When that happens AND we already have a feed, wipe and rebuild from scratch
  // so the user sees fresh order without a blank screen.
  useEffect(() => {
    if (!initialisedRef.current || products.length === 0) return;

    // Rebuild seed to cover any new products
    seedRef.current = shuffle(Array.from({ length: products.length }, (_, i) => i));
    offsetRef.current      = PRODUCTS_PER_BLOCK;
    blocksBuiltRef.current = 1;

    const [grid, strip] = buildBlock(products, seedRef.current, 0);
    setFeed([grid, strip]);          // replace — don't append
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastFetchedAt.current]);       // only fires after a confirmed server refresh

  // ── Append one block from local cache ────────────────────────────────────
  const appendLocalBlock = useCallback(() => {
    const fresh  = productsRef.current;
    const offset = offsetRef.current;

    if (fresh.length > seedRef.current.length) {
      // Product list has grown — rebuild seed to cover new items
      seedRef.current = shuffle(Array.from({ length: fresh.length }, (_, i) => i));
    }

    const [grid, strip] = buildBlock(fresh, seedRef.current, offset);
    offsetRef.current   = offset + PRODUCTS_PER_BLOCK;
    blocksBuiltRef.current += 1;
    setFeed((prev) => [...prev, grid, strip]);
  }, []);

  // ── handleLoadMore: called when user scrolls to bottom ───────────────────
  //
  // STRATEGY:
  //   • Always show one new block immediately from local cache (instant, no server)
  //   • Only hit the server once every BLOCKS_BEFORE_REFETCH blocks AND
  //     only if the cooldown has elapsed
  //   • The server call is fire-and-forget — the block is built from local
  //     cache immediately; any new products from the server appear in the
  //     NEXT load-more, not this one (avoids layout jump)
  const handleLoadMore = useCallback(async () => {
    if (fetchingRef.current || productsRef.current.length === 0) return;
    fetchingRef.current = true;

    // Step 1: append a block immediately from what we already have
    appendLocalBlock();

    // Step 2: decide whether to also hit the server
    const builtSinceLastFetch = blocksBuiltRef.current;
    const now                 = Date.now();
    const cooldownElapsed     = now - lastFetchedAt.current > FETCH_COOLDOWN_MS;
    const shouldFetch         = builtSinceLastFetch >= BLOCKS_BEFORE_REFETCH && cooldownElapsed && !storeLoading;

    if (shouldFetch) {
      setIsFetchingMore(true);
      blocksBuiltRef.current = 0;

      try {
        await loadRecentListings();
        // Stamp AFTER a successful fetch — this is what the reset effect watches
        lastFetchedAt.current = Date.now();
      } catch (_) {
        // Silent — local cache still works fine
      } finally {
        setIsFetchingMore(false);
      }
    }

    // Release lock after a short delay to prevent rapid double-fires
    // from onEndReached when scrollEnabled=false
    setTimeout(() => {
      fetchingRef.current = false;
    }, 400);
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
        // onEndReached fires unreliably when scrollEnabled=false — the
        // parent ScrollView doesn't propagate the event consistently.
        // We DON'T use onEndReached here at all. Instead HomeScreen
        // calls appendBlock via the exposed ref when it detects bottom.
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

// ─── Styles ───────────────────────────────────────────────────────────────────
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