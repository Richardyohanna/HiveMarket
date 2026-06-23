package com.hivemarket.payment.service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.hivemarket.wallet.service.PaymentProcessingService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentConfirmationService {

    private final PaystackService paystackService;
    private final PaymentProcessingService paymentProcessingService;

    @Transactional
    public void confirmPayment(
            UUID productId,
            UUID buyerId,
            UUID sellerId,
            String reference
    ) {

        Map<String, Object> response =
                paystackService.verifyTransaction(reference);

        Boolean status =
                (Boolean) response.get("status");

        if (status == null || !status) {
            throw new RuntimeException(
                    "Paystack verification failed"
            );
        }

        Map<String, Object> data =
                (Map<String, Object>) response.get("data");

        String paymentStatus =
                String.valueOf(data.get("status"));

        if (!"success".equalsIgnoreCase(paymentStatus)) {
            throw new RuntimeException(
                    "Payment not successful"
            );
        }

        Long amountInKobo =
                ((Number) data.get("amount")).longValue();

        BigDecimal amount =
                BigDecimal.valueOf(amountInKobo)
                        .divide(BigDecimal.valueOf(100));

        paymentProcessingService.processOrderPayment(
                productId,
                buyerId,
                sellerId,
                amount,
                reference
        );
    }
}