package com.hivemarket.chat.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Returned for individual messages.
 *
 * Changes from original:
 *  - Added `fileUrl` → supports the image / document sending feature
 *    the frontend now sends via the file-chunk WebSocket flow.
 *    Null for plain text messages.
 */
public record MessageResponse(

        UUID          conversationId,
        UUID          senderId,
        UUID          receiverId,
        String        message,
        LocalDateTime messageTime,
        Boolean       isReceived,
        Boolean       isRead,

        // ── New field ──────────────────────────────────────────────────────
        String        fileUrl         // null for text-only messages

) {}