package com.hivemarket.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PaystackInitializeResponse(
        boolean status,
        String message,
        PaystackInitializeData data
) {
    public record PaystackInitializeData(
            @JsonProperty("authorization_url")
            String authorizationUrl,

            @JsonProperty("access_code")
            String accessCode,

            String reference
    ) {}
}