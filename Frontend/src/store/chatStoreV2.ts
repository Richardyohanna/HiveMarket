/**
 * Production-Scale Chat Store (V2)
 * Features: Normalized state, pagination, caching, WebSocket integration
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  getConversationsApi,
  getMessagesApi as getMessagesApiOld,
} from '../api/chatApi';
import {
  CHAT_CONFIG,
  ChatStore,
  Conversation,
  FetchMessagesRequest,
  IncomingMessage,
  Message,
  NormalizedChatState,
  WebSocketMessage
} from '../types/chatV2';

/**
 * ─── DEDUPLICATION HELPER ─────────────────────────────────────────────────
 * Tracks processed message IDs to prevent duplicates from WebSocket echoes
 */
class DeduplicationManager {
  private processedIds: Map<string, number> = new Map();
  private readonly TTL = CHAT_CONFIG.DEDUP_TRACKING_TTL;

  markProcessed(messageId: string): boolean {
    const now = Date.now();
    if (this.processedIds.has(messageId)) {
      return false; // Already processed
    }
    this.processedIds.set(messageId, now);
    return true; // First time seeing it
  }

  cleanup(): void {
    const now = Date.now();
    for (const [id, timestamp] of this.processedIds.entries()) {
      if (now - timestamp > this.TTL) {
        this.processedIds.delete(id);
      }
    }
  }

  clear(): void {
    this.processedIds.clear();
  }
}

const dedup = new DeduplicationManager();

/**
 * ─── UTILITY FUNCTIONS ─────────────────────────────────────────────────────
 */

// Generate unique message ID for deduplication
const generateMessageId = (msg: Message | IncomingMessage): string => {
  return `${msg.conversationId}_${msg.messageTime}_${msg.senderId}`;
};

// Ensure message has a unique ID
const enrichMessage = (msg: Message | IncomingMessage): Message => ({
  ...msg,
  messageId: generateMessageId(msg),
});

// Sort messages by timestamp (oldest first)
const sortMessagesByTime = (messages: Message[]): Message[] =>
  [...messages].sort(
    (a, b) =>
      new Date(a.messageTime).getTime() - new Date(b.messageTime).getTime()
  );

/**
 * ─── INITIAL STATE ────────────────────────────────────────────────────────
 */
const initialState: NormalizedChatState = {
  conversationsById: {},
  conversationIds: [],
  messagesByConversationId: {},
  messageMetadata: {},
  activeConversationId: null,
  loading: false,
  error: null,
  wsConnected: false,
  processedMessageIds: new Set(),
  lastProcessedTime: Date.now(),
};

/**
 * ─── ZUSTAND STORE ────────────────────────────────────────────────────────
 */
export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ───────────────────────────────────────────────────────────────────────
    // FETCH CONVERSATIONS
    // ───────────────────────────────────────────────────────────────────────
    fetchConversations: async (userId: string) => {
      set({ loading: true, error: null });
      try {
        const data = await getConversationsApi(userId);
        const normalized: Record<string, Conversation> = {};
        const ids: string[] = [];

        data.forEach((conv: Conversation) => {
          normalized[conv.conversationId] = conv;
          ids.push(conv.conversationId);
        });

        // Sort by lastMessageTime descending
        ids.sort(
          (a, b) =>
            new Date(normalized[b].lastMessageTime).getTime() -
            new Date(normalized[a].lastMessageTime).getTime()
        );

        set({
          conversationsById: normalized,
          conversationIds: ids,
          loading: false,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch conversations';
        set({ error: errorMsg, loading: false });
      }
    },

    // ───────────────────────────────────────────────────────────────────────
    // SET ACTIVE CONVERSATION & FETCH LATEST MESSAGES
    // ───────────────────────────────────────────────────────────────────────
    setActiveConversation: async (conversationId: string) => {
      set({ activeConversationId: conversationId });

      const state = get();
      const conv = state.conversationsById[conversationId];
      if (!conv) return;

      // If we already have cached messages, don't refetch
      const existingMessages = state.messagesByConversationId[conversationId];
      if (existingMessages && existingMessages.length > 0) {
        return;
      }

      // Fetch latest messages for this conversation
      await get().fetchMessages({
        conversationId,
        buyerId: conv.buyerId,
        sellerId: conv.sellerId,
        limit: CHAT_CONFIG.MESSAGES_PAGE_SIZE,
        cursor: null,
        direction: 'newer',
      });
    },

    // ───────────────────────────────────────────────────────────────────────
    // FETCH MESSAGES WITH PAGINATION
    // ───────────────────────────────────────────────────────────────────────
    fetchMessages: async (req: FetchMessagesRequest) => {
      const { conversationId, buyerId, sellerId, limit = CHAT_CONFIG.MESSAGES_PAGE_SIZE } = req;

      // Initialize metadata if not exists
      const state = get();
      if (!state.messageMetadata[conversationId]) {
        set(st => ({
          messageMetadata: {
            ...st.messageMetadata,
            [conversationId]: {
              conversationId,
              messages: {},
              messageIds: [],
              oldestMessageTime: null,
              newestMessageTime: null,
              cursor: { conversationId, cursor: null, hasMore: true, totalCount: 0, isLoading: false, timestamp: 0 },
              isFetching: false,
              error: null,
            },
          },
        }));
      }

      set(st => ({
        messageMetadata: {
          ...st.messageMetadata,
          [conversationId]: {
            ...st.messageMetadata[conversationId],
            isFetching: true,
            error: null,
          },
        },
      }));

      try {
        // Call existing API (TODO: update to support cursor pagination)
        const messages: Message[] = await getMessagesApiOld(buyerId, sellerId);

        if (!Array.isArray(messages)) {
          throw new Error('Invalid response format');
        }

        // Enrich with message IDs
        const enrichedMessages = messages.map(enrichMessage);

        // Filter duplicates (deduplication)
        const dedupedMessages = enrichedMessages.filter(msg => {
          const msgId = msg.messageId!;
          return dedup.markProcessed(msgId);
        });

        // Sort by time
        const sorted = sortMessagesByTime(dedupedMessages);

        // Get unique IDs, maintaining order
        const messageIds = sorted.map(m => m.messageId!);

        // Create message record
        const messageRecord: Record<string, Message> = {};
        sorted.forEach(msg => {
          messageRecord[msg.messageId!] = msg;
        });

        set(st => ({
          messagesByConversationId: {
            ...st.messagesByConversationId,
            [conversationId]: sorted,
          },
          messageMetadata: {
            ...st.messageMetadata,
            [conversationId]: {
              ...st.messageMetadata[conversationId],
              messages: messageRecord,
              messageIds,
              oldestMessageTime: sorted[0]?.messageTime || null,
              newestMessageTime: sorted[sorted.length - 1]?.messageTime || null,
              cursor: {
                conversationId,
                cursor: null, // TODO: get from API
                hasMore: false, // TODO: get from API
                totalCount: sorted.length,
                isLoading: false,
                timestamp: Date.now(),
              },
              isFetching: false,
              error: null,
            },
          },
        }));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch messages';
        set(st => ({
          messageMetadata: {
            ...st.messageMetadata,
            [conversationId]: {
              ...st.messageMetadata[conversationId],
              isFetching: false,
              error: errorMsg,
            },
          },
        }));
      }
    },

    // ───────────────────────────────────────────────────────────────────────
    // ADD NEW MESSAGE (Local + WebSocket)
    // ───────────────────────────────────────────────────────────────────────
    addMessage: (message: Message, isOptimistic = false) => {
      const enriched = enrichMessage(message);
      const msgId = enriched.messageId!;

      // Mark as processed to prevent duplicates
      dedup.markProcessed(msgId);

      set(st => {
        const conversationId = message.conversationId;
        const existing = st.messagesByConversationId[conversationId] || [];

        // Check if already exists (deduplication)
        if (existing.some(m => m.messageId === msgId)) {
          return st;
        }

        const updated = [...existing, enriched];
        const sorted = sortMessagesByTime(updated);

        return {
          messagesByConversationId: {
            ...st.messagesByConversationId,
            [conversationId]: sorted,
          },
          messageMetadata: {
            ...st.messageMetadata,
            [conversationId]: {
              ...(st.messageMetadata[conversationId] || {
                conversationId,
                messages: {},
                messageIds: [],
                oldestMessageTime: null,
                newestMessageTime: null,
                cursor: { conversationId, cursor: null, hasMore: false, totalCount: 0, isLoading: false, timestamp: 0 },
                isFetching: false,
                error: null,
              }),
              messages: {
                ...(st.messageMetadata[conversationId]?.messages || {}),
                [msgId]: enriched,
              },
              messageIds: sorted.map(m => m.messageId!),
              newestMessageTime: sorted[sorted.length - 1].messageTime,
              totalCount: sorted.length,
            },
          },
        };
      });
    },

    // ───────────────────────────────────────────────────────────────────────
    // ADD MESSAGE FROM WEBSOCKET (With deduplication)
    // ───────────────────────────────────────────────────────────────────────
    addWebSocketMessage: (message: IncomingMessage) => {
      // This routes through the same deduplication logic
      get().addMessage(message as Message, false);

      // Update conversation preview (moves to top, updates lastMessage)
      get().updateConversationPreview(message.conversationId, {
        lastMessage: message.message,
        lastMessageTime: message.messageTime,
      });
    },

    // ───────────────────────────────────────────────────────────────────────
    // UPDATE CONVERSATION PREVIEW (lastMessage, unread, etc.)
    // ───────────────────────────────────────────────────────────────────────
    updateConversationPreview: (conversationId: string, updates) => {
      set(st => {
        const existing = st.conversationsById[conversationId];
        if (!existing) return st;

        const updated = { ...existing, ...updates };
        let conversationIds = [...st.conversationIds];

        // Move to top if lastMessageTime changed
        if (updates.lastMessageTime && updates.lastMessageTime !== existing.lastMessageTime) {
          conversationIds = conversationIds.filter(id => id !== conversationId);
          conversationIds.unshift(conversationId);
        }

        return {
          conversationsById: {
            ...st.conversationsById,
            [conversationId]: updated,
          },
          conversationIds,
        };
      });
    },

    // ───────────────────────────────────────────────────────────────────────
    // LOAD OLDER MESSAGES (Pagination)
    // ───────────────────────────────────────────────────────────────────────
    loadOlderMessages: async (conversationId: string) => {
      const state = get();
      const metadata = state.messageMetadata[conversationId];
      if (!metadata || !metadata.cursor.hasMore) return;

      set(st => ({
        messageMetadata: {
          ...st.messageMetadata,
          [conversationId]: {
            ...st.messageMetadata[conversationId],
            isFetching: true,
          },
        },
      }));

      try {
        const conv = state.conversationsById[conversationId];
        if (!conv) throw new Error('Conversation not found');

        // TODO: Implement cursor-based pagination in API
        // For now, this is a placeholder
        console.log('Loading older messages for:', conversationId);

        set(st => ({
          messageMetadata: {
            ...st.messageMetadata,
            [conversationId]: {
              ...st.messageMetadata[conversationId],
              isFetching: false,
            },
          },
        }));
      } catch (err) {
        console.error('Error loading older messages:', err);
      }
    },

    // ───────────────────────────────────────────────────────────────────────
    // LOAD NEWER MESSAGES (Pagination)
    // ───────────────────────────────────────────────────────────────────────
    loadNewerMessages: async (conversationId: string) => {
      const state = get();
      const metadata = state.messageMetadata[conversationId];
      if (!metadata) return;

      set(st => ({
        messageMetadata: {
          ...st.messageMetadata,
          [conversationId]: {
            ...st.messageMetadata[conversationId],
            isFetching: true,
          },
        },
      }));

      try {
        // TODO: Implement cursor-based pagination in API
        console.log('Loading newer messages for:', conversationId);

        set(st => ({
          messageMetadata: {
            ...st.messageMetadata,
            [conversationId]: {
              ...st.messageMetadata[conversationId],
              isFetching: false,
            },
          },
        }));
      } catch (err) {
        console.error('Error loading newer messages:', err);
      }
    },

    // ───────────────────────────────────────────────────────────────────────
    // WEBSOCKET STATUS
    // ───────────────────────────────────────────────────────────────────────
    setWebSocketConnected: (connected: boolean) => {
      set({ wsConnected: connected });
    },

    // ───────────────────────────────────────────────────────────────────────
    // HANDLE WEBSOCKET MESSAGE (Router)
    // ───────────────────────────────────────────────────────────────────────
    handleWebSocketMessage: (wsMessage: WebSocketMessage) => {
      const { type, data } = wsMessage;

      switch (type) {
        case 'message':
          get().addWebSocketMessage(data as IncomingMessage);
          break;
        case 'read-receipt':
          // TODO: Mark messages as read
          break;
        case 'typing':
          // TODO: Show typing indicator
          break;
        default:
          console.warn('Unknown WebSocket message type:', type);
      }
    },

    // ───────────────────────────────────────────────────────────────────────
    // CACHE MANAGEMENT
    // ───────────────────────────────────────────────────────────────────────
    clearConversationCache: (conversationId: string) => {
      set(st => ({
        messagesByConversationId: {
          ...st.messagesByConversationId,
          [conversationId]: [],
        },
        messageMetadata: {
          ...st.messageMetadata,
          [conversationId]: {
            ...st.messageMetadata[conversationId],
            messages: {},
            messageIds: [],
            oldestMessageTime: null,
            newestMessageTime: null,
          },
        },
      }));
    },

    clearAllCaches: () => {
      set({
        messagesByConversationId: {},
        messageMetadata: {},
      });
      dedup.clear();
    },

    cleanupOldMessages: (maxAge = CHAT_CONFIG.MESSAGE_CACHE_TTL) => {
      const cutoffTime = Date.now() - maxAge;
      set(st => {
        const updated = { ...st.messagesByConversationId };
        const metaUpdated = { ...st.messageMetadata };

        Object.keys(updated).forEach(convId => {
          const messages = updated[convId];
          const filtered = messages.filter(
            m => new Date(m.messageTime).getTime() > cutoffTime
          );

          if (filtered.length < messages.length) {
            updated[convId] = filtered;
            const existingMeta = metaUpdated[convId] || {};
            metaUpdated[convId] = {
              ...existingMeta,
              messageIds: filtered.map(m => m.messageId!),
              oldestMessageTime: filtered[0]?.messageTime || null,
              newestMessageTime: filtered[filtered.length - 1]?.messageTime || null,
              cursor: {
                ...(existingMeta.cursor || {}),
                totalCount: filtered.length,
              },
            };
          }
        });

        return {
          messagesByConversationId: updated,
          messageMetadata: metaUpdated,
        };
      });
    },

    // ───────────────────────────────────────────────────────────────────────
    // MARK MESSAGES AS READ
    // ───────────────────────────────────────────────────────────────────────
    markMessagesAsRead: async (conversationId: string, upToTime: string) => {
      set(st => ({
        messagesByConversationId: {
          ...st.messagesByConversationId,
          [conversationId]: (st.messagesByConversationId[conversationId] || []).map(m =>
            new Date(m.messageTime).getTime() <= new Date(upToTime).getTime()
              ? { ...m, isRead: true }
              : m
          ),
        },
      }));

      // TODO: Call API to mark as read on backend
    },

    // ───────────────────────────────────────────────────────────────────────
    // CREATE CONVERSATION
    // ───────────────────────────────────────────────────────────────────────
    createConversation: async (buyerId, sellerId, message) => {
      // Implementation from original store
      console.log('Creating conversation:', { buyerId, sellerId, message });
      // TODO: Implement
    },

    // ───────────────────────────────────────────────────────────────────────
    // STATE SETTERS
    // ───────────────────────────────────────────────────────────────────────
    setLoading: (loading: boolean) => {
      set({ loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },
  }))
);

/**
 * ─── MEMOIZED SELECTORS ───────────────────────────────────────────────────
 * These selectors prevent unnecessary re-renders
 */

// Get all conversations as a sorted list
export const selectConversationList = (userId: string) =>
  useChatStore(st => {
    return st.conversationIds
      .map(id => st.conversationsById[id])
      .filter(Boolean)
      .map(conv => ({
        id: conv.conversationId,
        otherUserId: conv.buyerId === userId ? conv.sellerId : conv.buyerId,
        otherUserName: conv.lastMessage, // TODO: Get from profile
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: 0, // TODO: Track unread per conversation
        avatar: conv.profile_picture,
        isActive: st.activeConversationId === conv.conversationId,
      }));
  });

// Get messages for active conversation
export const selectActiveConversationMessages = () =>
  useChatStore(st => {
    if (!st.activeConversationId) return [];
    return st.messagesByConversationId[st.activeConversationId] || [];
  });

// Get messages for specific conversation
export const selectConversationMessages = (conversationId: string) =>
  useChatStore(st => st.messagesByConversationId[conversationId] || []);

// Get pagination state for specific conversation
export const selectPaginationState = (conversationId: string) =>
  useChatStore(st => st.messageMetadata[conversationId]?.cursor || null);

// Get total unread count
export const selectTotalUnreadCount = () =>
  useChatStore(st => {
    // TODO: Implement unread tracking per conversation
    return 0;
  });

// Get WebSocket status
export const selectWebSocketStatus = () => useChatStore(st => st.wsConnected);

// Get loading state
export const selectIsLoading = () => useChatStore(st => st.loading);
