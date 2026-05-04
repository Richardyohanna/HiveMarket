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
export const PRIMARY      = "#008100";
export const PRIMARY_SOFT = "#e8f5e9";
export const PRIMARY_DARK = "#1a3a1a";
export const PRODUCTS_PER_BLOCK   = 12;
export const RECENT_PREVIEW_COUNT = 4;
export const BLOCKS_BEFORE_REFETCH = 3;
export const FETCH_COOLDOWN_MS     = 30_000;

// ─── Types ────────────────────────────────────────────────────────────────────
type GridBlock  = { type: "grid";         items: RecentListingItem[]; key: string };
type StripBlock = { type: "recent_strip"; items: RecentListingItem[]; key: string };
export type FeedBlock  = GridBlock | StripBlock;

// ─── Module-level key counter — unique across all renders & HMR reloads ───────
let _keyCounter = 0;
const nextKey = (t: "g" | "s") => `${t}_${++_keyCounter}_${Date.now()}`;

// ─── Pure helpers ─────────────────────────────────────────────────────────────
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildBlock(
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

// ─── Sub-components (all defined OUTSIDE main so hook count is constant) ──────

export const ProductCard = React.memo(({
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

export const RecentStrip = React.memo(({
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

export const GridBlockView = React.memo(({
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