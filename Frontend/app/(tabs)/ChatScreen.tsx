import { Colors } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { chatSocketService } from '../../src/api/chatSocket';
import { useChatStore } from '../../src/store/chatStore';
import { userStore } from '../../src/store/userStore';
import { Conversation, MessageResponse } from '../../src/types/chat';

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

// ─── Tab types ─────────────────────────────────────────────────────────────────
type TabType = "buying" | "selling";

// ─── UI contact shape ──────────────────────────────────────────────────────────
type ChatContact = {
  id:            string;   // conversationId
  buyerId:       string;
  sellerId:      string;
  fullName:      string;
  lastMessage:   string;
  timeSent:      string;   // raw ISO — used for sorting
  timeSentLabel: string;   // formatted for display
  online:        boolean;
  unread:        number;
  avatar?:       string;
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatTime = (iso: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";

  const now     = new Date();
  const diffMs  = now.getTime() - date.getTime();
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDay === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7)   return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

// Map a raw Conversation from the backend → UI shape
const toContact = (
  c: Conversation & { otherUserName?: string; otherUserId?: string; unreadCount?: number },
  currentUserId: string,
  unreadMap: Record<string, number>
): ChatContact => ({
  id:            c.conversationId,
  buyerId:       c.buyerId,
  sellerId:      c.sellerId,
  fullName:      c.otherUserName ?? (c.buyerId === currentUserId ? "Seller" : "Buyer"),
  lastMessage:   c.lastMessage ?? "No messages yet",
  timeSent:      c.lastMessageTime ?? "",
  timeSentLabel: formatTime(c.lastMessageTime ?? ""),
  online:        false,
  unread:        c.unreadCount ?? unreadMap[c.conversationId] ?? 0,
  avatar:        c.profile_picture,
});

// ─── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({
  name, size = 46, uri, isDark,
}: {
  name: string; size?: number; uri?: string; isDark: boolean;
}) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (uri) {
    return (
      <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
    );
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT,
      alignItems: "center", justifyContent: "center",
    }}>
      <Text style={{ color: PRIMARY, fontWeight: "800", fontSize: size * 0.35 }}>{initials}</Text>
    </View>
  );
};

// ─── Tab pill ──────────────────────────────────────────────────────────────────
const TabPill = ({
  label, active, onPress, isDark,
}: {
  label: string; active: boolean; onPress: () => void; isDark: boolean;
}) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.tabPill,
      active
        ? { backgroundColor: PRIMARY }
        : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
    ]}
  >
    <Text style={[
      styles.tabPillText,
      { color: active ? "#fff" : isDark ? "#94a3b8" : "#64748b" },
    ]}>
      {label}
    </Text>
  </Pressable>
);

// ─── Contact row ───────────────────────────────────────────────────────────────
const ContactRow = React.memo(({
  contact, isDark, theme, onPress, isActive,
}: {
  contact:  ChatContact;
  isDark:   boolean;
  theme:    typeof Colors.light;
  onPress:  () => void;
  isActive: boolean;
}) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.contactRow,
      isActive && { backgroundColor: isDark ? "#0f2a0f" : PRIMARY_SOFT },
    ]}
  >
    <View style={styles.avatarStack}>
      <Avatar name={contact.fullName} uri={contact.avatar} isDark={isDark} />
      {contact.online && (
        <View style={[styles.onlineDot, { borderColor: theme.background }]} />
      )}
    </View>

    <View style={styles.contactContent}>
      <View style={styles.contactTop}>
        <Text style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>
          {contact.fullName}
        </Text>
        <Text style={[
          styles.contactTime,
          {
            color:      contact.unread > 0 ? PRIMARY : theme.readColor,
            fontWeight: contact.unread > 0 ? "700"   : "400",
          },
        ]}>
          {contact.timeSentLabel}
        </Text>
      </View>

      <View style={styles.contactBottom}>
        <Text
          numberOfLines={1}
          style={[styles.contactMsg, {
            color:      contact.unread > 0 ? theme.text    : theme.readColor,
            fontWeight: contact.unread > 0 ? "600"         : "400",
            flex: 1,
          }]}
        >
          {contact.lastMessage}
        </Text>

        {contact.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{contact.unread}</Text>
          </View>
        )}
      </View>
    </View>
  </Pressable>
));

// ─── Main ChatScreen ───────────────────────────────────────────────────────────
const ChatScreen = () => {
  
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;

  // ── Current user ─────────────────────────────────────────────────────────
  const userState     = userStore.getState();
  const currentUserId = userState.id ?? "";

  // ── Chat store ────────────────────────────────────────────────────────────
  const { conversations, loading, error, fetchConversations } = useChatStore();

  // ── Local state ───────────────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState<TabType>("buying");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [search,      setSearch]      = useState("");
  const [unreadMap,   setUnreadMap]   = useState<Record<string, number>>({});
  const [hasNewMsg,   setHasNewMsg]   = useState(false);

  // ── Optional: seller passed from a product / listing screen ──────────────
  const { sellerEmail, sellerName, sellerId } = useLocalSearchParams<{
    sellerEmail?: string;
    sellerName?:  string;
    sellerId?:    string;
  }>();

  console.log("Conversations in ChatScreen:", conversations);

  // ── On mount: load conversations + subscribe to live messages ─────────────
  // Mirrors Hivegram: getFriends() publishes then subscribes inside the effect,
  // and re-runs whenever the active tab changes.
  useEffect(() => {
    if (!currentUserId) return;

    fetchConversations(currentUserId);

    const unsubscribe = chatSocketService.onMessage(
      (incoming: MessageResponse) => {

        console.log("Received message via socket:", incoming);

        setUnreadMap(prev => ({
          ...prev,
          [incoming.conversationId]:
            (prev[incoming.conversationId] ?? 0) + 1,
        }));

        setHasNewMsg(true);
      }
    ) as (() => void) | undefined;

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUserId, activeTab]);
  // Reset activeIndex when a new message arrives
  // (mirrors: useEffect(() => setActiveIndex(0), [hasNewChatArrived]))
  useEffect(() => {
    setActiveIndex(0);
  }, [hasNewMsg]);

  // ── Split conversations by role (Buying / Selling) ────────────────────────
  const allContacts: ChatContact[] = conversations
    .map(c => toContact(c, currentUserId, unreadMap))
    .sort((a, b) =>
      new Date(b.timeSent).getTime() - new Date(a.timeSent).getTime()
    );

  console.log("All contacts after mapping and sorting:", allContacts, "conversations:", conversations, "unreadMap:", unreadMap);

  const buyingContacts  = allContacts.filter(c => c.buyerId  === currentUserId);
  const sellingContacts = allContacts.filter(c => c.sellerId === currentUserId);
  const tabContacts     = activeTab === "buying" ? buyingContacts : sellingContacts;

  // If arrived from a product page, prepend the seller as a fresh contact
  const sellerContact: ChatContact | null = sellerName
    ? {
        id:            sellerEmail ?? "seller",
        buyerId:       currentUserId,
        sellerId:      sellerId ?? "seller",
        fullName:      sellerName,
        lastMessage:   "Start a conversation…",
        timeSent:      new Date().toISOString(),
        timeSentLabel: "Now",
        online:        true,
        unread:        0,
      }
    : null;

  const displayContacts = sellerContact
    ? [sellerContact, ...tabContacts.filter(c => c.id !== sellerContact.id)]
    : tabContacts;

  const filtered = displayContacts.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = allContacts.reduce((sum, c) => sum + c.unread, 0);

  // ── Open a conversation ───────────────────────────────────────────────────
  // Mirrors: onClick → setActiveIndex, setYesIfNewChat(false), setFriend, setFriendName
  const openChat = (contact: ChatContact, index: number) => {
    setActiveIndex(index);
    setHasNewMsg(false);
    // Clear unread for this conversation (mirrors setYesIfNewChat(false))
    setUnreadMap(prev => ({ ...prev, [contact.id]: 0 }));

    router.push({
      pathname: "/ChatScreen/[id]",
      params: {
        id:       contact.id,
        buyerId:  contact.buyerId,
        sellerId: contact.sellerId,
        fullName: contact.fullName,
        online:   String(contact.online),
        avatar:   contact.avatar ?? "",
      },
    });
  };

  // ── Tab switch ────────────────────────────────────────────────────────────
  // Mirrors: setTabs("friends") → useEffect re-runs → publishes + subscribes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setActiveIndex(0);
    setSearch("");
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: 25 }]}>

      {/* ── Header ── */}
      <View style={[styles.listHeader, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <View>
          <Text style={[styles.listTitle, { color: theme.text }]}>Messages</Text>
          {totalUnread > 0 && (
            <Text style={[styles.listSubtitle, { color: PRIMARY }]}>
              {totalUnread} unread
            </Text>
          )}
        </View>
        <Pressable style={[styles.composeBtn, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}>
          <Text style={{ fontSize: 16 }}>✏️</Text>
        </Pressable>
      </View>

      {/* ── Tabs: Buying / Selling ── */}
      {/* Mirrors Hivegram's chatCategory row */}
      <View style={styles.tabRow}>
        <TabPill
          label="Buying"
          active={activeTab === "buying"}
          onPress={() => handleTabChange("buying")}
          isDark={isDark}
        />
        <TabPill
          label="Selling"
          active={activeTab === "selling"}
          onPress={() => handleTabChange("selling")}
          isDark={isDark}
        />
      </View>

      {/* ── Search ── */}
      <View style={[styles.searchBar, {
        backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
        borderColor:     isDark ? "#334155" : "#E2E8F0",
        marginHorizontal: 14, marginBottom: 10,
      }]}>
        <Text style={{ fontSize: 14 }}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search messages..."
          placeholderTextColor={theme.readColor}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Text style={[styles.clearSearch, { color: theme.readColor }]}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* ── Loading ── */}
      {loading && (
        <ActivityIndicator size="small" color={PRIMARY} style={{ marginTop: 20 }} />
      )}

      {/* ── Error ── */}
      {!!error && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={[styles.emptyText, { color: theme.readColor }]}>{error}</Text>
          <Pressable
            onPress={() => fetchConversations(currentUserId)}
            style={styles.retryBtn}
          >
            <Text style={{ color: PRIMARY, fontWeight: "600" }}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* ── Contact list ── */}
      {/* Mirrors Hivegram's contactList FlatList */}
      {!loading && !error && (
        <FlatList
          data={filtered}
          keyExtractor={c => c.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>
                {activeTab === "buying" ? "🛒" : "🏪"}
              </Text>
              <Text style={[styles.emptyText, { color: theme.readColor }]}>
                {activeTab === "buying"
                  ? "No buying conversations yet"
                  : "No selling conversations yet"}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <ContactRow
              contact={item}
              isDark={isDark}
              theme={theme}
              isActive={activeIndex === index}
              onPress={() => openChat(item, index)}
            />
          )}
          ItemSeparatorComponent={() => (
            <View style={[
              styles.separator,
              { backgroundColor: isDark ? "#1a2a1a" : "#f0f9f0" },
            ]} />
          )}
        />
      )}
    </View>
  );
};

export default ChatScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },

  listHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  listTitle:    { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  listSubtitle: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  composeBtn:   {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },

  tabRow: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  tabPill: {
    flex: 1, paddingVertical: 8, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  tabPillText: { fontSize: 13, fontWeight: "700" },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  clearSearch: { fontSize: 14, padding: 2 },

  contactRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, marginHorizontal: 6,
  },
  avatarStack: { position: "relative" },
  onlineDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: PRIMARY, borderWidth: 2,
  },
  contactContent: { flex: 1, gap: 4 },
  contactTop: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  contactName:   { fontSize: 14, fontWeight: "700", flex: 1, marginRight: 8 },
  contactTime:   { fontSize: 11 },
  contactBottom: { flexDirection: "row", alignItems: "center", gap: 8 },
  contactMsg:    { fontSize: 13 },
  unreadBadge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  separator:  { height: 1, marginLeft: 72 },

  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText:  { fontSize: 14, fontWeight: "500" },
  retryBtn:   { marginTop: 8, padding: 8 },
});