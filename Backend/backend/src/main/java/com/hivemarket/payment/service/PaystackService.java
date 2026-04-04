package com.hivemarket.payment.service;

import com.hivemarket.payment.dto.PaystackInitializeResponse;

import java.math.BigDecimal;
import java.util.Map;

public interface PaystackService {

    PaystackInitializeResponse initializeTransaction(
            String email,
            BigDecimal amount,
            String reference,
            String callbackUrl,
            Map<String, Object> metadata
    );

    Map<String, Object> verifyTransaction(String reference);
}