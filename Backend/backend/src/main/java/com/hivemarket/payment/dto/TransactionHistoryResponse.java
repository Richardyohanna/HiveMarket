package com.hivemarket.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionHistoryResponse(
        UUID id,
        UUID productId,
        String reference,
        BigDecimal amount,
        String status,
        String productName,
        String productImage,
        LocalDateTime createdAt,
        LocalDateTime paidAt
) {
}