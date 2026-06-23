package com.hivemarket.wallet.dto;
 
import lombok.Data;
 
@Data
public class AdminActionRequest {
    /** Reason for approval or rejection (shown to seller on rejection) */
    private String note;
}