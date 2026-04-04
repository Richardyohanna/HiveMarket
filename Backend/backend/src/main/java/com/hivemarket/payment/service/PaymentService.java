package com.hivemarket.payment.service;

import com.hivemarket.payment.dto.InitializePaymentRequest;
import com.hivemarket.payment.dto.InitializePaymentResponse;
import com.hivemarket.payment.dto.TransactionDetailResponse;
import com.hivemarket.payment.dto.TransactionHistoryResponse;
import com.hivemarket.payment.dto.VerifyPaymentResponse;

import java.util.List;

import org.springframework.stereotype.Service;


public interface PaymentService {

    InitializePaymentResponse initializePayment(InitializePaymentRequest request);

    VerifyPaymentResponse verifyPayment(String reference);

    List<TransactionHistoryResponse> getBuyerTransactions(Long buyerId);

    TransactionDetailResponse getTransactionByReference(String reference);

    void handleWebhook(String payload, String signature);
}