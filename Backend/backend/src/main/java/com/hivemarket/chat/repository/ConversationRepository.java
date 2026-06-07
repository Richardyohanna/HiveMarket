package com.hivemarket.chat.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hivemarket.chat.entity.Conversation;

public interface ConversationRepository
        extends JpaRepository<Conversation, UUID> {

    // ── Existing queries ───────────────────────────────────────────────────────

    List<Conversation> findByBuyerIdOrSellerId(
            UUID buyerId,
            UUID sellerId
    );

    Optional<Conversation> findByBuyerIdAndSellerId(
            UUID buyerId,
            UUID sellerId
    );

    // ── New queries ────────────────────────────────────────────────────────────

    /**
     * Reset the unread counter for a given user in a conversation.
     * Called when the user opens the chat (marks messages as read).
     *
     * The frontend calls PUT /api/chat/conversations/{conversationId}/read
     * with the current userId so we know which counter to zero out.
     */
    @Modifying
    @Query("""
        UPDATE Conversation c
        SET c.buyerUnread = CASE WHEN c.buyerId = :userId THEN 0 ELSE c.buyerUnread END,
            c.sellerUnread = CASE WHEN c.sellerId = :userId THEN 0 ELSE c.sellerUnread END
        WHERE c.id = :conversationId
    """)
    void resetUnreadForUser(
            @Param("conversationId") UUID conversationId,
            @Param("userId")         UUID userId
    );
}