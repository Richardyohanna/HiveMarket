package com.hivemarket.payment.dto;

import java.math.BigDecimal;

public record InitializePaymentRequest(
        Long productId,
        Long buyerId,
        String customerEmail,
        BigDecimal amount
) {
}