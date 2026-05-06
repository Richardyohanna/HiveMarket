/**
 * ProfileScreen — Hook-safe implementation
 *
 * THE ROOT CAUSE (finally confirmed):
 * ─────────────────────────────────────
 * `userStore` is a custom hook that calls `useCallback` internally.
 * Every time it's called inside a component, it adds 2+ extra hooks
 * (useCallback, possibly useState) to the component's hook list.
 * When the store's internal state changes (e.g. after login data loads),
 * those internal hooks fire in a different order → "change in hook order".
 *
 * THE DEFINITIVE FIX:
 * ────────────────────
 * Do NOT call `userStore()` as a hook at all.
 * Read user data via `userStore.getState()` — this is a plain function
 * call, not a hook, so it adds ZERO entries to React's hook registry.
 *
 * We then use a single `useSyncExternalStore` subscription (via
 * `useProductStore`) to re-render when listings change, and a
 * `useState` counter to force re-render when user data changes.
 */

import ProductListingsTab from '@/components/ProductListingsTab';
import SettingsTab from '@/components/SettingsTab';
import SoldListingTab from '@/components/SoldListingTab';
import { Colors } from '@/constants/theme';
import { removeToken } from '@/src/services/authStorage';
import { useProductStore } from '@/src/store/productStore';
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
const TAB_LABELS: Record<Tab, string> = { listings: "Active", sold: "Sold",  settings: "Settings" };
const TAB_ICONS:  Record<Tab, string> = { listings: "🛍️",    sold: "📦",    settings: "⚙️"      };

const ProfileScreen = () => {
  // ── FIXED hook list — identical count on every single render ─────────────

  const scheme = useColorScheme();                                          // H1 (stable)
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;

  // H2 — Subscribe to productStore (standard Zustand, safe)
  const recentListings = useProductStore((s) => s.recentListings);

  // H3 — Tab state
  const [activeTab, setActiveTab] = useState<Tab>("listings");

  // H4 — Re-render trigger when user data loads (avoids calling userStore as hook)
  const [, forceUpdate] = useState(0);

  // ── Read user data via getState() — ZERO hooks, plain function call ──────
  // This never affects the hook count. We subscribe manually below.
  const user = userStore.getState();

  // H5 — Subscribe to userStore changes without calling it as a hook
  // When the store changes, we increment the counter to trigger a re-render,
  // then re-read via getState() above on the next render.
  useEffect(() => {                                                          // H5
    // userStore.subscribe exists on all Zustand stores
    const unsub = (userStore as any).subscribe(() => {
      forceUpdate((n) => n + 1);
    });
    return unsub;
  }, []);

  // H6, H7 — Derived data
  const myListings = useMemo(                                               // H6
    () => recentListings.filter(
      (item) => item.sellerEmail === user.email && item.pStatus !== "SOLD"
    ),
    [recentListings, user.email]
  );

  const mySold = useMemo(                                                   // H7
    () => recentListings.filter(
      (item) => item.sellerEmail === user.email && item.pStatus === "SOLD"
    ),
    [recentListings, user.email]
  );

  // H8, H9 — Callbacks
  const handleLogout = useCallback(() => {                                  // H8
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel",  style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: async () => {
        
        await removeToken();           // ✅ remove token

        userStore.getState().clearUser();

           // ✅ clear user data from store
        //router.replace("/"); // ✅ redirect
        
        
      }, },



      
    ]);


  }, []);

  const onProductPressed = useCallback((id: string) => {                   // H9
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id } });
  }, []);

  // ── No more hooks below ───────────────────────────────────────────────────

  const {
    profile_picture,
    full_name,
    university,
    campus,
    email,
    gender,
   
  } = user;

  const avatarSource = profile_picture
    ? { uri: profile_picture }
    : gender === "Female"
      ? require("@/assets/images/CreateAccount/femaleUser.png")
      : require("@/assets/images/CreateAccount/user.png");


  const onBack = () => {

    router.back();
  }
  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>

      {/* ── Navbar ── */}
      <View style={[styles.navbar, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        
         <Pressable 
          onPress={onBack}         
          hitSlop={12}
        >
          <Image
            source={require("../../assets/images/ProductDetail/back.png")}
            style={[styles.navIcon, { tintColor: PRIMARY }]}
          />
        </Pressable>
        <Text style={[styles.navTitle, { color: theme.text, textAlign: "center", alignSelf: "center"}]}>My Profile</Text>
        <Pressable
          style={[styles.navShare, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}
          hitSlop={12}
        >
          <Image
            source={require("../../assets/images/Profile/share.png")}
            style={[styles.navIcon, { tintColor: PRIMARY }]}
          />
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

          <Text style={[styles.heroSub, { color: theme.readColor }]}>
            {[university, campus].filter(Boolean).join(" · ")}
          </Text>
          <Text style={[styles.heroEmail, { color: theme.readColor }]}>{email}</Text>
          <Text style={[styles.heroMember, { color: isDark ? "#4ade80" : PRIMARY }]}>
            🎓 Member since 2023
          </Text>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {[
            { label: "Listed",  value: myListings.length, icon: "🛍️" },
            { label: "Sold",    value: mySold.length,      icon: "📦" },
            { label: "Rating",  value: "4.9",              icon: "⭐" },
            { label: "Reviews", value: 12,                 icon: "💬" },
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
        </View>

        {/* ── Quick actions ── */}
        <View style={styles.quickRow}>
          <Pressable
            style={[styles.quickBtn, { backgroundColor: PRIMARY }]}
            onPress={() => router.push("/SellScreen/SellScreen")}
          >
            <Text style={styles.quickBtnIcon}>➕</Text>
            <Text style={styles.quickBtnText}>Sell Item</Text>
          </Pressable>
          <Pressable
            style={[styles.quickBtn, {
              backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT,
              borderWidth: 1, borderColor: PRIMARY,
            }]}
            onPress={() => router.push("/ChatScreen/ChatScreen")}
          >
            <Text style={styles.quickBtnIcon}>💬</Text>
            <Text style={[styles.quickBtnText, { color: PRIMARY }]}>Messages</Text>
          </Pressable>
        </View>

        {/* ── Tab bar ── */}
        <View style={[styles.tabBar, {
          backgroundColor: theme.sectionBackground,
          borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
        }]}>
          {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
              >
                <Text style={styles.tabIcon}>{TAB_ICONS[tab]}</Text>
                <Text style={[styles.tabLabel, {
                  color: isActive ? PRIMARY : theme.readColor,
                  fontWeight: isActive ? "800" : "400",
                }]}>
                  {TAB_LABELS[tab]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/*
          All three panels always rendered — display:none hides inactive ones.
          This keeps the React tree shape constant so hook counts never change.
        */}
        <View style={activeTab !== "listings" ? styles.hidden : undefined}>
          <ProductListingsTab
            items={myListings}
            onProductPressed={onProductPressed}
            isDark={isDark}
            theme={theme}
            onSellPress={() => router.push("/SellScreen/SellScreen")}
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
            handleLogout={()=> { handleLogout();}}
            isDark={isDark}
            theme={theme}
          />
        </View>

      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  screen:  { flex: 1 },
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
    flex: 1, height: 46, borderRadius: 13,
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