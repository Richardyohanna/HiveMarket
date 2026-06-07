package com.hivemarket.chat.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

/**
 * Changes from original:
 *  - Added `fileUrl`  → stores the resolved URL after a file upload completes
 */
@Entity
@Table(name = "messages")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(name = "receiver_id", nullable = false)
    private UUID receiverId;

    @Column(name = "message")
    private String message;

    @Column(name = "message_time")
    private LocalDateTime messageTime;

    @Column(name = "is_received")
    private Boolean isReceived;

    @Column(name = "is_read")
    private Boolean isRead;

    // ── New column ─────────────────────────────────────────────────────────────
    /** Populated only when the message carries a file attachment. */
    @Column(name = "file_url")
    private String fileUrl;
}