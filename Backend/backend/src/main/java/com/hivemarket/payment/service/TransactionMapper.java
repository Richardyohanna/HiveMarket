package com.hivemarket.payment.service;

import com.hivemarket.payment.dto.TransactionDetailResponse;
import com.hivemarket.payment.dto.TransactionHistoryResponse;
import com.hivemarket.payment.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionHistoryResponse toHistoryResponse(Transaction transaction) {
        return new TransactionHistoryResponse(
                transaction.getId(),
                transaction.getProductId(),
                transaction.getReference(),
                transaction.getAmount(),
                transaction.getStatus().name(),
                null,
                null,
                transaction.getCreatedAt(),
                transaction.getPaidAt()
        );
    }

    public TransactionDetailResponse toDetailResponse(Transaction transaction) {
        return new TransactionDetailResponse(
                transaction.getId(),
                transaction.getProductId(),
                transaction.getBuyerId(),
                transaction.getSellerId(),
                transaction.getReference(),
                transaction.getAmount(),
                transaction.getStatus().name(),
                transaction.getPaymentProvider().name(),
                transaction.getCustomerEmail(),
                transaction.getAuthorizationUrl(),
                transaction.getGatewayResponse(),
                transaction.getCreatedAt(),
                transaction.getPaidAt()
        );
    }
}