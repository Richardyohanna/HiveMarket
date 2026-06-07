package com.hivemarket.payment.service;

import com.hivemarket.payment.dto.CardChargeRequest;
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
    
    Map<String, Object> chargeCard(CardChargeRequest request);

    Map<String, Object> submitPin(String pin, String reference);

    Map<String, Object> submitOtp(String otp, String reference);

    Map<String, Object> chargeBankTransfer(
            String email,
            Long amount,
            String reference
            
    );
}