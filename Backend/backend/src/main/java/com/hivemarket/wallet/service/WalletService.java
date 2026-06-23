/*
 * package com.hivemarket.wallet.service;
 * 
 * import com.hivemarket.user.entity.User; import
 * com.hivemarket.user.repository.UserRepository; import
 * com.hivemarket.wallet.dto.WalletBalanceResponse; import
 * com.hivemarket.wallet.entity.Wallet; import
 * com.hivemarket.wallet.entity.WalletTransaction; import
 * com.hivemarket.wallet.enums.WalletTransactionType; import
 * com.hivemarket.wallet.repository.WalletRepository; import
 * com.hivemarket.wallet.repository.WalletTransactionRepository; import
 * lombok.RequiredArgsConstructor; import
 * org.springframework.data.domain.PageRequest; import
 * org.springframework.stereotype.Service; import
 * org.springframework.transaction.annotation.Transactional;
 * 
 * import java.math.BigDecimal; import java.util.UUID;
 * 
 * @Service
 * 
 * @RequiredArgsConstructor public class WalletService {
 * 
 * private final WalletRepository walletRepository; private final
 * WalletTransactionRepository walletTransactionRepository; private final
 * UserRepository userRepository;
 * 
 * public WalletBalanceResponse getWalletBalance(UUID userId) {
 * 
 * @SuppressWarnings({ "unused", "null" }) User user =
 * userRepository.findById(userId) .orElseThrow(() -> new
 * IllegalArgumentException("User not found"));
 * 
 * Wallet wallet = walletRepository.findByUserId(userId) .orElseGet(() ->
 * createWallet(userId));
 * 
 * BigDecimal totalEarned = walletTransactionRepository
 * .findByWalletIdOrderByCreatedAtDesc(wallet.getId(), PageRequest.of(0,
 * Integer.MAX_VALUE)) .stream() .filter(wt -> wt.getType() ==
 * WalletTransactionType.SELLER_CREDIT) .map(WalletTransaction::getAmount)
 * .reduce(BigDecimal.ZERO, BigDecimal::add);
 * 
 * BigDecimal pendingWithdrawals = walletTransactionRepository
 * .findByWalletIdOrderByCreatedAtDesc(wallet.getId(), PageRequest.of(0,
 * Integer.MAX_VALUE)) .stream() .filter(wt -> wt.getType() ==
 * WalletTransactionType.WITHDRAWAL && "PENDING".equals(wt.getStatus()))
 * .map(WalletTransaction::getAmount) .reduce(BigDecimal.ZERO, BigDecimal::add);
 * 
 * return new WalletBalanceResponse(wallet.getBalance(), totalEarned,
 * pendingWithdrawals); }
 * 
 * @SuppressWarnings("null")
 * 
 * @Transactional(rollbackFor = Exception.class) public void withdraw(UUID
 * userId, BigDecimal amount) { User user = userRepository.findById(userId)
 * .orElseThrow(() -> new IllegalArgumentException("User not found"));
 * 
 * if (!(user.getRole() == "Seller")) { throw new
 * IllegalArgumentException("Only sellers can withdraw"); }
 * 
 * if (amount.compareTo(BigDecimal.ZERO) <= 0) { throw new
 * IllegalArgumentException("Amount must be greater than zero"); }
 * 
 * Wallet wallet = walletRepository.findByUserId(userId) .orElseThrow(() -> new
 * IllegalArgumentException("Wallet not found"));
 * 
 * if (wallet.getBalance().compareTo(amount) < 0) { throw new
 * IllegalArgumentException("Insufficient balance"); }
 * 
 * wallet.setBalance(wallet.getBalance().subtract(amount));
 * walletRepository.save(wallet);
 * 
 * WalletTransaction withdrawal = WalletTransaction.builder()
 * .walletId(wallet.getId()) .type(WalletTransactionType.WITHDRAWAL)
 * .amount(amount) .description("Withdrawal request") .status("SUCCESS")
 * .build();
 * 
 * walletTransactionRepository.save(withdrawal); }
 * 
 * @SuppressWarnings("null") private Wallet createWallet(UUID userId) { Wallet
 * wallet = Wallet.builder() .userId(userId) .balance(BigDecimal.ZERO)
 * .currency("NGN") .build(); return walletRepository.save(wallet); } }
 */

package com.hivemarket.wallet.service;

import com.hivemarket.user.entity.User;
import com.hivemarket.user.repository.UserRepository;
import com.hivemarket.wallet.dto.WalletBalanceResponse;
import com.hivemarket.wallet.dto.WithdrawRequest;
import com.hivemarket.wallet.entity.Wallet;
import com.hivemarket.wallet.entity.WalletTransaction;
import com.hivemarket.wallet.entity.WithdrawalRequest;
import com.hivemarket.wallet.entity.WithdrawalRequest.WithdrawalStatus;
//import com.hivemarket.wallet.entity.WithdrawalRequest.WithdrawalStatus;
import com.hivemarket.wallet.enums.WalletTransactionType;
import com.hivemarket.wallet.repository.WalletRepository;
import com.hivemarket.wallet.repository.WalletTransactionRepository;
import com.hivemarket.wallet.repository.WithdrawalRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final UserRepository userRepository;

    // ── Seller: get wallet balance ─────────────────────────────────────────────

    public WalletBalanceResponse getWalletBalance(UUID userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> createWallet(userId));

        // Total ever earned (all SELLER_CREDIT entries)
        BigDecimal totalEarned = walletTransactionRepository
                .findByWalletIdOrderByCreatedAtDesc(wallet.getId(), PageRequest.of(0, Integer.MAX_VALUE))
                .stream()
                .filter(wt -> wt.getType() == WalletTransactionType.SELLER_CREDIT)
                .map(WalletTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Pending withdrawal amount (balance already deducted on request — shown for transparency)
        BigDecimal pendingWithdrawals = withdrawalRequestRepository
                .findBySellerIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(wr -> wr.getStatus() == WithdrawalStatus.PENDING)
                .map(WithdrawalRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new WalletBalanceResponse(wallet.getBalance(), totalEarned, pendingWithdrawals);
    }

    // ── Seller: request a withdrawal ──────────────────────────────────────────

    /**
     * Deducts from the seller's wallet immediately and creates a PENDING
     * WithdrawalRequest. Admin then approves within 24 hours.
     * If rejected, the balance is refunded.
     */
    @Transactional(rollbackFor = Exception.class)
    public WithdrawalRequest requestWithdrawal(UUID userId, WithdrawRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Fix: use .equals() not == for String comparison
        if (!"SELLER".equalsIgnoreCase(String.valueOf(user.getRole()))) {
            throw new IllegalArgumentException("Only sellers can request withdrawals");
        }

        BigDecimal amount = request.getAmount();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be greater than zero");
        }

        // Prevent duplicate pending requests
        if (withdrawalRequestRepository.existsBySellerIdAndStatus(userId, WithdrawalStatus.PENDING)) {
            throw new IllegalArgumentException(
                    "You already have a pending withdrawal request. Please wait for it to be processed.");
        }

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException(
                    "Insufficient balance. Available: NGN" + wallet.getBalance());
        }

        // Deduct immediately so the seller can't spend the same funds again
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        // Create pending withdrawal record
        WithdrawalRequest withdrawalRequest = WithdrawalRequest.builder()
                .sellerId(userId)
                .amount(amount)
                .status(WithdrawalStatus.PENDING)
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .accountName(request.getAccountName())
                .build();

        WithdrawalRequest saved = withdrawalRequestRepository.save(withdrawalRequest);

        // Ledger entry (PENDING status)
        WalletTransaction withdrawal = WalletTransaction.builder()
                .walletId(wallet.getId())
                .type(WalletTransactionType.WITHDRAWAL)
                .amount(amount)
                .description("Withdrawal request — pending admin approval")
                .status("PENDING")
                .build();
        walletTransactionRepository.save(withdrawal);

        log.info("Seller {} requested withdrawal of NGN{} — pending approval", userId, amount);

        return saved;
    }

    // ── Seller: view their own withdrawal history ──────────────────────────────

    public List<WithdrawalRequest> getMyWithdrawals(UUID userId) {
        return withdrawalRequestRepository.findBySellerIdOrderByCreatedAtDesc(userId);
    }

    // ── Admin: list all pending withdrawals ───────────────────────────────────

    public List<WithdrawalRequest> getAllPendingWithdrawals() {
        return withdrawalRequestRepository.findByStatusOrderByCreatedAtAsc(WithdrawalStatus.PENDING);
    }

    // ── Admin: approve a withdrawal ───────────────────────────────────────────

    @Transactional(rollbackFor = Exception.class)
    public WithdrawalRequest approveWithdrawal(UUID withdrawalId, String adminNote) {
        WithdrawalRequest wr = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new IllegalArgumentException("Withdrawal request not found"));

        if (wr.getStatus() != WithdrawalStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING withdrawals can be approved");
        }

        wr.setStatus(WithdrawalStatus.APPROVED);
        wr.setAdminNote(adminNote);

        // Update the corresponding ledger entry to SUCCESS
        updateWithdrawalLedger(wr.getSellerId(), wr.getAmount(), "SUCCESS",
                "Withdrawal approved by admin");

        log.info("Withdrawal {} approved for seller {}", withdrawalId, wr.getSellerId());

        return withdrawalRequestRepository.save(wr);
    }

    // ── Admin: reject a withdrawal (refund seller) ────────────────────────────

    @Transactional(rollbackFor = Exception.class)
    public WithdrawalRequest rejectWithdrawal(UUID withdrawalId, String adminNote) {
        WithdrawalRequest wr = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new IllegalArgumentException("Withdrawal request not found"));

        if (wr.getStatus() != WithdrawalStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING withdrawals can be rejected");
        }

        // Refund the seller's wallet
        Wallet wallet = walletRepository.findByUserId(wr.getSellerId())
                .orElseThrow(() -> new IllegalArgumentException("Seller wallet not found"));

        wallet.setBalance(wallet.getBalance().add(wr.getAmount()));
        walletRepository.save(wallet);

        wr.setStatus(WithdrawalStatus.REJECTED);
        wr.setAdminNote(adminNote);

        // Ledger refund entry
        WalletTransaction refund = WalletTransaction.builder()
                .walletId(wallet.getId())
                .type(WalletTransactionType.WITHDRAWAL)
                .amount(wr.getAmount())
                .description("Withdrawal rejected — funds refunded. Reason: " + adminNote)
                .status("REFUNDED")
                .build();
        walletTransactionRepository.save(refund);

        log.info("Withdrawal {} rejected for seller {} — NGN{} refunded",
                withdrawalId, wr.getSellerId(), wr.getAmount());

        return withdrawalRequestRepository.save(wr);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void updateWithdrawalLedger(UUID sellerId, BigDecimal amount,
                                         String status, String description) {
        Wallet wallet = walletRepository.findByUserId(sellerId).orElse(null);
        if (wallet == null) return;

        WalletTransaction entry = WalletTransaction.builder()
                .walletId(wallet.getId())
                .type(WalletTransactionType.WITHDRAWAL)
                .amount(amount)
                .description(description)
                .status(status)
                .build();
        walletTransactionRepository.save(entry);
    }

    private Wallet createWallet(UUID userId) {
        Wallet wallet = Wallet.builder()
                .userId(userId)
                .balance(BigDecimal.ZERO)
                .currency("NGN")
                .build();
        return walletRepository.save(wallet);
    }
}