package com.hivemarket.payment.dto;

import java.math.BigDecimal;

public record InitializePaymentRequest(
        String productId,
        String buyerId,
        String customerEmail,
        BigDecimal amount
) {
}