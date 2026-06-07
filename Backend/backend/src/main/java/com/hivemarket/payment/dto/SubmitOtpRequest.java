package com.hivemarket.payment.dto;

import lombok.Data;

@Data
public class SubmitOtpRequest {

    private String otp;

    private String reference;
}