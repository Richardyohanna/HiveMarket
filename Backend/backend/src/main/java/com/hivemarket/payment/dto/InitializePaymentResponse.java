package com.hivemarket.payment.dto;

public record InitializePaymentResponse(
		
        String reference,
        String authorizationUrl,
        String accessCode,
        String status
) {
}