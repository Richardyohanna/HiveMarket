import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CARD_W, Colors, PRIMARY, PRIMARY_DARK } from "../constants/theme";

// ─── Mini product card ────────────────────────────────────────────────────────
const MiniCard = React.memo(({
  item, isDark, theme, onPress
}: {
  item: any; isDark: boolean; theme: typeof Colors.light; onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.miniCard, {
      backgroundColor: theme.sectionBackground,
      borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
    }]}
  >
    <Image
      source={item.pImage ? { uri: item.pImage } : require("../assets/images/HomeScreen/nike.png")} //"../../assets/images/HomeScreen/nike.png")}
      style={styles.miniImg}
      resizeMode="cover"
    />
    {item.status === "SOLD" && (
      <View style={styles.soldOverlay}>
        <Text style={styles.soldText}>SOLD</Text>
      </View>
    )}
    <View style={styles.miniInfo}>
      <Text numberOfLines={1} style={[styles.miniName, { color: theme.text }]}>{item.pName}</Text>
      <Text style={[styles.miniPrice, { color: PRIMARY }]}>₦{Number(item.pAmount).toLocaleString()}</Text>
    </View>
  </Pressable>
));

export default MiniCard;


const styles = StyleSheet.create({
  screen: { flex: 1 },

  navbar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1,
  },
  navTitle:  { fontSize: 17, fontWeight: "900", letterSpacing: -0.4 },
  navShare:  { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  navIcon:   { width: 18, height: 18, resizeMode: "contain" },

  // Hero
  heroBanner: {
    marginHorizontal: 14, marginTop: 16,
    borderRadius: 22, overflow: "hidden", alignItems: "center", paddingBottom: 22,
  },
  heroBannerStripe: { width: "100%", height: 7 },
  avatarGroup:    { marginTop: 18, position: "relative", marginBottom: 10 },
  avatarRing: {
    width: 98, height: 98, borderRadius: 49,
    borderWidth: 3, borderColor: PRIMARY,
    overflow: "hidden",
  },
  avatar:        { width: "100%", height: "100%" },
  editAvatarBtn: {
    position: "absolute", bottom: 0, right: -4,
    width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  editAvatarIcon: { fontSize: 13 },
  heroName:      { fontSize: 20, fontWeight: "900", letterSpacing: -0.4, marginBottom: 6 },
  heroBadgeRow:  { flexDirection: "row", marginBottom: 7 },
  heroBadge:     { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  heroBadgeText: { fontSize: 11, fontWeight: "700" },
  heroSub:       { fontSize: 12, marginBottom: 3 },
  heroEmail:     { fontSize: 12, marginBottom: 5 },
  heroMember:    { fontSize: 12, fontWeight: "700" },

  // Stats
  statsRow: { flexDirection: "row", marginHorizontal: 14, marginTop: 14, gap: 8 },
  statBox: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    padding: 10, alignItems: "center", gap: 3,
  },
  statIcon:  { fontSize: 18 },
  statVal:   { fontSize: 16, fontWeight: "900" },
  statLabel: { fontSize: 9, fontWeight: "600", textTransform: "uppercase" },

  // Quick actions
  quickActions: { flexDirection: "row", marginHorizontal: 14, marginTop: 14, gap: 10 },
  quickBtn: {
    flex: 1, height: 46, borderRadius: 13,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
  },
  quickBtnIcon: { fontSize: 15 },
  quickBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // Tabs
  tabBar: {
    flexDirection: "row", marginHorizontal: 14, marginTop: 18,
    borderRadius: 14, borderWidth: 1, overflow: "hidden",
  },
  tabItem:  { flex: 1, alignItems: "center", paddingVertical: 11, gap: 2 },
  tabIcon:  { fontSize: 16 },
  tabLabel: { fontSize: 11 },

  // Grid
  grid:    { paddingHorizontal: 14, paddingTop: 12, gap: 12 },
  gridRow: { gap: 12, justifyContent: "space-between" },

  // Mini card
  miniCard: {
    width: CARD_W, borderRadius: 14, borderWidth: 1, overflow: "hidden",
    shadowColor: PRIMARY, shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  miniImg:  { width: "100%", height: 130 },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  soldText: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  miniInfo: { padding: 9, gap: 3 },
  miniName: { fontSize: 12, fontWeight: "600" },
  miniPrice:{ fontSize: 13, fontWeight: "900" },

  // Settings
  settingsSection: { paddingHorizontal: 14, paddingTop: 14, gap: 8 },
  settingsGroupLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, marginTop: 4, marginBottom: -2 },
  settingRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 12,
  },
  settingIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  settingEmoji:{ fontSize: 18 },
  settingText: { flex: 1 },
  settingLabel:{ fontSize: 14, fontWeight: "600" },
  settingSub:  { fontSize: 11, marginTop: 1 },
  settingArrow:{ fontSize: 22, fontWeight: "300" },

  // Empty
  emptyState: { alignItems: "center", paddingTop: 50, paddingHorizontal: 30, gap: 8 },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 17, fontWeight: "800" },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  emptyAction:   { marginTop: 10, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  emptyActionText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});