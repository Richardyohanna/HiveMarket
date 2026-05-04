import { Colors } from '@/constants/theme';
import ScrollWithRefresh from '@/hooks/ScrollWithRefresh';
import { useProductStore } from '@/src/store/productStore';
import { router } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import CategorySection from './CategorySection';
import FeaturedProductSection from './FeaturedProductSection';
import HeaderSection from './HeaderSection';
import RecentListingSection from './RecentListingSection';

const HomeScreen = () => {
  // ── ALL hooks must be called before any conditional logic ────────────────
  const scheme  = useColorScheme();
  const isDark  = scheme === "dark";
  const theme   = isDark ? Colors.dark : Colors.light;

  const loading            = useProductStore((s) => s.loading);
  const loadRecentListings = useProductStore((s) => s.loadRecentListings);

  useEffect(() => {
    if (loadRecentListings.length === 0) {
      loadRecentListings();
    }
  }, []);

  const onNotificationClicked = useCallback(() => {
    router.push("/NotificationScreen/NotificationScreen");
  }, []);

  // Pull-to-refresh — awaited properly so the spinner stops when fetch ends
  const handleRefresh = useCallback(async () => {
    if (loading) return;
    await loadRecentListings();
  }, [loading, loadRecentListings]);

  // ── No early returns above this line ────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      <StatusBar
        backgroundColor={theme.screenBackground}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <HeaderSection onNotificationClicked={onNotificationClicked} />

      <ScrollWithRefresh
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onRefresh={handleRefresh}
      >
        {/* Search bar */}
        <View style={[styles.search, { backgroundColor: isDark ? "#1E293B" : "#f2f2f26e" }]}>
          <Pressable>
            <Image source={require("../../assets/images/HomeScreen/search.png")} />
          </Pressable>
          <TextInput
            placeholder="Search for items"
            placeholderTextColor={isDark ? "#ffffff92" : "#0000008b"}
            style={styles.searchInput}
          />
          <View style={[styles.searchDivider, { backgroundColor: isDark ? "#525e70cd" : "#62626294" }]} />
          <Pressable>
            <Image source={require("../../assets/images/HomeScreen/searchSetting.png")} />
          </Pressable>
        </View>

        {/* All sections are pure store consumers — they never fetch themselves */}
        <FeaturedProductSection />
        <RecentListingSection />
        <CategorySection />
      </ScrollWithRefresh>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  scrollContent: {
    gap: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  search: {
    width: "100%",
    padding: 15,
    borderRadius: 20,
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00000086",
  },
  searchInput:   { flex: 1 },
  searchDivider: { width: 2, height: 20 },
});