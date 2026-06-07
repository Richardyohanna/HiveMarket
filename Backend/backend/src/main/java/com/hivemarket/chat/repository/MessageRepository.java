package com.hivemarket.chat.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hivemarket.chat.entity.Message;

public interface MessageRepository
        extends JpaRepository<Message, UUID> {

    // ── Existing ───────────────────────────────────────────────────────────────
    List<Message> findByConversationIdOrderByMessageTimeAsc(
            UUID conversationId
    );

    // ── New ────────────────────────────────────────────────────────────────────

    /**
     * Mark all unread messages in a conversation as read for a given receiver.
     * Called when the user opens the chat screen.
     */
    @Modifying
    @Query("""
        UPDATE Message m
        SET m.isRead = true
        WHERE m.conversationId = :conversationId
          AND m.receiverId      = :userId
          AND m.isRead          = false
    """)
    void markMessagesAsRead(
            @Param("conversationId") UUID conversationId,
            @Param("userId")         UUID userId
    );
}