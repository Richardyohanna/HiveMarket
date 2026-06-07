/**
 * SETUP & INTEGRATION GUIDE
 * How to integrate the new chat architecture into your app
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STEP 1: UPDATE ROOT LAYOUT (_layout.tsx)
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const LAYOUT_EXAMPLE = `
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useChatStore } from '@/src/store/chatStoreV2';
import { initializeWebSocket, cleanupWebSocket } from '@/src/api/websocketServiceV2';
import { userStore } from '@/src/store/userStore';

export default function RootLayout() {
  const user = userStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    // Initialize WebSocket on app start
    const init = async () => {
      try {
        await initializeWebSocket(user.id);
        setInitialized(true);
      } catch (err) {
        console.error('Failed to initialize WebSocket:', err);
      }
    };

    init();

    // Cleanup on logout
    return () => {
      cleanupWebSocket().catch(console.error);
    };
  }, [user?.id]);

  return (
    <Stack>
      {/* Your screens */}
    </Stack>
  );
}
`;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STEP 2: UPDATE CHATSCREEN.TSX
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CHAT_SCREEN_EXAMPLE = `
import { useEffect } from 'react';
import { useChatStore } from '@/src/store/chatStoreV2';
import { useChatConversations } from '@/src/hooks/useChatMessagesV2';
import { userStore } from '@/src/store/userStore';

export default function ChatScreen() {
  const user = userStore();
  const currentUserId = user?.id ?? '';

  // Fetch conversations on mount
  const fetchConversations = useChatStore(st => st.fetchConversations);

  useEffect(() => {
    if (!currentUserId) return;
    
    // Initial fetch
    fetchConversations(currentUserId);

    // Optional: Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchConversations(currentUserId);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentUserId, fetchConversations]);

  // Get conversations using optimized hook
  const {
    conversations,
    unreadCount,
    loading,
    error,
    setActive,
  } = useChatConversations(currentUserId);

  // Render conversations list
  return (
    <FlatList
      data={conversations}
      renderItem={({ item }) => (
        <ConversationItem
          conversation={item}
          onPress={() => setActive(item.id)}
        />
      )}
      keyExtractor={item => item.id}
    />
  );
}
`;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STEP 3: UPDATE CHATDETAILSCREEN.TSX
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CHAT_DETAIL_EXAMPLE = `
import { useLocalSearchParams } from 'expo-router';
import { useChatMessages, useMessageSend } from '@/src/hooks/useChatMessagesV2';
import { userStore } from '@/src/store/userStore';

export default function ChatDetailScreen() {
  const { id, buyerId, sellerId } = useLocalSearchParams<{
    id: string;
    buyerId: string;
    sellerId: string;
  }>();

  const user = userStore();
  const currentUserId = user?.id ?? '';

  // Use optimized hooks (handles everything: pagination, dedup, caching)
  const {
    messages,
    loading,
    loadOlder,
    isLoadingOlder,
    hasMore,
  } = useChatMessages(id!, currentUserId);

  const { sendMessage, isSending } = useMessageSend(
    id!,
    buyerId!,
    sellerId!,
    currentUserId
  );

  return (
    <View>
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={item => item.id} // CRITICAL: stable unique key
        onEndReached={() => hasMore && loadOlder()}
        ListHeaderComponent={isLoadingOlder ? <Spinner /> : null}
      />
      <Input
        onSend={sendMessage}
        disabled={isSending}
      />
    </View>
  );
}
`;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STEP 4: UPDATE LOGOUT HANDLER
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const LOGOUT_EXAMPLE = `
import { cleanupWebSocket } from '@/src/api/websocketServiceV2';
import { useChatStore } from '@/src/store/chatStoreV2';

async function handleLogout() {
  try {
    // Clean up WebSocket
    await cleanupWebSocket();

    // Clear store (dedup tracking, caches)
    useChatStore.getState().clearAllCaches();

    // Navigate to login
    router.replace('/login');
  } catch (err) {
    console.error('Logout error:', err);
  }
}
`;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OPTIONAL: HANDLE OFFLINE
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const OFFLINE_EXAMPLE = `
import { useNetInfo } from '@react-native-community/netinfo';
import { useChatStore } from '@/src/store/chatStoreV2';

export function useOfflineHandling() {
  const { isConnected, isInternetReachable } = useNetInfo();
  const wsConnected = useChatStore(st => st.wsConnected);

  const isOnline = isConnected && isInternetReachable && wsConnected;

  return {
    isOnline,
    isOffline: !isOnline,
    isInternetReachable: isConnected,
    isWebSocketConnected: wsConnected,
  };
}

// Usage in ChatDetailScreen:
const { isOnline } = useOfflineHandling();

return (
  <>
    {!isOnline && (
      <Banner style={{ backgroundColor: '#fef3c7' }}>
        <Text>You're offline. Messages will sync when connection is restored.</Text>
      </Banner>
    )}
    {/* ... rest of screen ... */}
  </>
);
`;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TROUBLESHOOTING
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TROUBLESHOOTING = `
PROBLEM: Messages not showing up in real-time
───────────────────────────────────────────────
1. Check WebSocket connection: useChatStore(st => st.wsConnected)
2. Verify messages are being routed to correct conversation ID
3. Check deduplication isn't filtering legitimate messages
4. Look at store: useChatStore(st => st.messagesByConversationId[conversationId])

SOLUTION:
  - Add console logs in addWebSocketMessage()
  - Verify message.conversationId matches your conversation
  - Check dedup manager isn't over-filtering

PROBLEM: Duplicate messages appearing
──────────────────────────────────────
1. Check if messageId is being generated correctly
2. Verify dedup manager is marking messages processed
3. Check for multiple WebSocket subscribers

SOLUTION:
  - Ensure messageId = conversationId_messageTime_senderId
  - Add logging: console.log('Processed?', dedup.markProcessed(msgId))
  - Verify WebSocket subscribes only once

PROBLEM: Messages scrolling to bottom not working
──────────────────────────────────────────────────
1. listRef.current?.scrollToEnd() not being called
2. FlatList content not updating properly
3. Key extractor returning non-unique keys

SOLUTION:
  - Use useAutoScroll hook
  - Ensure keyExtractor returns item.id (unique)
  - Add setTimeout to allow FlatList to update

PROBLEM: Memory usage growing
──────────────────────────────
1. Messages not being cleaned up
2. Dedup tracking not expiring old IDs
3. Conversations cached indefinitely

SOLUTION:
  - Call cleanupOldMessages() periodically
  - Lower MESSAGE_CACHE_TTL in config
  - Clear inactive conversations manually

PROBLEM: WebSocket not connecting
──────────────────────────────────
1. initializeWebSocket() not called
2. userId not available yet
3. WebSocket server unreachable

SOLUTION:
  - Call in _layout.tsx after login
  - Check network connection first
  - Verify server logs for connection attempts
  - Add connection status indicator UI

PROBLEM: FlatList rendering slowly
──────────────────────────────────
1. renderItem not memoized
2. keyExtractor not optimal
3. Too many messages in state

SOLUTION:
  - Wrap with React.memo()
  - Use item.id as key (not index)
  - Implement pagination to load 25 at a time
  - Check FlatList props (removeClippedSubviews, etc.)
`;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PERFORMANCE MONITORING
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MONITORING_EXAMPLE = `
import { performance } from 'react-native';

function trackPerformance(label: string, callback: () => void) {
  const start = performance.now();
  callback();
  const end = performance.now();
  console.log(\`[\${label}] took \${(end - start).toFixed(2)}ms\`);
}

// Usage:
trackPerformance('Open conversation', () => {
  useChatStore.getState().setActiveConversation(conversationId);
});

trackPerformance('Render message list', () => {
  setMessages(messages);
});

// Monitor memory (use React Native Debugger):
// console.log('Memory:', require('react-native').Platform.OS === 'android'
//   ? performance.getEntriesByType('measure')
//   : 'Use Xcode profiler for iOS');
`;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK REFERENCE
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const QUICK_REFERENCE = \`
INITIALIZATION:
  await initializeWebSocket(userId)

FETCH CONVERSATIONS:
  useChatStore.getState().fetchConversations(userId)

FETCH MESSAGES:
  useChatStore.getState().fetchMessages({
    conversationId,
    buyerId,
    sellerId,
    limit: 25,
  })

SEND MESSAGE:
  useChatStore.getState().addMessage({
    conversationId,
    senderId,
    receiverId,
    message: text,
    messageTime: new Date().toISOString(),
    isReceived: false,
    isRead: false,
  })

GET MESSAGES FOR CONVERSATION:
  const messages = useChatStore(st =>
    st.messagesByConversationId[conversationId] || []
  )

GET ALL CONVERSATIONS:
  const conversations = useChatStore(st =>
    st.conversationIds.map(id => st.conversationsById[id])
  )

LOAD OLDER MESSAGES:
  await useChatStore.getState().loadOlderMessages(conversationId)

MARK AS READ:
  await useChatStore.getState().markMessagesAsRead(conversationId, upToTime)

CLEAR CACHE:
  useChatStore.getState().clearConversationCache(conversationId)
  // or
  useChatStore.getState().clearAllCaches()

CHECK WEBSOCKET STATUS:
  const wsConnected = useChatStore(st => st.wsConnected)
\`;

export default {
  LAYOUT_EXAMPLE,
  CHAT_SCREEN_EXAMPLE,
  CHAT_DETAIL_EXAMPLE,
  LOGOUT_EXAMPLE,
  OFFLINE_EXAMPLE,
  TROUBLESHOOTING,
  MONITORING_EXAMPLE,
  QUICK_REFERENCE,
};
