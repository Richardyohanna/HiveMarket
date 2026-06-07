package com.hivemarket.payment.service;

import com.hivemarket.payment.dto.CardChargeRequest;
import com.hivemarket.payment.dto.InitializePaymentRequest;
import com.hivemarket.payment.dto.InitializePaymentResponse;
import com.hivemarket.payment.dto.TransactionDetailResponse;
import com.hivemarket.payment.dto.TransactionHistoryResponse;
import com.hivemarket.payment.dto.VerifyPaymentResponse;

import java.util.List;
import java.util.Map;



public interface PaymentService {

    InitializePaymentResponse initializePayment(InitializePaymentRequest request);

    VerifyPaymentResponse verifyPayment(String reference);

    List<TransactionHistoryResponse> getBuyerTransactions(Long buyerId);

    TransactionDetailResponse getTransactionByReference(String reference);

    void handleWebhook(String payload, String signature);
    
    // ── NEW ─────────────────────────────────────────────

    Map<String, Object> chargeCard(
            CardChargeRequest request
    );

    Map<String, Object> submitPin(
            String pin,
            String reference
    );

    Map<String, Object> submitOtp(
            String otp,
            String reference
    );

    Map<String, Object> chargeBankTransfer(
            String email,
            Long amount,
            String reference
            
            
    );
}