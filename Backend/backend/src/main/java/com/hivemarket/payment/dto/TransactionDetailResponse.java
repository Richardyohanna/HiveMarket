package com.hivemarket.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionDetailResponse(
        UUID id,
        UUID productId,
        UUID buyerId,
        UUID sellerId,
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