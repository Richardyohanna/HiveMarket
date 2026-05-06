import { Colors } from '@/constants/theme';

import { userStore } from '@/src/store/userStore';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import React from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import CategoryScreen from '../CategoryScreen/CategoryScreen';
import ChatScreen from '../ChatScreen/ChatScreen';
import HomeScreen from '../HomeScreen/HomeScreen';
import ListingsScreen from '../ListingsScreen/ListingsScreen';
import ProfileScreen from '../ProfileScreen/ProfileScreen';
import SellScreen from '../SellScreen/SellScreen';

const PRIMARY = "#008100";
const PRIMARY_DARK = "#1a3a1a";

export type BottomTabProp = {
  Home: undefined;
  Category: undefined;
  Sell: undefined;
  Chat: undefined;
  Listings: undefined;
  profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabProp>();

// ── Minimal icon components (swap for your real icon set if preferred) ───────
const TabIcon = ({
  emoji, focused, isDark,
}: { emoji: string; focused: boolean; isDark: boolean }) => (
  <View style={[tabIconStyles.wrap, focused && {
    backgroundColor: isDark ? "#1a3a1a" : "#e8f5e9",
  }]}>
    <Text style={{ fontSize: 20 }}>{emoji}</Text>
    {focused && (
      <View style={[tabIconStyles.dot, { backgroundColor: PRIMARY }]} />
    )}
  </View>
);

const tabIconStyles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 46,
    height: 34,
    borderRadius: 12,
    position: "relative",
  },
  dot: {
    position: "absolute",
    bottom: -3,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

// ── Sell FAB ─────────────────────────────────────────────────────────────────
const SellFAB = ({ isDark }: { isDark: boolean }) => (
  <Pressable
    onPress={() => router.navigate("/SellScreen/SellScreen")}
    style={({ pressed }) => [
      styles.fab,
      pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
    ]}
  >
    <View style={styles.fabInner}>
      <Text style={styles.fabPlus}>+</Text>
    </View>
  </Pressable>
);

// ── Navigator ─────────────────────────────────────────────────────────────────
const BottomTabNav = () => {
  const scheme  = useColorScheme();
  const isDark  = scheme === "dark";
  const theme   = isDark ? Colors.dark : Colors.light;

  const {role } = userStore();

  // ── Seller check: adjust selector to your auth store shape ────────────────
  const isSeller = role === "seller";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 82 : 64,
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: isDark ? "#000" : "#008100",
          shadowOpacity: isDark ? 0.4 : 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          paddingBottom: Platform.OS === "ios" ? 18 : 6,
          paddingTop: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
        },
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: isDark ? "#475569" : "#94a3b8",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarBackground: () => (
          <View style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark ? "#0f172a" : "#ffffff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: "hidden",
            },
          ]} />
        ),
      }}
    >
      {/* ── Home ── */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" focused={focused} isDark={isDark} />
          ),
        }}
      />

      {/* ── Explore / Category ── */}
      <Tab.Screen
        name="Category"
        component={CategoryScreen}
        options={{
          tabBarLabel: "Explore",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🧭" focused={focused} isDark={isDark} />
          ),
        }}
      />

      {/* ── Sell FAB (seller only) OR Listings (non-seller) ── */}
      {isSeller ? (
        <Tab.Screen
          name="Sell"
          component={SellScreen}
          options={{
            tabBarLabel: "",
            tabBarButton: () => <SellFAB isDark={isDark} />,
          }}
        />
      ) : (
        <Tab.Screen
          name="Listings"
          component={ListingsScreen}
          options={{
            tabBarLabel: "My Items",
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📦" focused={focused} isDark={isDark} />
            ),
          }}
        />
      )}

      {/* ── Chat ── */}
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: "Chat",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💬" focused={focused} isDark={isDark} />
          ),
        }}
      />

      {/* ── Profile ── */}
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} isDark={isDark} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNav;

const styles = StyleSheet.create({
  fab: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    alignSelf: "center",
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.45,
    elevation: 10,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  fabPlus: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 30,
    marginTop: -1,
  },
});