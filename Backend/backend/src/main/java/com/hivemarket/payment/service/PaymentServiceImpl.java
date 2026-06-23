package com.hivemarket.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivemarket.payment.dto.*;
import com.hivemarket.payment.entity.Transaction;
import com.hivemarket.payment.enums.PaymentProvider;
import com.hivemarket.payment.enums.TransactionStatus;
import com.hivemarket.payment.repository.TransactionRepository;
import com.hivemarket.wallet.service.PaymentProcessingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaystackService paystackService;
    private final TransactionRepository transactionRepository;
    private final PaymentProcessingService paymentProcessingService;
    private final ObjectMapper objectMapper;

    @Value("${paystack.callback.url}")
    private String callbackUrl;

    // ─────────────────────────────────────────────────────────
    // INITIALIZE PAYMENT
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional(rollbackFor = Exception.class)
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

        if (request.sellerId() != null) {
            metadata.put("sellerId", request.sellerId());
        }

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

        // Convert string IDs to UUIDs
        UUID productId = request.productId() != null ? UUID.fromString(request.productId()) : null;
        UUID buyerId = request.buyerId() != null ? UUID.fromString(request.buyerId()) : null;
        UUID sellerId = request.sellerId() != null ? UUID.fromString(request.sellerId()) : null;

        // Save transaction with PENDING status
        Transaction transaction = Transaction.builder()
                .productId(productId)
                .buyerId(buyerId)
                .sellerId(sellerId)
                .amount(request.amount())
                .reference(reference)
                .status(TransactionStatus.PENDING)
                .paymentProvider(PaymentProvider.PAYSTACK)
                .customerEmail(request.customerEmail())
                .authorizationUrl(paystackResponse.data().authorizationUrl())
                .accessCode(paystackResponse.data().accessCode())
                .currency("NGN")
                .metadataJson(convertMetadataToJson(metadata))
                .build();

        transactionRepository.save(transaction);

        return new InitializePaymentResponse(
                paystackResponse.data().reference(),
                paystackResponse.data().authorizationUrl(),
                paystackResponse.data().accessCode(),
                paystackResponse.message()
        );
    }

    // ─────────────────────────────────────────────────────────
    // VERIFY PAYMENT
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional(rollbackFor = Exception.class)
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

        // Update transaction status
        Transaction transaction = transactionRepository.findByReference(reference)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if ("success".equalsIgnoreCase(paymentStatus)) {
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setPaidAt(LocalDateTime.now());
            transaction.setPaidAtRaw(String.valueOf(data.get("paid_at")));
            transaction.setGatewayResponse(gatewayResponse);
            transactionRepository.save(transaction);

            // Process payment - debit buyer and credit seller
            processSuccessfulPayment(transaction);
        } else if ("failed".equalsIgnoreCase(paymentStatus)) {
            transaction.setStatus(TransactionStatus.FAILED);
            transaction.setGatewayResponse(gatewayResponse);
            transactionRepository.save(transaction);
        }

        return new VerifyPaymentResponse(
                reference,
                paymentStatus,
                gatewayResponse
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
    // HISTORY
    // ─────────────────────────────────────────────────────────

    @Override
    public List<TransactionHistoryResponse>
    getBuyerTransactions(Long buyerId) {
        UUID buyerUUID = UUID.fromString(buyerId.toString());
        return transactionRepository.findByBuyerIdOrderByCreatedAtDesc(buyerUUID)
                .stream()
                .map(this::mapToTransactionHistoryResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionHistoryResponse> getBuyerTransactionsByUUID(UUID buyerId) {
        return transactionRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId)
                .stream()
                .map(this::mapToTransactionHistoryResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionHistoryResponse> getSellerTransactions(UUID sellerId) {
        return transactionRepository.findBySellerIdOrderByCreatedAtDesc(sellerId)
                .stream()
                .map(this::mapToTransactionHistoryResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────
    // TRANSACTION DETAILS
    // ─────────────────────────────────────────────────────────

    @Override
    public TransactionDetailResponse
    getTransactionByReference(String reference) {
        Transaction transaction = transactionRepository.findByReference(reference)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        return mapToTransactionDetailResponse(transaction);
    }

    // ─────────────────────────────────────────────────────────
    // WEBHOOK
    // ─────────────────────────────────────────────────────────

    @Override
    @Transactional(rollbackFor = Exception.class)
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

        try {
            Map<String, Object> webhookData = objectMapper.readValue(payload, Map.class);
            Map<String, Object> data = (Map<String, Object>) webhookData.get("data");

            if (data != null) {
                String reference = (String) data.get("reference");
                String status = (String) data.get("status");

                if ("success".equalsIgnoreCase(status)) {
                    Transaction transaction = transactionRepository.findByReference(reference)
                            .orElseThrow(() -> new RuntimeException("Transaction not found in webhook"));

                    if (transaction.getStatus() != TransactionStatus.SUCCESS) {
                        transaction.setStatus(TransactionStatus.SUCCESS);
                        transaction.setPaidAt(LocalDateTime.now());
                        transaction.setGatewayResponse(String.valueOf(data.get("gateway_response")));
                        transactionRepository.save(transaction);

                        // Process payment - debit buyer and credit seller
                        processSuccessfulPayment(transaction);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error processing webhook: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ─────────────────────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────────────────────

    private void processSuccessfulPayment(Transaction transaction) {
        if (transaction.getStatus() == TransactionStatus.SUCCESS &&
                transaction.getBuyerId() != null &&
                transaction.getSellerId() != null) {
            paymentProcessingService.processOrderPayment(
                    transaction.getProductId(),
                    transaction.getBuyerId(),
                    transaction.getSellerId(),
                    transaction.getAmount(),
                    transaction.getReference()
            );
        }
    }

    private String generateReference() {

        return "HIVEMARKET-"
                + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12);
    }

    private String convertMetadataToJson(Map<String, Object> metadata) {
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            return "{}";
        }
    }

    private TransactionHistoryResponse mapToTransactionHistoryResponse(Transaction transaction) {
        return new TransactionHistoryResponse(
                transaction.getId(),
                transaction.getReference(),
                transaction.getAmount(),
                transaction.getStatus().toString(),
                transaction.getCreatedAt()
        );
    }

    private TransactionDetailResponse mapToTransactionDetailResponse(Transaction transaction) {
        return new TransactionDetailResponse(
                transaction.getId(),
                transaction.getProductId(),
                transaction.getBuyerId(),
                transaction.getSellerId(),
                transaction.getReference(),
                transaction.getAmount(),
                transaction.getStatus().toString(),
                transaction.getPaymentProvider().toString(),
                transaction.getCustomerEmail(),
                transaction.getAuthorizationUrl(),
                transaction.getGatewayResponse(),
                transaction.getCreatedAt(),
                transaction.getPaidAt()
        );
    }
}