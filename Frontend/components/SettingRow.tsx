import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, PRIMARY_DARK, PRIMARY_SOFT } from "../constants/theme";


// ─── Setting row ─────────────────────────────────────────────────────────────
const SettingRow = ({
  emoji, label, sub, danger, onPress, isDark, theme,
}: {
  emoji: string; label: string; sub?: string; danger?: boolean;
  onPress?: () => void; isDark: boolean; theme: typeof Colors.light;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.settingRow, {
      backgroundColor: theme.sectionBackground,
      borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
    }]}
  >
    <View style={[styles.settingIcon, {
      backgroundColor: danger ? "#ff15003f" : isDark ? PRIMARY_DARK : PRIMARY_SOFT,
    }]}>
      <Text style={styles.settingEmoji}>{emoji}</Text>
    </View>
    <View style={styles.settingText}>
      <Text style={[styles.settingLabel, { color: danger ? "#ff3b30" : theme.text }]}>
        {label}
      </Text>
      {sub && <Text style={[styles.settingSub, { color: theme.readColor }]}>{sub}</Text>}
    </View>
    {!danger && <Text style={[styles.settingArrow, { color: theme.readColor }]}>›</Text>}
  </Pressable>
);


export default SettingRow;


const styles = StyleSheet.create({

  // Settings
  settingsSection: { paddingHorizontal: 14, paddingTop: 14, gap: 8 },
  settingsGroupLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, marginTop: 4, marginBottom: -2 },
  settingRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 12,
  },
  settingIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  settingEmoji:{ fontSize: 18 },
  settingText: { flex: 1 },
  settingLabel:{ fontSize: 14, fontWeight: "600" },
  settingSub:  { fontSize: 11, marginTop: 1 },
  settingArrow:{ fontSize: 22, fontWeight: "300" },

});