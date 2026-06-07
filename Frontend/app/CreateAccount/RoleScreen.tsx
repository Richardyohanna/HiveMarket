import { Colors, FontSize } from '@/constants/theme';
import { serverRole } from '@/src/api/userApi';
import { userStore } from '@/src/store/userStore';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
} from 'react-native';

// ─── Brand colours ────────────────────────────────────────────────────────────
const GREEN        = "#008100";
const GREEN_SUBTLE = "#e6f4e6";
const DARK_BG      = "#0d150d";
const DARK_CARD    = "#111e11";
const DARK_BORDER  = "rgba(0,180,0,0.18)";

// ─── Role definitions ─────────────────────────────────────────────────────────
type Role = {
  role: string;
  emoji: string;
  tagline: string;
  perks: string[];
  roleImage: ImageSourcePropType;
};

const ROLES: Role[] = [
  {
    role: "Student",
    emoji: "🎒",
    tagline: "Browse & buy from peers",
    perks: ["Discover campus deals", "Chat with sellers", "Save favourites"],
    roleImage: require("../../assets/images/RoleScreen/student.png"),
  },
  {
    role: "Seller",
    emoji: "🛍️",
    tagline: "List & sell your items",
    perks: ["Post listings for free", "Reach campus buyers", "Manage your shop"],
    roleImage: require("../../assets/images/RoleScreen/seller.png"),
  },
];

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

// ─── Role card ────────────────────────────────────────────────────────────────
const RoleCard = ({
  item,
  selected,
  onSelect,
  isDark,
}: {
  item: Role;
  selected: boolean;
  onSelect: () => void;
  isDark: boolean;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], width: "100%" }}>
      <Pressable
        onPress={onSelect}
        onPressIn={onIn}
        onPressOut={onOut}
        style={[
          rc.wrap,
          {
            backgroundColor: selected
              ? isDark ? "#0a2a0a" : "#d6f0d6"
              : isDark ? DARK_CARD : "#fff",
            borderColor: selected ? GREEN : isDark ? DARK_BORDER : "rgba(0,129,0,0.1)",
            shadowColor: selected ? GREEN : "#000",
          },
        ]}
      >
        {/* Selection ring */}
        <View style={[rc.dot, {
          borderColor: selected ? GREEN : isDark ? "#3a5a3a" : "#c0d8c0",
          backgroundColor: selected ? GREEN : "transparent",
        }]}>
          {selected && <Text style={{ color: "#fff", fontSize: 9, fontWeight: "900" }}>✓</Text>}
        </View>

        {/* Left: image + emoji badge */}
        <View style={rc.imageWrap}>
          <Image
            source={item.roleImage}
            style={[rc.image, {
              borderColor: selected ? GREEN : isDark ? DARK_BORDER : "rgba(0,129,0,0.12)",
            }]}
            resizeMode="cover"
          />
          <View style={[rc.emojiBadge, { backgroundColor: selected ? GREEN : isDark ? "#1a2e1a" : GREEN_SUBTLE }]}>
            <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
          </View>
        </View>

        {/* Right: text */}
        <View style={rc.textBlock}>
          <Text style={[rc.roleName, { color: isDark ? "#d0ffd0" : "#0d1a0d" }]}>
            {item.role}
          </Text>
          <Text style={[rc.tagline, { color: selected ? GREEN : isDark ? "#5a7a5a" : "#7a9a7a" }]}>
            {item.tagline}
          </Text>

          <View style={rc.perksList}>
            {item.perks.map((perk) => (
              <View key={perk} style={rc.perkRow}>
                <View style={[rc.perkDot, { backgroundColor: selected ? GREEN : isDark ? "#3a5a3a" : "#c0d8c0" }]} />
                <Text style={[rc.perkText, { color: isDark ? "#7a9a7a" : "#4a7a4a" }]}>{perk}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Selected glow strip */}
        {selected && <View style={rc.selectedStrip} />}
      </Pressable>
    </Animated.View>
  );
};

const rc = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 20, borderWidth: 1.5,
    padding: 16, marginBottom: 14, gap: 16,
    shadowOpacity: 0.1, shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
    overflow: "hidden", position: "relative",
  },
  dot: {
    position: "absolute", top: 14, right: 14,
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  imageWrap: { position: "relative" },
  image: {
    width: 88, height: 88, borderRadius: 16, borderWidth: 2,
  },
  emojiBadge: {
    position: "absolute", bottom: -6, right: -6,
    width: 28, height: 28, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  textBlock: { flex: 1, gap: 4 },
  roleName:  { fontSize: 18, fontWeight: "900", letterSpacing: -0.3 },
  tagline:   { fontSize: 12, fontWeight: "600" },
  perksList: { marginTop: 8, gap: 5 },
  perkRow:   { flexDirection: "row", alignItems: "center", gap: 7 },
  perkDot:   { width: 5, height: 5, borderRadius: 3 },
  perkText:  { fontSize: 12 },
  selectedStrip: {
    position: "absolute", left: 0, top: 0, bottom: 0,
    width: 4, backgroundColor: GREEN,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
const RoleScreen = () => {
  const { email, role, setRole } = userStore();

  const scheme    = useColorScheme();
  const isDark    = scheme === "dark";
  const theme     = isDark ? Colors.dark : Colors.light;
  const themeSize = FontSize.size;

  const [loading, setLoading] = useState(false);

  // Button animation
  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const onNext = () => {
    setLoading(true);

    console.log("This is the role before sending it ", role)
    serverRole(role || "Student", email, (response: any) => {
      console.log("Server response for role selection:", response);
    }).then(() => {
      setLoading(false);
      router.push("/CreateAccount/GenderScreen");
    });
  };

  const selectedRole = ROLES.find(r => r.role === role);

  return (
    <View style={[s.root, { backgroundColor: isDark ? DARK_BG : "#f4faf4", paddingTop: 25 }]}>

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

      {/* Header */}
      <View style={s.header}>
        <Text style={[s.stepLabel, { color: isDark ? "#5a7a5a" : "#7a9a7a" }]}>
          Step 1 of 3
        </Text>
      </View>

      {/* Progress */}
      <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
        <ProgressBar step={1} total={3} />
      </View>

      {/* Content */}
      <View style={s.content}>

        {/* Title block */}
        <View style={s.titleBlock}>
          <Text style={[s.title, { color: isDark ? "#e0ffe0" : "#0d1a0d" }]}>
            What's your role?
          </Text>
          <Text style={[s.subtitle, { color: isDark ? "#5a7a5a" : "#7a9a7a" }]}>
            Choose how you'll use HiveMarket.{"\n"}You can always switch later.
          </Text>
        </View>

        {/* Role cards */}
        <View style={{ width: "100%" }}>
          {ROLES.map(item => (
            <RoleCard
              key={item.role}
              item={item}
              selected={role === item.role}
              onSelect={() => setRole(item.role)}
              isDark={isDark}
            />
          ))}
        </View>

        {/* Selected chip */}
        {role ? (
          <View style={[s.chip, { backgroundColor: isDark ? "#0a2a0a" : GREEN_SUBTLE }]}>
            <View style={[s.chipDot, { backgroundColor: GREEN }]} />
            <Text style={[s.chipText, { color: isDark ? "#7aba7a" : "#3a7a3a" }]}>
              Selected:{" "}
              <Text style={{ color: GREEN, fontWeight: "800" }}>
                {selectedRole?.emoji} {role}
              </Text>
            </Text>
          </View>
        ) : (
          <Text style={[s.hintText, { color: isDark ? "#3a5a3a" : "#b0c8b0" }]}>
            Tap a card to select your role
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={[s.footer, {
        backgroundColor: isDark ? DARK_BG : "#f4faf4",
        borderColor: isDark ? DARK_BORDER : "rgba(0,129,0,0.1)",
      }]}>
        <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%" }}>
          <Pressable
            onPress={onNext}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={loading}
            style={[s.nextBtn, {
              backgroundColor: role ? GREEN : isDark ? "#1a2e1a" : "#c8e6c8",
              opacity: loading ? 0.75 : 1,
            }]}
          >
            <View style={s.btnShimmer} />
            <Text style={[s.nextBtnText, { color: role ? "#fff" : isDark ? "#3a5a3a" : "#8aaa8a" }]}>
              {loading ? "Saving…" : "Continue"}
            </Text>
            {!loading && role && (
              <Text style={{ color: "#fff", fontSize: 16, marginLeft: 6 }}>→</Text>
            )}
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={() => router.push("/CreateAccount/GenderScreen")}
          style={s.skipBtn}
        >
          <Text style={[s.skipText, { color: isDark ? "#3a5a3a" : "#9aba9a" }]}>
            Skip for now
          </Text>
        </Pressable>
      </View>

    </View>
  );
};

export default RoleScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  bgPattern: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  ring:      { position: "absolute", borderWidth: 1 },

  header: {
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14,
    alignItems: "center",
  },
  stepLabel: { fontSize: 13, fontWeight: "700", letterSpacing: 0.4 },

  content: {
    flex: 1, paddingHorizontal: 20, alignItems: "center",
  },

  titleBlock: { alignItems: "center", gap: 8, marginBottom: 24 },
  iconBubble: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title:    { fontSize: 24, fontWeight: "900", textAlign: "center", letterSpacing: -0.4 },
  subtitle: { fontSize: 13, textAlign: "center", lineHeight: 20 },

  chip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 20, marginTop: 4,
  },
  chipDot:  { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: "500" },
  hintText: { fontSize: 12, fontWeight: "500", marginTop: 4 },

  footer: {
    paddingHorizontal: 20, paddingBottom: 36, paddingTop: 14,
    borderTopWidth: 1, alignItems: "center", gap: 4,
  },
  nextBtn: {
    flexDirection: "row", borderRadius: 16, paddingVertical: 16,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden", position: "relative", width: "100%",
  },
  btnShimmer: {
    position: "absolute", top: 0, left: "10%",
    width: "30%", height: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ skewX: "-20deg" }],
  },
  nextBtnText: { fontWeight: "800", fontSize: 15, letterSpacing: 0.4 },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  skipText: { fontSize: 13, fontWeight: "600" },
});