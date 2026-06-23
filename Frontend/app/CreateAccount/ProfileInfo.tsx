import { Colors, FontSize } from '@/constants/theme';
import { uploadProfilePicture } from '@/src/api/userApi';
import { userStore } from '@/src/store/userStore';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';

import {
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native';

// ─── Brand colours ────────────────────────────────────────────────────────────
const GREEN        = "#008100";
const GREEN_LIGHT  = "#00a300";
const GREEN_SUBTLE = "#e6f4e6";
const DARK_BG      = "#0d150d";
const DARK_CARD    = "#111e11";
const DARK_BORDER  = "rgba(0,180,0,0.18)";

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ step, total }: { step: number; total: number }) => (
  <View style={{ flexDirection: "row", gap: 6 }}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={{
        flex: 1, height: 4, borderRadius: 2,
        backgroundColor: i < step ? GREEN : "rgba(0,129,0,0.15)",
      }} />
    ))}
  </View>
);

// ─── Field component ──────────────────────────────────────────────────────────
const Field = ({
  label, placeholder, value, onChangeText,
  icon, isDark, autoCorrect,
}: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; icon: string;
  isDark: boolean; autoCorrect?: boolean;
}) => (
  <View style={{ width: "100%", marginBottom: 14 }}>
    <Text style={[fi.label, { color: isDark ? "#9aba9a" : "#3a5a3a" }]}>{label}</Text>
    <View style={[fi.row, {
      backgroundColor: isDark ? "#152015" : GREEN_SUBTLE,
      borderColor: value.trim()
        ? GREEN
        : isDark ? DARK_BORDER : "rgba(0,129,0,0.15)",
    }]}>
      <Text style={fi.icon}>{icon}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#3a5a3a" : "#9aba9a"}
        style={[fi.input, { color: isDark ? "#e0ffe0" : "#0d1a0d" }]}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={autoCorrect ?? false}
      />
      {value.trim().length > 0 && (
        <Text style={{ fontSize: 13 }}>✅</Text>
      )}
    </View>
  </View>
);

const fi = StyleSheet.create({
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.9, marginBottom: 7, textTransform: "uppercase" },
  row: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 13, gap: 10,
  },
  icon:  { fontSize: 16 },
  input: { flex: 1, fontSize: 14 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ProfileInfo = () => {
  const { email, gender } = userStore();

  const scheme    = useColorScheme();
  const isDark    = scheme === "dark";
  const theme     = isDark ? Colors.dark : Colors.light;
  const themeSize = FontSize.size;

  const [profilePicture, setProfilePicture] = useState("");
  const [address,       setAddress]       = useState("");
  const [location,       setLocation]       = useState<any>({});
  const [university,     setUniversity]     = useState("");
  const [campus,         setCampus]         = useState("");
  const [loading,        setLoading]        = useState(false);
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);

  // Avatar ring pulse animation
  const ringAnim = useRef(new Animated.Value(1)).current;
 
  useEffect(()=> {

    getCurrentLocation();

  }, [])

  const pulseRing = () => {
    Animated.sequence([
      Animated.timing(ringAnim, { toValue: 1.08, duration: 180, useNativeDriver: true }),
      Animated.timing(ringAnim, { toValue: 1,    duration: 180, useNativeDriver: true }),
    ]).start();
  };

  // Done button animation
  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const filledCount = [
    !!profilePicture,
    address.trim().length > 0,
    university.trim().length > 0,
    campus.trim().length > 0,
  ].filter(Boolean).length;

  const imageSelector = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission required", "Please allow gallery access.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets?.length > 0) {
        setProfilePicture(result.assets[0].uri);
        pulseRing();
      }
    } catch {
      Alert.alert("Error", "Unable to pick image.");
    }
  };

  const onDoneClick = () => {
    if (!address.trim())   { Alert.alert("Validation Error", "Please enter your location.");   return; }
    if (!university.trim()) { Alert.alert("Validation Error", "Please enter your university."); return; }
    if (!campus.trim())     { Alert.alert("Validation Error", "Please enter your campus.");     return; }

    setLoading(true);

    const Data = {
      address: address,
      latitude: latitude,
      longitude: longitude

    }

    setLocation(Data);

    console.log("This is the location", location, " here's the data" , Data);

    uploadProfilePicture(email, profilePicture, Data, university, campus)
      .then(() => {
        setLoading(false);
        router.replace("/Login/LoginScreen");
      });
  };

 

const getCurrentLocation = async () => {

    const { status } =
        await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
        Alert.alert("Location permission denied");
        return;
    }

    const current =
        await Location.getCurrentPositionAsync({});

    setLatitude(current.coords.latitude);
    setLongitude(current.coords.longitude);

    
    console.log(current.coords.latitude);
    console.log(current.coords.longitude);
};

  const isReady = address.trim() && university.trim() && campus.trim();

  return (
    <View style={[s.root, { backgroundColor: isDark ? DARK_BG : "#f4faf4" , paddingTop: 25}]}>

      {/* Background rings */}
      <View style={s.bgPattern} pointerEvents="none">
        {[...Array(5)].map((_, i) => (
          <View key={i} style={[s.ring, {
            width:  120 + i * 90,
            height: 120 + i * 90,
            borderRadius: 60 + i * 45,
            borderColor: isDark
              ? `rgba(0,180,0,${0.05 - i * 0.007})`
              : `rgba(0,129,0,${0.06 - i * 0.009})`,
          }]} />
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.scroll}
          >

            {/* Header */}
            <View style={s.header}>
              <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
                <Text style={[s.backArrow, { color: theme.text }]}>‹</Text>
              </Pressable>
              <Text style={[s.stepLabel, { color: isDark ? "#5a7a5a" : "#7a9a7a" }]}>Step 3 of 3</Text>
              <View style={{ width: 36 }} />
            </View>

            {/* Progress */}
            <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
              <ProgressBar step={3} total={3} />
            </View>

            {/* Card */}
            <View style={[s.card, {
              backgroundColor: isDark ? DARK_CARD : "#fff",
              borderColor: isDark ? DARK_BORDER : "rgba(0,129,0,0.1)",
              shadowColor: isDark ? GREEN : "#000",
            }]}>

              {/* Title */}
              <View style={s.titleBlock}>

                <Text style={[s.title, { color: isDark ? "#e0ffe0" : "#0d1a0d" }]}>
                  Complete Your Profile
                </Text>
                <Text style={[s.subtitle, { color: isDark ? "#5a7a5a" : "#7a9a7a" }]}>
                  Almost there! Add a photo and your university details.
                </Text>
              </View>

              {/* Avatar */}
              <View style={s.avatarSection}>
                <Pressable onPress={imageSelector}>
                  <Animated.View style={[s.avatarRingOuter, {
                    transform: [{ scale: ringAnim }],
                    borderColor: profilePicture ? GREEN : isDark ? DARK_BORDER : "rgba(0,129,0,0.2)",
                    backgroundColor: isDark ? "#0a2a0a" : GREEN_SUBTLE,
                  }]}>
                    <View style={[s.avatarRingInner, {
                      borderColor: profilePicture ? GREEN : "transparent",
                    }]}>
                      <Image
                        source={
                          profilePicture
                            ? { uri: profilePicture }
                            : gender === "Female"
                              ? require("@/assets/images/CreateAccount/femaleUser.png")
                              : require("@/assets/images/CreateAccount/user.png")
                        }
                        style={s.avatar}
                        resizeMode="cover"
                      />
                    </View>
                  </Animated.View>

                  {/* Camera badge */}
                  <View style={[s.cameraBadge, { backgroundColor: GREEN, borderColor: isDark ? DARK_CARD : "#fff" }]}>
                    <Text style={{ fontSize: 13 }}>📷</Text>
                  </View>
                </Pressable>

                <View style={s.avatarMeta}>
                  <Text style={[s.avatarLabel, { color: isDark ? "#d0ffd0" : "#0d1a0d" }]}>
                    {profilePicture ? "Photo uploaded ✅" : "Add profile photo"}
                  </Text>
                  <Text style={[s.avatarHint, { color: isDark ? "#3a5a3a" : "#9aba9a" }]}>
                    Tap the photo to upload from gallery
                  </Text>
                </View>
              </View>

              {/* Completion pill */}
              <View style={[s.pill, { backgroundColor: isDark ? "#0a2a0a" : GREEN_SUBTLE }]}>
                <View style={[s.pillBar, { width: `${(filledCount / 4) * 100}%` }]} />
                <Text style={[s.pillText, { color: isDark ? "#7aba7a" : "#3a7a3a" }]}>
                  {filledCount} of 4 fields complete
                </Text>
              </View>

              {/* Fields */}
              <View style={{ marginTop: 20 }}>
                <Field
                  label="Location"
                  placeholder="e.g. Lagos, Nigeria"
                  value={address}
                  onChangeText={(data) => {setAddress(data); }}
                  icon="📍"
                  isDark={isDark}
                />
                <Field
                  label="University"
                  placeholder="e.g. University of Lagos"
                  value={university}
                  onChangeText={setUniversity}
                  icon="🏛️"
                  isDark={isDark}
                />
                <Field
                  label="Campus"
                  placeholder="e.g. Yaba Campus"
                  value={campus}
                  onChangeText={setCampus}
                  icon="🏫"
                  isDark={isDark}
                />
              </View>

              {/* Tip */}
              <View style={[s.tip, {
                backgroundColor: isDark ? "#0a2a0a" : "#f0faf0",
                borderColor: isDark ? DARK_BORDER : "rgba(0,129,0,0.15)",
              }]}>
                <Text style={{ fontSize: 14 }}>💡</Text>
                <Text style={[s.tipText, { color: isDark ? "#5a8a5a" : "#4a7a4a" }]}>
                  Your university info helps connect you with buyers and sellers on your campus.
                </Text>
              </View>

            </View>

            <View style={{ height: 120 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Sticky footer */}
      <View style={[s.footer, {
        backgroundColor: isDark ? DARK_BG : "#f4faf4",
        borderColor: isDark ? DARK_BORDER : "rgba(0,129,0,0.1)",
      }]}>
        <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%" }}>
          <Pressable
            onPress={onDoneClick}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={loading || !isReady}
            style={[s.doneBtn, {
              backgroundColor: isReady ? GREEN : isDark ? "#1a2e1a" : "#c8e6c8",
              opacity: loading ? 0.75 : 1,
            }]}
          >
            <View style={s.btnShimmer} />
            <Text style={[s.doneBtnText, { color: isReady ? "#fff" : isDark ? "#3a5a3a" : "#8aaa8a" }]}>
              {loading ? "Uploading…" : "Finish Setup"}
            </Text>
            {!loading && isReady && <Text style={{ color: "#fff", fontSize: 16, marginLeft: 6 }}>🎉</Text>}
          </Pressable>
        </Animated.View>
      </View>

    </View>
  );
};

export default ProfileInfo;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 40 },

  bgPattern: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderWidth: 1 },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  backBtn:   { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 30, fontWeight: "300", lineHeight: 34 },
  stepLabel: { fontSize: 13, fontWeight: "700", letterSpacing: 0.4 },

  // Card
  card: {
    marginHorizontal: 16, borderRadius: 24, borderWidth: 1,
    padding: 22,
    shadowOpacity: 0.07, shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },

  titleBlock: { alignItems: "center", gap: 8, marginBottom: 24 },
  iconBubble: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title:    { fontSize: 22, fontWeight: "900", textAlign: "center", letterSpacing: -0.3 },
  subtitle: { fontSize: 13, textAlign: "center", lineHeight: 20 },

  // Avatar
  avatarSection: { alignItems: "center", marginBottom: 20, position: "relative" },
  avatarRingOuter: {
    width: 108, height: 108, borderRadius: 54,
    borderWidth: 3, padding: 4,
    alignItems: "center", justifyContent: "center",
  },
  avatarRingInner: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2, overflow: "hidden",
    alignItems: "center", justifyContent: "center",
  },
  avatar:     { width: 96, height: 96, borderRadius: 48 },
  cameraBadge: {
    position: "absolute", bottom: 24, right: "30%",
    width: 30, height: 30, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },
  avatarMeta:  { alignItems: "center", marginTop: 10, gap: 3 },
  avatarLabel: { fontSize: 14, fontWeight: "700" },
  avatarHint:  { fontSize: 11 },

  // Completion pill
  pill: {
    borderRadius: 10, height: 32,
    overflow: "hidden", justifyContent: "center",
    paddingHorizontal: 12, position: "relative",
  },
  pillBar: {
    position: "absolute", left: 0, top: 0, bottom: 0,
    backgroundColor: "rgba(0,129,0,0.15)", borderRadius: 10,
  },
  pillText: { fontSize: 11, fontWeight: "700", zIndex: 1 },

  // Tip
  tip: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    borderRadius: 12, borderWidth: 1,
    padding: 12, marginTop: 16,
  },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },

  // Footer
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 36, paddingTop: 14,
    borderTopWidth: 1,
  },
  doneBtn: {
    flexDirection: "row", borderRadius: 16, paddingVertical: 16,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden", position: "relative",
  },
  btnShimmer: {
    position: "absolute", top: 0, left: "10%",
    width: "30%", height: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ skewX: "-20deg" }],
  },
  doneBtnText: { fontWeight: "800", fontSize: 15, letterSpacing: 0.4 },
});