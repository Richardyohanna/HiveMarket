import { Colors, FontSize } from '@/constants/theme';
import { serverGender } from '@/src/api/userApi';
import { userStore } from '@/src/store/userStore';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
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

// ─── Gender options with emoji + description ──────────────────────────────────
const GENDER_OPTIONS = [
  { gender: "Male",              emoji: "👨", desc: "He / Him"         },
  { gender: "Female",            emoji: "👩", desc: "She / Her"        },
  { gender: "Non-binary",        emoji: "🧑", desc: "They / Them"      },
  { gender: "Prefer not to say", emoji: "🤐", desc: "Stay private"     },
];

// ─── Animated gender card ─────────────────────────────────────────────────────
const GenderCard = ({
  item,
  selected,
  onSelect,
  isDark,
}: {
  item: typeof GENDER_OPTIONS[0];
  selected: boolean;
  onSelect: () => void;
  isDark: boolean;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], width: "46%" }}>
      <Pressable
        onPress={onSelect}
        onPressIn={onIn}
        onPressOut={onOut}
        style={[
          card.wrap,
          {
            backgroundColor: selected
              ? isDark ? "#0a2a0a" : "#d6f0d6"
              : isDark ? DARK_CARD : "#fff",
            borderColor: selected ? GREEN : isDark ? DARK_BORDER : "rgba(0,129,0,0.1)",
            shadowColor: selected ? GREEN : "#000",
          },
        ]}
      >
        {/* Selection indicator */}
        <View style={[
          card.dot,
          {
            borderColor: selected ? GREEN : isDark ? "#3a5a3a" : "#c0d8c0",
            backgroundColor: selected ? GREEN : "transparent",
          },
        ]}>
          {selected && <Text style={{ color: "#fff", fontSize: 9, fontWeight: "900" }}>✓</Text>}
        </View>

        {/* Emoji bubble */}
        <View style={[
          card.emojiBubble,
          { backgroundColor: selected ? GREEN : isDark ? "#1a2e1a" : GREEN_SUBTLE },
        ]}>
          <Text style={card.emoji}>{item.emoji}</Text>
        </View>

        <Text style={[card.gender, { color: isDark ? "#d0ffd0" : "#0d1a0d" }]}>
          {item.gender}
        </Text>
        <Text style={[card.desc, { color: isDark ? "#5a7a5a" : "#7a9a7a" }]}>
          {item.desc}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const card = StyleSheet.create({
  wrap: {
    borderRadius: 20, borderWidth: 1.5,
    padding: 16, alignItems: "center", margin: "2%",
    shadowOpacity: 0.1, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
    gap: 8,
  },
  dot: {
    position: "absolute", top: 12, right: 12,
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  emojiBubble: {
    width: 60, height: 60, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  emoji:  { fontSize: 30 },
  gender: { fontSize: 14, fontWeight: "800", textAlign: "center", letterSpacing: -0.2 },
  desc:   { fontSize: 11, fontWeight: "500", textAlign: "center" },
});

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ step, total }: { step: number; total: number }) => (
  <View style={{ flexDirection: "row", gap: 6, marginBottom: 28 }}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={{
          flex: 1, height: 4, borderRadius: 2,
          backgroundColor: i < step ? GREEN : "rgba(0,129,0,0.15)",
        }}
      />
    ))}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const GenderScreen = () => {
  const { email, gender, setGender } = userStore();

  const scheme    = useColorScheme();
  const isDark    = scheme === "dark";
  const themeSize = FontSize.size;
  const theme     = isDark ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(false);

  const userEmail = Array.isArray(email) ? email[0] : email;

  // Next button animation
  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const onNext = () => {
    if (!gender) return;
    setLoading(true);
    serverGender(gender, userEmail, (response) => {
      console.log("Gender server response:", response);
    }).then(() => {
      setLoading(false);
      router.push("/CreateAccount/ProfileInfo");
    });
  };

  return (
    <View style={[s.root, { backgroundColor: isDark ? DARK_BG : "#f4faf4" }]}>

      {/* Background rings */}
      <View style={s.bgPattern} pointerEvents="none">
        {[...Array(5)].map((_, i) => (
          <View key={i} style={[s.ring, {
            width:  140 + i * 100,
            height: 140 + i * 100,
            borderRadius: 70 + i * 50,
            borderColor: isDark
              ? `rgba(0,180,0,${0.05 - i * 0.007})`
              : `rgba(0,129,0,${0.06 - i * 0.009})`,
          }]} />
        ))}
      </View>

      {/* Header row */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
          <Text style={[s.backArrow, { color: theme.text }]}>‹</Text>
        </Pressable>
        <Text style={[s.stepLabel, { color: isDark ? "#5a7a5a" : "#7a9a7a" }]}>
          Step 2 of 3
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Content */}
      <View style={s.content}>
        <ProgressBar step={2} total={3} />

        {/* Title block */}
        <View style={s.titleWrap}>
          <Text style={[s.title, { color: isDark ? "#e0ffe0" : "#0d1a0d" }]}>
            How do you identify?
          </Text>
        </View>

        {/* Grid of gender cards */}
        <View style={s.grid}>
          {GENDER_OPTIONS.map((item) => (
            <GenderCard
              key={item.gender}
              item={item}
              selected={gender === item.gender}
              onSelect={() => setGender(item.gender)}
              isDark={isDark}
            />
          ))}
        </View>

        {/* Selected chip */}
        {gender ? (
          <View style={[s.selectedChip, { backgroundColor: isDark ? "#0a2a0a" : GREEN_SUBTLE }]}>
            <View style={[s.chipDot, { backgroundColor: GREEN }]} />
            <Text style={[s.chipText, { color: isDark ? "#9aba9a" : "#3a5a3a" }]}>
              Selected:{" "}
              <Text style={{ color: GREEN, fontWeight: "800" }}>{gender}</Text>
            </Text>
          </View>
        ) : (
          <View style={s.selectedChip}>
            <Text style={[s.chipText, { color: isDark ? "#3a5a3a" : "#b0c8b0" }]}>
              No option selected yet
            </Text>
          </View>
        )}
      </View>

      {/* Bottom actions */}
      <View style={s.footer}>
        <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%" }}>
          <Pressable
            onPress={onNext}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={loading || !gender}
            style={[s.nextBtn, {
              backgroundColor: gender ? GREEN : isDark ? "#1a2e1a" : "#c8e6c8",
              opacity: loading ? 0.75 : 1,
            }]}
          >
            <View style={s.btnShimmer} />
            <Text style={[s.nextBtnText, { color: gender ? "#fff" : isDark ? "#3a5a3a" : "#8aaa8a" }]}>
              {loading ? "Saving…" : "Continue"}
            </Text>
            {!loading && gender && (
              <Text style={{ color: "#fff", fontSize: 16, marginLeft: 6 }}>→</Text>
            )}
          </Pressable>
        </Animated.View>

        <Pressable onPress={() => router.push("/CreateAccount/ProfileInfo")} style={s.skipBtn}>
          <Text style={[s.skipText, { color: isDark ? "#3a5a3a" : "#9aba9a" }]}>
            Skip for now
          </Text>
        </Pressable>
      </View>

    </View>
  );
};

export default GenderScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:  { flex: 1, paddingTop: 25 },

  bgPattern: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  ring:      { position: "absolute", borderWidth: 1 },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8,
  },
  backBtn:   { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 30, fontWeight: "300", lineHeight: 34 },
  stepLabel: { fontSize: 13, fontWeight: "700", letterSpacing: 0.4 },

  // Content
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },

  titleWrap: { alignItems: "center", marginBottom: 28, gap: 10 },
  iconBubble: {
    width: 68, height: 68, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  title:    { fontSize: 24, fontWeight: "900", textAlign: "center", letterSpacing: -0.4 },
  subtitle: { fontSize: 13, textAlign: "center", lineHeight: 20 },

  grid: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "center", marginBottom: 16,
  },

  // Selected chip
  selectedChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    alignSelf: "center", paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, minHeight: 36,
  },
  chipDot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: GREEN },
  chipText: { fontSize: 13, fontWeight: "500" },

  // Footer
  footer: {
    paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12,
    alignItems: "center", gap: 4,
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
  skipBtn:     { paddingVertical: 12, paddingHorizontal: 24 },
  skipText:    { fontSize: 13, fontWeight: "600" },
});