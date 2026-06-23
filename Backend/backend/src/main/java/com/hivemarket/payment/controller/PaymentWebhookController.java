package com.hivemarket.payment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivemarket.payment.config.PaystackConfig;
import com.hivemarket.payment.service.PaymentService;
import com.hivemarket.wallet.service.PaymentProcessingService;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PaymentService paymentService;
    private final PaystackConfig paystackConfig;
    private final PaymentProcessingService paymentProcessingService;
    private final ObjectMapper objectMapper;

    @PostMapping("/callback")
    public ResponseEntity<Void> handleWebhookCallback(
            @RequestBody String payload,
            @RequestHeader(value = "x-paystack-signature", required = false) String signature
    ) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
    
    
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestHeader("x-paystack-signature") String signature,
            @RequestBody String rawBody
    ) {
        // 1. Verify the request actually came from Paystack
        if (!isValidSignature(rawBody, signature)) {
          //  log.warn("Invalid Paystack webhook signature — ignoring request");
            return ResponseEntity.status(401).body("Invalid signature");
        }
 
        try {
            Map<String, Object> event = objectMapper.readValue(rawBody, Map.class);
            String eventType = (String) event.get("event");
            //log.info("Paystack webhook received: {}", eventType);
 
            // 2. Only process successful charge events
            if ("charge.success".equals(eventType)) {
                Map<String, Object> data = (Map<String, Object>) event.get("data");
                processSuccessfulCharge(data);
            }
 
            // Always return 200 immediately — Paystack retries if you don't
            return ResponseEntity.ok("OK");
 
        } catch (Exception e) {
           // log.error("Error processing Paystack webhook", e);
            // Still return 200 so Paystack doesn't keep retrying a bad payload
            return ResponseEntity.ok("OK");
        }
    }
 
    private void processSuccessfulCharge(Map<String, Object> data) {
        String reference = (String) data.get("reference");
 
        // Amount comes in kobo (smallest unit) — convert back to Naira
        Object amountObj = data.get("amount");
        BigDecimal amountInKobo = new BigDecimal(amountObj.toString());
        BigDecimal amountInNaira = amountInKobo.divide(BigDecimal.valueOf(100));
 
        // Pull seller/buyer/product IDs from the metadata you sent during initialization
        Map<String, Object> metadata = (Map<String, Object>) data.get("metadata");
 
        if (metadata == null) {
            //log.warn("Webhook for ref {} has no metadata — cannot credit seller", reference);
            return;
        }
 
        String sellerIdStr   = (String) metadata.get("seller_id");
        String buyerIdStr    = (String) metadata.get("buyer_id");
        String productIdStr  = (String) metadata.get("product_id");
 
        if (sellerIdStr == null || buyerIdStr == null || productIdStr == null) {
           // log.warn("Webhook metadata missing seller/buyer/product for ref {}", reference);
            return;
        }
 
        UUID sellerId  = UUID.fromString(sellerIdStr);
        UUID buyerId   = UUID.fromString(buyerIdStr);
        UUID productId = UUID.fromString(productIdStr);
 
        //log.info("Processing payment: ref={} amount=NGN{} seller={} buyer={}",
                //reference, amountInNaira, sellerId, buyerId);
 
        paymentProcessingService.processOrderPayment(
                productId, buyerId, sellerId, amountInNaira, reference
        );
 
       // log.info("Seller wallet credited successfully for ref={}", reference);
    }
 
    /**
     * Verify HMAC-SHA512 signature.
     * Paystack signs the raw request body using your secret key.
     */
    private boolean isValidSignature(String rawBody, String paystackSignature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(
                    paystackConfig.getSecretKeyTest().getBytes(StandardCharsets.UTF_8),
                    "HmacSHA512"
            );
            mac.init(secretKey);
            byte[] hashBytes = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
 
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
 
            return hexString.toString().equals(paystackSignature);
        } catch (Exception e) {
           // log.error("Signature verification failed", e);
            return false;
        }
    }
}