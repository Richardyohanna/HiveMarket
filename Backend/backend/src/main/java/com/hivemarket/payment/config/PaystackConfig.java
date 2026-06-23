package com.hivemarket.payment.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "paystack")
public class PaystackConfig {

    private String mode;
    private String secretKeyTest;
    private String secretKeyLive;
    private String publicKeyTest;
    private String publicKeyLive;
    private String baseUrl;
}