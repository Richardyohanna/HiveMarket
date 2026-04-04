package com.hivemarket.payment.service;

import com.hivemarket.payment.dto.InitializePaymentRequest;
import com.hivemarket.payment.dto.InitializePaymentResponse;
import com.hivemarket.payment.dto.PaystackInitializeResponse;
import com.hivemarket.payment.dto.TransactionDetailResponse;
import com.hivemarket.payment.dto.TransactionHistoryResponse;
import com.hivemarket.payment.dto.VerifyPaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaystackService paystackService;

    @Value("${paystack.callback.url}")
    private String callbackUrl;

    @Override
    public InitializePaymentResponse initializePayment(InitializePaymentRequest request) {

        if (request == null) {
            throw new RuntimeException("Request cannot be null");
        }

        if (request.customerEmail() == null || request.customerEmail().isBlank()) {
            throw new RuntimeException("Customer email is required");
        }

        if (request.amount() == null || request.amount().signum() <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }

        String reference = generateReference();

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("productId", request.productId());
        metadata.put("buyerId", request.buyerId());

        PaystackInitializeResponse paystackResponse = paystackService.initializeTransaction(
                request.customerEmail(),
                request.amount(),
                reference,
                callbackUrl,
                metadata
        );

        if (paystackResponse == null) {
            throw new RuntimeException("Paystack response is null");
        }

        if (!paystackResponse.status()) {
            throw new RuntimeException("Paystack initialization failed: " + paystackResponse.message());
        }

        if (paystackResponse.data() == null) {
            throw new RuntimeException("Paystack response data is null");
        }

        return new InitializePaymentResponse(
                paystackResponse.data().reference(),
                paystackResponse.data().authorizationUrl(),
                paystackResponse.data().accessCode(),
                paystackResponse.message()
        );
    }

    private String generateReference() {
        return "HIVEMARKET-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    @Override
    public VerifyPaymentResponse verifyPayment(String reference) {
        return null;
    }

    @Override
    public List<TransactionHistoryResponse> getBuyerTransactions(Long buyerId) {
        return List.of();
    }

    @Override
    public TransactionDetailResponse getTransactionByReference(String reference) {
        return null;
    }

    @Override
    public void handleWebhook(String payload, String signature) {
    }
}