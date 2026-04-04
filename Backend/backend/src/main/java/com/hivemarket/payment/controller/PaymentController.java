package com.hivemarket.payment.controller;

import com.hivemarket.payment.dto.InitializePaymentRequest;
import com.hivemarket.payment.dto.InitializePaymentResponse;
import com.hivemarket.payment.dto.TransactionDetailResponse;
import com.hivemarket.payment.dto.TransactionHistoryResponse;
import com.hivemarket.payment.dto.VerifyPaymentResponse;
import com.hivemarket.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initialize")
    public ResponseEntity<InitializePaymentResponse> initializePayment(
            @RequestBody InitializePaymentRequest request
    ) {
        InitializePaymentResponse response = paymentService.initializePayment(request);
        System.out.println("This is the response: " + response);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify")
    public ResponseEntity<VerifyPaymentResponse> verifyPayment(
            @RequestParam String reference
    ) {
    	System.out.println("This is the reference " + reference);
        return ResponseEntity.ok(paymentService.verifyPayment(reference));
    }

    @GetMapping("/history/{buyerId}")
    public ResponseEntity<List<TransactionHistoryResponse>> getBuyerTransactions(
            @PathVariable Long buyerId
    ) {
        return ResponseEntity.ok(paymentService.getBuyerTransactions(buyerId));
    }

    @GetMapping("/transaction/{reference}")
    public ResponseEntity<TransactionDetailResponse> getTransactionDetail(
            @PathVariable String reference
    ) {
        return ResponseEntity.ok(paymentService.getTransactionByReference(reference));
    }
}