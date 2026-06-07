/**
 * Custom Hooks for Chat Store Integration
 * Fixed: Zustand getSnapshot infinite loop + unstable selectors
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStoreV2';
import type { Message, UIMessage, UseChatMessagesReturn } from '../types/chatV2';

/* ──────────────────────────────────────────────────────────────── */
/* CONVERT BACKEND MESSAGE TO UI MESSAGE */
/* ──────────────────────────────────────────────────────────────── */

const convertToUIMessage = (msg: Message, currentUserId: string): UIMessage => ({
  id: msg.messageId || `${msg.conversationId}_${msg.messageTime}_${msg.senderId}`,
  text: msg.message,
  sent: msg.senderId === currentUserId,
  time: new Date(msg.messageTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }),
  timestamp: new Date(msg.messageTime).getTime(),
  fileUrl: msg.fileUrl || null,
  fileType: msg.fileUrl
    ? /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.fileUrl)
      ? 'image'
      : 'document'
    : null,
  uploading: false,
  status: msg.isRead ? 'read' : msg.isReceived ? 'delivered' : 'sent',
});

/* ──────────────────────────────────────────────────────────────── */
/* CHAT MESSAGES HOOK */
/* ──────────────────────────────────────────────────────────────── */

export const useChatMessages = (
  conversationId: string,
  currentUserId: string
): UseChatMessagesReturn => {
  const [uiMessages, setUiMessages] = useState<UIMessage[]>([]);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isLoadingNewer, setIsLoadingNewer] = useState(false);

  /* ✅ SAFE SELECTORS (NO DEFAULT ARRAYS INSIDE STORE) */
  const storeMessages =
    useChatStore(st => st.messagesByConversationId?.[conversationId]);

  const messageMeta =
    useChatStore(st => st.messageMetadata?.[conversationId]);

  const loading = useChatStore(st => st.loading);
  const error = useChatStore(st => st.error);

  const fetchMessages = useChatStore(st => st.fetchMessages);

  /* ─── SAFE NORMALIZATION OUTSIDE ZUSTAND ─── */
  const safeMessages = storeMessages ?? [];
  const paginationState = messageMeta?.cursor;

  /* ─── DERIVE UI MESSAGES (MEMOIZED SAFE TRANSFORM) ─── */
  const convertedMessages = useMemo(() => {
    return safeMessages.map(msg =>
      convertToUIMessage(msg, currentUserId)
    );
  }, [safeMessages, currentUserId]);

  /* ─── SYNC UI STATE ─── */
  useEffect(() => {
    setUiMessages(convertedMessages);
  }, [convertedMessages]);

  /* ─── LOAD OLDER MESSAGES ─── */
  const handleLoadOlder = useCallback(async () => {
    if (isLoadingOlder || !paginationState?.hasMore) return;

    setIsLoadingOlder(true);
    try {
      await useChatStore.getState().loadOlderMessages(conversationId);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [conversationId, isLoadingOlder, paginationState?.hasMore]);

  /* ─── LOAD NEWER MESSAGES ─── */
  const handleLoadNewer = useCallback(async () => {
    if (isLoadingNewer) return;

    setIsLoadingNewer(true);
    try {
      await useChatStore.getState().loadNewerMessages(conversationId);
    } finally {
      setIsLoadingNewer(false);
    }
  }, [conversationId, isLoadingNewer]);

  return {
    messages: uiMessages,
    loading,
    hasMore: paginationState?.hasMore || false,
    error,
    loadOlder: handleLoadOlder,
    loadNewer: handleLoadNewer,
    isLoadingOlder,
    isLoadingNewer,
  };
};

/* ──────────────────────────────────────────────────────────────── */
/* CHAT CONVERSATIONS HOOK */
/* ──────────────────────────────────────────────────────────────── */

export const useChatConversations = (userId: string) => {
  const conversationIds = useChatStore(st => st.conversationIds);
  const conversationsById = useChatStore(st => st.conversationsById);
  const activeId = useChatStore(st => st.activeConversationId);
  const setActive = useChatStore(st => st.setActiveConversation);
  const loading = useChatStore(st => st.loading);
  const error = useChatStore(st => st.error);

  const conversations = useMemo(() => {
    return conversationIds
      .map(id => conversationsById[id])
      .filter(Boolean)
      .map(conv => ({
        id: conv.conversationId,
        otherUserId: conv.buyerId === userId ? conv.sellerId : conv.buyerId,
        otherUserName: '',
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: 0,
        avatar: conv.profile_picture,
        online: false,
        isActive: activeId === conv.conversationId,
      }));
  }, [conversationIds, conversationsById, activeId, userId]);

  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  }, [conversations]);

  const handleSetActive = useCallback(
    async (conversationId: string) => {
      await setActive(conversationId);
    },
    [setActive]
  );

  return {
    conversations,
    activeConversation: conversations.find(c => c.isActive),
    loading,
    error,
    unreadCount: totalUnread,
    setActive: handleSetActive,
  };
};

/* ──────────────────────────────────────────────────────────────── */
/* AUTO SCROLL HOOK */
/* ──────────────────────────────────────────────────────────────── */

export const useAutoScroll = (messages: UIMessage[], smooth = true) => {
  const listRef = useRef<any>(null);
  const isScrollingUp = useRef(false);

  useEffect(() => {
    if (!isScrollingUp.current && messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd?.({ animated: smooth });
      }, smooth ? 100 : 0);
    }
  }, [messages.length, smooth]);

  const handleScroll = useCallback((e: any) => {
    const contentOffset = e.nativeEvent.contentOffset.y;
    const contentSize = e.nativeEvent.contentSize.height;
    const layoutHeight = e.nativeEvent.layoutMeasurement.height;

    isScrollingUp.current =
      contentOffset + layoutHeight < contentSize - 200;
  }, []);

  return { listRef, handleScroll };
};

/* ──────────────────────────────────────────────────────────────── */
/* MESSAGE SEND HOOK */
/* ──────────────────────────────────────────────────────────────── */

export const useMessageSend = (
  conversationId: string,
  buyerId: string,
  sellerId: string,
  currentUserId: string
) => {
  const [isSending, setIsSending] = useState(false);
  const addMessage = useChatStore(st => st.addMessage);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setIsSending(true);

      const now = new Date().toISOString();

      try {
        const optimisticMsg: Message = {
          conversationId,
          senderId: currentUserId,
          receiverId: currentUserId === buyerId ? sellerId : buyerId,
          message: text,
          messageTime: now,
          isReceived: false,
          isRead: false,
        };

        addMessage(optimisticMsg, true);

        console.log('Sending message:', optimisticMsg);

        await new Promise(resolve => setTimeout(resolve, 300));

        setIsSending(false);
      } catch (err) {
        console.error(err);
        setIsSending(false);
      }
    },
    [conversationId, buyerId, sellerId, currentUserId, addMessage]
  );

  return { sendMessage: handleSend, isSending };
};

/* ──────────────────────────────────────────────────────────────── */
/* REALTIME HOOK */
/* ──────────────────────────────────────────────────────────────── */

export const useRealtimeMessages = () => {
  const wsConnected = useChatStore(st => st.wsConnected);

  const connectionStatus = wsConnected
    ? 'connected'
    : 'disconnected';

  return { connectionStatus };
};

/* ──────────────────────────────────────────────────────────────── */
/* CONVERSATION SWITCHER */
/* ──────────────────────────────────────────────────────────────── */

export const useConversationSwitcher = (conversationId: string | null) => {
  const setActiveConversation = useChatStore(
    st => st.setActiveConversation
  );

  useEffect(() => {
    if (!conversationId) return;

    setActiveConversation(conversationId);
  }, [conversationId, setActiveConversation]);
};

/* ──────────────────────────────────────────────────────────────── */
/* MEMORY OPTIMIZATION */
/* ──────────────────────────────────────────────────────────────── */

export const useMemoryOptimization = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      useChatStore.getState().cleanupOldMessages(30 * 60 * 1000);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};