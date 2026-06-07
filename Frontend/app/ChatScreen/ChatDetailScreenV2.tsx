/**
 * OPTIMIZED ChatDetailScreen (V2)
 * Uses normalized store, pagination, memoization, and proper WebSocket integration
 */

import { Colors } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import optimized hooks and services
import {
  useAutoScroll,
  useChatMessages,
  useMessageSend,
  useRealtimeMessages,
} from '../../src/hooks/useChatMessagesV2';
import { useChatStore } from '../../src/store/chatStoreV2';
import { userStore } from '../../src/store/userStore';
import type { UIMessage } from '../../src/types/chatV2';

const PRIMARY = '#008100';
const PRIMARY_SOFT = '#e8f5e9';
const PRIMARY_DARK = '#1a3a1a';

// ─── OPTIMIZED MESSAGE BUBBLE (Memoized) ──────────────────────────────────
const MessageBubble= React.memo(
  ({
    message,
    isDark,
  }: {
    message: UIMessage;
    isDark: boolean;
  }) => {
    const bubbleStyle: ViewStyle  = message.sent
      ? { backgroundColor: PRIMARY, alignSelf: 'flex-end', marginRight: 12 }
      : { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', alignSelf: 'flex-start', marginLeft: 12 };

    const textStyle = {
      color: message.sent ? '#fff' : isDark ? '#e2e8f0' : '#1e293b',
    };

    return (
      <View style={[styles.messageBubble, bubbleStyle]}>
        {message.fileUrl && (
          <Image
            source={{ uri: message.fileUrl }}
            style={
              message.fileType === 'image'
                ? styles.imageMessage
                : styles.documentPreview
            }
          />
        )}
        <Text style={[styles.messageText, textStyle]}>{message.text}</Text>
        <Text style={[styles.messageTime, { color: message.sent ? 'rgba(255,255,255,0.7)' : isDark ? '#94a3b8' : '#64748b' }]}>
          {message.time}
        </Text>
        {message.sent && (
          <Text style={{ marginTop: 2, fontSize: 10, color: message.status === 'read' ? '#90EE90' : '#94a3b8' }}>
            {message.status === 'read' ? '✓✓' : '✓'}
          </Text>
        )}
      </View>
    );
  }
);
MessageBubble.displayName = 'MessageBubble';

// ─── OPTIMIZED INPUT AREA (Memoized) ───────────────────────────────────────
const InputArea = React.memo(
  ({
    draft,
    onChangeText,
    onSend,
    isSending,
    isDark,
  }: {
    draft: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    isSending: boolean;
    isDark: boolean;
  }) => (
    <View style={[styles.inputContainer, { backgroundColor: isDark ? '#0f172a' : '#fff' }]}>
      <TextInput
        value={draft}
        onChangeText={onChangeText}
        placeholder="Type a message..."
        placeholderTextColor={isDark ? '#64748b' : '#cbd5e1'}
        editable={!isSending}
        multiline
        style={[
          styles.input,
          {
            color: isDark ? '#e2e8f0' : '#1e293b',
            backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
          },
        ]}
      />
      <Pressable
        onPress={onSend}
        disabled={!draft.trim() || isSending}
        style={[
          styles.sendButton,
          { opacity: !draft.trim() || isSending ? 0.5 : 1 },
        ]}
      >
        <Text style={{ fontSize: 20 }}>
          {isSending ? '⏳' : '📤'}
        </Text>
      </Pressable>
    </View>
  )
);
InputArea.displayName = 'InputArea';

// ─── HEADER (Memoized) ─────────────────────────────────────────────────────
const ChatHeader = React.memo(
  ({
    name,
    avatar,
    isOnline,
    isDark,
    theme,
  }: {
    name: string;
    avatar?: string;
    isOnline: boolean;
    isDark: boolean;
    theme: typeof Colors.light;
  }) => (
    <View style={[styles.header, { backgroundColor: isDark ? PRIMARY_DARK : PRIMARY_SOFT, borderColor: isDark ? '#1a3a1a' : '#e4f0e4' }]}>
      <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
        <Text style={{ fontSize: 20 }}>←</Text>
      </Pressable>

      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.headerAvatar} />
      ) : (
        <View style={styles.headerAvatarPlaceholder}>
          <Text style={{ color: PRIMARY, fontWeight: '800', fontSize: 14 }}>
            {name.split(' ')[0]?.[0]}
          </Text>
        </View>
      )}

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.headerName, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.headerStatus, { color: isOnline ? PRIMARY : theme.readColor }]}>
          {isOnline ? '🟢 Online' : 'Last seen recently'}
        </Text>
      </View>

      <Pressable style={styles.headerIcon}>
        <Text style={{ fontSize: 20 }}>📞</Text>
      </Pressable>
      <Pressable style={styles.headerIcon}>
        <Text style={{ fontSize: 20 }}>ℹ️</Text>
      </Pressable>
    </View>
  )
);
ChatHeader.displayName = 'ChatHeader';

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────
export default function ChatDetailScreenV2() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  // Get params
  const { id, buyerId, sellerId, fullName, avatar, online } = useLocalSearchParams<{
    id: string;
    buyerId: string;
    sellerId: string;
    fullName: string;
    avatar?: string;
    online?: string;
  }>();

  const isOnline = online === 'true';
  const currentUser = userStore.getState();
  const currentUserId = currentUser?.id ?? '';

  // ─── HOOKS ──────────────────────────────────────────────────────────────
  const {
    messages,
    loading,
    hasMore,
    loadOlder,
    isLoadingOlder,
  } = useChatMessages(id!, currentUserId);

  const { listRef, handleScroll } = useAutoScroll(messages);
  const { sendMessage, isSending } = useMessageSend(
    id!,
    buyerId!,
    sellerId!,
    currentUserId
  );
  useRealtimeMessages(); //id!, buyerId!, sellerId!);

  // ─── LOCAL STATE ────────────────────────────────────────────────────────
  const [draft, setDraft] = useState('');

  // ─── HANDLERS ──────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  }, [draft, sendMessage]);

  const handleLoadOlder = useCallback(() => {
    if (!isLoadingOlder && hasMore) {
      loadOlder();
    }
  }, [isLoadingOlder, hasMore, loadOlder]);

  // ─── FLAT LIST KEY EXTRACTOR (Optimized) ────────────────────────────────
  // Critical for FlatList performance: unique, stable IDs
  const keyExtractor = useCallback((item: UIMessage) => item.id, []);

  // ─── MEMOIZED RENDER ITEM ──────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: UIMessage }) => (
      <MessageBubble message={item} isDark={isDark} />
    ),
    [isDark]
  );

  // ─── MEMOIZED LIST FOOTER (Load older) ────────────────────────────────
  const listFooter = useMemo(() => {
    if (loading || !hasMore) return null;

    return (
      <Pressable
        onPress={handleLoadOlder}
        disabled={isLoadingOlder}
        style={styles.loadOlderButton}
      >
        <Text style={{ color: PRIMARY, fontWeight: '600' }}>
          {isLoadingOlder ? 'Loading...' : 'Load older messages'}
        </Text>
      </Pressable>
    );
  }, [loading, hasMore, isLoadingOlder, handleLoadOlder]);

  // ─── EMPTY STATE ───────────────────────────────────────────────────────
  const listEmpty = useMemo(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <Text style={{ fontSize: 40, marginBottom: 8 }}>💬</Text>
        <Text style={[{ color: theme.text }, styles.emptyText]}>
          No messages yet. Start a conversation!
        </Text>
      </View>
    );
  }, [loading, theme.text]);

  // ─── CONNECTION STATUS INDICATOR ──────────────────────────────────────
  const wsConnected = useChatStore(st => st.wsConnected);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Header */}
      <ChatHeader
        name={fullName || 'Contact'}
        avatar={avatar}
        isOnline={isOnline}
        isDark={isDark}
        theme={theme}
      />

      {/* Connection status */}
      {!wsConnected && (
        <View style={[styles.connectionBanner, { backgroundColor: '#fef3c7' }]}>
          <Text style={{ color: '#92400e', fontSize: 12, fontWeight: '500' }}>
            ⚠️ Not connected. Messages will sync when connection is restored.
          </Text>
        </View>
      )}

      {/* Messages list */}
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={listEmpty}
        ListHeaderComponent={listFooter}
        contentContainerStyle={styles.messageListContent}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Throttle scroll events (60 FPS)
        removeClippedSubviews={true} // Remove off-screen views
        maxToRenderPerBatch={10} // Render in batches
        updateCellsBatchingPeriod={50} // Batch update timing
        onEndReachedThreshold={0.5} // Load older when 50% scrolled up
        onEndReached={handleLoadOlder}
      />

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <InputArea
          draft={draft}
          onChangeText={setDraft}
          onSend={handleSend}
          isSending={isSending}
          isDark={isDark}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  connectionBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fcd34d',
  },

  messageListContent: {
    paddingVertical: 12,
  },

  messageBubble: {
    marginVertical: 4,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    maxWidth: '85%',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  imageMessage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 4,
  },
  documentPreview: {
    width: 150,
    height: 40,
    borderRadius: 8,
    marginBottom: 4,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_SOFT,
  },

  loadOlderButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
