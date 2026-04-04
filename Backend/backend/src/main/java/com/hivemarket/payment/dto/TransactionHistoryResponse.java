package com.hivemarket.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionHistoryResponse(
        Long id,
        Long productId,
        String reference,
        BigDecimal amount,
        String status,
        String productName,
        String productImage,
        LocalDateTime createdAt,
        LocalDateTime paidAt
) {
}