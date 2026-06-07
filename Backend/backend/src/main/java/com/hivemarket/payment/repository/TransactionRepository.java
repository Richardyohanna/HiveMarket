package com.hivemarket.payment.repository;

import com.hivemarket.payment.entity.Transaction;
import com.hivemarket.payment.enums.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findByReference(String reference);

    List<Transaction> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId);

    List<Transaction> findBySellerIdOrderByCreatedAtDesc(UUID sellerId);

    List<Transaction> findByBuyerIdAndStatusOrderByCreatedAtDesc(UUID buyerId, TransactionStatus status);
}