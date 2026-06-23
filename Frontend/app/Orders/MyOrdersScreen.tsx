import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from 'react-native';

// Import your API calls and types
import { formatTimeAgo } from '@/src/store/productStore';
import { userStore } from '@/src/store/userStore';
import { Order } from '@/src/types/Order';
import {
  getAllCancelledOrderApi,
  getAllDeliveredOrderApi,
  getAllIn_ProgressOrderApi,
  getAllOrderApi,
} from '../../src/api/OrderApi'; // <-- Make sure to fix this path to your actual api file

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

// Unified statuses matching your specific API tabs 
type TabStatus = 'All' | 'In_Progress' | 'Delivered' | 'Cancelled';

const MyOrdersScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const user = userStore.getState();

  // Screen States
  const [activeTab, setActiveTab] = useState<TabStatus>('All');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // TODO: Grab the actual logged-in user id from your Auth State / Context
  const userId = user.id; 

  // Fetch orders when the active tab shifts
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let fetchedData: Order[] = [];

        switch (activeTab) {
          case 'All':
            fetchedData = await getAllOrderApi(userId) || [];
            break;
          case 'In_Progress':
            fetchedData = await getAllIn_ProgressOrderApi(userId) || [];
            break;
          case 'Delivered':
            fetchedData = await getAllDeliveredOrderApi(userId) || [];
            break;
          case 'Cancelled':
            fetchedData = await getAllCancelledOrderApi(userId) || [];
            break;
          default:
            fetchedData = [];
        }

        setOrders(fetchedData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, userId]);

  const renderOrderItem = ({ item }: { item: Order }) => {
    // Check if the current item is pending or in progress
    const isInProgress = item.status.toLowerCase() === 'in_progress';
    const isCancelled = item.status.toLowerCase() === 'cancelled';

    return (
      <Pressable
        style={[styles.orderCard, {
          backgroundColor: theme.sectionBackground,
          borderColor: isDark ? PRIMARY_DARK : "#e4f0e4"
        }]}

        onPress={() => router.push({
            pathname: "/Orders/OrderDetail/[id]",
            params: { id: item.OrderId }
          }) }
        
      >
        {/* Visual asset placeholder 
        <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}>
          <Text style={{ fontSize: 20 }}>📦</Text>

        </View>

        */}

      <Image
        source={
          item.productImage && item.productImage.imageUrl
            ? { uri: item.productImage.imageUrl }
            : require("../../assets/images/HomeScreen/nike.png")
        }
        style={styles.imagePlaceholder}
        resizeMode="cover"
      />

        <View style={styles.cardDetails}>
          <View style={styles.cardHeader}>
            <Text numberOfLines={1} style={[styles.orderTitle, { color: theme.text }]}>
              {item.productName}
            </Text>
            <Text style={[styles.orderPrice, { color: PRIMARY }]}>
              ₦{Number(item.amountPaid).toLocaleString()}
            </Text>
          </View>

          <Text style={[styles.orderDate, { color: theme.readColor }]}>
            Ordered {formatTimeAgo(item.orderDate)}
          </Text>
          
          <View style={styles.badgeRow}>
            <View
              style={[styles.statusBadge, {
                backgroundColor: isInProgress 
                  ? (isDark ? "#3b2300" : "#fff3e0") 
                  : isCancelled 
                  ? (isDark ? "#3a1a1a" : "#ffebee")
                  : (isDark ? PRIMARY_DARK : PRIMARY_SOFT)
              }]}
            >
              <Text
                style={[styles.badgeText, {
                  color: isInProgress ? "#e65100" : isCancelled ? "#d32f2f" : PRIMARY
                }]}
              >
                {isInProgress ? "⏳ In-Progress" : isCancelled ? "❌ Cancelled" : "✓ Delivered"}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground, paddingTop: 25 }]}>
      
      {/* Navbar Header */}
      <View style={[styles.navbar, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ fontSize: 30, color: theme.text, fontWeight: "700" }}>←</Text>
        </Pressable>
        <Text style={[styles.navTitle, { color: theme.text }]}>My Orders</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Tabs Menu */}
      <View style={[styles.tabBar, { backgroundColor: theme.sectionBackground, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        {(['All', 'In_Progress', 'Delivered', 'Cancelled'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
            >
              <Text style={[styles.tabLabel, {
                color: isActive ? PRIMARY : theme.readColor,
                fontWeight: isActive ? "800" : "500",
              }]}>
                {tab.replace('_', ' ')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Content Stream */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.OrderId}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>🛒</Text>
              <Text style={[styles.emptyText, { color: theme.readColor }]}>No orders found in this section.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default MyOrdersScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  navbar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1,
  },
  navTitle: { fontSize: 17, fontWeight: "900", letterSpacing: -0.4 },
  
  tabBar: {
    flexDirection: "row", marginHorizontal: 14, marginTop: 14,
    borderRadius: 12, borderWidth: 1, overflow: "hidden",
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabItemActive: { borderBottomWidth: 3, borderBottomColor: PRIMARY },
  tabLabel: { fontSize: 11 },

  listContainer: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 40, gap: 12 },
  orderCard: {
    flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 12, gap: 12, alignItems: 'center'
  },
  imagePlaceholder: {
    width: 60, height: 60, borderRadius: 10, alignItems: 'center', justifyContent: 'center'
  },
  cardDetails: { flex: 1, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  orderPrice: { fontSize: 14, fontWeight: '900' },
  orderDate: { fontSize: 11, marginTop: 2, marginBottom: 6 },
  badgeRow: { flexDirection: 'row' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 14, fontWeight: '500' }
});