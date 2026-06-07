package com.hivemarket.payment.dto;

import lombok.Data;

@Data
public class BankTransferRequest {

    private String email;

    private Long amount;

    private String reference;
    
   
}