/*
 * package com.hivemarket.wallet.service;
 * 
 * import com.hivemarket.payment.entity.Transaction; import
 * com.hivemarket.payment.enums.TransactionStatus; import
 * com.hivemarket.payment.repository.TransactionRepository; import
 * com.hivemarket.user.entity.User; import
 * com.hivemarket.user.repository.UserRepository; import
 * com.hivemarket.wallet.entity.Wallet; import
 * com.hivemarket.wallet.entity.WalletTransaction; import
 * com.hivemarket.wallet.enums.WalletTransactionType; import
 * com.hivemarket.wallet.repository.WalletRepository; import
 * com.hivemarket.wallet.repository.WalletTransactionRepository; import
 * lombok.RequiredArgsConstructor; import
 * org.springframework.stereotype.Service; import
 * org.springframework.transaction.annotation.Transactional;
 * 
 * import java.math.BigDecimal; import java.util.Optional; import
 * java.util.UUID;
 * 
 * @Service
 * 
 * @RequiredArgsConstructor public class PaymentProcessingService {
 * 
 * private final WalletRepository walletRepository; private final
 * WalletTransactionRepository walletTransactionRepository; private final
 * UserRepository userRepository; private final TransactionRepository
 * transactionRepository;
 * 
 * private static final UUID PLATFORM_WALLET_USER_ID =
 * UUID.fromString("00000000-0000-0000-0000-000000000001"); private static final
 * BigDecimal PLATFORM_FEE_PERCENTAGE = new BigDecimal("0.10");
 * 
 * @Transactional(rollbackFor = Exception.class) public void
 * processOrderPayment(UUID productId, UUID buyerId, UUID sellerId, BigDecimal
 * amount, String reference) { if (amount.compareTo(BigDecimal.ZERO) <= 0) {
 * throw new IllegalArgumentException("Amount must be greater than zero"); }
 * 
 * // Validate users exist User seller = userRepository.findById(sellerId)
 * .orElseThrow(() -> new IllegalArgumentException("Seller not found")); User
 * buyer = userRepository.findById(buyerId) .orElseThrow(() -> new
 * IllegalArgumentException("Buyer not found"));
 * 
 * // Calculate splits BigDecimal platformFee =
 * amount.multiply(PLATFORM_FEE_PERCENTAGE); BigDecimal sellerAmount =
 * amount.subtract(platformFee);
 * 
 * // Get or create seller wallet Wallet sellerWallet =
 * walletRepository.findByUserId(sellerId) .orElseGet(() ->
 * createWallet(sellerId));
 * 
 * // Get or create platform wallet Wallet platformWallet =
 * walletRepository.findByUserId(PLATFORM_WALLET_USER_ID) .orElseGet(() ->
 * createWallet(PLATFORM_WALLET_USER_ID));
 * 
 * // Update balances
 * sellerWallet.setBalance(sellerWallet.getBalance().add(sellerAmount));
 * platformWallet.setBalance(platformWallet.getBalance().add(platformFee));
 * 
 * walletRepository.save(sellerWallet); walletRepository.save(platformWallet);
 * 
 * // Create transaction record Transaction transaction = Transaction.builder()
 * .productId(productId) .buyerId(buyerId) .sellerId(sellerId) .amount(amount)
 * .reference(reference) .status(TransactionStatus.SUCCESS)
 * .paidAt(java.time.LocalDateTime.now()) .build();
 * 
 * transactionRepository.save(transaction);
 * 
 * // Create wallet transaction ledger entries WalletTransaction sellerCredit =
 * WalletTransaction.builder() .walletId(sellerWallet.getId())
 * .transactionId(transaction.getId())
 * .type(WalletTransactionType.SELLER_CREDIT) .amount(sellerAmount)
 * .description("Payment received for product sale") .status("SUCCESS")
 * .build();
 * 
 * WalletTransaction platformCredit = WalletTransaction.builder()
 * .walletId(platformWallet.getId()) .transactionId(transaction.getId())
 * .type(WalletTransactionType.PLATFORM_COMMISSION) .amount(platformFee)
 * .description("Platform commission from sale") .status("SUCCESS") .build();
 * 
 * walletTransactionRepository.save(sellerCredit);
 * walletTransactionRepository.save(platformCredit); }
 * 
 * private Wallet createWallet(UUID userId) { Wallet wallet = Wallet.builder()
 * .userId(userId) .balance(BigDecimal.ZERO) .currency("NGN") .build(); return
 * walletRepository.save(wallet); } }
 */


package com.hivemarket.wallet.service;

import com.hivemarket.order.service.OrderService;
import com.hivemarket.payment.entity.Transaction;
import com.hivemarket.payment.enums.TransactionStatus;
import com.hivemarket.payment.repository.TransactionRepository;
import com.hivemarket.product.Entity.Product;
import com.hivemarket.product.Repository.ProductRepository;
import com.hivemarket.user.entity.User;
import com.hivemarket.user.repository.UserRepository;
import com.hivemarket.wallet.entity.Wallet;
import com.hivemarket.wallet.entity.WalletTransaction;
import com.hivemarket.wallet.enums.WalletTransactionType;
import com.hivemarket.wallet.repository.WalletRepository;
import com.hivemarket.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentProcessingService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepo;
    private final OrderService orderService;
    
    private static final UUID PLATFORM_WALLET_USER_ID =
            UUID.fromString("00000000-0000-0000-0000-000000000001");

    // 10% platform fee — change here to adjust
    private static final BigDecimal PLATFORM_FEE_PERCENTAGE = new BigDecimal("0.10");

    @Transactional(rollbackFor = Exception.class)
    public void processOrderPayment(
            UUID productId,
            UUID buyerId,
            UUID sellerId,
            BigDecimal amount,
            String reference
    ) {
        // ── Guard: never process the same reference twice ──────────────────────
        // Paystack may retry the webhook — this prevents double-crediting the seller
		/*
		 * if (WalletRepository.existsByReference(reference)) {
		 * log.warn("Duplicate webhook for reference {} — skipping", reference); return;
		 * }
		 */

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        // Validate users exist
        userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + sellerId));
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("Buyer not found: " + buyerId));

        Product product = productRepo.findById(productId) .orElseThrow(() -> new IllegalArgumentException("Product  not found: " + productId));
       
        orderService.saveOrder(product, buyer);
        
        // ── Calculate splits ───────────────────────────────────────────────────
        BigDecimal platformFee   = amount.multiply(PLATFORM_FEE_PERCENTAGE)
                                         .setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal sellerAmount  = amount.subtract(platformFee);

        log.info("Payment split — total: NGN{}, seller: NGN{}, platform fee: NGN{}",
                amount, sellerAmount, platformFee);

        // ── Get or create wallets ──────────────────────────────────────────────
        Wallet sellerWallet = walletRepository.findByUserId(sellerId)
                .orElseGet(() -> createWallet(sellerId));

        Wallet platformWallet = walletRepository.findByUserId(PLATFORM_WALLET_USER_ID)
                .orElseGet(() -> createPlatformWallet());

        // ── Credit balances ────────────────────────────────────────────────────
        sellerWallet.setBalance(sellerWallet.getBalance().add(sellerAmount));
        platformWallet.setBalance(platformWallet.getBalance().add(platformFee));

        walletRepository.save(sellerWallet);
        walletRepository.save(platformWallet);

        // ── Save transaction record ────────────────────────────────────────────
		/*
		 * Transaction transaction = Transaction.builder() .productId(productId)
		 * .buyerId(buyerId) .sellerId(sellerId) .amount(amount) .reference(reference)
		 * .status(TransactionStatus.SUCCESS) .paidAt(LocalDateTime.now()) .build();
		 * 
		 * transactionRepository.save(transaction);
		 */
        
        Transaction transaction = transactionRepository.findByReference(reference).orElse(null);

        // ── Wallet ledger entries ──────────────────────────────────────────────
        WalletTransaction sellerCredit = WalletTransaction.builder()
                .walletId(sellerWallet.getId())
                .transactionId(transaction.getId())
                .type(WalletTransactionType.SELLER_CREDIT)
                .amount(sellerAmount)
                .description("Payment received for product sale (ref: " + reference + ")")
                .status("SUCCESS")
                .build();

        WalletTransaction platformCredit = WalletTransaction.builder()
                .walletId(platformWallet.getId())
                .transactionId(transaction.getId())
                .type(WalletTransactionType.PLATFORM_COMMISSION)
                .amount(platformFee)
                .description("Platform commission from sale (ref: " + reference + ")")
                .status("SUCCESS")
                .build();

        walletTransactionRepository.save(sellerCredit);
        walletTransactionRepository.save(platformCredit);
        
        System.out.println("Seller {} wallet credited NGN{} for ref {}"+ sellerId +sellerAmount +reference);

        log.info("Seller {} wallet credited NGN{} for ref {}", sellerId, sellerAmount, reference);
    }

    private Wallet createWallet(UUID userId) {
        Wallet wallet = Wallet.builder()
                .userId(userId)
                .balance(BigDecimal.ZERO)
                .currency("NGN")
                .build();
        return walletRepository.save(wallet);
    }

    private Wallet createPlatformWallet() {
        Wallet wallet = Wallet.builder()
                .userId(PLATFORM_WALLET_USER_ID)
                .balance(BigDecimal.ZERO)
                .currency("NGN")
                .build();
        return walletRepository.save(wallet);
    }
}