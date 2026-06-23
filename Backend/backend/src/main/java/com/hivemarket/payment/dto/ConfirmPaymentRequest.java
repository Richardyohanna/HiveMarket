package com.hivemarket.payment.dto;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConfirmPaymentRequest {

    private UUID productId;

    private UUID buyerId;

    private UUID sellerId;

    private String reference;
}
