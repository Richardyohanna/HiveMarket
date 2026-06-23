package com.hivemarket.wallet.repository;

import com.hivemarket.wallet.entity.WithdrawalRequest;
import com.hivemarket.wallet.entity.WithdrawalRequest.WithdrawalStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, UUID> {

    List<WithdrawalRequest> findBySellerIdOrderByCreatedAtDesc(UUID sellerId);

    List<WithdrawalRequest> findByStatusOrderByCreatedAtAsc(WithdrawalStatus status);

    /** Check if seller already has a pending withdrawal (optional — prevent duplicate requests) */
    boolean existsBySellerIdAndStatus(UUID sellerId, WithdrawalStatus status);
}