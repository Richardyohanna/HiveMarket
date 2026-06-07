package com.hivemarket.payment.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "paystack")
public class PaystackConfig {

    private String secretKey;
    private String publicKey;
    private String baseUrl;
}