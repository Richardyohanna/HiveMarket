package com.hivemarket.payment.service;

import com.hivemarket.payment.dto.CardChargeRequest;
import com.hivemarket.payment.dto.PaystackInitializeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    
    @Override
    public Map<String, Object> chargeCard(CardChargeRequest request) {

        HttpHeaders headers = new HttpHeaders();

        headers.setBearerAuth(paystackSecretKey);

        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();

        payload.put("email", request.getEmail());

        payload.put("amount", request.getAmount());

        payload.put("reference", request.getReference());

        Map<String, Object> card = new HashMap<>();

        card.put("number", request.getNumber());

        card.put("cvv", request.getCvv());

        card.put("expiry_month", request.getExpMonth());

        card.put("expiry_year", request.getExpYear());

        payload.put("card", card);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(payload, headers);

        ResponseEntity<Map<String, Object>> response =
                restTemplate.exchange(
                        paystackBaseUrl + "/charge",
                        HttpMethod.POST,
                        entity,
                        new ParameterizedTypeReference<>() {}
                );

        return response.getBody();
    }

    @Override
    public Map<String, Object> submitPin(
            String pin,
            String reference
    ) {

        HttpHeaders headers = new HttpHeaders();

        headers.setBearerAuth(paystackSecretKey);

        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();

        payload.put("pin", pin);

        payload.put("reference", reference);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(payload, headers);

        ResponseEntity<Map<String, Object>> response =
                restTemplate.exchange(
                        paystackBaseUrl + "/charge/submit_pin",
                        HttpMethod.POST,
                        entity,
                        new ParameterizedTypeReference<>() {}
                );

        return response.getBody();
    }

    @Override
    public Map<String, Object> submitOtp(
            String otp,
            String reference
    ) {

        HttpHeaders headers = new HttpHeaders();

        headers.setBearerAuth(paystackSecretKey);

        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();

        payload.put("otp", otp);

        payload.put("reference", reference);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(payload, headers);

        ResponseEntity<Map<String, Object>> response =
                restTemplate.exchange(
                        paystackBaseUrl + "/charge/submit_otp",
                        HttpMethod.POST,
                        entity,
                        new ParameterizedTypeReference<>() {}
                );

        return response.getBody();
    }

	@Override
	public Map<String, Object> chargeBankTransfer(String email, Long amount, String reference) {
		// TODO Auto-generated method stub
		   String url = paystackBaseUrl + "/charge";

		    HttpHeaders headers = new HttpHeaders();
		    headers.setContentType(MediaType.APPLICATION_JSON);
		    headers.setBearerAuth(paystackSecretKey);

		    Map<String, Object> payload = new HashMap<>();

		    payload.put("email", email);
		    payload.put("amount", amount);
		    payload.put("reference", reference);

		    // THIS enables virtual account transfer
		    Map<String, Object> bankTransfer = new HashMap<>();
		    bankTransfer.put(
		            "account_expires_at",
		            LocalDateTime.now()
		                    .plusMinutes(30)
		                    .toString()
		    );

		    payload.put("bank_transfer", bankTransfer);

		    System.out.println("PAYSTACK PAYLOAD => " + payload);

		    HttpEntity<Map<String, Object>> entity =
		            new HttpEntity<>(payload, headers);

		    ResponseEntity<Map> response = restTemplate.exchange(
		            url,
		            HttpMethod.POST,
		            entity,
		            Map.class
		    );

		    return response.getBody();
	}


}