import { Colors, FontSize } from '@/constants/theme';
import { useProductStore } from "@/src/store/productStore";
import { userStore } from "@/src/store/userStore";
import { ProductCondition } from "@/src/types/products";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

const CATEGORIES = [
  { id: "Electronics",      emoji: "📱" },
  { id: "Books",            emoji: "📚" },
  { id: "Fashion",          emoji: "👗" },
  { id: "Hostel & Rooms",   emoji: "🏠" },
  { id: "Beauty & Care",    emoji: "💄" },
  { id: "Food & Snacks",    emoji: "🍔" },
  { id: "Services",         emoji: "🛠️" },
  { id: "Accessories",      emoji: "⌚" },
  { id: "Sports & Fitness", emoji: "⚽" },
  { id: "Furniture",        emoji: "🪑" },
  { id: "Vehicles",         emoji: "🚗" },
  { id: "Others",           emoji: "🎁" },
];

const CONDITIONS: { label: string; value: ProductCondition; desc: string }[] = [
  { label: "NEW",       value: "NEW",       desc: "Brand new, unused" },
  { label: "LIKE NEW",  value: "LIKE NEW",  desc: "Barely used, perfect condition" },
  { label: "UK USED",   value: "UK USED",   desc: "Foreign used, excellent" },
  { label: "GOOD",      value: "GOOD",      desc: "Used but works perfectly" },
  { label: "FAIR",      value: "FAIR",      desc: "Visible wear, works well" },
  { label: "USED",      value: "USED",      desc: "Heavily used, functional" },
];

// ─── Form field wrapper ───────────────────────────────────────────────────────
const FieldLabel = ({ label, required, theme }: {
  label: string; required?: boolean; theme: typeof Colors.light;
}) => (
  <View style={styles.fieldLabel}>
    <Text style={[styles.fieldLabelText, { color: theme.text }]}>{label}</Text>
    {required && <Text style={[styles.fieldRequired, { color: PRIMARY }]}>*</Text>}
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const SellScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;
  const fs     = FontSize.size;

  const {
    productName, description, price, category, condition, location,
    images, loading, error, successMessage,
    setProductName, setDescription, setPrice, setCategory,
    setCondition, setLocation, addImages, removeImage, createProduct,
  } = useProductStore();

  const { full_name, profile_picture, email } = userStore();

  const [imageIndex,    setImageIndex]    = useState(0);
  const [catVisible,    setCatVisible]    = useState(false);
  const [currentStep,   setCurrentStep]   = useState(1); // 1: photos+basic, 2: details, 3: pricing

  const pickImages = useCallback(async (limit: number) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission Required", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: limit,
    });
    if (!result.canceled) {
      addImages(result.assets.map((a) => a.uri));
      setImageIndex(0);
    }
  }, [addImages]);

  const handleSubmit = useCallback(async () => {
    const result = await createProduct();
    if (result.success) router.back();
  }, [createProduct]);

  const onCancel = useCallback(() => {
    Alert.alert("Discard Listing?", "Your changes won't be saved.", [
      { text: "Keep Editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => router.back() },
    ]);
  }, []);

  // ── Step progress ──────────────────────────────────────────────────────────
  const Steps = () => (
    <View style={styles.stepRow}>
      {["Photos", "Details", "Pricing"].map((s, i) => {
        const n    = i + 1;
        const done = currentStep > n;
        const act  = currentStep === n;
        return (
          <React.Fragment key={s}>
            <Pressable onPress={() => setCurrentStep(n)} style={styles.stepItem}>
              <View style={[styles.stepCircle, {
                backgroundColor: done ? PRIMARY : act ? PRIMARY : isDark ? "#1E293B" : "#E2E8F0",
                borderColor: act || done ? PRIMARY : isDark ? "#334155" : "#CBD5E1",
              }]}>
                {done
                  ? <Text style={styles.stepCheckmark}>✓</Text>
                  : <Text style={[styles.stepNum, { color: act ? "#fff" : theme.readColor }]}>{n}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, {
                color: act ? PRIMARY : theme.readColor,
                fontWeight: act ? "700" : "400",
              }]}>{s}</Text>
            </Pressable>
            {i < 2 && (
              <View style={[styles.stepLine, {
                backgroundColor: currentStep > n ? PRIMARY : isDark ? "#334155" : "#E2E8F0",
              }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.screenBackground }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>

          {/* ── Header ── */}
          <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
            <Pressable onPress={onCancel} hitSlop={12} style={styles.headerBtn}>
              <Text style={[styles.headerCancel, { color: theme.readColor }]}>✕</Text>
            </Pressable>
            <Text style={[styles.headerTitle, { color: theme.text }]}>List an Item</Text>
            <Pressable style={styles.headerBtn}>
              <Text style={[styles.headerDraft, { color: PRIMARY }]}>Draft</Text>
            </Pressable>
          </View>

          {/* ── Step indicator ── */}
          <View style={[styles.stepContainer, {
            backgroundColor: theme.sectionBackground,
            borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
          }]}>
            <Steps />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scroll}
          >

            {/* ══════ STEP 1: Photos + Basic ══════ */}
            {currentStep === 1 && (
              <>
                {/* Image picker */}
                {images.length > 0 ? (
                  <View style={styles.imagePreviewWrapper}>
                    <Image
                      source={{ uri: images[imageIndex] }}
                      style={styles.mainImage}
                      resizeMode="cover"
                    />

                    {/* Image count badge */}
                    <View style={[styles.imgCountBadge, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
                      <Text style={styles.imgCountText}>{imageIndex + 1}/{images.length}</Text>
                    </View>

                    {/* Remove current image */}
                    <Pressable
                      style={styles.removeImgBtn}
                      onPress={() => {
                        removeImage(imageIndex);
                        setImageIndex(Math.max(0, imageIndex - 1));
                      }}
                    >
                      <Text style={styles.removeImgText}>✕</Text>
                    </Pressable>

                    {/* Thumbnail strip */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.thumbStrip}
                    >
                      {images.map((uri, i) => (
                        <Pressable key={i} onPress={() => setImageIndex(i)}>
                          <Image
                            source={{ uri }}
                            style={[styles.thumb, i === imageIndex && styles.thumbActive]}
                          />
                        </Pressable>
                      ))}
                      {images.length < 10 && (
                        <Pressable
                          onPress={() => pickImages(10 - images.length)}
                          style={[styles.thumbAdd, { backgroundColor: "rgba(0,0,0,0.4)" }]}
                        >
                          <Text style={styles.thumbAddText}>+</Text>
                        </Pressable>
                      )}
                    </ScrollView>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => pickImages(10)}
                    style={[styles.imagePlaceholder, {
                      backgroundColor: isDark ? "#111d11" : PRIMARY_SOFT,
                      borderColor: isDark ? PRIMARY_DARK : "#a7d7a7",
                    }]}
                  >
                    <View style={[styles.cameraCircle, { backgroundColor: isDark ? PRIMARY_DARK : "#c8e6c9" }]}>
                      <Text style={styles.cameraEmoji}>📷</Text>
                    </View>
                    <Text style={[styles.placeholderTitle, { color: theme.text }]}>Add Photos</Text>
                    <Text style={[styles.placeholderSub, { color: theme.readColor }]}>
                      Tap to upload up to 10 photos{"\n"}First photo is the cover
                    </Text>
                    <View style={[styles.uploadBtn, { backgroundColor: PRIMARY }]}>
                      <Text style={styles.uploadBtnText}>Select from Gallery</Text>
                    </View>
                  </Pressable>
                )}

                {/* Product name */}
                <View style={styles.field}>
                  <FieldLabel label="Product Name" required theme={theme} />
                  <TextInput
                    value={productName}
                    onChangeText={setProductName}
                    placeholder="What are you selling?"
                    placeholderTextColor={theme.readColor}
                    style={[styles.input, {
                      backgroundColor: theme.sectionBackground,
                      color: theme.text,
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                    }]}
                  />
                </View>

                {/* Category */}
                <View style={styles.field}>
                  <FieldLabel label="Category" required theme={theme} />
                  <Pressable
                    onPress={() => { Keyboard.dismiss(); setCatVisible(true); }}
                    style={[styles.selector, {
                      backgroundColor: theme.sectionBackground,
                      borderColor: category !== "Select category" ? PRIMARY : isDark ? "#334155" : "#E2E8F0",
                    }]}
                  >
                    <Text style={[styles.selectorText, {
                      color: category === "Select category" ? theme.readColor : theme.text,
                    }]}>
                      {CATEGORIES.find((c) => c.id === category)?.emoji ?? "📦"} {category}
                    </Text>
                    <Text style={[styles.selectorChevron, { color: theme.readColor }]}>›</Text>
                  </Pressable>
                </View>

                {/* Next button */}
                <Pressable
                  style={[styles.nextBtn, { backgroundColor: PRIMARY }]}
                  onPress={() => setCurrentStep(2)}
                >
                  <Text style={styles.nextBtnText}>Next: Add Details →</Text>
                </Pressable>
              </>
            )}

            {/* ══════ STEP 2: Details ══════ */}
            {currentStep === 2 && (
              <>
                {/* Condition */}
                <View style={styles.field}>
                  <FieldLabel label="Item Condition" required theme={theme} />
                  <View style={styles.conditionGrid}>
                    {CONDITIONS.map((c) => {
                      const isSelected = condition === c.value;
                      return (
                        <Pressable
                          key={c.value}
                          onPress={() => setCondition(c.value as ProductCondition)}
                          style={[styles.conditionChip, {
                            backgroundColor: isSelected
                              ? PRIMARY
                              : isDark ? "#1E293B" : "#F1F5F9",
                            borderColor: isSelected ? PRIMARY : isDark ? "#334155" : "#E2E8F0",
                          }]}
                        >
                          <Text style={[styles.conditionLabel, {
                            color: isSelected ? "#fff" : theme.text,
                          }]}>
                            {c.label}
                          </Text>
                          <Text style={[styles.conditionDesc, {
                            color: isSelected ? "rgba(255,255,255,0.8)" : theme.readColor,
                          }]}>
                            {c.desc}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Description */}
                <View style={styles.field}>
                  <FieldLabel label="Description" required theme={theme} />
                  <TextInput
                    multiline
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe your item — size, color, defects, why you're selling..."
                    placeholderTextColor={theme.readColor}
                    style={[styles.textarea, {
                      backgroundColor: theme.sectionBackground,
                      color: theme.text,
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                    }]}
                  />
                  <Text style={[styles.charCount, { color: theme.readColor }]}>
                    {description.length} / 500
                  </Text>
                </View>

                {/* Location */}
                <View style={styles.field}>
                  <FieldLabel label="Pickup Location" required theme={theme} />
                  <View style={[styles.inputRow, {
                    backgroundColor: theme.sectionBackground,
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  }]}>
                    <Text style={{ fontSize: 16 }}>📍</Text>
                    <TextInput
                      value={location}
                      onChangeText={setLocation}
                      placeholder="e.g. Main Gate, Sabo, Buka Street..."
                      placeholderTextColor={theme.readColor}
                      style={[styles.inputRowText, { color: theme.text }]}
                    />
                  </View>
                </View>

                <View style={styles.rowButtons}>
                  <Pressable
                    style={[styles.backBtn, { borderColor: isDark ? PRIMARY_DARK : "#c8e6c9" }]}
                    onPress={() => setCurrentStep(1)}
                  >
                    <Text style={[styles.backBtnText, { color: PRIMARY }]}>← Back</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.nextBtn, { backgroundColor: PRIMARY, flex: 2 }]}
                    onPress={() => setCurrentStep(3)}
                  >
                    <Text style={styles.nextBtnText}>Next: Set Price →</Text>
                  </Pressable>
                </View>
              </>
            )}

            {/* ══════ STEP 3: Pricing ══════ */}
            {currentStep === 3 && (
              <>
                {/* Price */}
                <View style={styles.field}>
                  <FieldLabel label="Selling Price" required theme={theme} />
                  <View style={[styles.priceRow, {
                    backgroundColor: theme.sectionBackground,
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  }]}>
                    <View style={[styles.currencyBox, { backgroundColor: PRIMARY }]}>
                      <Text style={styles.currency}>₦</Text>
                    </View>
                    <TextInput
                      value={price}
                      onChangeText={setPrice}
                      placeholder="0.00"
                      placeholderTextColor={theme.readColor}
                      keyboardType="numeric"
                      style={[styles.priceInput, { color: theme.text }]}
                    />
                  </View>
                  {price && !isNaN(Number(price)) && Number(price) > 0 && (
                    <Text style={[styles.priceHint, { color: theme.readColor }]}>
                      You'll receive ₦{(Number(price) * 0.95).toLocaleString()} after 5% platform fee
                    </Text>
                  )}
                </View>

                {/* Summary card */}
                <View style={[styles.summaryCard, {
                  backgroundColor: isDark ? "#0a1f0a" : PRIMARY_SOFT,
                  borderColor: isDark ? PRIMARY_DARK : "#c8e6c9",
                }]}>
                  <Text style={[styles.summaryTitle, { color: PRIMARY }]}>📋 Listing Summary</Text>
                  {[
                    ["Name",      productName || "—"],
                    ["Category",  category !== "Select category" ? category : "—"],
                    ["Condition", condition || "—"],
                    ["Location",  location || "—"],
                    ["Price",     price ? `₦${Number(price).toLocaleString()}` : "—"],
                    ["Photos",    `${images.length} / 10`],
                  ].map(([label, value]) => (
                    <View key={label} style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: theme.readColor }]}>{label}</Text>
                      <Text style={[styles.summaryValue, { color: theme.text }]} numberOfLines={1}>
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>

                {error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </View>
                )}

                {successMessage && (
                  <View style={styles.successBox}>
                    <Text style={styles.successText}>✅ {successMessage}</Text>
                  </View>
                )}

                <View style={styles.rowButtons}>
                  <Pressable
                    style={[styles.backBtn, { borderColor: isDark ? PRIMARY_DARK : "#c8e6c9" }]}
                    onPress={() => setCurrentStep(2)}
                  >
                    <Text style={[styles.backBtnText, { color: PRIMARY }]}>← Back</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={loading}
                    style={[styles.submitBtn, { backgroundColor: PRIMARY, opacity: loading ? 0.65 : 1 }]}
                  >
                    <Text style={styles.submitBtnText}>
                      {loading ? "Posting..." : "🚀 Post Listing"}
                    </Text>
                  </Pressable>
                </View>

                <Text style={[styles.terms, { color: theme.readColor }]}>
                  By posting you agree to our{" "}
                  <Text style={{ color: PRIMARY, fontWeight: "600" }}>Terms of Service</Text>{" "}
                  and Community Guidelines
                </Text>
              </>
            )}

          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* ── Category modal ── */}
      <Modal visible={catVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setCatVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalSheet, {
                backgroundColor: isDark ? "#111d11" : "#fff",
                borderColor: isDark ? PRIMARY_DARK : "#c8e6c9",
              }]}>
                <View style={[styles.modalHandle, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Category</Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => { setCategory(cat.id); setCatVisible(false); }}
                      style={[styles.modalOption, {
                        backgroundColor: category === cat.id
                          ? isDark ? PRIMARY_DARK : PRIMARY_SOFT
                          : "transparent",
                        borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
                      }]}
                    >
                      <Text style={styles.modalEmoji}>{cat.emoji}</Text>
                      <Text style={[styles.modalOptionText, {
                        color: category === cat.id ? PRIMARY : theme.text,
                        fontWeight: category === cat.id ? "700" : "500",
                      }]}>
                        {cat.id}
                      </Text>
                      {category === cat.id && (
                        <Text style={[styles.selectedCheck, { color: PRIMARY }]}>✓</Text>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default SellScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerBtn:    { width: 44, alignItems: "center" },
  headerCancel: { fontSize: 18, fontWeight: "300" },
  headerTitle:  { fontSize: 16, fontWeight: "900", letterSpacing: -0.3 },
  headerDraft:  { fontSize: 13, fontWeight: "700" },

  // Steps
  stepContainer: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  stepRow:       { flexDirection: "row", alignItems: "center" },
  stepItem:      { alignItems: "center", gap: 3 },
  stepCircle: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },
  stepCheckmark: { color: "#fff", fontSize: 13, fontWeight: "700" },
  stepNum:       { fontSize: 12, fontWeight: "700" },
  stepLabel:     { fontSize: 10 },
  stepLine:      { flex: 1, height: 2, marginHorizontal: 6, marginBottom: 16 },

  scroll: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 60, gap: 4 },

  // Image picker
  imagePreviewWrapper: { width: "100%", borderRadius: 20, overflow: "hidden", marginBottom: 8, position: "relative" },
  mainImage:           { width: "100%", height: 280 },
  imgCountBadge: {
    position: "absolute", top: 12, left: 12,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  imgCountText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  removeImgBtn: {
    position: "absolute", top: 12, right: 12,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center", justifyContent: "center",
  },
  removeImgText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  thumbStrip:    { gap: 6, padding: 10, position: "absolute", bottom: 0, flexDirection: "row" },
  thumb:         { width: 52, height: 52, borderRadius: 10, opacity: 0.7 },
  thumbActive:   { opacity: 1, borderWidth: 2.5, borderColor: PRIMARY },
  thumbAdd: {
    width: 52, height: 52, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  thumbAddText: { color: "#fff", fontSize: 24, fontWeight: "300" },

  imagePlaceholder: {
    alignItems: "center", justifyContent: "center",
    borderRadius: 20, borderWidth: 2, borderStyle: "dashed",
    paddingVertical: 36, paddingHorizontal: 20, gap: 10, marginBottom: 8,
  },
  cameraCircle:    { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center" },
  cameraEmoji:     { fontSize: 30 },
  placeholderTitle:{ fontSize: 18, fontWeight: "800" },
  placeholderSub:  { fontSize: 13, textAlign: "center", lineHeight: 19 },
  uploadBtn:       { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 4 },
  uploadBtnText:   { color: "#fff", fontSize: 14, fontWeight: "700" },

  // Fields
  field:      { gap: 7, marginTop: 12 },
  fieldLabel: { flexDirection: "row", alignItems: "center", gap: 3 },
  fieldLabelText: { fontSize: 14, fontWeight: "700" },
  fieldRequired:  { fontSize: 14, fontWeight: "700" },

  input: {
    padding: 14, borderRadius: 14, borderWidth: 1,
    fontSize: 14,
  },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
  },
  inputRowText: { flex: 1, fontSize: 14 },
  textarea: {
    borderWidth: 1, borderRadius: 14, padding: 14,
    minHeight: 110, fontSize: 14, lineHeight: 21, textAlignVertical: "top",
  },
  charCount: { textAlign: "right", fontSize: 11 },
  selector: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13,
  },
  selectorText:    { flex: 1, fontSize: 14 },
  selectorChevron: { fontSize: 22, fontWeight: "300" },

  // Conditions
  conditionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  conditionChip: {
    width: "47%", borderRadius: 12, borderWidth: 1,
    padding: 12, gap: 2,
  },
  conditionLabel:{ fontSize: 12, fontWeight: "800" },
  conditionDesc: { fontSize: 10, lineHeight: 14 },

  // Pricing
  priceRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderRadius: 14, overflow: "hidden",
  },
  currencyBox: { paddingHorizontal: 16, paddingVertical: 14 },
  currency:    { color: "#fff", fontSize: 16, fontWeight: "800" },
  priceInput:  { flex: 1, paddingHorizontal: 14, fontSize: 20, fontWeight: "700" },
  priceHint:   { fontSize: 12, marginTop: 4 },

  // Summary
  summaryCard:  {
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 10, marginTop: 8,
  },
  summaryTitle: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
  summaryRow:   { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 12 },
  summaryValue: { fontSize: 12, fontWeight: "600", maxWidth: "60%" },

  // Buttons
  rowButtons: { flexDirection: "row", gap: 10, marginTop: 16 },
  nextBtn:    { height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", flex: 1 },
  nextBtnText:{ color: "#fff", fontSize: 14, fontWeight: "700" },
  backBtn:    { height: 50, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  backBtnText:{ fontSize: 14, fontWeight: "700" },
  submitBtn:  { flex: 2, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  // Feedback
  errorBox:   { backgroundColor: "#fff0f0", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#fca5a5" },
  errorText:  { color: "#dc2626", fontSize: 13, fontWeight: "600" },
  successBox: { backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#86efac" },
  successText:{ color: PRIMARY, fontSize: 13, fontWeight: "600" },
  terms:      { textAlign: "center", fontSize: 11, lineHeight: 17, marginTop: 12 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, padding: 20, maxHeight: "70%",
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  modalTitle:  { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  modalOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 13, paddingHorizontal: 10,
    borderRadius: 12, borderWidth: 1, marginBottom: 6,
  },
  modalEmoji:       { fontSize: 20 },
  modalOptionText:  { flex: 1, fontSize: 14 },
  selectedCheck:    { fontSize: 16, fontWeight: "700" },
});