/*
 * package com.hivemarket.wallet.controller;
 * 
 * import com.hivemarket.wallet.dto.WalletBalanceResponse; import
 * com.hivemarket.wallet.dto.WithdrawRequest; import
 * com.hivemarket.wallet.service.WalletService; import
 * lombok.RequiredArgsConstructor; import
 * org.springframework.http.ResponseEntity; import
 * org.springframework.web.bind.annotation.*;
 * 
 * import java.util.UUID;
 * 
 * @RestController
 * 
 * @RequestMapping("/api/wallet")
 * 
 * @RequiredArgsConstructor public class WalletController {
 * 
 * private final WalletService walletService;
 * 
 * @GetMapping("/balance/{userId}") public ResponseEntity<WalletBalanceResponse>
 * getWalletBalance(@PathVariable UUID userId) { WalletBalanceResponse response
 * = walletService.getWalletBalance(userId); return ResponseEntity.ok(response);
 * }
 * 
 * @PostMapping("/withdraw") public ResponseEntity<String> withdraw(@RequestBody
 * WithdrawRequest request) { try { walletService.withdraw(request.getUserId(),
 * request.getAmount()); return
 * ResponseEntity.ok("{\"message\": \"Withdrawal successful\"}"); } catch
 * (IllegalArgumentException e) { return
 * ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
 * } } }
 */

package com.hivemarket.wallet.controller;

import com.hivemarket.wallet.dto.AdminActionRequest;
import com.hivemarket.wallet.dto.WalletBalanceResponse;
import com.hivemarket.wallet.dto.WithdrawRequest;
import com.hivemarket.wallet.entity.WithdrawalRequest;
import com.hivemarket.wallet.service.PaystackBankService;
import com.hivemarket.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final PaystackBankService paystackBankService;

    // ── Seller endpoints ───────────────────────────────────────────────────────

    @GetMapping("/balance/{userId}")
    public ResponseEntity<WalletBalanceResponse> getWalletBalance(@PathVariable UUID userId) {
        return ResponseEntity.ok(walletService.getWalletBalance(userId));
    }

    /**
     * Seller requests a withdrawal.
     * Balance is deducted immediately; payout happens after admin approves.
     */
    @PostMapping("/withdraw")
    public ResponseEntity<?> requestWithdrawal(@RequestBody WithdrawRequest request) {
        try {
            WithdrawalRequest result = walletService.requestWithdrawal(
                    request.getUserId(), request);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    /** Seller views their own withdrawal history */
    @GetMapping("/withdrawals/{userId}")
    public ResponseEntity<List<WithdrawalRequest>> getMyWithdrawals(@PathVariable UUID userId) {
        return ResponseEntity.ok(walletService.getMyWithdrawals(userId));
    }

    // ── Admin endpoints ────────────────────────────────────────────────────────
    // Add role-based security (@PreAuthorize("hasRole('ADMIN')")) once ready

    /** Admin sees all pending withdrawal requests */
    @GetMapping("/admin/withdrawals/pending")
    public ResponseEntity<List<WithdrawalRequest>> getPendingWithdrawals() {
        return ResponseEntity.ok(walletService.getAllPendingWithdrawals());
    }

    /** Admin approves a withdrawal */
    @PostMapping("/admin/withdrawals/{withdrawalId}/approve")
    public ResponseEntity<?> approveWithdrawal(
            @PathVariable UUID withdrawalId,
            @RequestBody(required = false) AdminActionRequest request
    ) {
        try {
            String note = request != null ? request.getNote() : "Approved";
            WithdrawalRequest result = walletService.approveWithdrawal(withdrawalId, note);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    /** Admin rejects a withdrawal — seller gets refunded */
    @PostMapping("/admin/withdrawals/{withdrawalId}/reject")
    public ResponseEntity<?> rejectWithdrawal(
            @PathVariable UUID withdrawalId,
            @RequestBody AdminActionRequest request
    ) {
        try {
            WithdrawalRequest result = walletService.rejectWithdrawal(
                    withdrawalId, request.getNote());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
    
    @GetMapping("/banks")
    public ResponseEntity<List<PaystackBankService.BankDto>> getBanks() {
        return ResponseEntity.ok(paystackBankService.listBanks());
    }

    @GetMapping("/resolve-account")
    public ResponseEntity<PaystackBankService.ResolvedAccountDto> resolveAccount(
            @RequestParam String accountNumber,
            @RequestParam String bankCode) {
        return ResponseEntity.ok(paystackBankService.resolveAccountNumber(accountNumber, bankCode));
    }
}