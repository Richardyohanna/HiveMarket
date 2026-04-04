package com.hivemarket.payment.entity;

import com.hivemarket.payment.enums.PaymentProvider;
import com.hivemarket.payment.enums.TransactionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;

    private Long buyerId;

    private Long sellerId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, unique = true)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentProvider paymentProvider;

    @Column(length = 500)
    private String authorizationUrl;

    @Column(length = 255)
    private String accessCode;

    @Column(length = 50)
    private String currency;

    @Column(length = 255)
    private String customerEmail;

    @Column(length = 255)
    private String paidAtRaw;

    private LocalDateTime paidAt;

    @Column(length = 2000)
    private String gatewayResponse;

    @Column(length = 2000)
    private String metadataJson;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}