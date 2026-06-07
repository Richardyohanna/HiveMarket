package com.hivemarket.chat.dto;

import java.util.UUID;

/**
 * Sent by the client for:
 *   POST /api/chat/messages        (fetch message history)
 *   POST /api/chat/conversation    (create conversation)
 *   WS   /app/chat.sendMessage     (send a message)
 *
 * Changes from original:
 *  - Added `fileUrl` (nullable) → populated when the client sends a file
 *    after the chunk-reassembly flow resolves the upload URL.
 */
public record ConversationRequest(

        UUID   buyerId,
        UUID   sellerId,
        String message,

        // ── New field ──────────────────────────────────────────────────────
        String fileUrl          // null for plain text messages

) {
    /**
     * Convenience constructor for plain text messages (no file).
     * Keeps existing call-sites that only pass buyerId/sellerId/message
     * compiling without changes.
     */
    public ConversationRequest(UUID buyerId, UUID sellerId, String message) {
        this(buyerId, sellerId, message, null);
    }
}