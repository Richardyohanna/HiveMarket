import { Colors } from '@/constants/theme';
import ScrollWithRefresh from '@/hooks/ScrollWithRefresh';
import { useProducts } from '@/src/hooks/useProducts'; // Keeping hook for data layer
import { userStore } from '@/src/store/userStore';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View
} from 'react-native';

// Fresh, warm brand palette 
const PRIMARY = "#008100"; // Hive Market Green
const HIVE_AMBER = "#FFB000"; // Warm Accent Yellow
const NEUTRAL_BG_LIGHT = "#FBFBF9"; // Crisp Editorial Off-White

// Mock Campus Shop Data matching your vision (You can tie this to a hook later)
const CAMPUS_SHOPS = [
  { id: '1', name: "The Campus Bookstore", location: "Student Union", distance: "2 mins away", isOpen: true, hours: "Open until 8 PM", image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=500" },
  { id: '2', name: "Quad Coffee Roasters", location: "North Campus Quads", distance: "5 mins away", isOpen: true, hours: "Open until 10 PM", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500" },
  { id: '3', name: "Dorm Essentials Lounge", location: "South Residence Hall", distance: "8 mins away", isOpen: false, hours: "Opens 8 AM", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500" },
];

const HomeScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const user = userStore.getState();
  const userId = user?.id || "";

  const { products, loading, refetch } = useProducts(userId);

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);

  useEffect(() => {
    refetch();
  }, []);

  const handleSearch = useCallback(() => {
    if (!search.trim()) return;
    router.push({ pathname: "/CategoryScreen", params: { q: search } });
  }, [search]);

  const onNotificationClicked = useCallback(() => {
    router.push("/NotificationScreen/NotificationScreen");
  }, []);

  const handleRefresh = useCallback(async () => {
    if (loading) return;
    await refetch();
  }, [loading, refetch]);

  // Filter storefronts based on "Open Now" toggle
  const filteredShops = filterOpenNow ? CAMPUS_SHOPS.filter(shop => shop.isOpen) : CAMPUS_SHOPS;

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? theme.screenBackground : NEUTRAL_BG_LIGHT, paddingTop: 25 }]}>
      <StatusBar
        backgroundColor={isDark ? theme.screenBackground : NEUTRAL_BG_LIGHT}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      {/* Brand & Context Header */}
      <View style={styles.topNavWrapper}>
        <View>
          <Text style={[styles.campusDropdownText, { color: isDark ? "#fff" : "#1A202C" }]}>
            HiveMarket @ <Text style={{ color: PRIMARY }}>{user.university || "all"} ▾</Text>
          </Text>
          <Text style={styles.subCampusText}>Exploring local campus storefronts</Text>
        </View>
        <Pressable onPress={onNotificationClicked} style={styles.iconContainer}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </Pressable>
      </View>

      {/* Sticky Quick-Search Box */}
      <View style={styles.searchWrapper}>
        <View style={[
          styles.searchBar,
          {
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderColor: searchFocused ? PRIMARY : "#E2E8F0",
          }
        ]}>
          <Text style={styles.searchEmoji}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={(t) => { setSearch(t); setShowResults(true); }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholder="What are you looking for on campus today?"
            placeholderTextColor="#94A3B8"
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        {/* Community Filter Toggles */}
        <View style={styles.filterRow}>
          <Pressable 
            onPress={() => setFilterOpenNow(!filterOpenNow)}
            style={[styles.filterPill, filterOpenNow && { backgroundColor: PRIMARY, borderColor: PRIMARY }]}
          >
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.filterText, filterOpenNow && { color: '#FFF' }]}>Open Now Only</Text>
          </Pressable>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 8 }}>
            {["All Hubs", "Student Union", "North Campus", "Dorm Stores"].map((filter, idx) => (
              <View key={idx} style={[styles.filterPill, idx === 0 && styles.activePill]}>
                <Text style={[styles.filterText, idx === 0 && { color: '#FFF' }]}>{filter}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Main Stream (The Campus Stroll Layout) */}
      <ScrollWithRefresh
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onRefresh={handleRefresh}
      >
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Campus Storefronts</Text>
          <Text style={{ color: PRIMARY, fontSize: 13, fontWeight: "600" }}>Map View 🗺️</Text>
        </View>

        {/* Displaying Storefront entities instead of standard product cells */}
        {filteredShops.map((shop) => (
          <Pressable 
            key={shop.id} 
            style={[styles.shopCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}
            onPress={() => router.push({ pathname: "/HomeScreen/ShopCatalogScreen", params: { shopId: shop.id } })} // Your next step Detail screen
          >
            <View style={styles.imageWrapper}>
              <Image source={{ uri: shop.image }} style={styles.shopImage} />
              
              {/* Dynamic Live Status Indicator */}
              <View style={[styles.statusBadge, { backgroundColor: shop.isOpen ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)' }]}>
                <View style={[styles.innerStatusDot, { backgroundColor: '#FFF' }]} />
                <Text style={styles.statusBadgeText}>{shop.isOpen ? "OPEN" : "CLOSED"}</Text>
              </View>

              {/* Proximity / Distance Stamp */}
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>📍 {shop.distance}</Text>
              </View>
            </View>

            <View style={styles.shopDetails}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.shopName, { color: theme.text }]}>{shop.name}</Text>
                <Text style={styles.shopLocation}>{shop.location} • <Text style={{ color: shop.isOpen ? PRIMARY : '#EF4444' }}>{shop.hours}</Text></Text>
              </View>
              
              {/* Fresh Interactive Social Indicator ("Buzz") */}
              <View style={styles.buzzContainer}>
                <Text style={{ fontSize: 12 }}>🔥 Popular</Text>
              </View>
            </View>
          </Pressable>
        ))}

        {/* Keep micro listings underneath for casual browsing */}
        <View style={{ marginTop: 15 }}>
          <Text style={[styles.sectionSubtitle, { color: theme.text }]}>Trending Marketplace Item Finds</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingTop: 10 }}>
            {products.slice(0, 5).map((product, idx) => (
              <View key={idx} style={[styles.miniProductCard, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                <View style={styles.miniPlaceholderImage}><Text style={{ fontSize: 24 }}>🎒</Text></View>
                <Text style={[styles.miniProductName, { color: theme.text }]} numberOfLines={1}>{product.pName || "Campus Gear"}</Text>
                <Text style={styles.miniProductPrice}>₦{Number(product.pAmount).toLocaleString()}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollWithRefresh>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    
  },
  topNavWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 30
  },
  campusDropdownText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'System', 
  },
  subCampusText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  searchEmoji: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },
  
  // Custom Filter Toggles Styles
  filterRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    marginRight: 6,
  },
  activePill: {
    backgroundColor: '#1A202C',
    borderColor: '#1A202C',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
  },

  // Scroll Content & Virtual Stroll Main Cards
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  shopCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 170,
  },
  shopImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  innerStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A202C',
  },
  shopDetails: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shopName: {
    fontSize: 15,
    fontWeight: '700',
  },
  shopLocation: {
    fontSize: 12,
    color: '#718096',
    marginTop: 3,
  },
  buzzContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#F59E0B',
  },

  // Mini Items Sub-list Styles
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  miniProductCard: {
    width: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
  },
  miniPlaceholderImage: {
    height: 80,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniProductName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  miniProductPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY,
    marginTop: 2,
  },
});