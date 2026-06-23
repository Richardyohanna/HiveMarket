package com.hivemarket.wallet.entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a seller's withdrawal request that sits PENDING until
 * an admin approves or rejects it within 24 hours.
 */
@Entity
@Table(name = "withdrawal_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID sellerId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    /**
     * PENDING  → waiting for admin action (default)
     * APPROVED → admin approved; payout should be initiated
     * REJECTED → admin rejected; balance refunded
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WithdrawalStatus status;

    /** Bank account details the seller wants paid into */
    @Column(nullable = false)
    private String bankName;

    @Column(nullable = false)
    private String accountNumber;

    @Column(nullable = false)
    private String accountName;

    /** Optional note from admin when rejecting */
    @Column
    private String adminNote;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum WithdrawalStatus {
        PENDING, APPROVED, REJECTED
    }
}