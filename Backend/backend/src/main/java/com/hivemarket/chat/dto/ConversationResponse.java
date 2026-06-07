package com.hivemarket.chat.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Returned by GET /api/chat/conversations/{userId}
 *
 * Changes from original:
 *  - Added `otherUserName`  → frontend needs this for the contact row fullName
 *  - Added `otherUserId`    → lets the frontend know who the "other" person is
 *  - Added `unreadCount`    → drives the unread badge per conversation
 *  - `conversationId` is now the canonical field name (was `id` in the entity)
 */
public record ConversationResponse(

        UUID          conversationId,
        UUID          buyerId,
        UUID          sellerId,
        String        profile_picture,
        String        lastMessage,
        LocalDateTime lastMessageTime,

        // ── New fields the frontend now relies on ──────────────────────────
        String        otherUserName,   // display name of the other participant
        UUID          otherUserId,     // UUID of the other participant
        int           unreadCount      // unread message count for this user

) {}