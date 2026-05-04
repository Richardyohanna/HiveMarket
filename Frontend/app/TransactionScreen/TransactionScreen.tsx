import { Colors, FontSize } from '@/constants/theme';
import { increaseProductPurchaseApi, increaseProductViewApi } from "@/src/api/productApi";
import { usePayment } from "@/src/hooks/usePayment";
import { useProductStore } from "@/src/store/productStore";
import { listenForPaymentReturn } from "@/src/utils/deepLink";
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
const SERVICE_FEE  = 50.6;

// ─── Related product mini card ────────────────────────────────────────────────
const RelatedCard = React.memo(({
  item, isDark, theme, onPress,
}: {
  item: any;
  isDark: boolean;
  theme: typeof Colors.light;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.relatedCard, {
      backgroundColor: theme.sectionBackground,
      borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
    }]}
  >
    <Image
      source={item.pImage ? { uri: item.pImage } : require("../../assets/images/HomeScreen/nike.png")}
      style={styles.relatedImg}
      resizeMode="cover"
    />
    {item.pQuality && (
      <View style={[styles.relatedBadge, {
        backgroundColor: item.pQuality === "NEW" ? PRIMARY : "#b45309",
      }]}>
        <Text style={styles.relatedBadgeText}>{item.pQuality}</Text>
      </View>
    )}
    <View style={styles.relatedInfo}>
      <Text numberOfLines={1} style={[styles.relatedName, { color: theme.text }]}>
        {item.pName}
      </Text>
      <Text style={[styles.relatedPrice, { color: PRIMARY }]}>
        ₦{Number(item.pAmount).toLocaleString()}
      </Text>
    </View>
  </Pressable>
));

// ─── Fee row ──────────────────────────────────────────────────────────────────
const FeeRow = ({
  label, value, bold, color, theme,
}: {
  label: string; value: string; bold?: boolean;
  color?: string; theme: typeof Colors.light;
}) => (
  <View style={styles.feeRow}>
    <Text style={[styles.feeLabel, { color: theme.readColor }, bold && { color: theme.text, fontWeight: "700" }]}>
      {label}
    </Text>
    <Text style={[styles.feeValue, { color: color ?? theme.text }, bold && { fontWeight: "800", fontSize: 15 }]}>
      {value}
    </Text>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const TransactionScreen = () => {
  const { startPayment, confirmPayment } = usePayment();
  const { id } = useLocalSearchParams<{ id: string }>();

  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;
  const fs     = FontSize.size;

  const { recentListings, updateRecentListing } = useProductStore();

  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [isPaying,         setIsPaying]         = useState(false);
  const [paymentStep,      setPaymentStep]       = useState<"idle" | "processing" | "success" | "failed">("idle");

  const product = useMemo(
    () => recentListings.find((item) => String(item.id) === String(id)),
    [recentListings, id]
  );

  // Related products: same category, excluding this product
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return recentListings
      .filter((item) => item.id !== product.id)// && item.category === product.category)
      .slice(0, 8);
  }, [recentListings, product]);

  // Fallback related: any 8 products if no category match
  const displayedRelated = useMemo(() => {
    if (relatedProducts.length >= 2) return relatedProducts;
    return recentListings
      .filter((item) => item.id !== product?.id)
      .slice(0, 8);
  }, [relatedProducts, recentListings, product]);

  // Deep-link listener for payment return
  useEffect(() => {
    if (!product) return;

    const unsubscribe = listenForPaymentReturn(async () => {
      if (!paymentReference) return;

      try {
        setPaymentStep("processing");
        const verify = await confirmPayment(paymentReference);

        if (verify.paymentStatus === "success") {
          setPaymentStep("success");
          increaseProductPurchaseApi(String(product.id));
          updateRecentListing(product.id, {
            purchases: (product.purchases || 0) + 1,
          });
        } else {
          setPaymentStep("failed");
        }
      } catch (err) {
        console.log(err);
        setPaymentStep("failed");
      }
    });

    return unsubscribe;
  }, [paymentReference, product]);

  const onBack = useCallback(() => router.back(), []);

  const onProductClicked = useCallback((productId: string) => {
    increaseProductViewApi(productId);
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id: productId } });
  }, []);

  const handlePayment = useCallback(async () => {
    if (!product || isPaying) return;
    setIsPaying(true);
    try {
      const init = await startPayment({
        productId: Number(product.id),
        buyerId: 1,
        customerEmail: "test@email.com",
        amount: Number(product.pAmount),
      });
      setPaymentReference(init.reference);
      setPaymentStep("processing");
    } catch {
      alert("Payment failed to start");
    } finally {
      setIsPaying(false);
    }
  }, [product, isPaying, startPayment]);

  // ── Success screen ────────────────────────────────────────────────────────
  if (paymentStep === "success") {
    return (
      <View style={[styles.resultScreen, { backgroundColor: theme.screenBackground }]}>
        <View style={[styles.resultIcon, { backgroundColor: PRIMARY_SOFT }]}>
          <Text style={styles.resultEmoji}>🎉</Text>
        </View>
        <Text style={[styles.resultTitle, { color: theme.text }]}>Payment Successful!</Text>
        <Text style={[styles.resultSub, { color: theme.readColor }]}>
          Your order for {product?.pName} has been placed.
        </Text>
        <Pressable
          style={[styles.resultBtn, { backgroundColor: PRIMARY }]}
          onPress={() => router.push("/")}
        >
          <Text style={styles.resultBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  if (paymentStep === "failed") {
    return (
      <View style={[styles.resultScreen, { backgroundColor: theme.screenBackground }]}>
        <View style={[styles.resultIcon, { backgroundColor: "#fff3e0" }]}>
          <Text style={styles.resultEmoji}>❌</Text>
        </View>
        <Text style={[styles.resultTitle, { color: theme.text }]}>Payment Failed</Text>
        <Text style={[styles.resultSub, { color: theme.readColor }]}>
          Something went wrong. Please try again.
        </Text>
        <Pressable
          style={[styles.resultBtn, { backgroundColor: PRIMARY }]}
          onPress={() => setPaymentStep("idle")}
        >
          <Text style={styles.resultBtnText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.resultScreen, { backgroundColor: theme.screenBackground }]}>
        <Text style={[styles.resultSub, { color: theme.readColor }]}>Product not found</Text>
      </View>
    );
  }

  const total = Number(product.pAmount) + SERVICE_FEE;

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerBtn}>
          <Image
            source={require("../../assets/images/ProductDetail/back.png")}
            style={[styles.headerIcon, { tintColor: theme.text }]}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Step indicator ── */}
        <View style={styles.stepRow}>
          {["Review", "Payment", "Done"].map((step, i) => (
            <React.Fragment key={step}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, {
                  backgroundColor: i === 0 ? PRIMARY : isDark ? "#1a3a1a" : "#d4edda",
                }]}>
                  <Text style={[styles.stepNum, { color: i === 0 ? "#fff" : theme.readColor }]}>
                    {i + 1}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, {
                  color: i === 0 ? PRIMARY : theme.readColor,
                  fontWeight: i === 0 ? "700" : "400",
                }]}>
                  {step}
                </Text>
              </View>
              {i < 2 && (
                <View style={[styles.stepLine, {
                  backgroundColor: isDark ? PRIMARY_DARK : "#d4edda",
                }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* ── Product review card ── */}
        <View style={styles.sectionLabel}>
          <View style={[styles.labelAccent, { backgroundColor: PRIMARY }]} />
          <Text style={[styles.labelText, { color: theme.text }]}>Review Item</Text>
        </View>

        <Pressable
          onPress={() => onProductClicked(product.id)}
          style={[styles.productCard, {
            backgroundColor: theme.sectionBackground,
            borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
          }]}
        >
          <Image
            source={
              product.pImage
                ? { uri: product.pImage }
                : require("../../assets/images/HomeScreen/nike.png")
            }
            style={styles.productImg}
          />

          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
              {product.pName}
            </Text>
            {product.pQuality && (
              <View style={[styles.qualityBadge, {
                backgroundColor: product.pQuality === "NEW" ? PRIMARY_SOFT : "#fff3e0",
              }]}>
                <Text style={[styles.qualityText, {
                  color: product.pQuality === "NEW" ? PRIMARY : "#b45309",
                }]}>
                  {product.pQuality}
                </Text>
              </View>
            )}
            <Text style={[styles.productPrice, { color: PRIMARY }]}>
              ₦{Number(product.pAmount).toLocaleString()}
            </Text>
            {product.location ? (
              <Text style={[styles.productLocation, { color: theme.readColor }]}>
                📍 {product.location}
              </Text>
            ) : null}
          </View>

          <View style={[styles.viewArrow, { backgroundColor: isDark ? "#0f1f0f" : "#e8f5e9" }]}>
            <Text style={[styles.arrowText, { color: PRIMARY }]}>›</Text>
          </View>
        </Pressable>

        {/* ── Seller info ── */}
        {product.sellerName && (
          <View style={[styles.sellerRow, {
            backgroundColor: theme.sectionBackground,
            borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
          }]}>
            <Text style={styles.sellerEmoji}>🧑‍💼</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sellerLabel, { color: theme.readColor }]}>Seller</Text>
              <Text style={[styles.sellerName, { color: theme.text }]}>{product.sellerName}</Text>
            </View>
            <View style={[styles.verifiedBadge, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}>
              <Text style={[styles.verifiedText, { color: PRIMARY }]}>✓ Verified</Text>
            </View>
          </View>
        )}

        {/* ── Order summary ── */}
        <View style={styles.sectionLabel}>
          <View style={[styles.labelAccent, { backgroundColor: PRIMARY }]} />
          <Text style={[styles.labelText, { color: theme.text }]}>Order Summary</Text>
        </View>

        <View style={[styles.summaryCard, {
          backgroundColor: theme.sectionBackground,
          borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
        }]}>
          <FeeRow
            label="Item price"
            value={`₦${Number(product.pAmount).toLocaleString()}`}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]} />
          <FeeRow
            label="Service fee"
            value={`₦${SERVICE_FEE.toFixed(2)}`}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]} />
          <FeeRow
            label="Delivery fee"
            value="Free"
            color={PRIMARY}
            theme={theme}
          />
          <View style={[styles.totalDivider, { backgroundColor: isDark ? PRIMARY_DARK : "#c8e6c9" }]} />
          <FeeRow
            label="Total"
            value={`₦${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            bold
            color={PRIMARY}
            theme={theme}
          />
        </View>

        {/* ── Payment method ── */}
        <View style={styles.sectionLabel}>
          <View style={[styles.labelAccent, { backgroundColor: PRIMARY }]} />
          <Text style={[styles.labelText, { color: theme.text }]}>Payment Method</Text>
        </View>

        <View style={[styles.paymentMethod, {
          backgroundColor: theme.sectionBackground,
          borderColor: PRIMARY,
        }]}>
          <View style={[styles.paymentIcon, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}>
            <Text style={{ fontSize: 20 }}>💳</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.paymentTitle, { color: theme.text }]}>Paystack</Text>
            <Text style={[styles.paymentSub, { color: theme.readColor }]}>
              Card, Bank Transfer, USSD
            </Text>
          </View>
          <View style={[styles.selectedDot, { backgroundColor: PRIMARY }]} />
        </View>

        {/* ── Related products ── */}
        {displayedRelated.length > 0 && (
          <>
            <View style={styles.sectionLabel}>
              <View style={[styles.labelAccent, { backgroundColor: PRIMARY }]} />
              <Text style={[styles.labelText, { color: theme.text }]}>You May Also Like</Text>
            </View>

            <FlatList
              data={displayedRelated}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `related_${item.id}`}
              contentContainerStyle={styles.relatedList}
              scrollEnabled
              renderItem={({ item }) => (
                <RelatedCard
                  item={item}
                  isDark={isDark}
                  theme={theme}
                  onPress={() => onProductClicked(item.id)}
                />
              )}
            />
          </>
        )}

        {/* Bottom spacer so content clears the pay button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Sticky pay button ── */}
      <View style={[styles.stickyFooter, {
        backgroundColor: theme.screenBackground,
        borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
      }]}>
        <View style={styles.footerTotal}>
          <Text style={[styles.footerLabel, { color: theme.readColor }]}>Total</Text>
          <Text style={[styles.footerAmount, { color: PRIMARY }]}>
            ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <Pressable
          onPress={handlePayment}
          disabled={isPaying}
          style={[styles.payBtn, { backgroundColor: PRIMARY, opacity: isPaying ? 0.7 : 1 }]}
        >
          {isPaying ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.payBtnText}>Proceed to Payment</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default TransactionScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 14, paddingTop: 10, gap: 14 },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerBtn:   { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerIcon:  { width: 20, height: 20, resizeMode: "contain" },
  headerTitle: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },

  // Steps
  stepRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  stepItem: { alignItems: "center", gap: 4 },
  stepDot:  { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepNum:  { fontSize: 12, fontWeight: "700" },
  stepLabel:{ fontSize: 11 },
  stepLine: { flex: 1, height: 2, marginHorizontal: 6, marginBottom: 14 },

  // Section labels
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  labelAccent:  { width: 4, height: 18, borderRadius: 2 },
  labelText:    { fontSize: 14, fontWeight: "700" },

  // Product card
  productCard: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 16, borderWidth: 1, padding: 12, gap: 12,
  },
  productImg:  { width: 80, height: 80, borderRadius: 12 },
  productInfo: { flex: 1, gap: 5 },
  productName: { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  qualityBadge:{ alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  qualityText: { fontSize: 9, fontWeight: "800" },
  productPrice:{ fontSize: 15, fontWeight: "900" },
  productLocation: { fontSize: 10 },
  viewArrow:   { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  arrowText:   { fontSize: 22, fontWeight: "700", marginTop: -2 },

  // Seller row
  sellerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 12,
  },
  sellerEmoji:   { fontSize: 24 },
  sellerLabel:   { fontSize: 10, fontWeight: "600", textTransform: "uppercase" },
  sellerName:    { fontSize: 13, fontWeight: "700" },
  verifiedBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  verifiedText:  { fontSize: 11, fontWeight: "700" },

  // Summary card
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 0 },
  feeRow:  { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9 },
  feeLabel:{ fontSize: 13 },
  feeValue:{ fontSize: 13, fontWeight: "600" },
  divider: { height: 1 },
  totalDivider: { height: 1.5, marginVertical: 4 },

  // Payment method
  paymentMethod: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 2, padding: 12,
  },
  paymentIcon:  { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  paymentTitle: { fontSize: 14, fontWeight: "700" },
  paymentSub:   { fontSize: 11, marginTop: 2 },
  selectedDot:  { width: 10, height: 10, borderRadius: 5 },

  // Related
  relatedList: { gap: 10, paddingVertical: 4 },
  relatedCard: {
    width: 140, borderRadius: 14, borderWidth: 1, overflow: "hidden",
  },
  relatedImg:       { width: "100%", height: 110 },
  relatedBadge:     { position: "absolute", top: 6, left: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  relatedBadgeText: { color: "#fff", fontSize: 8, fontWeight: "800" },
  relatedInfo:  { padding: 8, gap: 4 },
  relatedName:  { fontSize: 11, fontWeight: "600" },
  relatedPrice: { fontSize: 12, fontWeight: "800" },

  // Sticky footer
  stickyFooter: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 14, paddingVertical: 14,
    borderTopWidth: 1,
  },
  footerTotal:  { flex: 1 },
  footerLabel:  { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  footerAmount: { fontSize: 18, fontWeight: "900" },
  payBtn: {
    flex: 2, height: 52, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  payBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  // Result screens
  resultScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  resultIcon:   { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  resultEmoji:  { fontSize: 36 },
  resultTitle:  { fontSize: 22, fontWeight: "800" },
  resultSub:    { fontSize: 14, textAlign: "center", lineHeight: 20 },
  resultBtn:    { width: "100%", height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
  resultBtnText:{ color: "#fff", fontSize: 15, fontWeight: "800" },
});