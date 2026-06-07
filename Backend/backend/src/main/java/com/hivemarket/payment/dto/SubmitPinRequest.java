package com.hivemarket.payment.dto;

import lombok.Data;

@Data
public class SubmitPinRequest {

    private String pin;

    private String reference;
}