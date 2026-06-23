/**
 * PaymentScreen — Paystack Hosted Payment (WebView)
 * ───────────────────────────────────────────────────
 * Loads Paystack's official payment page inside a WebView.
 * Detects success/cancel via URL changes and navigates accordingly.
 *
 * Params received (via router.push):
 *   url        — Paystack authorization_url from your backend
 *   reference  — transaction reference for backend verification
 *   productId  — to increment purchases on success
 *   productName — for display on success/fail screens
 */

import { Colors } from "@/constants/theme";
import { confirmPayment } from "@/src/api/paymentApi";
import { increaseProductPurchaseApi } from "@/src/api/productApi";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";

// ─── Inline result screens ────────────────────────────────────────────────────

const ResultScreen = ({
  type,
  productName,
  onRetry,
  onHome,
  theme,
}: {
  type: "success" | "failed" | "cancelled";
  productName: string;
  onRetry?: () => void;
  onHome: () => void;
  theme: any;
}) => {
  const config = {
    success: {
      emoji: "🎉",
      title: "Payment Successful!",
      sub: `Your order for ${productName} has been confirmed.`,
      bg: PRIMARY_SOFT,
      btn: "Back to Home",
      action: onHome,
    },
    failed: {
      emoji: "❌",
      title: "Payment Failed",
      sub: "Something went wrong. Please try again.",
      bg: "#fff3e0",
      btn: "Try Again",
      action: onRetry ?? onHome,
    },
    cancelled: {
      emoji: "↩️",
      title: "Payment Cancelled",
      sub: "You cancelled the payment. No charge was made.",
      bg: "#f1f5f9",
      btn: "Go Back",
      action: onRetry ?? onHome,
    },
  }[type];

  return (
    <View style={[styles.centred, { backgroundColor: theme.screenBackground }]}>
      <View style={[styles.resultIcon, { backgroundColor: config.bg }]}>
        <Text style={styles.resultEmoji}>{config.emoji}</Text>
      </View>
      <Text style={[styles.resultTitle, { color: theme.text }]}>{config.title}</Text>
      <Text style={[styles.resultSub, { color: theme.readColor }]}>{config.sub}</Text>
      <Pressable style={[styles.bigBtn, { backgroundColor: PRIMARY }]} onPress={config.action}>
        <Text style={styles.bigBtnText}>{config.btn}</Text>
      </Pressable>
      {type !== "success" && (
        <Pressable onPress={onHome} style={styles.ghostBtn}>
          <Text style={[styles.ghostBtnText, { color: theme.readColor }]}>Back to Home</Text>
        </Pressable>
      )}
    </View>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PaymentScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;

  

  const { url, reference, productId, productName, sellerId, buyerId } = useLocalSearchParams<{
    url: string;
    reference: string;
    productId: string;
    productName: string;
    sellerId: string;
    buyerId: string;
  }>();


  const [screen, setScreen] = useState<"webview" | "success" | "failed" | "cancelled">("webview");
  const [processing, setProcessing] = useState(false);
  const handledRef = useRef(false); // prevent double-firing

  const handleSuccess = useCallback(async () => {
  if (handledRef.current) return;
  handledRef.current = true;

  setProcessing(true);

  try {
    const ref = String(reference ?? "");
    if (!ref) throw new Error("Missing payment reference");

    // 1. FIRST verify & process payment
    await confirmPayment({
      productId,
      buyerId,
      sellerId,
      reference: ref,
    });

    // 2. OPTIONAL: update UI stats
    if (productId) {
      await increaseProductPurchaseApi(productId);
    }

    setScreen("success");

  } catch (e) {
    console.error("[PaymentScreen] confirm error", e);
    setScreen("failed");

  } finally {
    setProcessing(false);
  }
}, [productId, reference]);

  /*
  const handleSuccess = useCallback(async () => {
    if (handledRef.current) return;
    handledRef.current = true;
    setProcessing(true);
    try {
      const ref = String(reference ?? "");
      if (!ref) throw new Error("Missing payment reference");

      // Verify payment with backend; backend should handle wallet/transfer splitting
      await verifyPayment(ref);

      if (productId) await increaseProductPurchaseApi(productId);
      setScreen("success");
    } catch (e) {
      console.error("[PaymentScreen] verify error", e);
      setScreen("failed");
    } finally {
      setProcessing(false);
    }
  }, [productId, reference]); */

  const handleFailed = useCallback(() => {
    if (handledRef.current) return;
    handledRef.current = true;
    setScreen("failed");
  }, []);

  const handleCancelled = useCallback(() => {
    if (handledRef.current) return;
    handledRef.current = true;
    setScreen("cancelled");
  }, []);

  const onNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const navUrl = navState.url?.toLowerCase() ?? "";
      console.log("[PaymentScreen] nav →", navUrl);

      // Paystack redirects to your callback URL on success
      // Adjust these to match your actual Paystack callback/redirect URLs
      if (
        navUrl.includes("callback") ||
        navUrl.includes("success") ||
        navUrl.includes("verify") ||
        navUrl.includes("trxref=") // Paystack appends trxref on redirect
      ) {
        handleSuccess();
        return;
      }

      // Paystack cancel goes back or hits a cancel URL
      if (navUrl.includes("cancel") || navUrl.includes("close")) {
        handleCancelled();
        return;
      }

      if (navUrl.includes("failed") || navUrl.includes("error")) {
        handleFailed();
      }
    },
    [handleSuccess, handleFailed, handleCancelled]
  );

  const goHome = useCallback(() => router.replace("/"), []);

  const retry = useCallback(() => {
    handledRef.current = false;
    router.back();
  }, []);

  // ── Result screens ────────────────────────────────────────────────────────
  if (screen !== "webview") {
    return (
      <ResultScreen
        type={screen}
        productName={productName ?? "your item"}
        onRetry={retry}
        onHome={goHome}
        theme={theme}
      />
    );
  }

  // ── WebView ───────────────────────────────────────────────────────────────
  if (!url) {
    return (
      <View style={[styles.centred, { backgroundColor: theme.screenBackground }]}>
        <Text style={[styles.resultSub, { color: theme.readColor }]}>
          No payment URL provided. Please go back and try again.
        </Text>
        <Pressable style={[styles.bigBtn, { backgroundColor: PRIMARY }]} onPress={goHome}>
          <Text style={styles.bigBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.screenBackground, paddingTop: 25 }}>
      {/* Minimal header so user can bail out */}
      <View style={[styles.header, { borderColor: isDark ? "#1a3a1a" : "#e4f0e4" }]}>
        <Pressable onPress={handleCancelled} hitSlop={12} style={styles.headerBtn}>
          <Text style={{ fontSize: 30, color: theme.text, fontWeight: "700" }}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Secure Payment</Text>
        {/* Lock badge */}
        <View style={[styles.lockBadge, { backgroundColor: isDark ? "#0a1f0a" : PRIMARY_SOFT }]}>
          <Text style={{ fontSize: 14 }}>🔒</Text>
        </View>
      </View>

      {/* Trust bar */}
      <View style={[styles.trustBar, { backgroundColor: isDark ? "#0a1f0a" : PRIMARY_SOFT }]}>
        <Text style={[styles.trustText, { color: PRIMARY }]}>
          🛡️ Powered by Paystack · 256-bit SSL encryption
        </Text>
      </View>

      <WebView
        source={{ uri: String(url) }}
        onNavigationStateChange={onNavigationStateChange}
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.loadingOverlay, { backgroundColor: theme.screenBackground }]}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={[styles.loadingText, { color: theme.readColor }]}>Loading secure payment…</Text>
          </View>
        )}
        // Prevent the WebView from navigating away to unrelated pages
        setSupportMultipleWindows={false}
        javaScriptEnabled
        domStorageEnabled
        style={{ flex: 1 }}
      />

      {processing && (
        <View style={styles.processingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={[styles.loadingText, { color: theme.readColor }]}>Processing payment…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centred: {
    flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerBtn:   { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  lockBadge:   { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  trustBar: {
    paddingVertical: 7, paddingHorizontal: 14, alignItems: "center",
  },
  trustText: { fontSize: 11, fontWeight: "600" },

  loadingOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  loadingText: { fontSize: 13 },

  resultIcon:  { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  resultEmoji: { fontSize: 36 },
  resultTitle: { fontSize: 22, fontWeight: "800" },
  resultSub:   { fontSize: 14, textAlign: "center", lineHeight: 20 },
  bigBtn:      { width: "100%", height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bigBtnText:  { color: "#fff", fontSize: 15, fontWeight: "800" },
  ghostBtn:    { paddingVertical: 12 },
  ghostBtnText:{ fontSize: 14 },

  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    gap: 12,
  },
});