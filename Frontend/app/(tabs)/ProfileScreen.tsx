/**
 * ProfileScreen — Hook-safe implementation
 *
 * Seller vs non-seller differences:
 * ─────────────────────────────────
 * • Non-sellers: only "Settings" tab is shown. Active/Sold tabs are hidden.
 * • Non-sellers: SellerWalletSection is not rendered.
 * • SettingsTab receives `isSeller` so it can show/hide "Wallet & Payouts".
 *
 * Hook count stays constant across all renders — tab list derivation is
 * done outside the JSX so no conditional hook calls are introduced.
 */

import ProductListingsTab from '@/components/ProductListingsTab';
import SettingsTab from '@/components/SettingsTab';
import SoldListingTab from '@/components/SoldListingTab';
import { Colors } from '@/constants/theme';
import { SellerWalletSection } from '@/src/components/SellerWalletSection';
import { useProducts } from '@/src/hooks/useProducts';
import { removeToken } from '@/src/services/authStorage';
import { userStore } from '@/src/store/userStore';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

type Tab = "listings" | "sold" | "settings";

const ALL_TAB_LABELS: Record<Tab, string> = { listings: "Active", sold: "Sold", settings: "Settings" };
const ALL_TAB_ICONS:  Record<Tab, string> = { listings: "🛍️",    sold: "📦",   settings: "⚙️"      };

// Tabs available to sellers vs non-sellers
const SELLER_TABS:     Tab[] = ["listings", "sold", "settings"];
const NON_SELLER_TABS: Tab[] = ["settings"];

const ProfileScreen = () => {
  // ── FIXED hook list — identical count on every single render ─────────────

  const scheme  = useColorScheme();                         // H1
  const isDark  = scheme === "dark";
  const theme   = isDark ? Colors.dark : Colors.light;

  const user = userStore.getState();
  const {
      profile_picture,
      full_name,
      university,
      campus,
      email,
      gender,
      isSeller,
    } = user; 


  const { products: recentListings } = useProducts(user.id); // H2

  // H3 — Tab state (always starts on the first available tab per role)
  const [activeTab, setActiveTab] = useState<Tab>(
    user.isSeller ? "listings" : "settings"
  );

  // H4 — Re-render trigger when user data loads
  const [, forceUpdate] = useState(0);

  // H5 — Subscribe to userStore changes without calling it as a hook
  useEffect(() => {                                          // H5
    const unsub = (userStore as any).subscribe(() => {
      forceUpdate((n) => n + 1);
    });
    return unsub;
  }, []);

  // H6, H7 — Derived data
  const myListings = useMemo(                               // H6
    () => recentListings.filter(
      (item) => item.sellerEmail === user.email && item.pStatus !== "SOLD"
    ),
    [recentListings, user.email]
  );

  const mySold = useMemo(                                   // H7
    () => recentListings.filter(
      (item) => item.sellerEmail === user.email && item.pStatus === "SOLD"
    ),
    [recentListings, user.email]
  );

  // H8, H9 — Callbacks
  const handleLogout = useCallback(() => {                  // H8
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out", style: "destructive", onPress: async () => {
          await removeToken();
          userStore.getState().clearUser();
          router.replace("/Login/LoginScreen");
        },
      },
    ]);
  }, []);

  const onProductPressed = useCallback((id: string) => {   // H9
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id } });
  }, []);

  // ── No more hooks below ───────────────────────────────────────────────────

  
 



  // Derive which tabs to show based on seller status (plain value, not a hook)
  const visibleTabs: Tab[] = isSeller ? SELLER_TABS : NON_SELLER_TABS;

  const avatarSource = profile_picture
    ? { uri: profile_picture }
    : gender === "Female"
      ? require("@/assets/images/CreateAccount/femaleUser.png")
      : require("@/assets/images/CreateAccount/user.png");

  const onBack = () => router.back();

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground, paddingTop: 25 }]}>

      {/* ── Navbar ── */}
      <View style={[styles.navbar, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={{ fontSize: 30, color: theme.text, fontWeight: "700" }}>←</Text>
        </Pressable>
        <Text style={[styles.navTitle, { color: theme.text, textAlign: "center", alignSelf: "center" }]}>
          My Profile
        </Text>
        <Pressable style={styles.navShare} hitSlop={12}>
          <Text style={{ fontSize: 30, color: theme.text }}>➦</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* ── Hero banner ── */}
        <View style={[styles.heroBanner, { backgroundColor: isDark ? "#0a1f0a" : PRIMARY_SOFT }]}>
          <View style={[styles.heroStripe, { backgroundColor: PRIMARY }]} />

          <View style={styles.avatarGroup}>
            <View style={styles.avatarRing}>
              <Image source={avatarSource} style={styles.avatar} />
            </View>
            <Pressable style={[styles.editBtn, { backgroundColor: PRIMARY }]}>
              <Text style={styles.editBtnIcon}>✏️</Text>
            </Pressable>
          </View>

          <Text style={[styles.heroName, { color: theme.text }]}>
            {full_name || "Your Name"}
          </Text>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: isDark ? PRIMARY_DARK : "#c8e6c9" }]}>
              <Text style={[styles.badgeText, { color: PRIMARY }]}>✓ Verified Student</Text>
            </View>
          </View>

          <Text style={[styles.heroSub, { color: theme.text }]}>
            {[university, campus].filter(Boolean).join(" · ")}
          </Text>
          <Text style={[styles.heroEmail, { color: theme.text }]}>{email}</Text>
          <Text style={[styles.heroMember, { color: isDark ? "#4ade80" : PRIMARY }]}>
            🎓 Member since 2023
          </Text>
        </View>

        {/* ── Seller Wallet Section — sellers only ── */}
        {isSeller && (
          <SellerWalletSection userId={user.id} isDark={isDark} theme={theme} />
        )}

        {/* ── Stats ── */}
        {isSeller && ( <View style={styles.statsRow}>
          {[
            // Non-sellers only see Settings, so listing/sold counts are seller-only
            ...(isSeller
              ? [
                  { label: "Listed", value: myListings.length, icon: "🛍️" },
                  { label: "Sold",   value: mySold.length,     icon: "📦" },
                ]
              : []),
            { label: "Rating",  value: "4.9", icon: "⭐" },
            { label: "Reviews", value: 12,    icon: "💬" },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[styles.statBox, {
                backgroundColor: theme.sectionBackground,
                borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
              }]}
            >
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statVal, { color: PRIMARY }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.readColor }]}>{stat.label}</Text>
            </View>
          ))}
        </View> )}


        {/* ── Tab bar — only rendered when more than one tab is available ── */}
        {visibleTabs.length > 1 && (
          <View style={[styles.tabBar, {
            backgroundColor: theme.sectionBackground,
            borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
          }]}>
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                >
                  <Text style={styles.tabIcon}>{ALL_TAB_ICONS[tab]}</Text>
                  <Text style={[styles.tabLabel, {
                    color: isActive ? PRIMARY : theme.readColor,
                    fontWeight: isActive ? "800" : "400",
                  }]}>
                    {ALL_TAB_LABELS[tab]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/*
          All three panels always rendered — display:none hides inactive ones.
          This keeps the React tree shape constant so hook counts never change.
          For non-sellers, listings/sold panels are hidden by both display:none
          AND by the fact that activeTab can never be "listings" or "sold".
        */}
        <View style={activeTab !== "listings" ? styles.hidden : undefined}>
          <ProductListingsTab
            items={myListings}
            onProductPressed={onProductPressed}
            isDark={isDark}
            theme={theme}
            onSellPress={() => router.push("/SellScreen")}
          />
        </View>

        <View style={activeTab !== "sold" ? styles.hidden : undefined}>
          <SoldListingTab
            items={mySold}
            onProductPressed={onProductPressed}
            isDark={isDark}
            theme={theme}
          />
        </View>

        <View style={activeTab !== "settings" ? styles.hidden : undefined}>
          <SettingsTab
            handleLogout={() => { handleLogout(); }}
            isDark={isDark}
            theme={theme}
            isSeller={isSeller}
          />
        </View>

      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  screen:  { flex: 1, marginBottom: 60 },
  hidden:  { display: "none" },

  navbar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1,
  },
  navTitle:  { fontSize: 17, fontWeight: "900", letterSpacing: -0.4 },
  navShare:  { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  navIcon:   { width: 18, height: 18, resizeMode: "contain" },

  heroBanner: {
    marginHorizontal: 14, marginTop: 16,
    borderRadius: 22, overflow: "hidden", alignItems: "center", paddingBottom: 22,
  },
  heroStripe:  { width: "100%", height: 7 },
  avatarGroup: { marginTop: 18, position: "relative", marginBottom: 10 },
  avatarRing: {
    width: 98, height: 98, borderRadius: 49,
    borderWidth: 3, borderColor: PRIMARY, overflow: "hidden",
  },
  avatar:      { width: "100%", height: "100%" },
  editBtn: {
    position: "absolute", bottom: 0, right: -4,
    width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  editBtnIcon: { fontSize: 13 },
  heroName:    { fontSize: 20, fontWeight: "900", letterSpacing: -0.4, marginBottom: 6 },
  badgeRow:    { flexDirection: "row", marginBottom: 7 },
  badge:       { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText:   { fontSize: 11, fontWeight: "700" },
  heroSub:     { fontSize: 12, marginBottom: 3 },
  heroEmail:   { fontSize: 12, marginBottom: 5 },
  heroMember:  { fontSize: 12, fontWeight: "700" },

  statsRow: { flexDirection: "row", marginHorizontal: 14, marginTop: 14, gap: 8 },
  statBox: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    padding: 10, alignItems: "center", gap: 3,
  },
  statIcon:  { fontSize: 18 },
  statVal:   { fontSize: 16, fontWeight: "900" },
  statLabel: { fontSize: 9, fontWeight: "600", textTransform: "uppercase" },

  quickRow: { flexDirection: "row", marginHorizontal: 14, marginTop: 14, gap: 10 },
  quickBtn: {
    height: 46, borderRadius: 13,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
  },
  quickBtnIcon: { fontSize: 15 },
  quickBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  tabBar: {
    flexDirection: "row", marginHorizontal: 14, marginTop: 18,
    borderRadius: 14, borderWidth: 1, overflow: "hidden",
  },
  tabItem:       { flex: 1, alignItems: "center", paddingVertical: 11, gap: 2 },
  tabItemActive: { borderBottomWidth: 2.5, borderBottomColor: PRIMARY },
  tabIcon:       { fontSize: 16 },
  tabLabel:      { fontSize: 11 },
});