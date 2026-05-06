/**
 * SettingsTab
 * ───────────
 * ZERO hooks. All data via props.
 */
import { Colors } from '@/constants/theme';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

type Props = {
  handleLogout: () => void;
  isDark: boolean;
  theme: typeof Colors.light;
};

// ─── Pure row — no hooks ──────────────────────────────────────────────────────
const Row = ({
  emoji, label, sub, danger, onPress, isDark, theme,
}: {
  emoji: string; label: string; sub?: string; danger?: boolean;
  onPress?: () => void; isDark: boolean; theme: typeof Colors.light;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.row, {
      backgroundColor: theme.sectionBackground,
      borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
    }]}
  >
    <View style={[styles.iconBox, {
      backgroundColor: danger ? "#ff15003f" : isDark ? PRIMARY_DARK : PRIMARY_SOFT,
    }]}>
      <Text style={styles.rowEmoji}>{emoji}</Text>
    </View>
    <View style={styles.rowText}>
      <Text style={[styles.rowLabel, { color: danger ? "#ff3b30" : theme.text }]}>{label}</Text>
      {sub && <Text style={[styles.rowSub, { color: theme.readColor }]}>{sub}</Text>}
    </View>
    {!danger && <Text style={[styles.rowArrow, { color: theme.readColor }]}>›</Text>}
  </Pressable>
);

const GroupLabel = ({ text, theme }: { text: string; theme: typeof Colors.light }) => (
  <Text style={[styles.groupLabel, { color: theme.readColor }]}>{text}</Text>
);

const SettingsTab = ({ handleLogout, isDark, theme }: Props) => (
  <View style={styles.container}>

    <GroupLabel text="ACCOUNT" theme={theme} />
    <Row emoji="👤" label="Edit Profile"    sub="Update your info"       isDark={isDark} theme={theme} onPress={() => {}} />
    <Row emoji="🔔" label="Notifications"  sub="Manage alerts"          isDark={isDark} theme={theme} onPress={() => {}} />
    <Row emoji="❤️" label="Wishlist"        sub="Items you saved"        isDark={isDark} theme={theme} onPress={() => {}} />
    <Row emoji="🛡️" label="Privacy"        sub="Control your data"      isDark={isDark} theme={theme} onPress={() => {}} />
    <Row emoji="🎓" label="Student ID"     sub="Verify your enrollment" isDark={isDark} theme={theme} onPress={() => {}} />

    <GroupLabel text="TRANSACTIONS" theme={theme} />
    <Row emoji="💳" label="Payment Methods"  sub="Cards & bank accounts"  isDark={isDark} theme={theme} onPress={() => {}} />
    <Row emoji="📦" label="My Orders"        sub="Track your purchases"   isDark={isDark} theme={theme} onPress={() => {}} />
    <Row emoji="💰" label="Wallet & Payouts" sub="Seller earnings"        isDark={isDark} theme={theme} onPress={() => {}} />

    <GroupLabel text="SUPPORT" theme={theme} />
    <Row emoji="💬" label="Help Center"    sub="FAQs & contact us"      isDark={isDark} theme={theme} onPress={() => {}} />
    <Row emoji="⭐" label="Rate the App"   sub="Leave us a review"      isDark={isDark} theme={theme} onPress={() => {}} />
    <Row emoji="📜" label="Terms & Policy" sub="Legal info"             isDark={isDark} theme={theme} onPress={() => {}} />

    <GroupLabel text="DANGER ZONE" theme={theme} />
    <Row
      emoji="🚪" label="Log Out" danger
      isDark={isDark} theme={theme}
      onPress={handleLogout}
    />
    <Row
      emoji="🗑️" label="Delete Account" danger
      isDark={isDark} theme={theme}
      onPress={() => Alert.alert(
        "Delete Account",
        "This is permanent and cannot be undone. All your listings will be removed.",
        [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive" }]
      )}
    />

    <View style={{ height: 20 }} />
  </View>
);

export default SettingsTab;

const styles = StyleSheet.create({
  container: { paddingHorizontal: 14, paddingTop: 14, gap: 8 },

  groupLabel: {
    fontSize: 10, fontWeight: "700", letterSpacing: 1.5,
    marginTop: 8, marginBottom: -2, paddingLeft: 2,
  },

  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 12,
  },
  iconBox:  { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowEmoji: { fontSize: 18 },
  rowText:  { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: "600" },
  rowSub:   { fontSize: 11, marginTop: 1 },
  rowArrow: { fontSize: 22, fontWeight: "300" },
});