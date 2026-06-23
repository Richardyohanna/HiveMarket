package com.hivemarket.wallet.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hivemarket.payment.config.PaystackConfig;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaystackBankService {

  

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final PaystackConfig paystackConfig;
    
    public List<BankDto> listBanks() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + paystackConfig.getSecretKeyTest());

        ResponseEntity<String> response = restTemplate.exchange(
        		paystackConfig.getBaseUrl() + "/bank?country=nigeria&perPage=100",
                HttpMethod.GET, new HttpEntity<>(headers), String.class);

        List<BankDto> banks = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            for (JsonNode node : root.get("data")) {
                banks.add(new BankDto(node.get("name").asText(), node.get("code").asText()));
            }
        } catch (Exception e) {
            log.error("Failed to parse Paystack bank list", e);
            throw new IllegalStateException("Could not fetch bank list");
        }
        return banks;
    }
	
	public ResolvedAccountDto resolveAccountNumber(String accountNumber, String bankCode) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + paystackConfig.getSecretKeyTest());

        String url = paystackConfig.getBaseUrl() + "/bank/resolve?account_number=" + accountNumber + "&bank_code=" + bankCode;

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            JsonNode data = objectMapper.readTree(response.getBody()).get("data");
            return new ResolvedAccountDto(data.get("account_number").asText(), data.get("account_name").asText());
        } catch (Exception e) {
            log.error("Failed to resolve account {} / {}", accountNumber, bankCode, e);
            throw new IllegalArgumentException("Could not verify this account. Check the number and bank.");
        }
    }

    public record BankDto(String name, String code) {}
    public record ResolvedAccountDto(String accountNumber, String accountName) {}
}