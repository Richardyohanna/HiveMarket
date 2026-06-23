package com.hivemarket.wallet.dto;
 
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;
 
@Data
public class WithdrawRequest {
    private UUID userId;
    private BigDecimal amount;
    private String bankCode; 
    // Bank details for the payout
    private String bankName;
    private String accountNumber;
    private String accountName;
}