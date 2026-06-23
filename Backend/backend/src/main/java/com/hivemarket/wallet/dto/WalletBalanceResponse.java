/*
 * package com.hivemarket.wallet.dto;
 * 
 * import java.math.BigDecimal;
 * 
 * public class WalletBalanceResponse { public BigDecimal balance; public
 * BigDecimal totalEarned; public BigDecimal pendingWithdrawals;
 * 
 * public WalletBalanceResponse(BigDecimal balance, BigDecimal totalEarned,
 * BigDecimal pendingWithdrawals) { this.balance = balance; this.totalEarned =
 * totalEarned; this.pendingWithdrawals = pendingWithdrawals; } }
 */


package com.hivemarket.wallet.dto;
 
import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
 
@Data
@AllArgsConstructor
public class WalletBalanceResponse {
    private BigDecimal balance;
    private BigDecimal totalEarned;
    private BigDecimal pendingWithdrawals;
}