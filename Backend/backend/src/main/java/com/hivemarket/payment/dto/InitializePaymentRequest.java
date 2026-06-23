package com.hivemarket.payment.dto;

import java.math.BigDecimal;

public record InitializePaymentRequest(
        String productId,
        String buyerId,
        String sellerId,
        String customerEmail,
        BigDecimal amount
) {
}