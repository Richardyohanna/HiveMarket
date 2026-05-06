

import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Colors, PRIMARY } from '../constants/theme';

type emptyProp = {
    activeTab: string;
}


const EmptyState: React.FC<emptyProp> = ({ activeTab }) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;

       return (
         <View style={styles.emptyState}>
           <Text style={styles.emptyEmoji}>{activeTab === "listings" ? "🛍️" : "📦"}</Text>
           <Text style={[styles.emptyTitle, { color: theme.text }]}>
             {activeTab === "listings" ? "No active listings" : "Nothing sold yet"}
           </Text>
           <Text style={[styles.emptySubtitle, { color: theme.readColor }]}>
             {activeTab === "listings"
               ? "Tap the Sell tab to post your first item"
               : "Your sold items will appear here"}
           </Text>
           {activeTab === "listings" && (
             <Pressable
               style={[styles.emptyAction, { backgroundColor: PRIMARY }]}
               onPress={() => router.push("/SellScreen/SellScreen")}
             >
               <Text style={styles.emptyActionText}>Start Selling</Text>
             </Pressable>
           )}
         </View>
       );
}

export default EmptyState

const styles = StyleSheet.create({


  // Empty
  emptyState: { alignItems: "center", paddingTop: 50, paddingHorizontal: 30, gap: 8 },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 17, fontWeight: "800" },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  emptyAction:   { marginTop: 10, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  emptyActionText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});