package com.hivemarket.payment.dto;

public record VerifyPaymentResponse(
        String reference,
        String status,
        String message
) {
}