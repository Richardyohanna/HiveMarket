# Payment Gateway Configuration Guide - Paystack Test & Live Mode

## Overview
This guide explains how your payment system is configured to handle test mode and production (live) mode transactions with automatic wallet debit/credit functionality.

---

## 📋 Configuration Structure

### 1. **Test vs Live Mode Setup**

Your `.env` file now supports both test and live modes:

```env
# Test/Live Mode Configuration
PAYSTACK_MODE=test                          # Set to "test" or "live"
PAYSTACK_SECRET_KEY_TEST=sk_test_xxxx       # Your Paystack test secret key
PAYSTACK_SECRET_KEY_LIVE=sk_live_xxxx       # Your Paystack live secret key
PAYSTACK_PUBLIC_KEY_TEST=pk_test_xxxx       # Your Paystack test public key
PAYSTACK_PUBLIC_KEY_LIVE=pk_live_xxxx       # Your Paystack live public key
PAYSTACK_BASE_URL=https://api.paystack.co   # Paystack API endpoint
```

### 2. **How to Switch Between Test and Live**

Simply change one environment variable in `.env`:

```env
# For Testing (Development)
PAYSTACK_MODE=test

# For Production
PAYSTACK_MODE=live
```

The system automatically selects the correct API key based on this setting.

---

## 🔄 Payment Flow - How It Works

### Step 1: Payment Initialization
When a user initiates payment:
```
POST /api/payments/initialize
```

**Request Body:**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "buyerId": "550e8400-e29b-41d4-a716-446655440001",
  "sellerId": "550e8400-e29b-41d4-a716-446655440002",
  "customerEmail": "buyer@example.com",
  "amount": 10000
}
```

**What Happens:**
- Transaction is saved to database with `PENDING` status
- Payment reference is generated (e.g., `HIVEMARKET-a1b2c3d4e5f6`)
- Authorization URL is returned for payment
- Transaction details are stored including buyerId, sellerId, productId

### Step 2: Payment Verification
After payment is completed on Paystack:
```
GET /api/payments/verify?reference=HIVEMARKET-a1b2c3d4e5f6
```

**What Happens:**
- Transaction status is verified from Paystack
- If successful:
  - Seller wallet is **CREDITED** (90% of amount)
  - Platform gets commission (10% of amount)
  - Buyer's transaction record is updated
  - Wallet ledger entries are created

### Step 3: Webhook Processing
Paystack sends confirmation webhook:
```
POST /api/payments/callback
or
POST /api/payments/webhook
```

**What Happens:**
- Webhook payload is validated
- Transaction is marked as SUCCESS
- Wallet credits and debits are processed
- Buyer and seller can see updated balances

---

## 💰 Wallet System

### Seller Wallet Operations

**Check Seller Wallet Balance:**
```
GET /api/wallets/balance/{sellerId}
```

**Seller Transaction History:**
```
GET /api/payments/history/seller/{sellerId}
```

**Withdraw from Wallet:**
```
POST /api/wallets/withdraw
{
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "amount": 5000
}
```

### Money Flow
```
Payment of ₦10,000
    ↓
Paystack receives full amount
    ↓
    ├─→ Seller Wallet: +₦9,000 (90%)
    └─→ Platform Commission: +₦1,000 (10%)
    ↓
Buyer's transaction record updated (DEBIT)
Seller can withdraw ₦9,000 anytime
```

---

## 🧪 Testing in Test Mode

### 1. Configure Test Mode
In `.env`:
```env
PAYSTACK_MODE=test
PAYSTACK_SECRET_KEY_TEST=sk_test_YOUR_TEST_KEY
```

### 2. Use Paystack Test Cards

#### Successful Payment
- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date (e.g., 12/25)
- **CVV:** 123
- **OTP:** 123456 (if prompted)

#### Failed Payment
- **Card Number:** 5555 5555 5555 4444

### 3. Test Transaction Flow

```bash
# 1. Initialize payment
curl -X POST http://localhost:8080/api/payments/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "550e8400-e29b-41d4-a716-446655440000",
    "buyerId": "550e8400-e29b-41d4-a716-446655440001",
    "sellerId": "550e8400-e29b-41d4-a716-446655440002",
    "customerEmail": "test@example.com",
    "amount": 1000
  }'

# 2. Payment page opens in Paystack
# Use test card: 4111 1111 1111 1111

# 3. Verify payment after completing Paystack form
curl -X GET "http://localhost:8080/api/payments/verify?reference=HIVEMARKET-xxxxx"

# 4. Check seller wallet
curl -X GET http://localhost:8080/api/wallets/balance/550e8400-e29b-41d4-a716-446655440002
```

---

## 📊 Transaction Dashboard

### View All Transactions

**Buyer's Transaction History:**
```
GET /api/payments/history/buyer/{buyerId}
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "reference": "HIVEMARKET-a1b2c3d4e5f6",
    "amount": 10000,
    "status": "SUCCESS",
    "createdAt": "2026-06-16T11:45:00"
  }
]
```

**Seller's Transaction History:**
```
GET /api/payments/history/seller/{sellerId}
```

**Transaction Details:**
```
GET /api/payments/transaction/{reference}
```

---

## 🛡️ Key Features Implemented

✅ **Test Mode Support**
- Toggle between test and live modes with single env variable
- Never accidentally charge real money during development

✅ **Transaction Persistence**
- All transactions saved to database with full details
- Never lose transaction data
- Complete audit trail

✅ **Automatic Wallet Processing**
- Seller receives payment immediately after verification
- Platform commission automatically deducted
- Buyer's debit recorded
- No manual processing needed

✅ **Multiple Entry Points**
- Webhook endpoint (`/api/payments/callback`)
- Direct verification endpoint (`/api/payments/verify`)
- Both triggers wallet processing

✅ **Dashboard Support**
- View buyer transaction history
- View seller transaction history
- Check real-time wallet balance
- See commission splits

---

## 🔧 Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  product_id UUID,
  buyer_id UUID,
  seller_id UUID,
  amount DECIMAL(19, 2),
  reference VARCHAR(255) UNIQUE,
  status VARCHAR(50),           -- PENDING, SUCCESS, FAILED
  payment_provider VARCHAR(50), -- PAYSTACK
  customer_email VARCHAR(255),
  authorization_url VARCHAR(500),
  access_code VARCHAR(255),
  currency VARCHAR(3),
  paid_at TIMESTAMP,
  gateway_response TEXT,
  metadata_json TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Wallets Table
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,
  balance DECIMAL(19, 2),
  currency VARCHAR(3),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Wallet Transactions Table
```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY,
  wallet_id UUID,
  transaction_id UUID,
  type VARCHAR(50),           -- SELLER_CREDIT, PLATFORM_COMMISSION, WITHDRAWAL, REFUND
  amount DECIMAL(19, 2),
  description VARCHAR(500),
  status VARCHAR(50),
  created_at TIMESTAMP
);
```

---

## ⚙️ Configuration Files Updated

### 1. `.env`
- Added `PAYSTACK_MODE` variable
- Split keys into test and live versions
- Test/live keys auto-selected based on mode

### 2. `application.properties`
```properties
paystack.mode=${PAYSTACK_MODE:test}
paystack.secret.key.test=${PAYSTACK_SECRET_KEY_TEST}
paystack.secret.key.live=${PAYSTACK_SECRET_KEY_LIVE}
paystack.public.key.test=${PAYSTACK_PUBLIC_KEY_TEST}
paystack.public.key.live=${PAYSTACK_PUBLIC_KEY_LIVE}
paystack.base.url=${PAYSTACK_BASE_URL:https://api.paystack.co}
paystack.callback.url=${PAYSTACK_CALLBACK_URL:http://localhost:8080/api/payments/callback}
```

### 3. `PaystackConfig.java`
- Implements mode switching logic
- Automatically selects correct API key
- Provides `isTestMode()` helper method

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Change `PAYSTACK_MODE=live` in production `.env`
- [ ] Set correct live API keys (`PAYSTACK_SECRET_KEY_LIVE`, `PAYSTACK_PUBLIC_KEY_LIVE`)
- [ ] Update webhook URL in Paystack dashboard to production URL
- [ ] Test one complete transaction in live mode
- [ ] Verify wallet balances are correctly updated
- [ ] Set up monitoring for transaction failures
- [ ] Configure email notifications for withdrawals

---

## 📞 Troubleshooting

### Transactions Not Showing in Paystack Dashboard (Test Mode)
✓ **This is expected!** Test transactions are sandboxed and don't appear in the live dashboard. Use:
- Paystack test account dashboard (different from live)
- Our transaction database to verify test transactions worked

### Wallet Not Being Credited
1. Check transaction status: `GET /api/payments/transaction/{reference}`
2. Verify status is "SUCCESS" (not "PENDING" or "FAILED")
3. Check webhook was received at `/api/payments/callback`
4. Verify seller wallet exists: `GET /api/wallets/balance/{sellerId}`

### Payment Authorization URL Not Working
- Ensure callback URL matches in `.env` and Paystack dashboard settings
- For local testing, expose via Ngrok or similar tunnel service
- Webhook will still work with local URL if tunnel is set up

---

## 📝 API Reference Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payments/initialize` | POST | Start payment process |
| `/api/payments/verify` | GET | Verify payment after completion |
| `/api/payments/callback` | POST | Webhook from Paystack |
| `/api/payments/webhook` | POST | Alternative webhook endpoint |
| `/api/payments/history/buyer/{id}` | GET | View buyer transactions |
| `/api/payments/history/seller/{id}` | GET | View seller transactions |
| `/api/payments/transaction/{ref}` | GET | Get transaction details |
| `/api/wallets/balance/{userId}` | GET | Check wallet balance |
| `/api/wallets/withdraw` | POST | Request withdrawal |

---

## ✅ Summary

Your payment system is now fully configured to:
1. ✅ **Support test mode** - No real charges during development
2. ✅ **Save all transactions** - Complete audit trail
3. ✅ **Auto-debit/credit wallets** - Automatic payment processing
4. ✅ **Show on dashboard** - View transactions anytime
5. ✅ **Support withdrawals** - Sellers can cash out their earnings

**Current Mode:** Check `.env` for `PAYSTACK_MODE` value (test/live)
