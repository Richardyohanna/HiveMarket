/**
 * SoldListingTab
 * ──────────────
 * ZERO hooks. All data via props.
 */
import { Colors } from '@/constants/theme';
import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const PRIMARY      = "#008100";
const PRIMARY_DARK = "#1a3a1a";

type SoldItem = {
  id: string;
  pImage?: string;
  pName?: string;
  pAmount?: string | number;
  pQuality?: string;
  status?: string;
};

type Props = {
  items: SoldItem[];
  onProductPressed: (id: string) => void;
  isDark: boolean;
  theme: typeof Colors.light;
};

const SoldCard = ({
  item, isDark, theme, onPress,
}: {
  item: SoldItem; isDark: boolean; theme: typeof Colors.light; onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.card, {
      backgroundColor: theme.sectionBackground,
      borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
    }]}
  >
    <View style={styles.imgWrapper}>
      <Image
        source={item.pImage ? { uri: item.pImage } : require("../assets/images/HomeScreen/nike.png")}
        style={styles.cardImg}
        resizeMode="cover"
      />
      {/* Sold overlay */}
      <View style={styles.soldOverlay}>
        <Text style={styles.soldText}>SOLD</Text>
      </View>
    </View>
    <View style={styles.cardBody}>
      <Text numberOfLines={1} style={[styles.cardName, { color: theme.text }]}>{item.pName}</Text>
      <Text style={[styles.cardPrice, { color: theme.readColor, textDecorationLine: "line-through" }]}>
        ₦{Number(item.pAmount).toLocaleString()}
      </Text>
    </View>
  </Pressable>
);

const SoldListingTab = ({ items, onProductPressed, isDark, theme }: Props) => {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📦</Text>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Nothing sold yet</Text>
        <Text style={[styles.emptySub, { color: theme.readColor }]}>
          Your completed sales will appear here
        </Text>
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
        <SoldCard
          item={item}
          isDark={isDark}
          theme={theme}
          onPress={() => onProductPressed(item.id)}
        />
      )}
    />
  );
};

export default SoldListingTab;

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 14, paddingTop: 12, gap: 12 },
  row:  { gap: 12, justifyContent: "space-between" },

  card: {
    flex: 1, maxWidth: "49%", borderRadius: 14, borderWidth: 1, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  imgWrapper: { position: "relative" },
  cardImg:    { width: "100%", height: 130 },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
    alignItems: "center", justifyContent: "center",
  },
  soldText:  { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  cardBody:  { padding: 9, gap: 3 },
  cardName:  { fontSize: 12, fontWeight: "600" },
  cardPrice: { fontSize: 12, fontWeight: "600" },

  empty: { alignItems: "center", paddingTop: 50, paddingHorizontal: 30, gap: 8 },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 17, fontWeight: "800" },
  emptySub:   { fontSize: 13, textAlign: "center", lineHeight: 19 },
});