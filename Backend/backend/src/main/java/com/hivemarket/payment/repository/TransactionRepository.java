package com.hivemarket.payment.repository;

import com.hivemarket.payment.entity.Transaction;
import com.hivemarket.payment.enums.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByReference(String reference);

    List<Transaction> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Transaction> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    List<Transaction> findByBuyerIdAndStatusOrderByCreatedAtDesc(Long buyerId, TransactionStatus status);
}