package com.hivemarket.payment.dto;

import lombok.Data;

@Data
public class CardChargeRequest {

    private String email;
    private Integer amount;
    private String reference;

    private String number;
    private String cvv;
    private String expMonth;
    private String expYear;
}
