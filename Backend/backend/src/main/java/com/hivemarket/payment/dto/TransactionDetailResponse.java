package com.hivemarket.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionDetailResponse(
        Long id,
        Long productId,
        Long buyerId,
        Long sellerId,
        String reference,
        BigDecimal amount,
        String status,
        String paymentProvider,
        String customerEmail,
        String authorizationUrl,
        String gatewayResponse,
        LocalDateTime createdAt,
        LocalDateTime paidAt
) {
}