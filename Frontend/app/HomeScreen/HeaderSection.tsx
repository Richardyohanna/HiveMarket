import { Colors } from '@/constants/theme';
import { userStore } from '@/src/store/userStore';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

type HomeHeaderProp = {
  onNotificationClicked: () => void;
};

const HeaderSection = ({ onNotificationClicked }: HomeHeaderProp) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;

  const { email, full_name, profile_picture, gender } = userStore();

  // Subtle fade-in on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-8)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  const onProfileImage = () => router.navigate("/ProfileScreen/ProfileScreen");
  const onSignInClicked = () => router.navigate("/Login/LoginScreen");
  const onSignUpClicked = () => router.navigate("/CreateAccount/CreateAccountScreen");

  // Derive first name only for a cleaner greeting
  const firstName = full_name?.split(" ")[0] ?? "";

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    "Good evening";

  const avatarSource = profile_picture
    ? { uri: profile_picture }
    : gender === "Female"
    ? require('@/assets/images/CreateAccount/femaleUser.png')
    : require('@/assets/images/CreateAccount/user.png');

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* ── Left: avatar + greeting ────────────────────────────────── */}
      <Pressable onPress={onProfileImage} style={styles.left}>
        {/* Avatar with green ring when logged in */}
        <View style={[
          styles.avatarWrap,
          email ? styles.avatarRingActive : styles.avatarRingInactive,
        ]}>
          <Image source={avatarSource} style={styles.avatar} />
          {/* Online dot */}
          {email && (
            <View style={styles.onlineDot} />
          )}
        </View>

        {email ? (
          <View style={styles.greetingCol}>
            <Text style={[styles.greetingSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>
              {greeting} 👋
            </Text>
            <Text style={[styles.greetingName, { color: theme.text }]} numberOfLines={1}>
              {firstName || full_name}
            </Text>
          </View>
        ) : (
          <View style={styles.authRow}>
            <Pressable
              onPress={onSignInClicked}
              style={[styles.authBtn, { backgroundColor: PRIMARY }]}
            >
              <Text style={styles.authBtnText}>Sign In</Text>
            </Pressable>
            <Pressable
              onPress={onSignUpClicked}
              style={[styles.authBtn, {
                backgroundColor: "transparent",
                borderWidth: 1.5,
                borderColor: PRIMARY,
              }]}
            >
              <Text style={[styles.authBtnText, { color: PRIMARY }]}>Sign Up</Text>
            </Pressable>
          </View>
        )}
      </Pressable>

      {/* ── Right: hive logo mark + notification ──────────────────── */}
      <View style={styles.right}>
        {/* HiveMarket bee badge */}
        <View style={[styles.beeBadge, {
          backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT,
        }]}>
          <Text style={styles.beeEmoji}>🐝</Text>
        </View>

        {/* Notification bell */}
        <Pressable
          onPress={onNotificationClicked}
          style={[
            styles.notifBtn,
            {
              backgroundColor: isDark ? "#1E293B" : "#ffffff",
              shadowColor: isDark ? "#000" : "#008100",
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
            },
          ]}
        >
          <Image
            source={require("../../assets/images/HomeScreen/notification.png")}
            style={{ tintColor: isDark ? "#94a3b8" : "#475569" }}
          />
          {/* Notification badge dot */}
          <View style={styles.notifDot} />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default HeaderSection;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },

  // Left
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarWrap: {
    borderRadius: 24,
    padding: 2,
    position: "relative",
  },
  avatarRingActive: {
    borderWidth: 2,
    borderColor: "#008100",
  },
  avatarRingInactive: {
    borderWidth: 2,
    borderColor: "rgba(200,200,200,0.4)",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#fff",
  },

  greetingCol: { gap: 1, flex: 1 },
  greetingSub: { fontSize: 11, fontWeight: "500", letterSpacing: 0.2 },
  greetingName: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },

  authRow: { flexDirection: "row", gap: 8 },
  authBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  authBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // Right
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  beeBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  beeEmoji: { fontSize: 18 },

  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
});