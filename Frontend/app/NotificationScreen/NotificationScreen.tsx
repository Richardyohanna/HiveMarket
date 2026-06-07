import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

// ── Notification data shape ───────────────────────────────────────────────────
type NotifType = "message" | "price" | "live" | "sold" | "reaction" | "system";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  group: "today" | "yesterday" | "earlier";
}

const ICON_MAP: Record<NotifType, { emoji: string; color: string; bg: string; bgDark: string }> = {
  message:  { emoji: "💬", color: "#3b82f6", bg: "#eff6ff",  bgDark: "#0f1a2a" },
  price:    { emoji: "🏷️", color: "#f59e0b", bg: "#fffbeb",  bgDark: "#1a1400" },
  live:     { emoji: "🟢", color: PRIMARY,   bg: PRIMARY_SOFT, bgDark: PRIMARY_DARK },
  sold:     { emoji: "🎉", color: "#8b5cf6", bg: "#f5f3ff",  bgDark: "#1a1030" },
  reaction: { emoji: "❤️", color: "#ef4444", bg: "#fef2f2",  bgDark: "#1a0a0a" },
  system:   { emoji: "🐝", color: PRIMARY,   bg: PRIMARY_SOFT, bgDark: PRIMARY_DARK },
};

// ── Static demo data (replace with your API data) ────────────────────────────
const INITIAL_NOTIFS: Notification[] = [
  {
    id: "1", type: "message", read: false, group: "today",
    title: "Message from Sarah",
    body: "Is the vintage lamp still available?",
    time: "2m ago",
  },
  {
    id: "2", type: "price", read: false, group: "today",
    title: "Price drop on saved item",
    body: "The Mid-century chair is now 15% off — ₦12,750",
    time: "1h ago",
  },
  {
    id: "3", type: "live", read: false, group: "today",
    title: "Your listing is live 🚀",
    body: "iPhone 13 charger is now visible to students",
    time: "3h ago",
  },
  {
    id: "4", type: "sold", read: true, group: "yesterday",
    title: "Item sold!",
    body: "Someone just bought your Calculus textbook",
    time: "Yesterday · 4:12 PM",
  },
  {
    id: "5", type: "reaction", read: true, group: "yesterday",
    title: "5 students saved your listing",
    body: "Your laptop bag is getting attention",
    time: "Yesterday · 1:30 PM",
  },
  {
    id: "6", type: "system", read: true, group: "earlier",
    title: "Welcome to HiveMarket 🐝",
    body: "Your campus marketplace is ready. Start buying and selling!",
    time: "3 days ago",
  },
];

// ── Single notification row ───────────────────────────────────────────────────
const NotifRow = ({
  notif, isDark, theme, onPress, onMarkRead,
}: {
  notif: Notification;
  isDark: boolean;
  theme: any;
  onPress: () => void;
  onMarkRead: () => void;
}) => {
  const icon    = ICON_MAP[notif.type];
  const bgColor = isDark ? icon.bgDark : icon.bg;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={() => { onMarkRead(); onPress(); }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.notifCard,
          {
            backgroundColor: notif.read
              ? (isDark ? "#0f172a" : "#fff")
              : (isDark ? "#0d1f0d" : "#f0fdf4"),
            borderColor: notif.read
              ? (isDark ? "#1e293b" : "#f1f5f9")
              : (isDark ? "#1a3a1a" : "#bbf7d0"),
          },
        ]}
      >
        {/* Unread indicator bar */}
        {!notif.read && (
          <View style={[styles.unreadBar, { backgroundColor: PRIMARY }]} />
        )}

        {/* Icon bubble */}
        <View style={[styles.iconBubble, { backgroundColor: bgColor }]}>
          <Text style={styles.iconEmoji}>{icon.emoji}</Text>
        </View>

        {/* Content */}
        <View style={styles.notifContent}>
          <View style={styles.notifTop}>
            <Text
              numberOfLines={1}
              style={[
                styles.notifTitle,
                {
                  color: theme.text,
                  fontWeight: notif.read ? "500" : "800",
                },
              ]}
            >
              {notif.title}
            </Text>
            {!notif.read && (
              <View style={[styles.unreadDot, { backgroundColor: PRIMARY }]} />
            )}
          </View>
          <Text
            numberOfLines={2}
            style={[styles.notifBody, { color: isDark ? "#64748b" : "#64748b" }]}
          >
            {notif.body}
          </Text>
          <Text style={[styles.notifTime, { color: isDark ? "#475569" : "#94a3b8" }]}>
            {notif.time}
          </Text>
        </View>

        {/* Chevron */}
        <Text style={[styles.chevron, { color: isDark ? "#334155" : "#cbd5e1" }]}>›</Text>
      </Pressable>
    </Animated.View>
  );
};

// ── Section label ─────────────────────────────────────────────────────────────
const SectionLabel = ({
  label, isDark, theme,
}: { label: string; isDark: boolean; theme: any }) => (
  <View style={styles.sectionLabelRow}>
    <View style={[styles.sectionAccent, { backgroundColor: PRIMARY }]} />
    <Text style={[styles.sectionLabelText, { color: theme.text }]}>{label}</Text>
    <View style={[styles.sectionLine, { backgroundColor: isDark ? "#1e293b" : "#f1f5f9" }]} />
  </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
const NotificationScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;

  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markOneRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const groups: { key: "today" | "yesterday" | "earlier"; label: string }[] = [
    { key: "today",     label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "earlier",   label: "Earlier" },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: theme.screenBackground ?? theme.background , paddingTop: 25}]}>
      <StatusBar
        backgroundColor={theme.screenBackground ?? theme.background}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      {/* ── Header ── */}
      <View style={[styles.header, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <View style={[styles.backCircle, {
            backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
          }]}>
            <Text style={[styles.backArrow, { color: isDark ? "#94a3b8" : "#475569" }]}>←</Text>
          </View>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.headerSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>

        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <Pressable
              onPress={markAllRead}
              style={[styles.markAllBtn, {
                backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT,
              }]}
            >
              <Text style={[styles.markAllText, { color: PRIMARY }]}>Mark all read</Text>
            </Pressable>
          )}
          <Pressable style={[styles.menuBtn, {
            backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
          }]}>
            <Text style={{ color: isDark ? "#94a3b8" : "#475569", fontSize: 18, lineHeight: 20 }}>⋯</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Unread summary pill ── */}
      {unreadCount > 0 && (
        <View style={[styles.summaryPill, {
          backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT,
          borderColor: isDark ? "#2d5a2d" : "#c8e6c9",
        }]}>
          <Text style={{ fontSize: 14 }}>🐝</Text>
          <Text style={[styles.summaryText, { color: PRIMARY }]}>
            You have {unreadCount} new notification{unreadCount > 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {/* ── Notification list ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {groups.map(({ key, label }) => {
          const items = notifications.filter((n) => n.group === key);
          if (items.length === 0) return null;
          return (
            <View key={key}>
              <SectionLabel label={label} isDark={isDark} theme={theme} />
              <View style={styles.group}>
                {items.map((notif) => (
                  <NotifRow
                    key={notif.id}
                    notif={notif}
                    isDark={isDark}
                    theme={theme}
                    onPress={() => {}}
                    onMarkRead={() => markOneRead(notif.id)}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {/* All read state */}
        {unreadCount === 0 && (
          <View style={styles.allReadBanner}>
            <Text style={{ fontSize: 32 }}>✅</Text>
            <Text style={[styles.allReadText, { color: isDark ? "#64748b" : "#94a3b8" }]}>
              You're all caught up!
            </Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn:    { },
  backCircle: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  backArrow:  { fontSize: 20, fontWeight: "300" },
  headerTitle:{ fontSize: 20, fontWeight: "900", letterSpacing: -0.4 },
  headerSub:  { fontSize: 11, marginTop: 1 },
  headerRight:{ flexDirection: "row", alignItems: "center", gap: 8 },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  markAllText:{ fontSize: 11, fontWeight: "700" },
  menuBtn:    { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },

  // Summary pill
  summaryPill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 14, marginTop: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1,
  },
  summaryText: { fontSize: 13, fontWeight: "700" },

  // Scroll
  scroll: { paddingHorizontal: 14, paddingTop: 10 },

  // Section label
  sectionLabelRow: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginTop: 18, marginBottom: 10,
  },
  sectionAccent:   { width: 4, height: 16, borderRadius: 2 },
  sectionLabelText:{ fontSize: 11, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
  sectionLine:     { flex: 1, height: 1 },

  // Group
  group: { gap: 8 },

  // Notif card
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#008100",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  unreadBar: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    width: 3,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  iconBubble: {
    width: 46, height: 46, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 20 },

  // Content
  notifContent: { flex: 1, gap: 3 },
  notifTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  notifTitle:{ fontSize: 13, flex: 1 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  notifBody: { fontSize: 12, lineHeight: 17 },
  notifTime: { fontSize: 10, marginTop: 2 },

  chevron: { fontSize: 22, fontWeight: "300", marginLeft: 2 },

  // All read
  allReadBanner: {
    alignItems: "center", gap: 8,
    paddingVertical: 30,
  },
  allReadText: { fontSize: 14, fontWeight: "600" },
});