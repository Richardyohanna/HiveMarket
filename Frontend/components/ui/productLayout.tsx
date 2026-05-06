import { Colors, generalStyle, PRIMARY, PRIMARY_DARK, PRIMARY_SOFT, PRODUCTS_PER_BLOCK, RECENT_PREVIEW_COUNT } from "@/constants/theme";
import { RecentListingItem } from "@/src/types/products";
import React from "react";
import {
  FlatList,
  Image,
  Pressable,

  Text,
  View
} from "react-native";


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
      style={[generalStyle.card, {
        backgroundColor: theme.sectionBackground,
        borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
      }]}
    >
      <View style={generalStyle.cardImgWrapper}>
        <Image
          source={item.pImage ? { uri: item.pImage } : require("../../assets/images/HomeScreen/nike.png")}
          style={generalStyle.cardImg}
          resizeMode="cover"
        />
        {item.pQuality && (
          <View style={[generalStyle.conditionPill, { backgroundColor: isNew ? PRIMARY : "#b45309" }]}>
            <Text style={generalStyle.conditionText}>{item.pQuality}</Text>
          </View>
        )}
        <View style={[generalStyle.wishlistBtn, { backgroundColor: isDark ? "#0f1f0f" : "#fff" }]}>
          <Text style={{ fontSize: 13 }}>🤍</Text>
        </View>
      </View>

      <View style={generalStyle.cardBody}>
        <Text numberOfLines={2} style={[generalStyle.cardName, { color: theme.text }]}>
          {item.pName}
        </Text>
        {item.location ? (
          <View style={generalStyle.locationRow}>
            <Text style={[generalStyle.locationPin, { color: PRIMARY }]}>📍</Text>
            <Text numberOfLines={1} style={[generalStyle.locationText, { color: theme.readColor }]}>
              {item.location}
            </Text>
          </View>
        ) : null}
        <Text style={[generalStyle.cardPrice, { color: PRIMARY }]}>
          ₦{Number(item.pAmount).toLocaleString()}
        </Text>
        <View style={generalStyle.metaRow}>
          <Text style={generalStyle.star}>★</Text>
          <Text style={[generalStyle.ratingVal, { color: theme.readColor }]}>
            {Number(item.rating || 0).toFixed(1)}
          </Text>
          {(item.views ?? 0) > 0 && (
            <Text style={[generalStyle.viewCount, { color: theme.readColor }]}>
              · {item.views} views
            </Text>
          )}
        </View>
        <Pressable style={generalStyle.buyBtn} onPress={onPress}>
          <Text style={generalStyle.buyBtnText}>Buy Now</Text>
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
  <View style={[generalStyle.stripOuter, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}>
    <View style={generalStyle.stripHeader}>
      <View style={generalStyle.stripAccent} />
      <Text style={[generalStyle.stripTitle, { color: isDark ? "#c8e6c9" : PRIMARY }]}>
        Recently Listed
      </Text>
    </View>
    <FlatList
      data={items}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(it, i) => `si_${it.id}_${i}`}
      contentContainerStyle={generalStyle.stripList}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPress(item.id)}
          style={[generalStyle.stripCard, {
            backgroundColor: theme.sectionBackground,
            borderColor: isDark ? PRIMARY_DARK : "#c8e6c9",
          }]}
        >
          <Image
            source={item.pImage ? { uri: item.pImage } : require("../../assets/images/HomeScreen/nike.png")}
            style={generalStyle.stripImg}
            resizeMode="cover"
          />
          <View style={generalStyle.stripCardInfo}>
            <Text numberOfLines={1} style={[generalStyle.stripCardName, { color: theme.text }]}>
              {item.pName}
            </Text>
            <Text style={[generalStyle.stripCardPrice, { color: PRIMARY }]}>
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
    <View style={generalStyle.gridBlock}>
      {pairs.map((pair, rowIdx) => (
        <View key={`row_${rowIdx}`} style={generalStyle.gridRow}>
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
            <View style={generalStyle.cardPlaceholder} />
          )}
        </View>
      ))}
    </View>
  );
}, (p, n) => p.isDark === n.isDark && p.items === n.items);


