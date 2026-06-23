/**
 * TransactionScreen — Checkout → Paystack WebView
 * ─────────────────────────────────────────────────
 * Flow:
 *  1. User reviews item + picks Card or Bank Transfer
 *  2. Tap "Proceed to Payment" → calls your backend initializePayment()
 *     which returns { authorization_url, reference, ... }
 *  3. Push to /PaymentScreen with { url, reference, productId, productName }
 *  4. PaymentScreen loads Paystack's hosted UI in a WebView
 *  5. On success/cancel Paystack redirects → PaymentScreen handles result
 *
 * No card details are ever collected here — Paystack handles everything.
 */

import { Colors, FontSize } from "@/constants/theme";
import { initializePayment } from "@/src/api/paymentApi";
import { increaseProductViewApi } from "@/src/api/productApi";
import { useProducts } from "@/src/hooks/useProducts";
import { userStore } from "@/src/store/userStore";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";
const SERVICE_FEE  = 50.6;

type PayMethod = "card" | "bank_transfer";

// ─── Small helpers ────────────────────────────────────────────────────────────

const SectionLabel = ({
  text,
  theme,
}: {
  text: string;
  isDark: boolean;
  theme: any;
}) => (
  <View style={styles.sectionLabel}>
    <View style={[styles.labelAccent, { backgroundColor: PRIMARY }]} />
    <Text style={[styles.labelText, { color: theme.text }]}>{text}</Text>
  </View>
);

const FeeRow = ({
  label,
  value,
  bold,
  color,
  theme,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
  theme: any;
}) => (
  <View style={styles.feeRow}>
    <Text
      style={[
        styles.feeLabel,
        { color: theme.readColor },
        bold && { color: theme.text, fontWeight: "700" },
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.feeValue,
        { color: color ?? theme.text },
        bold && { fontWeight: "800", fontSize: 15 },
      ]}
    >
      {value}
    </Text>
  </View>
);

const RelatedCard = React.memo(({ item, isDark, theme, onPress }: any) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.relatedCard,
      {
        backgroundColor: theme.sectionBackground,
        borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
      },
    ]}
  >
    <Image
      source={
        item.pImage
          ? { uri: item.pImage }
          : require("../../assets/images/HomeScreen/nike.png")
      }
      style={styles.relatedImg}
      resizeMode="cover"
    />
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

// ─── Main ─────────────────────────────────────────────────────────────────────

const TransactionScreen = () => {
  // ── All hooks first ───────────────────────────────────────────────────────
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;
  const fs     = FontSize.size;

  const { id } = useLocalSearchParams<{ id: string }>();

  const user = userStore.getState();
  const { products: recentListings } = useProducts(user.id);

  const [payMethod,   setPayMethod]   = useState<PayMethod>("card");
  const [isLoading,   setIsLoading]   = useState(false);
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const product = useMemo(
    () => recentListings.find((item) => String(item.id) === String(id)),
    [recentListings, id]
  );

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return recentListings.filter((item) => item.id !== product.id).slice(0, 8);
  }, [recentListings, product]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onBack = useCallback(() => router.back(), []);

  const onProductClicked = useCallback((productId: string) => {
    increaseProductViewApi(productId);
    router.push({
      pathname: "/ProductDetail/ProductDetail",
      params: { id: productId },
    });
  }, []);

  /**
   * Single entry point for both payment methods.
   * Calls your backend initialize endpoint, which returns:
   *   { authorization_url, reference, access_code }
   * Then pushes to PaymentScreen with the hosted URL.
   *
   * Paystack automatically handles Card vs Bank Transfer on their page
   * based on the `channels` array you pass during initialization.
   * If you only pass ["card"] Paystack shows only card UI.
   * If you pass ["bank_transfer"] or leave it out, Paystack shows all options.
   *
   * Recommended: pass nothing (let Paystack show all options) OR
   * send the chosen channel to your backend and include it in the
   * Paystack initialize call as `channels: ["card"]` or `channels: ["bank_transfer"]`.
   */
  const handleProceed = useCallback(async () => {
    if (!product) return;
    if(userStore.getState().id == null || userStore.getState().id == "" ) {

      Alert.alert("Login Required", "Please Login to be able to make payment to this product", [{text: "Cancel" }, {text: "Login" , onPress: () => router.push("/Login/LoginScreen")}])
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const email = userStore.getState().email ?? "student@hivemarket.ng";
      const amount = Math.round(Number(product.pAmount) + SERVICE_FEE);

      const initData = await initializePayment({
        productId:     product.id,
        buyerId:       userStore.getState().id,  // use id not email here
        customerEmail: email,
        amount,
        // Optional: forward the chosen channel to your backend
        // so it can pass channels: [payMethod] to Paystack
       // channel: payMethod,
      });

      // Your backend should return authorization_url + reference
      const authUrl   = initData.authorizationUrl ?? initData.data?.authorizationUrl;
      const reference = initData.reference         ?? initData.data?.reference;

      console.log("[TransactionScreen] Paystack URL →", authUrl);
      console.log("[TransactionScreen] Reference   →", reference);

      if (!authUrl) throw new Error("No authorization URL returned from backend");
      if (!reference) throw new Error("No reference returned from backend");

      // ── Navigate to the WebView payment screen ────────────────────────────
      router.push({
        pathname: "./PaymentScreen",   
        params: {
          url:         authUrl,
          reference,
          productId:   String(product.id),
          productName: product.pName,
          sellerId: product.sellerId,
          buyerId: user.id
        },
      });
    } catch (e: any) {
      console.error("[TransactionScreen] init error:", e);
      setErrorMsg(e?.message ?? "Failed to start payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [product, payMethod]);

  // ── No early returns before this line ─────────────────────────────────────

  if (!product) {
    return (
      <View style={[styles.centred, { backgroundColor: theme.screenBackground }]}>
        <Text style={[styles.resultSub, { color: theme.readColor }]}>
          Product not found
        </Text>
      </View>
    );
  }

  const total = Number(product.pAmount) + SERVICE_FEE;

  // ════════════════════════════════════════════════════════════════════
  //  CHECKOUT SCREEN
  // ════════════════════════════════════════════════════════════════════
  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      {/* Header */}
      <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerBtn}>
          <Text style={{ fontSize: 30, color: theme.text, fontWeight: "700" }}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Step indicator */}
        <View style={styles.stepRow}>
          {["Review", "Payment", "Done"].map((step, i) => (
            <React.Fragment key={step}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor:
                        i === 0 ? PRIMARY : isDark ? PRIMARY_DARK : "#d4edda",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNum,
                      { color: i === 0 ? "#fff" : theme.readColor },
                    ]}
                  >
                    {i + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: i === 0 ? PRIMARY : theme.readColor,
                      fontWeight: i === 0 ? "700" : "400",
                    },
                  ]}
                >
                  {step}
                </Text>
              </View>
              {i < 2 && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: isDark ? PRIMARY_DARK : "#d4edda" },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Product card */}
        <SectionLabel text="Review Item" isDark={isDark} theme={theme} />
        <Pressable
          onPress={() => onProductClicked(product.id)}
          style={[
            styles.productCard,
            {
              backgroundColor: theme.sectionBackground,
              borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
            },
          ]}
        >
          <Image
            source={
              product.pImage
                ? { uri: product.pImage }
                : require("../../assets/images/ProductDetail/Hero Image.png")
            }
            style={styles.productImg}
          />
          <View style={styles.productInfo}>
            <Text
              style={[styles.productName, { color: theme.text }]}
              numberOfLines={2}
            >
              {product.pName}
            </Text>
            <Text style={[styles.productPrice, { color: PRIMARY }]}>
              ₦{Number(product.pAmount).toLocaleString()}
            </Text>
            {product.location && (
              <Text style={[styles.productLocation, { color: theme.readColor }]}>
                📍 {product.location}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.viewArrow,
              { backgroundColor: isDark ? "#0f1f0f" : PRIMARY_SOFT },
            ]}
          >
            <Text style={[styles.arrowText, { color: PRIMARY }]}>›</Text>
          </View>
        </Pressable>

        {/* Seller info */}
        {product.sellerName && (
          <View
            style={[
              styles.sellerRow,
              {
                backgroundColor: theme.sectionBackground,
                borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
              },
            ]}
          >
            <Text style={{ fontSize: 24 }}>🧑‍💼</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sellerLabel, { color: theme.readColor }]}>
                Seller
              </Text>
              <Text style={[styles.sellerName, { color: theme.text }]}>
                {product.sellerName}
              </Text>
            </View>
            <View
              style={[
                styles.verifiedBadge,
                { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT },
              ]}
            >
              <Text style={[styles.verifiedText, { color: PRIMARY }]}>
                ✓ Verified
              </Text>
            </View>
          </View>
        )}

        {/* Order summary */}
        <SectionLabel text="Order Summary" isDark={isDark} theme={theme} />
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.sectionBackground,
              borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
            },
          ]}
        >
          <FeeRow
            label="Item price"
            value={`₦${Number(product.pAmount).toLocaleString()}`}
            theme={theme}
          />
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? PRIMARY_DARK : "#e4f0e4" },
            ]}
          />
          <FeeRow
            label="Service fee"
            value={`₦${SERVICE_FEE.toFixed(2)}`}
            theme={theme}
          />
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? PRIMARY_DARK : "#e4f0e4" },
            ]}
          />
          <FeeRow
            label="Delivery fee"
            value="Free"
            color={PRIMARY}
            theme={theme}
          />
          <View
            style={[
              styles.totalDivider,
              { backgroundColor: isDark ? PRIMARY_DARK : "#c8e6c9" },
            ]}
          />
          <FeeRow
            label="Total"
            value={`₦${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            bold
            color={PRIMARY}
            theme={theme}
          />
        </View>

        {/* Payment method selector */}
        <SectionLabel text="Payment Method" isDark={isDark} theme={theme} />

        {/* Info note about Paystack */}
        <View
          style={[
            styles.paystackNote,
            {
              backgroundColor: isDark ? "#0a1f0a" : PRIMARY_SOFT,
              borderColor: isDark ? PRIMARY_DARK : "#c8e6c9",
            },
          ]}
        >
          <Text style={{ fontSize: 13, color: PRIMARY, lineHeight: 19 }}>
            🔒 Payment is processed securely by{" "}
            <Text style={{ fontWeight: "800" }}>Paystack</Text>. Your card
            details are never stored on HiveMarket's servers.
          </Text>
        </View>



        {/* Error */}
        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          </View>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <>
            <SectionLabel text="You May Also Like" isDark={isDark} theme={theme} />
            <FlatList
              data={relatedProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `rel_${item.id}`}
              contentContainerStyle={styles.relatedList}
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

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View
        style={[
          styles.stickyFooter,
          {
            backgroundColor: theme.screenBackground,
            borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
          },
        ]}
      >
        <View style={styles.footerTotal}>
          <Text style={[styles.footerLabel, { color: theme.readColor }]}>
            Total
          </Text>
          <Text style={[styles.footerAmount, { color: PRIMARY }]}>
            ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <Pressable
          style={[
            styles.payBtn,
            { backgroundColor: PRIMARY, opacity: isLoading ? 0.7 : 1 },
          ]}
          disabled={isLoading}
          onPress={handleProceed}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
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
  screen: { flex: 1, paddingTop: 25 },
  scroll: { paddingHorizontal: 14, paddingTop: 10, gap: 14 },
  centred: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn:   { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },

  stepRow:  { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  stepItem: { alignItems: "center", gap: 4 },
  stepDot:  { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepNum:  { fontSize: 12, fontWeight: "700" },
  stepLabel:{ fontSize: 11 },
  stepLine: { flex: 1, height: 2, marginHorizontal: 6, marginBottom: 14 },

  sectionLabel: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  labelAccent:  { width: 4, height: 18, borderRadius: 2 },
  labelText:    { fontSize: 14, fontWeight: "700" },

  productCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  productImg:      { width: 80, height: 80, borderRadius: 12 },
  productInfo:     { flex: 1, gap: 5 },
  productName:     { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  productPrice:    { fontSize: 15, fontWeight: "900" },
  productLocation: { fontSize: 10 },
  viewArrow:       { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  arrowText:       { fontSize: 22, fontWeight: "700", marginTop: -2 },

  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  sellerLabel:   { fontSize: 10, fontWeight: "600", textTransform: "uppercase" },
  sellerName:    { fontSize: 13, fontWeight: "700" },
  verifiedBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  verifiedText:  { fontSize: 11, fontWeight: "700" },

  summaryCard:  { borderRadius: 16, borderWidth: 1, padding: 14 },
  feeRow:       { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9 },
  feeLabel:     { fontSize: 13 },
  feeValue:     { fontSize: 13, fontWeight: "600" },
  divider:      { height: 1 },
  totalDivider: { height: 1.5, marginVertical: 4 },

  paystackNote: { borderRadius: 14, borderWidth: 1, padding: 14 },

  methodRow: { gap: 10 },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  methodLabel: { fontSize: 14, fontWeight: "600" },
  methodSub:   { fontSize: 11, marginTop: 2 },
  radioOuter:  { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner:  { width: 10, height: 10, borderRadius: 5 },

  relatedList: { gap: 10, paddingVertical: 4 },
  relatedCard: { width: 140, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  relatedImg:  { width: "100%", height: 110 },
  relatedInfo: { padding: 8, gap: 4 },
  relatedName: { fontSize: 11, fontWeight: "600" },
  relatedPrice:{ fontSize: 12, fontWeight: "800" },

  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  footerTotal:  { flex: 1 },
  footerLabel:  { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  footerAmount: { fontSize: 18, fontWeight: "900" },
  payBtn:       { flex: 2, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  payBtnText:   { color: "#fff", fontSize: 15, fontWeight: "800" },

  errorBox:  { backgroundColor: "#fff0f0", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#fca5a5" },
  errorText: { color: "#dc2626", fontSize: 13, fontWeight: "600" },

  resultSub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});