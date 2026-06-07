package com.hivemarket.chat.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

/**
 * Changes from original:
 *  - Added `buyerUnread`  → unread count for the buyer
 *  - Added `sellerUnread` → unread count for the seller
 *
 * These mirror Hivegram's per-friend `unreadNumber` field.
 * The service increments the receiver's counter on every new message
 * and resets it to 0 when the frontend marks messages as read.
 */
@Entity
@Table(name = "conversation")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(name = "seller_id", nullable = false)
    private UUID sellerId;

    @Column(name = "last_message")
    private String lastMessage;

    @Column(name = "last_message_time")
    private LocalDateTime lastMessageTime;

    // ── New columns ────────────────────────────────────────────────────────────
    /** Messages the buyer has not yet read. */
    @Column(name = "buyer_unread", nullable = false)
    @Builder.Default
    private int buyerUnread = 0;

    /** Messages the seller has not yet read. */
    @Column(name = "seller_unread", nullable = false)
    @Builder.Default
    private int sellerUnread = 0;
}