/**
 * ProductListingsTab
 * ──────────────────
 * ZERO hooks inside this component.
 * All data is received via props from ProfileScreen.
 * This is mandatory — any hook called here would change the total
 * hook count when tabs switch, breaking React's rules of hooks.
 */
import { Colors } from '@/constants/theme';
import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const PRIMARY      = "#008100";
const PRIMARY_DARK = "#1a3a1a";

type ListingItem = {
  id: string;
  pImage?: string;
  pName?: string;
  pAmount?: string | number;
  pQuality?: string;
  status?: string;
};

type Props = {
  items: ListingItem[];
  onProductPressed: (id: string) => void;
  isDark: boolean;
  theme: typeof Colors.light;
  onSellPress: () => void;
};

const MiniCard = ({
  item, isDark, theme, onPress,
}: {
  item: ListingItem; isDark: boolean; theme: typeof Colors.light; onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.card, {
      backgroundColor: theme.sectionBackground,
      borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
    }]}
  >
    <Image
      source={item.pImage ? { uri: item.pImage } : require("../assets/images/HomeScreen/nike.png")}
      style={styles.cardImg}
      resizeMode="cover"
    />
    {item.pQuality && (
      <View style={[styles.pill, { backgroundColor: item.pQuality === "NEW" ? PRIMARY : "#b45309" }]}>
        <Text style={styles.pillText}>{item.pQuality}</Text>
      </View>
    )}
    <View style={styles.cardBody}>
      <Text numberOfLines={1} style={[styles.cardName, { color: theme.text }]}>{item.pName}</Text>
      <Text style={[styles.cardPrice, { color: PRIMARY }]}>
        ₦{Number(item.pAmount).toLocaleString()}
      </Text>
    </View>
  </Pressable>
);

const ProductListingsTab = ({ items, onProductPressed, isDark, theme, onSellPress }: Props) => {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🛍️</Text>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No active listings</Text>
        <Text style={[styles.emptySub, { color: theme.readColor }]}>
          Tap below to post your first item
        </Text>
        <Pressable style={[styles.emptyBtn, { backgroundColor: PRIMARY }]} onPress={onSellPress}>
          <Text style={styles.emptyBtnText}>Start Selling</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={2}
      scrollEnabled={false}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => (
        <MiniCard
          item={item}
          isDark={isDark}
          theme={theme}
          onPress={() => onProductPressed(item.id)}
        />
      )}
    />
  );
};

export default ProductListingsTab;

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 14, paddingTop: 12, gap: 12 },
  row:  { gap: 12, justifyContent: "space-between" },

  card: {
    flex: 1, maxWidth: "49%", borderRadius: 14, borderWidth: 1, overflow: "hidden",
    shadowColor: PRIMARY, shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardImg:   { width: "100%", height: 130 },
  pill: {
    position: "absolute", top: 7, left: 7,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  pillText:  { color: "#fff", fontSize: 8, fontWeight: "800" },
  cardBody:  { padding: 9, gap: 3 },
  cardName:  { fontSize: 12, fontWeight: "600" },
  cardPrice: { fontSize: 13, fontWeight: "900" },

  empty: { alignItems: "center", paddingTop: 50, paddingHorizontal: 30, gap: 8 },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 17, fontWeight: "800" },
  emptySub:   { fontSize: 13, textAlign: "center", lineHeight: 19 },
  emptyBtn:   { marginTop: 10, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});