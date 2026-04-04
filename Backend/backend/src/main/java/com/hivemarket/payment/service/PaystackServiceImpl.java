package com.hivemarket.payment.service;

import com.hivemarket.payment.dto.PaystackInitializeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaystackServiceImpl implements PaystackService {

    private final RestTemplate restTemplate;

    @Value("${paystack.secret.key}")
    private String paystackSecretKey;

    @Value("${paystack.base.url}")
    private String paystackBaseUrl;

    @Override
    public PaystackInitializeResponse initializeTransaction(
            String email,
            BigDecimal amount,
            String reference,
            String callbackUrl,
            Map<String, Object> metadata
    ) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(paystackSecretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();
        payload.put("email", email);
        payload.put("amount", amount.multiply(BigDecimal.valueOf(100)).longValue()); // kobo
        payload.put("reference", reference);
        payload.put("callback_url", callbackUrl);
        payload.put("currency", "NGN");
        payload.put("metadata", metadata);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        ResponseEntity<PaystackInitializeResponse> response = restTemplate.exchange(
                paystackBaseUrl + "/transaction/initialize",
                HttpMethod.POST,
                entity,
                PaystackInitializeResponse.class
        );

        if (response.getBody() == null) {
            throw new RuntimeException("Paystack returned empty initialize response");
        }

        return response.getBody();
    }

    @Override
    public Map<String, Object> verifyTransaction(String reference) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(paystackSecretKey);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                paystackBaseUrl + "/transaction/verify/" + reference,
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        if (response.getBody() == null) {
            throw new RuntimeException("Paystack returned empty verify response");
        }

        return response.getBody();
    }
}