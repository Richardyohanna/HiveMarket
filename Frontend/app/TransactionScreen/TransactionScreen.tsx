/**
 * TransactionScreen — In-App Paystack Payment
 * ─────────────────────────────────────────────
 * Flow:
 *  1. User selects Card or Bank Transfer
 *  2. For Card: enters number/expiry/cvv → chargeCard()
 *     - If Paystack returns "send_pin" → PIN screen
 *     - If "send_otp"                  → OTP screen
 *     - If "success"                   → Success screen
 *  3. For Bank Transfer: chargeBankTransfer() → Paystack returns
 *     a dedicated virtual account → student transfers manually
 *  4. On success: call backend verify + increaseProductPurchase
 *
 * Your backend only needs its existing initialize + verify endpoints.
 * The charge happens directly between the app and Paystack using your
 * PUBLIC key (safe to embed in the app).
 */

import { Colors, FontSize } from '@/constants/theme';
import { initializePayment } from "@/src/api/paymentApi";
import { increaseProductPurchaseApi, increaseProductViewApi } from "@/src/api/productApi";
import { CardDetails, ChargeResult, usePaystackInApp } from '@/src/hooks/usePaystackInApp';
import { useProducts } from '@/src/hooks/useProducts';
import { userStore } from '@/src/store/userStore';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";
const SERVICE_FEE  = 50.6;

type PayMethod = "card" | "bank_transfer";
type Screen    = "checkout" | "card_entry" | "pin" | "otp" | "awaiting" | "success" | "failed";

// ─── Small helpers ────────────────────────────────────────────────────────────

const SectionLabel = ({ text, isDark, theme }: { text: string; isDark: boolean; theme: any }) => (
  <View style={styles.sectionLabel}>
    <View style={[styles.labelAccent, { backgroundColor: PRIMARY }]} />
    <Text style={[styles.labelText, { color: theme.text }]}>{text}</Text>
  </View>
);

const FeeRow = ({
  label, value, bold, color, theme,
}: { label: string; value: string; bold?: boolean; color?: string; theme: any }) => (
  <View style={styles.feeRow}>
    <Text style={[styles.feeLabel, { color: theme.readColor }, bold && { color: theme.text, fontWeight: "700" }]}>
      {label}
    </Text>
    <Text style={[styles.feeValue, { color: color ?? theme.text }, bold && { fontWeight: "800", fontSize: 15 }]}>
      {value}
    </Text>
  </View>
);

const RelatedCard = React.memo(({ item, isDark, theme, onPress }: any) => (
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
    <View style={styles.relatedInfo}>
      <Text numberOfLines={1} style={[styles.relatedName, { color: theme.text }]}>{item.pName}</Text>
      <Text style={[styles.relatedPrice, { color: PRIMARY }]}>
        ₦{Number(item.pAmount).toLocaleString()}
      </Text>
    </View>
  </Pressable>
));

// ─── Card number formatter ────────────────────────────────────────────────────
function formatCardNumber(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

//Reference Generator
const generateReference = () => {
  return `HIVEMARKET-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
};


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

  //const recentListings     = useProductStore((s) => s.recentListings);
  //const updateRecentListing = useProductStore((s) => s.updateRecentListing);

  const {
    status: chargeStatus, result: chargeResult, errorMsg,
    chargeCard, submitPin, submitOtp, chargeBankTransfer, reset: resetCharge,
  } = usePaystackInApp();

  const [screen,     setScreen]     = useState<Screen>("checkout");
  const [payMethod,  setPayMethod]  = useState<PayMethod>("card");
  const [reference,  setReference]  = useState<string>("");

  // Card form state
  const [cardNum,    setCardNum]    = useState("");
  const [expiry,     setExpiry]     = useState("");
  const [cvv,        setCvv]        = useState("");
  const [cardName,   setCardName]   = useState("");

  // PIN / OTP state
  const [pin,        setPin]        = useState("");
  const [otp,        setOtp]        = useState("");

  const [bankTransferData, setBankTransferData] = useState<any>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Countdown for bank transfer
  const [countdown,  setCountdown]  = useState(600); // 10 min
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const product = useMemo(
    () => recentListings.find((item) => String(item.id) === String(id)),
    [recentListings, id]
  );

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return recentListings.filter((item) => item.id !== product.id).slice(0, 8);
  }, [recentListings, product]);

  // ── Watch charge status to transition screens ─────────────────────────────
  useEffect(() => {
    if (!chargeResult) return;
    switch (chargeResult.status) {
      case "send_pin":         setScreen("pin");      break;
      case "send_otp":         setScreen("otp");      break;
      case "awaiting_transfer":
        setScreen("awaiting");
        // start countdown
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setCountdown((c) => {
            if (c <= 1) { clearInterval(timerRef.current!); return 0; }
            return c - 1;
          });
        }, 1000);
        break;
      case "success":
        handleSuccess();
        break;
      case "failed":
        setScreen("failed");
        break;
    }
  }, [chargeResult]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Success handler ───────────────────────────────────────────────────────
  const handleSuccess = useCallback(() => {
    if (!product) return;
    increaseProductPurchaseApi(String(product.id));
   // updateRecentListing(product.id, { purchases: (product.purchases || 0) + 1 });
    setScreen("success");
  }, [product]); // , updateRecentListing]);

  // ── Get reference from your backend, then charge ──────────────────────────
  const getRefAndCharge = useCallback(async (method: PayMethod, card?: CardDetails) => {
    if (!product) return;

    // Read email without calling userStore as a hook
    const email = userStore.getState().email || "student@hivemarket.ng";

    // Step 1: initialize via YOUR backend (returns reference + access_code)
    let ref: string;
    try {
     const initData = await initializePayment({
        productId: product.id,
        buyerId: userStore.getState().email,
        customerEmail: email,
        amount: Math.round(
          Number(product.pAmount) + SERVICE_FEE
        ),
      });
      
      ref = initData.reference ?? initData.data?.reference; 
      
      console.log("This is the generated ref", ref);
      if (!ref) throw new Error("No reference returned from backend");
      setReference(ref);
    } catch (e: any) {
      setScreen("failed");
      return;
    }

    // Step 2: charge directly via Paystack public key
    const amount = Math.round((Number(product.pAmount) + SERVICE_FEE) * 100);

    if (method === "card" && card) {
      await chargeCard({ email, amount, reference: ref, card });
    } 
  }, [product, chargeCard, chargeBankTransfer]);

  // ── Handle card submission ────────────────────────────────────────────────
  const handleCardSubmit = useCallback(() => {
    const [rawMonth, rawYear] = expiry.split("/");
    const card: CardDetails = {
      number:   cardNum.replace(/\s/g, ""),
      cvv,
      expMonth: rawMonth?.trim() ?? "",
      expYear:  rawYear?.trim() ?? "",
    };
    getRefAndCharge("card", card);
  }, [cardNum, expiry, cvv, getRefAndCharge]);

  const handleBankTransfer = useCallback(async () => {
    if (!product) return;

    try {
      const email = userStore.getState().email || "student@hivemarket.ng";

      const ref = generateReference();

      console.log("THis is the Backrequest Data that i am sending ", email, Math.round( Number(product.pAmount) + SERVICE_FEE), ref );
      // Initialize transaction from backend
      const initData = await chargeBankTransfer({
        email: email,
        amount: Math.round(Number(product.pAmount) + SERVICE_FEE) ,
        reference: ref
    })
      
      /*initializePayment({
        productId: product.id,
        buyerId: userStore.getState().email,
        customerEmail: email,
        amount: Math.round(
          Number(product.pAmount) + SERVICE_FEE
        ),
      }); */

      console.log("THis is the initData ", initData);

      const transferData = initData; //initData.data || 

      setReference(transferData.reference);

      setBankTransferData({
        accountNumber:
          //transferData.account_number ||
          transferData.accountNumber,

        accountName:
          //transferData.account_name ||
          transferData.accountName,

        bankName:
          //transferData.bank_name ||
          transferData.bankName,
      });

      setCountdown(600);

      setScreen("awaiting");

    } catch (err) {
      console.log("Bank transfer error:", err);
      setScreen("failed");
    }
  }, [product]);

  const handlePinSubmit = useCallback(async () => {
    if (!reference) return;
    const res: ChargeResult = await submitPin(pin, reference);
    if (res.status === "success") handleSuccess();
  }, [pin, reference, submitPin, handleSuccess]);

  const handleOtpSubmit = useCallback(async () => {
    if (!reference) return;
    const res: ChargeResult = await submitOtp(otp, reference);
    if (res.status === "success") handleSuccess();
  }, [otp, reference, submitOtp, handleSuccess]);

  const onBack = useCallback(() => router.back(), []);

  const onProductClicked = useCallback((productId: string) => {
    increaseProductViewApi(productId);
    router.push({ pathname: "/ProductDetail/ProductDetail", params: { id: productId } });
  }, []);

  // ── No early returns before this line ─────────────────────────────────────

  if (!product) {
    return (
      <View style={[styles.centred, { backgroundColor: theme.screenBackground }]}>
        <Text style={[styles.resultSub, { color: theme.readColor }]}>Product not found</Text>
      </View>
    );
  }

  const total    = Number(product.pAmount) + SERVICE_FEE;
  const isLoading = chargeStatus === "loading";

  const formatCountdown = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ════════════════════════════════════════════════════════════════════
  //  SUCCESS SCREEN
  // ════════════════════════════════════════════════════════════════════
  if (screen === "success") {
    return (
      <View style={[styles.centred, { backgroundColor: theme.screenBackground }]}>
        <View style={[styles.resultIcon, { backgroundColor: PRIMARY_SOFT }]}>
          <Text style={styles.resultEmoji}>🎉</Text>
        </View>
        <Text style={[styles.resultTitle, { color: theme.text }]}>Payment Successful!</Text>
        <Text style={[styles.resultSub, { color: theme.readColor }]}>
          Your order for {product.pName} has been confirmed.
        </Text>
        <Pressable style={[styles.bigBtn, { backgroundColor: PRIMARY }]} onPress={() => router.replace("/")}>
          <Text style={styles.bigBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  //  FAILED SCREEN
  // ════════════════════════════════════════════════════════════════════
  if (screen === "failed") {
    return (
      <View style={[styles.centred, { backgroundColor: theme.screenBackground }]}>
        <View style={[styles.resultIcon, { backgroundColor: "#fff3e0" }]}>
          <Text style={styles.resultEmoji}>❌</Text>
        </View>
        <Text style={[styles.resultTitle, { color: theme.text }]}>Payment Failed</Text>
        <Text style={[styles.resultSub, { color: theme.readColor }]}>
          {chargeResult?.message ?? errorMsg ?? "Something went wrong. Please try again."}
        </Text>
        <Pressable
          style={[styles.bigBtn, { backgroundColor: PRIMARY }]}
          onPress={() => { resetCharge(); setScreen("checkout"); setPin(""); setOtp(""); }}
        >
          <Text style={styles.bigBtnText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  //  PIN SCREEN
  // ════════════════════════════════════════════════════════════════════
  if (screen === "pin") {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.screenBackground }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
          <Pressable onPress={() => setScreen("card_entry")} hitSlop={12} style={styles.headerBtn}>
           {/* <Image source={require("../../assets/images/ProductDetail/back.png")} style={[styles.headerIcon, { tintColor: theme.text }]} /> */}
           <Text style={{ fontSize: 30, color: theme.subText, fontWeight: "700" }} > ← </Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Enter PIN</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centredInner}>
          <View style={[styles.lockCircle, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}>
            <Text style={{ fontSize: 36 }}>🔒</Text>
          </View>
          <Text style={[styles.stepHeading, { color: theme.subText }]}>Card PIN</Text>
          <Text style={[styles.stepSub, { color: theme.readColor }]}>
            Enter your 4-digit card PIN to authorise this payment
          </Text>
          <TextInput
            value={pin}
            onChangeText={(t) => setPin(t.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            style={[styles.otpInput, {
              backgroundColor: theme.sectionBackground,
              color: theme.text,
              borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
              letterSpacing: 20,
            }]}
            placeholder="••••"
            placeholderTextColor={theme.readColor}
          />
          <Pressable
            style={[styles.bigBtn, { backgroundColor: PRIMARY, opacity: (pin.length < 4 || isLoading) ? 0.5 : 1 }]}
            disabled={pin.length < 4 || isLoading}
            onPress={handlePinSubmit}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bigBtnText}>Submit PIN</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  //  OTP SCREEN
  // ════════════════════════════════════════════════════════════════════
  if (screen === "otp") {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.screenBackground }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
          <Pressable onPress={() => setScreen("card_entry")} hitSlop={12} style={styles.headerBtn}>
            {/*<Image source={require("../../assets/images/ProductDetail/back.png")} style={[styles.headerIcon, { tintColor: theme.text }]} /> */}
            <Text style={{ fontSize: 30, color: theme.subText, fontWeight: "700" }} > ← </Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.subText }]}>OTP Verification</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centredInner}>
          <View style={[styles.lockCircle, { backgroundColor: isDark ? "#1a1030" : "#f5f3ff" }]}>
            <Text style={{ fontSize: 36 }}>📲</Text>
          </View>
          <Text style={[styles.stepHeading, { color: theme.text }]}>Enter OTP</Text>
          <Text style={[styles.stepSub, { color: theme.readColor }]}>
            {chargeResult?.message ?? "Enter the one-time password sent to your phone"}
          </Text>
          <TextInput
            value={otp}
            onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            style={[styles.otpInput, {
              backgroundColor: theme.sectionBackground,
              color: theme.text,
              borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
              letterSpacing: 16,
            }]}
            placeholder="000000"
            placeholderTextColor={theme.readColor}
          />
          <Pressable
            style={[styles.bigBtn, { backgroundColor: PRIMARY, opacity: (otp.length < 4 || isLoading) ? 0.5 : 1 }]}
            disabled={otp.length < 4 || isLoading}
            onPress={handleOtpSubmit}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bigBtnText}>Verify OTP</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  //  AWAITING BANK TRANSFER
  // ════════════════════════════════════════════════════════════════════
  if (screen === "awaiting") {
    const r = bankTransferData;
    return (
      <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
        <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
          <Pressable onPress={() => setScreen("checkout")} hitSlop={12} style={styles.headerBtn}>
            {/* <Image source={require("../../assets/images/ProductDetail/back.png")} style={[styles.headerIcon, { tintColor: theme.text }]} /> */}
            <Text style={{ fontSize: 30, color: theme.subText, fontWeight: "700" }} > ← </Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.subText }]}>Bank Transfer</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          {/* Timer */}
          <View style={[styles.timerBox, { backgroundColor: isDark ? "#0f1a2a" : "#eff6ff", borderColor: isDark ? "#1e3a5f" : "#bfdbfe" }]}>
            <Text style={styles.timerLabel}>Transfer expires in</Text>
            <Text style={[styles.timerValue, { color: countdown < 60 ? "#ef4444" : "#3b82f6" }]}>
              {formatCountdown(countdown)}
            </Text>
          </View>

          {/* Amount */}
          <View style={[styles.transferAmtBox, { backgroundColor: isDark ? "#0a1f0a" : PRIMARY_SOFT, borderColor: isDark ? PRIMARY_DARK : "#c8e6c9" }]}>
            <Text style={[styles.transferAmtLabel, { color: theme.readColor }]}>Amount to transfer</Text>
            <Text style={[styles.transferAmt, { color: PRIMARY }]}>
              ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {/* Account details */}
          <View style={[styles.accountCard, { backgroundColor: theme.sectionBackground, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
            <Text style={[styles.accountTitle, { color: theme.text }]}>Transfer to this account</Text>
            {[
              { label: "Bank Name",      value: r?.bankName      ?? "—" },
              { label: "Account Number", value: r?.accountNumber ?? "—" },
              { label: "Account Name",   value: r?.accountName   ?? "—" },
            ].map((row) => (
              <View key={row.label} style={styles.accountRow}>
                <Text style={[styles.accountLabel, { color: theme.readColor }]}>{row.label}</Text>
                <Text style={[styles.accountValue, { color: theme.text }]} selectable>{row.value}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.transferNote, { backgroundColor: isDark ? "#1a1030" : "#fef3c7", borderColor: isDark ? "#3a1a5f" : "#fcd34d" }]}>
            <Text style={{ color: isDark ? "#fcd34d" : "#92400e", fontSize: 13, lineHeight: 19 }}>
              ⚠️ Transfer the <Text style={{ fontWeight: "800" }}>exact amount</Text> shown. Your order will be confirmed automatically once payment is detected.
            </Text>
          </View>

          {/* Manual confirm (backup) */}
          <Pressable
            style={[styles.bigBtn, { backgroundColor: PRIMARY }]}
            onPress={() => {
              // Optionally call your backend verify endpoint here
              handleSuccess();
            }}
          >
            <Text style={styles.bigBtnText}>I've Made the Transfer</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  //  CARD ENTRY SCREEN
  // ════════════════════════════════════════════════════════════════════
  if (screen === "card_entry") {
    const cardValid = cardNum.replace(/\s/g, "").length === 16
                   && expiry.length >= 4
                   && cvv.length   >= 3;
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.screenBackground, paddingTop: 25 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
          <Pressable onPress={() => setScreen("checkout")} hitSlop={12} style={styles.headerBtn}>
            {/*<Image source={require("../../assets/images/ProductDetail/back.png")} style={[styles.headerIcon, { tintColor: theme.text }]} /> */}
            <Text style={{ fontSize: 30, color: theme.subText, fontWeight: "700" }} > ← </Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.subText }]}>Card Details</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
          {/* Card preview */}
          <View style={[styles.cardPreview, { backgroundColor: PRIMARY }]}>
            <View style={styles.cardPreviewTop}>
              <Text style={styles.cardPreviewLabel}>🐝 HiveMarket Pay</Text>
              <Text style={styles.cardPreviewChip}>💳</Text>
            </View>
            <Text style={styles.cardPreviewNumber}>
              {cardNum || "•••• •••• •••• ••••"}
            </Text>
            <View style={styles.cardPreviewBottom}>
              <View>
                <Text style={styles.cardPreviewSmall}>CARDHOLDER</Text>
                <Text style={styles.cardPreviewVal}>{cardName || "YOUR NAME"}</Text>
              </View>
              <View>
                <Text style={styles.cardPreviewSmall}>EXPIRES</Text>
                <Text style={styles.cardPreviewVal}>{expiry || "MM/YY"}</Text>
              </View>
            </View>
          </View>

          {/* Card number */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.readColor }]}>Card Number</Text>
            <TextInput
              value={cardNum}
              onChangeText={(t) => setCardNum(formatCardNumber(t))}
              keyboardType="number-pad"
              maxLength={19}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={theme.readColor}
              style={[styles.cardInput, { backgroundColor: theme.sectionBackground, color: theme.text, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}
            />
          </View>

          {/* Cardholder name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.readColor }]}>Cardholder Name</Text>
            <TextInput
              value={cardName}
              onChangeText={setCardName}
              placeholder="As it appears on card"
              placeholderTextColor={theme.readColor}
              autoCapitalize="words"
              style={[styles.cardInput, { backgroundColor: theme.sectionBackground, color: theme.text, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}
            />
          </View>

          {/* Expiry + CVV row */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.readColor }]}>Expiry</Text>
              <TextInput
                value={expiry}
                onChangeText={(t) => {
                  const raw = t.replace(/\D/g, "").slice(0, 4);
                  setExpiry(raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw);
                }}
                keyboardType="number-pad"
                placeholder="MM/YY"
                maxLength={5}
                placeholderTextColor={theme.readColor}
                style={[styles.cardInput, { backgroundColor: theme.sectionBackground, color: theme.text, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: theme.readColor }]}>CVV</Text>
              <TextInput
                value={cvv}
                onChangeText={(t) => setCvv(t.replace(/\D/g, "").slice(0, 4))}
                keyboardType="number-pad"
                secureTextEntry
                placeholder="•••"
                maxLength={4}
                placeholderTextColor={theme.readColor}
                style={[styles.cardInput, { backgroundColor: theme.sectionBackground, color: theme.text, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}
              />
            </View>
          </View>

          {/* Amount */}
          <View style={[styles.payAmtBox, { backgroundColor: isDark ? "#0a1f0a" : PRIMARY_SOFT, borderColor: isDark ? PRIMARY_DARK : "#c8e6c9" }]}>
            <Text style={[styles.payAmtLabel, { color: theme.readColor }]}>Amount to charge</Text>
            <Text style={[styles.payAmt, { color: PRIMARY }]}>
              ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          )}

          <Pressable
            style={[styles.bigBtn, { backgroundColor: PRIMARY, opacity: (!cardValid || isLoading) ? 0.5 : 1 }]}
            disabled={!cardValid || isLoading}
            onPress={handleCardSubmit}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.bigBtnText}>Pay ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            }
          </Pressable>

          <Text style={[styles.secureNote, { color: theme.readColor }]}>
            🔒 Secured by Paystack · Your card details are encrypted
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  //  CHECKOUT SCREEN (default)
  // ════════════════════════════════════════════════════════════════════
  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
      {/* Header */}
      <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerBtn}>
          {/*<Image source={require("../../assets/images/ProductDetail/back.png")} style={[styles.headerIcon, { tintColor: theme.text }]} /> */}
          <Text style={{ fontSize: 30, color: theme.subText, fontWeight: "700" }} > ← </Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.subText }]}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          {["Review", "Payment", "Done"].map((step, i) => (
            <React.Fragment key={step}>
              <View style={styles.stepItem}>
                <View style={[styles.stepDot, { backgroundColor: i === 0 ? PRIMARY : isDark ? PRIMARY_DARK : "#d4edda" }]}>
                  <Text style={[styles.stepNum, { color: i === 0 ? "#fff" : theme.readColor }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, { color: i === 0 ? PRIMARY : theme.readColor, fontWeight: i === 0 ? "700" : "400" }]}>{step}</Text>
              </View>
              {i < 2 && <View style={[styles.stepLine, { backgroundColor: isDark ? PRIMARY_DARK : "#d4edda" }]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Product card */}
        <SectionLabel text="Review Item" isDark={isDark} theme={theme} />
        <Pressable
          onPress={() => onProductClicked(product.id)}
          style={[styles.productCard, { backgroundColor: theme.sectionBackground, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}
        >
          <Image
            source={product.pImage ? { uri: product.pImage } : require("../../assets/images/ProductDetail/Hero Image.png")}
            style={styles.productImg}
          />
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>{product.pName}</Text>
            <Text style={[styles.productPrice, { color: PRIMARY }]}>₦{Number(product.pAmount).toLocaleString()}</Text>
            {product.location && <Text style={[styles.productLocation, { color: theme.readColor }]}>📍 {product.location}</Text>}
          </View>
          <View style={[styles.viewArrow, { backgroundColor: isDark ? "#0f1f0f" : PRIMARY_SOFT }]}>
            <Text style={[styles.arrowText, { color: PRIMARY }]}>›</Text>
          </View>
        </Pressable>

        {/* Seller info */}
        {product.sellerName && (
          <View style={[styles.sellerRow, { backgroundColor: theme.sectionBackground, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
            <Text style={{ fontSize: 24 }}>🧑‍💼</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sellerLabel, { color: theme.readColor }]}>Seller</Text>
              <Text style={[styles.sellerName, { color: theme.text }]}>{product.sellerName}</Text>
            </View>
            <View style={[styles.verifiedBadge, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}>
              <Text style={[styles.verifiedText, { color: PRIMARY }]}>✓ Verified</Text>
            </View>
          </View>
        )}

        {/* Order summary */}
        <SectionLabel text="Order Summary" isDark={isDark} theme={theme} />
        <View style={[styles.summaryCard, { backgroundColor: theme.sectionBackground, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
          <FeeRow label="Item price"   value={`₦${Number(product.pAmount).toLocaleString()}`}                            theme={theme} />
          <View style={[styles.divider, { backgroundColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]} />
          <FeeRow label="Service fee"  value={`₦${SERVICE_FEE.toFixed(2)}`}                                              theme={theme} />
          <View style={[styles.divider, { backgroundColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]} />
          <FeeRow label="Delivery fee" value="Free"                                              color={PRIMARY}          theme={theme} />
          <View style={[styles.totalDivider, { backgroundColor: isDark ? PRIMARY_DARK : "#c8e6c9" }]} />
          <FeeRow label="Total"        value={`₦${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} bold color={PRIMARY} theme={theme} />
        </View>

        {/* Payment method selector */}
        <SectionLabel text="Payment Method" isDark={isDark} theme={theme} />
        <View style={styles.methodRow}>
          {(["card", "bank_transfer"] as PayMethod[]).map((m) => {
            const active = payMethod === m;
            const label  = m === "card" ? "💳  Debit/Credit Card" : "🏦  Bank Transfer";
            return (
              <Pressable
                key={m}
                onPress={() => setPayMethod(m)}
                style={[styles.methodCard, {
                  backgroundColor:  active ? (isDark ? PRIMARY_DARK : PRIMARY_SOFT) : theme.sectionBackground,
                  borderColor:      active ? PRIMARY : (isDark ? "#334155" : "#E2E8F0"),
                  borderWidth:      active ? 2 : 1,
                }]}
              >
                <Text style={[styles.methodLabel, { color: active ? PRIMARY : theme.text }]}>{label}</Text>
                <View style={[styles.radioOuter, { borderColor: active ? PRIMARY : theme.readColor }]}>
                  {active && <View style={[styles.radioInner, { backgroundColor: PRIMARY }]} />}
                </View>
              </Pressable>
            );
          })}
        </View>

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
                <RelatedCard item={item} isDark={isDark} theme={theme} onPress={() => onProductClicked(item.id)} />
              )}
            />
          </>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View style={[styles.stickyFooter, { backgroundColor: theme.screenBackground, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <View style={styles.footerTotal}>
          <Text style={[styles.footerLabel, { color: theme.readColor }]}>Total</Text>
          <Text style={[styles.footerAmount, { color: PRIMARY }]}>
            ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <Pressable
          style={[styles.payBtn, { backgroundColor: PRIMARY }]}
         onPress={async () => {
            if (payMethod === "card") {
              setScreen("card_entry");
            } else {
              await handleBankTransfer();
            }
          }}
        >
          <Text style={styles.payBtnText}>
            {payMethod === "card" ? "Enter Card Details" : "Get Account Details"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default TransactionScreen;

const styles = StyleSheet.create({
  screen:  { flex: 1 , paddingTop: 25},
  scroll:  { paddingHorizontal: 14, paddingTop: 10, gap: 14 },
  centred: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  centredInner: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 16 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerBtn:   { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerIcon:  { width: 20, height: 20, resizeMode: "contain" },
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
    flexDirection: "row", alignItems: "center",
    borderRadius: 16, borderWidth: 1, padding: 12, gap: 12,
  },
  productImg:      { width: 80, height: 80, borderRadius: 12 },
  productInfo:     { flex: 1, gap: 5 },
  productName:     { fontSize: 13, fontWeight: "700", lineHeight: 18 },
  productPrice:    { fontSize: 15, fontWeight: "900" },
  productLocation: { fontSize: 10 },
  viewArrow:       { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  arrowText:       { fontSize: 22, fontWeight: "700", marginTop: -2 },

  sellerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 12,
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

  methodRow: { gap: 10 },
  methodCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 14, padding: 14,
  },
  methodLabel:  { fontSize: 14, fontWeight: "600" },
  radioOuter:   { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner:   { width: 10, height: 10, borderRadius: 5 },

  relatedList: { gap: 10, paddingVertical: 4 },
  relatedCard: { width: 140, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  relatedImg:  { width: "100%", height: 110 },
  relatedInfo: { padding: 8, gap: 4 },
  relatedName: { fontSize: 11, fontWeight: "600" },
  relatedPrice:{ fontSize: 12, fontWeight: "800" },

  stickyFooter: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 14, paddingVertical: 14, borderTopWidth: 1,
  },
  footerTotal:  { flex: 1 },
  footerLabel:  { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  footerAmount: { fontSize: 18, fontWeight: "900" },
  payBtn:       { flex: 2, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  payBtnText:   { color: "#fff", fontSize: 15, fontWeight: "800" },

  // Card entry
  cardPreview: {
    borderRadius: 18, padding: 22, gap: 16,
    shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  cardPreviewTop:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardPreviewLabel:  { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "700" },
  cardPreviewChip:   { fontSize: 22 },
  cardPreviewNumber: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 3, fontVariant: ["tabular-nums"] as any },
  cardPreviewBottom: { flexDirection: "row", justifyContent: "space-between" },
  cardPreviewSmall:  { color: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: "600", letterSpacing: 1 },
  cardPreviewVal:    { color: "#fff", fontSize: 13, fontWeight: "700", marginTop: 2 },

  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: "600" },
  cardInput:  { borderRadius: 12, borderWidth: 1, padding: 13, fontSize: 15 },

  payAmtBox: { borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  payAmtLabel:{ fontSize: 12 },
  payAmt:     { fontSize: 22, fontWeight: "900" },

  errorBox:  { backgroundColor: "#fff0f0", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#fca5a5" },
  errorText: { color: "#dc2626", fontSize: 13, fontWeight: "600" },
  secureNote:{ textAlign: "center", fontSize: 11, marginTop: 4 },

  bigBtn:     { width: "100%", height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bigBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  // PIN/OTP
  lockCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  stepHeading:{ fontSize: 22, fontWeight: "800" },
  stepSub:    { fontSize: 14, textAlign: "center", lineHeight: 20 },
  otpInput: {
    width: 200, height: 56, borderRadius: 14, borderWidth: 1,
    textAlign: "center", fontSize: 22, fontWeight: "700",
  },

  // Bank transfer
  timerBox: { borderRadius: 14, borderWidth: 1, padding: 16, alignItems: "center", gap: 4 },
  timerLabel:{ fontSize: 12, fontWeight: "600" },
  timerValue:{ fontSize: 28, fontWeight: "900" },

  transferAmtBox: { borderRadius: 14, borderWidth: 1, padding: 16, alignItems: "center", gap: 4 },
  transferAmtLabel:{ fontSize: 12 },
  transferAmt:    { fontSize: 26, fontWeight: "900" },

  accountCard:  { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  accountTitle: { fontSize: 15, fontWeight: "800" },
  accountRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  accountLabel: { fontSize: 12, fontWeight: "500" },
  accountValue: { fontSize: 14, fontWeight: "700" },

  transferNote: { borderRadius: 12, borderWidth: 1, padding: 14 },

  // Result
  resultIcon:  { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  resultEmoji: { fontSize: 36 },
  resultTitle: { fontSize: 22, fontWeight: "800" },
  resultSub:   { fontSize: 14, textAlign: "center", lineHeight: 20 },
});