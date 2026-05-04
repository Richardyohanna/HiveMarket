import { Colors, FontSize } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

// ─── Types ────────────────────────────────────────────────────────────────────
type ChatContact = {
  id: string;
  fullName: string;
  lastMessage: string;
  timeSent: string;
  online: boolean;
  unread: number;
  avatar?: string;
};

type Message = {
  id: string;
  text: string;
  sent: boolean;     // true = me, false = them
  time: string;
};

// ─── Mock data (replace with real API) ───────────────────────────────────────
const MOCK_CONTACTS: ChatContact[] = [
  { id: "1", fullName: "Alex Rivera",   lastMessage: "Is the calculus textbook still available?",  timeSent: "Just now",  online: true,  unread: 2 },
  { id: "2", fullName: "Sarah Chen",    lastMessage: "I can meet at the campus library by 2pm",    timeSent: "10:45 AM",  online: false, unread: 0 },
  { id: "3", fullName: "Jordan Smith",  lastMessage: "Would you take ₦5,000 for the book?",        timeSent: "Yesterday", online: true,  unread: 1 },
  { id: "4", fullName: "Fatima Bello",  lastMessage: "Is it still in good condition?",              timeSent: "Mon",       online: false, unread: 0 },
  { id: "5", fullName: "Chidi Okonkwo", lastMessage: "Can you do ₦3,500? Final offer!",            timeSent: "Sun",       online: true,  unread: 0 },
];

const MOCK_MESSAGES: Message[] = [
  { id: "1", text: "Hi! Is this still available?",         sent: false, time: "10:01 AM" },
  { id: "2", text: "Yes it is! Are you interested?",       sent: true,  time: "10:03 AM" },
  { id: "3", text: "Definitely. What's the condition?",    sent: false, time: "10:04 AM" },
  { id: "4", text: "It's in great condition, barely used. Only selling because I finished the course.", sent: true, time: "10:06 AM" },
  { id: "5", text: "Would you take ₦5,000?",               sent: false, time: "10:08 AM" },
  { id: "6", text: "Hmm, I was hoping for ₦6,500 but let's meet in the middle at ₦5,800?", sent: true, time: "10:10 AM" },
  { id: "7", text: "Deal! Can we meet tomorrow?",          sent: false, time: "10:11 AM" },
];

// ─── Avatar placeholder ───────────────────────────────────────────────────────
const Avatar = ({ name, size = 46, uri, isDark }: {
  name: string; size?: number; uri?: string; isDark: boolean;
}) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
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

// ─── Contact row ──────────────────────────────────────────────────────────────
const ContactRow = React.memo(({
  contact, isActive, isDark, theme, onPress,
}: {
  contact: ChatContact; isActive: boolean;
  isDark: boolean; theme: typeof Colors.light; onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.contactRow, {
      backgroundColor: isActive
        ? isDark ? PRIMARY_DARK : PRIMARY_SOFT
        : "transparent",
    }]}
  >
    {/* Avatar + online dot */}
    <View style={styles.avatarStack}>
      <Avatar name={contact.fullName} isDark={isDark} />
      {contact.online && <View style={[styles.onlineDot, { borderColor: theme.background }]} />}
    </View>

    {/* Content */}
    <View style={styles.contactContent}>
      <View style={styles.contactTop}>
        <Text style={[styles.contactName, { color: theme.text }]}>{contact.fullName}</Text>
        <Text style={[styles.contactTime, {
          color: contact.unread > 0 ? PRIMARY : theme.readColor,
          fontWeight: contact.unread > 0 ? "700" : "400",
        }]}>
          {contact.timeSent}
        </Text>
      </View>
      <View style={styles.contactBottom}>
        <Text
          numberOfLines={1}
          style={[styles.contactMsg, {
            color: contact.unread > 0 ? theme.text : theme.readColor,
            fontWeight: contact.unread > 0 ? "600" : "400",
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

// ─── Chat view (individual conversation) ──────────────────────────────────────
const ChatView = ({
  contact, isDark, theme, onBack,
}: {
  contact: ChatContact; isDark: boolean; theme: typeof Colors.light; onBack: () => void;
}) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [draft,    setDraft]    = useState("");
  const listRef = useRef<FlatList>(null);

  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    const newMsg: Message = {
      id:   String(Date.now()),
      text,
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraft("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [draft]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Chat header */}
      <View style={[styles.chatHeader, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: theme.text }]}>‹</Text>
        </Pressable>

        <Avatar name={contact.fullName} size={38} isDark={isDark} />

        <View style={styles.chatHeaderInfo}>
          <Text style={[styles.chatHeaderName, { color: theme.text }]}>{contact.fullName}</Text>
          <Text style={[styles.chatHeaderStatus, { color: contact.online ? PRIMARY : theme.readColor }]}>
            {contact.online ? "● Online" : "Offline"}
          </Text>
        </View>

        <Pressable style={[styles.chatIconBtn, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT }]}>
          <Text style={{ fontSize: 16 }}>📞</Text>
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item, index }) => {
          const prevSent = index > 0 ? messages[index - 1].sent : null;
          const showTime = prevSent !== item.sent || index === 0;
          return (
            <View>
              {showTime && (
                <Text style={[styles.msgTimestamp, { color: theme.readColor }]}>
                  {item.time}
                </Text>
              )}
              <View style={[
                styles.msgBubble,
                item.sent
                  ? [styles.msgSent, { backgroundColor: PRIMARY }]
                  : [styles.msgReceived, {
                      backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                    }],
              ]}>
                <Text style={[
                  styles.msgText,
                  { color: item.sent ? "#fff" : theme.text },
                ]}>
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input bar */}
      <View style={[styles.inputBar, {
        backgroundColor: theme.screenBackground,
        borderColor: isDark ? PRIMARY_DARK : "#e4f0e4",
      }]}>
        <View style={[styles.inputWrapper, {
          backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
          borderColor: isDark ? "#334155" : "#E2E8F0",
        }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor={theme.readColor}
            style={[styles.textInput, { color: theme.text }]}
            multiline
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
        </View>
        <Pressable
          onPress={sendMessage}
          disabled={!draft.trim()}
          style={[styles.sendBtn, {
            backgroundColor: draft.trim() ? PRIMARY : isDark ? PRIMARY_DARK : "#d4edda",
          }]}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

// ─── Main ChatScreen ──────────────────────────────────────────────────────────
const ChatScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme  = isDark ? Colors.dark : Colors.light;
  const fs     = FontSize.size;

  // When navigated from seller profile / product detail, open that chat directly
  const { sellerEmail, sellerName } = useLocalSearchParams<{
    sellerEmail?: string;
    sellerName?: string;
  }>();

  // If we arrived from a seller, find or create their contact
  const initialContact: ChatContact | null = sellerName
    ? {
        id:          sellerEmail ?? "seller",
        fullName:    sellerName,
        lastMessage: "Start a conversation...",
        timeSent:    "Now",
        online:      true,
        unread:      0,
      }
    : null;

  const [contacts]      = useState<ChatContact[]>(
    initialContact
      ? [initialContact, ...MOCK_CONTACTS.filter((c) => c.id !== initialContact.id)]
      : MOCK_CONTACTS
  );
  const [activeContact, setActiveContact] = useState<ChatContact | null>(
    initialContact ?? null
  );
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) =>
    c.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = contacts.reduce((sum, c) => sum + c.unread, 0);

  // ── If a conversation is open, show it ──────────────────────────────────
  if (activeContact) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.screenBackground }]}>
        <ChatView
          contact={activeContact}
          isDark={isDark}
          theme={theme}
          onBack={() => setActiveContact(null)}
        />
      </View>
    );
  }

  // ── Contact list ──────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Header */}
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
          <Text style={[styles.composeIcon, { color: PRIMARY }]}>✏️</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, {
        backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
        borderColor: isDark ? "#334155" : "#E2E8F0",
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

      {/* Contact list */}
      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={[styles.emptyText, { color: theme.readColor }]}>No conversations yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ContactRow
            contact={item}
            isActive={true} //activeContact?.id === item.id
            isDark={isDark}
            theme={theme}
            onPress={() => setActiveContact(item)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: isDark ? "#1a2a1a" : "#f0f9f0" }]} />
        )}
      />
    </View>
  );
};

export default ChatScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },

  // List header
  listHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  listTitle:    { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  listSubtitle: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  composeBtn:   { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  composeIcon:  { fontSize: 16 },

  // Search
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  clearSearch: { fontSize: 14, padding: 2 },

  // Contact row
  contactRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  avatarStack: { position: "relative" },
  onlineDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: PRIMARY, borderWidth: 2,
  },
  contactContent: { flex: 1, gap: 4 },
  contactTop:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  contactName:    { fontSize: 14, fontWeight: "700" },
  contactTime:    { fontSize: 11 },
  contactBottom:  { flexDirection: "row", alignItems: "center", gap: 8 },
  contactMsg:     { fontSize: 13 },
  unreadBadge:    {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  separator:  { height: 1, marginLeft: 72 },

  // Chat header
  chatHeader: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn:        { marginRight: 2 },
  backArrow:      { fontSize: 28, fontWeight: "300", lineHeight: 32 },
  chatHeaderInfo: { flex: 1 },
  chatHeaderName: { fontSize: 15, fontWeight: "700" },
  chatHeaderStatus:{ fontSize: 11, fontWeight: "600", marginTop: 1 },
  chatIconBtn:    { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  // Messages
  messagesList: { padding: 14, gap: 6 },
  msgTimestamp: { textAlign: "center", fontSize: 11, marginVertical: 8 },
  msgBubble:    { maxWidth: "78%", borderRadius: 18, padding: 11 },
  msgSent:      { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  msgReceived:  { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  msgText:      { fontSize: 14, lineHeight: 20 },

  // Input bar
  inputBar: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1, borderRadius: 22, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 8, maxHeight: 120,
  },
  textInput: { fontSize: 14, lineHeight: 20 },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: "center", justifyContent: "center",
  },
  sendIcon: { color: "#fff", fontSize: 18, fontWeight: "800" },

  // Empty
  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText:  { fontSize: 14, fontWeight: "500" },
});