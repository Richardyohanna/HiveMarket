package com.hivemarket.payment.service;

import com.hivemarket.payment.dto.*;
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

    // ─────────────────────────────────────────────────────────
    // INITIALIZE PAYMENT
    // ─────────────────────────────────────────────────────────

    @Override
    public InitializePaymentResponse initializePayment(
            InitializePaymentRequest request
    ) {

        if (request == null) {
            throw new RuntimeException("Request cannot be null");
        }

        if (request.customerEmail() == null ||
                request.customerEmail().isBlank()) {

            throw new RuntimeException(
                    "Customer email is required"
            );
        }

        if (request.amount() == null ||
                request.amount().signum() <= 0) {

            throw new RuntimeException(
                    "Amount must be greater than zero"
            );
        }

        String reference = generateReference();

        Map<String, Object> metadata =
                new HashMap<>();

        metadata.put(
                "productId",
                request.productId()
        );

        metadata.put(
                "buyerId",
                request.buyerId()
        );

        PaystackInitializeResponse paystackResponse =
                paystackService.initializeTransaction(
                        request.customerEmail(),
                        request.amount(),
                        reference,
                        callbackUrl,
                        metadata
                );

        if (paystackResponse == null) {
            throw new RuntimeException(
                    "Paystack response is null"
            );
        }

        if (!paystackResponse.status()) {
            throw new RuntimeException(
                    "Paystack initialization failed: "
                            + paystackResponse.message()
            );
        }

        if (paystackResponse.data() == null) {
            throw new RuntimeException(
                    "Paystack response data is null"
            );
        }

        return new InitializePaymentResponse(
                paystackResponse.data().reference(),
                paystackResponse.data().authorizationUrl(),
                paystackResponse.data().accessCode(),
                paystackResponse.message()
        );
    }

    // ─────────────────────────────────────────────────────────
    // CHARGE CARD
    // ─────────────────────────────────────────────────────────

    @Override
    public Map<String, Object> chargeCard(
            CardChargeRequest request
    ) {
        return paystackService.chargeCard(request);
    }

    // ─────────────────────────────────────────────────────────
    // SUBMIT PIN
    // ─────────────────────────────────────────────────────────

    @Override
    public Map<String, Object> submitPin(
            String pin,
            String reference
    ) {
        return paystackService.submitPin(
                pin,
                reference
        );
    }

    // ─────────────────────────────────────────────────────────
    // SUBMIT OTP
    // ─────────────────────────────────────────────────────────

    @Override
    public Map<String, Object> submitOtp(
            String otp,
            String reference
    ) {
        return paystackService.submitOtp(
                otp,
                reference
        );
    }

    // ─────────────────────────────────────────────────────────
    // BANK TRANSFER
    // ─────────────────────────────────────────────────────────

    @Override
    public Map<String, Object> chargeBankTransfer(
            String email,
            Long amount,
            String reference          
           
    ) {
        return paystackService.chargeBankTransfer(
                email,
                amount,
                reference
        );
    }

    // ─────────────────────────────────────────────────────────
    // VERIFY PAYMENT
    // ─────────────────────────────────────────────────────────

    @Override
    public VerifyPaymentResponse verifyPayment(
            String reference
    ) {

        Map<String, Object> response =
                paystackService.verifyTransaction(
                        reference
                );

        Boolean status =
                (Boolean) response.get("status");

        if (status == null || !status) {
            throw new RuntimeException(
                    "Payment verification failed"
            );
        }

        Map<String, Object> data =
                (Map<String, Object>) response.get("data");

        String paymentStatus =
                String.valueOf(data.get("status"));

        Long amount =
                Long.valueOf(
                        String.valueOf(data.get("amount"))
                );

        String gatewayResponse =
                String.valueOf(
                        data.get("gateway_response")
                );

        return new VerifyPaymentResponse(
                reference,
                paymentStatus,
                gatewayResponse
        );
    }

    // ─────────────────────────────────────────────────────────
    // HISTORY
    // ─────────────────────────────────────────────────────────

    @Override
    public List<TransactionHistoryResponse>
    getBuyerTransactions(Long buyerId) {

        return List.of();
    }

    // ─────────────────────────────────────────────────────────
    // TRANSACTION DETAILS
    // ─────────────────────────────────────────────────────────

    @Override
    public TransactionDetailResponse
    getTransactionByReference(String reference) {

        return null;
    }

    // ─────────────────────────────────────────────────────────
    // WEBHOOK
    // ─────────────────────────────────────────────────────────

    @Override
    public void handleWebhook(
            String payload,
            String signature
    ) {

        System.out.println(
                "Webhook payload: " + payload
        );

        System.out.println(
                "Signature: " + signature
        );
    }

    // ─────────────────────────────────────────────────────────
    // GENERATE REFERENCE
    // ─────────────────────────────────────────────────────────

    private String generateReference() {

        return "HIVEMARKET-"
                + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12);
    }
}