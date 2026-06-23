# Payment System Flow Diagram

## Complete Payment Processing Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BUYER INITIATES PAYMENT                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
                    POST /api/payments/initialize
                    {
                      productId: "xxx",
                      buyerId: "buyer-id",
                      sellerId: "seller-id",
                      customerEmail: "buyer@email.com",
                      amount: 10000
                    }
                                    ↓
            ┌───────────────────────────────────────────┐
            │  1. Generate unique reference             │
            │     HIVEMARKET-a1b2c3d4e5f6              │
            └───────────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────────┐
            │  2. SAVE TO DATABASE                      │
            │     Table: transactions                   │
            │     Status: PENDING                       │
            │     Stores: reference, amount, IDs,       │
            │              email, timestamp             │
            └───────────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────────┐
            │  3. Call Paystack API                    │
            │     /transaction/initialize              │
            │     (Uses test/live key from config)     │
            └───────────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────────┐
            │  RESPONSE: authorizationUrl               │
            │  Return to Frontend                       │
            └───────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    REDIRECT TO PAYSTACK CHECKOUT                        │
│                   (authorizationUrl opens in browser)                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
        ┌───────────────────────────────────────────────┐
        │  TEST MODE:                                  │
        │  Card: 4111 1111 1111 1111                  │
        │  Expiry: 12/25                              │
        │  CVV: 123                                   │
        │  OTP: 123456                                │
        └───────────────────────────────────────────────┘
                                    ↓
                    ┌─────────────────────────┐
                    │  PAYMENT COMPLETED      │
                    │  (On Paystack)          │
                    └─────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│               PAYSTACK SENDS WEBHOOK TO OUR SERVER                      │
│                  POST /api/payments/callback                            │
│                  (Includes transaction reference)                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────────┐
            │  Webhook received and validated           │
            │  Extract reference from payload           │
            └───────────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────────┐
            │  Query database for transaction           │
            │  using reference                          │
            └───────────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────────┐
            │  Update transaction status                │
            │  PENDING → SUCCESS                        │
            │  Add paid_at timestamp                    │
            └───────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                  ⭐ WALLET PROCESSING BEGINS ⭐                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
        Payment Amount: ₦10,000
        ├─ Seller receives:      ₦9,000  (90%)
        └─ Platform commission:  ₦1,000  (10%)
                                    ↓
        ┌─────────────────────────────────────┐
        │  Get or Create Seller Wallet        │
        │  Table: wallets                     │
        └─────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────┐
        │  Update Seller Wallet Balance       │
        │  balance += ₦9,000                  │
        └─────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────┐
        │  Get or Create Platform Wallet      │
        │  (Special system account)           │
        └─────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────┐
        │  Update Platform Balance            │
        │  balance += ₦1,000                  │
        └─────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────┐
        │  Create Ledger Entry (Seller Credit)        │
        │  Table: wallet_transactions                 │
        │  Type: SELLER_CREDIT                        │
        │  Amount: ₦9,000                             │
        │  Status: SUCCESS                            │
        │  transactionId: ref to transactions table   │
        └─────────────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────────────┐
        │  Create Ledger Entry (Platform Commission)  │
        │  Table: wallet_transactions                 │
        │  Type: PLATFORM_COMMISSION                  │
        │  Amount: ₦1,000                             │
        │  Status: SUCCESS                            │
        └─────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      ✅ PAYMENT COMPLETE ✅                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Alternative Verification Flow

```
If webhook doesn't arrive or frontend explicitly calls verify:

GET /api/payments/verify?reference=HIVEMARKET-a1b2c3d4e5f6
                                    ↓
        ┌─────────────────────────────────────┐
        │  Call Paystack API                  │
        │  GET /transaction/verify/{reference}│
        │  (Uses test/live key from config)   │
        └─────────────────────────────────────┘
                                    ↓
        ┌─────────────────────────────────────┐
        │  Get response from Paystack         │
        │  Extract status: success/failed     │
        └─────────────────────────────────────┘
                                    ↓
        IF status == SUCCESS:
        └─→ Update transaction → Process Wallet (SAME AS WEBHOOK)
        
        IF status == FAILED:
        └─→ Update transaction status to FAILED
```

---

## Database State at Each Stage

### Stage 1: After Payment Initialization
```
TRANSACTIONS TABLE:
┌─────────────────────────────────────────────────────────────┐
│ id  │ reference              │ status  │ amount │ buyer_id  │
├─────┼────────────────────────┼─────────┼────────┼───────────┤
│ 1   │ HIVEMARKET-a1b2c3d4e5f6│ PENDING │ 10000  │ buyer-id  │
└─────────────────────────────────────────────────────────────┘

WALLETS TABLE:
(No changes yet - wallets created on demand)

WALLET_TRANSACTIONS TABLE:
(Empty - no transactions processed yet)
```

### Stage 2: After Payment Verified as SUCCESS
```
TRANSACTIONS TABLE:
┌─────────────────────────────────────────────────────────────┐
│ id  │ reference              │ status  │ amount │ paid_at   │
├─────┼────────────────────────┼─────────┼────────┼───────────┤
│ 1   │ HIVEMARKET-a1b2c3d4e5f6│ SUCCESS │ 10000  │ 2024-... │
└─────────────────────────────────────────────────────────────┘

WALLETS TABLE:
┌─────────────────────────────────────────────────────────────┐
│ id  │ user_id    │ balance │ currency │
├─────┼────────────┼─────────┼──────────┤
│ 1   │ seller-id  │  9000   │ NGN      │
│ 2   │ platform   │  1000   │ NGN      │
└─────────────────────────────────────────────────────────────┘

WALLET_TRANSACTIONS TABLE:
┌─────────────────────────────────────────────────────────────┐
│ id  │ wallet_id │ type               │ amount │ status      │
├─────┼───────────┼────────────────────┼────────┼─────────────┤
│ 1   │ 1         │ SELLER_CREDIT      │  9000  │ SUCCESS     │
│ 2   │ 2         │ PLATFORM_COMMISSION│  1000  │ SUCCESS     │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints Used in Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      PAYMENT ENDPOINTS                          │
├─────────────────────────────────────────────────────────────────┤
│ POST /api/payments/initialize                                   │
│       → Saves transaction, calls Paystack, returns checkout URL │
│                                                                 │
│ GET /api/payments/verify?reference=XXX                          │
│       → Verifies with Paystack, updates transaction, credits    │
│       wallet if successful                                      │
│                                                                 │
│ POST /api/payments/callback                                     │
│       → Webhook from Paystack, auto-credits wallet on success  │
│                                                                 │
│ POST /api/payments/webhook                                      │
│       → Alternative webhook endpoint (same as /callback)        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  DASHBOARD ENDPOINTS                            │
├─────────────────────────────────────────────────────────────────┤
│ GET /api/payments/history/buyer/{buyerId}                       │
│       → List all transactions where user is buyer               │
│                                                                 │
│ GET /api/payments/history/seller/{sellerId}                     │
│       → List all transactions where user is seller              │
│                                                                 │
│ GET /api/payments/transaction/{reference}                       │
│       → Get detailed info about specific transaction            │
│                                                                 │
│ GET /api/wallets/balance/{userId}                              │
│       → Get wallet balance, earnings, pending withdrawals       │
│                                                                 │
│ POST /api/wallets/withdraw                                      │
│       → Request withdrawal of wallet balance                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Test Mode vs Live Mode

```
┌─────────────────────────────────────────────────────────────────┐
│                         TEST MODE                               │
├─────────────────────────────────────────────────────────────────┤
│ PAYSTACK_MODE=test                                              │
│ Uses: PAYSTACK_SECRET_KEY_TEST                                  │
│ Card: 4111 1111 1111 1111 (always succeeds)                     │
│ Transactions: Sandbox only, not on live dashboard               │
│ Use for: Development, testing, staging                          │
│ Risk: NONE - No real money charged                              │
│ Data: Saved in YOUR database (complete audit trail)            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         LIVE MODE                               │
├─────────────────────────────────────────────────────────────────┤
│ PAYSTACK_MODE=live                                              │
│ Uses: PAYSTACK_SECRET_KEY_LIVE                                  │
│ Card: Real cards (Visa, Mastercard, etc.)                       │
│ Transactions: On live Paystack dashboard, real money            │
│ Use for: Production only                                        │
│ Risk: REAL transactions - test thoroughly before using          │
│ Data: Saved in YOUR database + Paystack live logs               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Commission Split Visualization

```
Each payment is automatically split:

BUYER PAYS ₦10,000
        ↓
   PAYSTACK receives ₦10,000
        ↓
        ├─→ HiveMarket (10% commission): ₦1,000
        │   ├─ Goes to: Platform wallet
        │   └─ For: Infrastructure, maintenance, support
        │
        └─→ SELLER (90% of sale): ₦9,000
            ├─ Goes to: Seller wallet
            └─ Can: Withdraw anytime

LEDGER EXAMPLE (wallet_transactions table):
┌──────────────────────────────────────────────────────────┐
│ Type                 │ Amount │ Recipient      │ Status  │
├──────────────────────┼────────┼────────────────┼─────────┤
│ SELLER_CREDIT        │ 9000   │ Seller Wallet  │ SUCCESS │
│ PLATFORM_COMMISSION  │ 1000   │ Platform Acc   │ SUCCESS │
└──────────────────────────────────────────────────────────┘
```

---

## Error Handling

```
Payment Verification Failure:
    ↓
Transaction Status: FAILED
    ↓
No wallet credit applied
    ↓
User sees failure in dashboard
    ↓
Can retry payment


Webhook Processing Error:
    ↓
Error logged to console
    ↓
User can manually verify via GET /api/payments/verify
    ↓
Manual verification triggers same wallet processing


Wallet Processing Error:
    ↓
@Transactional rollback
    ↓
Transaction marked SUCCESS but wallet not credited
    ↓
Manual investigation needed
```

---

**Ready to test? Follow PAYMENT_SETUP_QUICK_START.md!**
