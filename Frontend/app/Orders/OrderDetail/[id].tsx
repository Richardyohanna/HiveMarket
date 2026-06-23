import { Colors } from "@/constants/theme";
import { userStore } from '@/src/store/userStore';
import { Order } from '@/src/types/Order';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View
} from 'react-native';

// Mock API imports - adjust matching your actual paths
import { increaseProductViewApi } from "@/src/api/productApi";
import { useProductDetail } from "@/src/hooks/useProductDetail";
import { formatTimeAgo } from "@/src/store/productStore";
import { getAllOrderApi } from '../../../src/api/OrderApi';

const { width } = Dimensions.get("window");
const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";
const AMBER        = "#EAB308";

const OrderDetailScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const { id } = useLocalSearchParams<{ id: string }>(); // OrderId passed via router
  const { id: currentUserId } = userStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState<boolean>(true);

  // Hook fetching full product parameters (related items, seller info) using order.productId
  const { 
    product, 
    loading: loadingProduct, 
    loadRecentListings, 
    recentListings 
  } = useProductDetail(order?.productId || "", currentUserId);

  // 1. Fetch matching order data on mount
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!currentUserId) return;
      try {
        setLoadingOrder(true);
        const allOrders: Order[] = await getAllOrderApi(currentUserId) || [];
        const matchingOrder = allOrders.find(o => o.OrderId === id);
        setOrder(matchingOrder || null);
      } catch (err) {
        console.error("Error retrieving order info:", err);
      } finally {
        setLoadingOrder(false);
      }
    };
    fetchOrderDetails();
  }, [id, currentUserId]);

  // 2. Fetch recommendations once order metadata provides productId
  useEffect(() => {
    if (order?.productId && currentUserId) {
      loadRecentListings(currentUserId);
    }
  }, [order?.productId, currentUserId]);

  // 3. Filter related marketplace listings
  const relatedItems = useMemo(() => {
    if (!product) return [];
    return recentListings
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  }, [recentListings, product]);

  const onChatSeller = () => {
    if (!product) {
      Alert.alert("Error", "Seller metadata is still loading.");
      return;
    }
    router.push({
      pathname: "/ChatScreen/[id]",
      params: {
        id: product.id,
        buyerId: currentUserId,
        sellerId: product.sellerId,
        fullName: product.sellerName,
        avatar: product.sellerProfilePicture,
      },
    });
  };

  const navigateToProduct = (productId: string) => {
    increaseProductViewApi(productId);
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id: productId } });
  };

  if (loadingOrder || (order && loadingProduct)) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.screenBackground }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.screenBackground }]}>
        <Text style={{ color: theme.readColor }}>Order details could not be found.</Text>
      </View>
    );
  }

  const isDelivered = order.status.toLowerCase() === 'delivered';
  const isCancelled = order.status.toLowerCase() === 'cancelled';

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBackground }]}>
      
      {/* --- HEADER --- */}
      <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.backArrow, { color: theme.text }]}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Track Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- PRODUCT SUMMARY CARD --- */}
        <View style={[styles.card, { backgroundColor: theme.sectionBackground, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
          <View style={styles.productRow}>
            <Image 
              source={
                order.productImage && (order.productImage as any).imageUrl
                  ? { uri: (order.productImage as any).imageUrl }
                  : require("../../../assets/images/HomeScreen/nike.png")
              }
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productMeta}>
              <Text numberOfLines={2} style={[styles.productName, { color: theme.text }]}>{order.productName}</Text>
              <Text style={[styles.productPrice, { color: PRIMARY }]}>₦{Number(order.amountPaid).toLocaleString()}</Text>
              <Text style={[styles.orderId, { color: theme.readColor }]}>ID: {order.OrderId.slice(0, 8).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* --- TRACKING TIMELINE STATUS --- */}
        <View style={[styles.card, { backgroundColor: theme.sectionBackground, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>Fulfillment Progress</Text>
          
          <View style={styles.timeline}>
            {/* Step 1: Placed */}
            <View style={styles.timelineStep}>
              <View style={styles.timelineLeft}>
                <View style={[styles.dot, { backgroundColor: PRIMARY }]} />
                <View style={[styles.line, { backgroundColor: !isCancelled ? PRIMARY : "#ccc" }]} />
              </View>
              <View style={styles.timelineRight}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>Order Confirmed</Text>
                <Text style={[styles.stepDate, { color: theme.readColor }]}>
                  {formatTimeAgo(order.orderDate)}
                </Text>
              </View>
            </View>

            {/* Step 2: In Progress / Cancelled */}
            <View style={styles.timelineStep}>
              <View style={styles.timelineLeft}>
                <View style={[styles.dot, { backgroundColor: isCancelled ? '#d32f2f' : (!isCancelled ? PRIMARY : "#ccc") }]} />
                <View style={[styles.line, { backgroundColor: isDelivered ? PRIMARY : "#ccc" }]} />
              </View>
              <View style={styles.timelineRight}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>
                  {isCancelled ? "Cancelled" : "Processing Delivery"}
                </Text>
                <Text style={[styles.stepDate, { color: theme.readColor }]}>
                  Status: {order.status.replace('_', ' ')}
                </Text>
              </View>
            </View>

            {/* Step 3: Delivered */}
            <View style={[styles.timelineStep, { paddingBottom: 0 }]}>
              <View style={styles.timelineLeft}>
                <View style={[styles.dot, { backgroundColor: isDelivered ? PRIMARY : "#ccc" }]} />
              </View>
              <View style={styles.timelineRight}>
                <Text style={[styles.stepTitle, { color: theme.text, opacity: isDelivered ? 1 : 0.5 }]}>Delivered</Text>
                {order.deliveredDate && (
                  <Text style={[styles.stepDate, { color: theme.readColor }]}>
                    {new Date(order.deliveredDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* --- CHAT WITH SELLER CALL TO ACTION --- */}
        <Pressable 
          onPress={onChatSeller}
          style={[styles.chatButton, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}
        >
          <Text style={styles.chatButtonEmoji}>💬</Text>
          <View style={styles.chatButtonTextContainer}>
            <Text style={[styles.chatButtonTitle, { color: isDark ? "#fff" : PRIMARY }]}>Message Merchant</Text>
            <Text style={[styles.chatButtonSub, { color: isDark ? "#a5d6a7" : "#558b2f" }]}>Confirm real-time status details directly</Text>
          </View>
          <Text style={[styles.chatButtonArrow, { color: PRIMARY }]}>➔</Text>
        </Pressable>

        {/* --- SIMILAR PRODUCTS SECTION --- */}
        {relatedItems.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={[styles.sectionHeading, { color: theme.text, marginLeft: 4, marginBottom: 12 }]}>
              Suggested Additions
            </Text>
            <View style={styles.grid}>
              {relatedItems.map((item) => (
                <Pressable 
                  key={item.id}
                  onPress={() => navigateToProduct(item.id)}
                  style={[styles.gridCard, { backgroundColor: theme.sectionBackground, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}
                >
                  <Image 
                    source={item.imageUrls?.[0] ? { uri: item.imageUrls[0] } : require("../../../assets/images/HomeScreen/nike.png")} 
                    style={styles.gridImage} 
                    resizeMode="cover"
                  />
                  <View style={styles.gridBody}>
                    <Text numberOfLines={1} style={[styles.gridName, { color: theme.text }]}>{item.pName}</Text>
                    <Text numberOfLines={1} style={[styles.gridPrice, { color: PRIMARY }]}>₦{Number(item.pAmount).toLocaleString()}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 25 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1
  },
  backArrow: { fontSize: 28, fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.4 },
  scrollContent: { padding: 16, gap: 16 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1 },
  productRow: { flexDirection: 'row', gap: 16 },
  productImage: { width: 80, height: 80, borderRadius: 12 },
  productMeta: { flex: 1, justifyContent: 'center', gap: 4 },
  productName: { fontSize: 15, fontWeight: '700' },
  productPrice: { fontSize: 16, fontWeight: '900' },
  orderId: { fontSize: 11, fontWeight: '500' },
  sectionHeading: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2, marginBottom: 16 },
  
  // Timeline Design
  timeline: { paddingLeft: 8 },
  timelineStep: { flexDirection: 'row', gap: 16, paddingBottom: 20 },
  timelineLeft: { alignItems: 'center', width: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  line: { width: 2, flex: 1, marginTop: 4, marginBottom: -12 },
  timelineRight: { flex: 1, justifyContent: 'flex-start', marginTop: -2 },
  stepTitle: { fontSize: 13, fontWeight: '700' },
  stepDate: { fontSize: 11, marginTop: 2 },

  // Chat bar action design
  chatButton: { 
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, gap: 14
  },
  chatButtonEmoji: { fontSize: 22 },
  chatButtonTextContainer: { flex: 1, gap: 2 },
  chatButtonTitle: { fontSize: 13, fontWeight: '800' },
  chatButtonSub: { fontSize: 11, fontWeight: '500' },
  chatButtonArrow: { fontSize: 16, fontWeight: '700' },

  // Suggestions Grid
  relatedSection: { marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: { width: (width - 44) / 2, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  gridImage: { width: '100%', height: 120 },
  gridBody: { padding: 10, gap: 2 },
  gridName: { fontSize: 12, fontWeight: '700' },
  gridPrice: { fontSize: 13, fontWeight: '900' }
});