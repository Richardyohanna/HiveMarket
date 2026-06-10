/**
 * app/(tabs)/_layout.tsx
 *
 * File structure inside (tabs) — flat, no subfolders:
 *   CartScreen.tsx
 *   CategoryScreen.tsx
 *   ChatScreen.tsx
 *   HomeScreen.tsx
 *   ListingsScreen.tsx
 *   ProfileScreen.tsx
 *   SellScreen.tsx
 *
 * RULE: Tab `name` must match the EXACT filename without .tsx
 * Previous error: names like "cart", "chat", "profile" don't exist —
 * the real filenames are "CartScreen", "ChatScreen", "ProfileScreen" etc.
 */


import { useCartProduct } from "@/src/hooks/useCartProduct";
import { userStore } from "@/src/store/userStore";
import { router, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

const PRIMARY      = "#008100";
const PRIMARY_DARK = "#1a3a1a";
const PRIMARY_SOFT = "#e8f5e9";

// ─────────────────────────────────────────────────────────────────────────────
// Tab Icon — emoji bubble + active dot + optional badge
// ─────────────────────────────────────────────────────────────────────────────
const TabIcon = ({
  emoji, focused, isDark, badge,
}: {
  emoji: string; focused: boolean; isDark: boolean; badge?: number;
}) => (
  <View style={iconStyles.wrap}>
    <View style={[iconStyles.inner, focused && {
      backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT,
    }]}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </View>

    {badge != null && badge > 0 && (
      <View style={iconStyles.badge}>
        <Text style={iconStyles.badgeText}>
          {badge > 99 ? "99+" : String(badge)}
        </Text>
      </View>
    )}

    {focused && (
      <View style={[iconStyles.dot, { backgroundColor: PRIMARY }]} />
    )}
  </View>
);

const iconStyles = StyleSheet.create({
  wrap: {
    alignItems: "center", justifyContent: "center",
    width: 48, height: 36, position: "relative",
  },
  inner: {
    width: 46, height: 34, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  dot: {
    position: "absolute", bottom: -4,
    width: 4, height: 4, borderRadius: 2,
  },
  badge: {
    position: "absolute", top: -2, right: 2,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3, borderWidth: 1.5, borderColor: "#fff",
  },
  badgeText: { color: "#fff", fontSize: 8, fontWeight: "900" },
});

// ─────────────────────────────────────────────────────────────────────────────
// Sell FAB — floating green button for sellers (centre slot)
// ─────────────────────────────────────────────────────────────────────────────
const SellFAB = ({ isDark }: { isDark: boolean }) => (
  <Pressable
    onPress={() => router.push("/(tabs)/SellScreen")}
    style={({ pressed }) => [
      fabStyles.outer,
      pressed && { opacity: 0.85, transform: [{ scale: 0.94 }] },
    ]}
  >
    <View style={fabStyles.inner}>
      <Text style={fabStyles.plus}>+</Text>
    </View>
    <Text style={[fabStyles.label, { color: isDark ? "#475569" : "#94a3b8" }]}>
      Sell
    </Text>
  </Pressable>
);

const fabStyles = StyleSheet.create({
  outer: { alignItems: "center", justifyContent: "center", marginTop: -20 },
  inner: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: PRIMARY,
    alignItems: "center", justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14, shadowOpacity: 0.5, elevation: 12,
    borderWidth: 3, borderColor: "#fff",
  },
  plus:  { color: "#fff", fontSize: 30, fontWeight: "300", lineHeight: 32, marginTop: -1 },
  label: { fontSize: 10, fontWeight: "700", marginTop: 4, letterSpacing: 0.2 },
});

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────
export default function TabsLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // Re-render when role changes (e.g. after login / onboarding)
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsub = (userStore as any).subscribe(() =>
      forceUpdate((n) => n + 1)
    );
    return unsub;
  }, []);

  const role     = userStore.getState().role ?? "";
  const isSeller = role.toLowerCase() === "seller";

    const {
      products: cartItems,
      loading,
      error,
      fetchCartProduct: fetchCart,
      addToCart,
      removeFromCart,
      isInCart,
      totalValue: cartCount,
    } = useCartProduct(userStore.getState().id); 
 

  const tabBarStyle = {
    height:               Platform.OS === "ios" ? 86 : 66,
    backgroundColor:      isDark ? "#0f172a" : "#ffffff",
    borderTopWidth:       0,
    elevation:            24,
    shadowColor:          isDark ? "#000" : PRIMARY,
    shadowOpacity:        isDark ? 0.45 : 0.14,
    shadowRadius:         20,
    shadowOffset:         { width: 0, height: -6 } as const,
    paddingBottom:        Platform.OS === "ios" ? 20 : 8,
    paddingTop:           8,
    borderTopLeftRadius:  22,
    borderTopRightRadius: 22,
    position:             "absolute" as const,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor:   PRIMARY,
        tabBarInactiveTintColor: isDark ? "#475569" : "#94a3b8",
        tabBarLabelStyle: {
          fontSize: 10, fontWeight: "700", letterSpacing: 0.2, marginTop: 2,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, {
            backgroundColor:      isDark ? "#0f172a" : "#ffffff",
            borderTopLeftRadius:  22,
            borderTopRightRadius: 22,
            overflow:             "hidden",
          }]} />
        ),
      }}
    >

      {/* ── HOME — always visible ──────────────────────────────────────── */}
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" focused={focused} isDark={isDark} />
          ),
        }}
      />

      {/* ── CATEGORY/EXPLORE — buyer only ─────────────────────────────── */}
      <Tabs.Screen
        name="CategoryScreen"
        options={{
          title: "Explore",
          href: isSeller ? null : undefined,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🧭" focused={focused} isDark={isDark} />
          ),
        }}
      />

      {/* ── MY LISTINGS — seller only ──────────────────────────────────── */}
      <Tabs.Screen
        name="ListingsScreen"
        options={{
          title: "Listings",
          href: isSeller ? undefined : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📦" focused={focused} isDark={isDark} />
          ),
        }}
      />

      {/* ── SELL FAB — seller only, centre slot ───────────────────────── */}
      <Tabs.Screen
        name="SellScreen"
        options={{
          title: "",
          href: isSeller ? undefined : null,
          tabBarButton: isSeller
            ? () => <SellFAB isDark={isDark} />
            : undefined,
        }}
      />

      {/* ── CART — buyer only, centre slot ────────────────────────────── */}
      <Tabs.Screen
        name="CartScreen"
        options={{
          title: "Cart",
          href: isSeller ? null : undefined,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              emoji="🛒"
              focused={focused}
              isDark={isDark}
              badge={cartCount}
            />
          ),
        }}
      />

      {/* ── CHAT — always visible ─────────────────────────────────────── */}
      <Tabs.Screen
        name="ChatScreen"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💬" focused={focused} isDark={isDark} />
          ),
        }}
      />

      {/* ── PROFILE — always visible ──────────────────────────────────── */}
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} isDark={isDark} />
          ),
        }}
      />

    </Tabs>
  );
}