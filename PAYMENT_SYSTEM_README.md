# 🏪 HiveMarket Payment System - Complete Implementation

## 📦 What's Included

Your HiveMarket payment system now has a **production-ready** Paystack integration with:

✅ **Test Mode Support** - Safely test without charging real money  
✅ **Transaction Persistence** - Every payment saved with full audit trail  
✅ **Automatic Wallet Processing** - Instant seller credits, buyer debits  
✅ **Commission Splits** - Automatic 90/10 split between seller and platform  
✅ **Dashboard Ready** - Complete transaction and wallet visibility  
✅ **Withdrawal System** - Sellers can cash out earnings anytime  
✅ **Production Ready** - One-line switch from test to live mode  

---

## 🚀 Quick Start (5 minutes)

### 1. Get Paystack Test Keys
```
1. Visit https://dashboard.paystack.com
2. Login to your account
3. Click Settings → Developer
4. Copy your TEST keys:
   - Secret Key (sk_test_...)
   - Public Key (pk_test_...)
```

### 2. Configure Backend
```bash
# Edit .env file in Backend/backend/
PAYSTACK_MODE=test
PAYSTACK_SECRET_KEY_TEST=sk_test_YOUR_KEY_HERE
PAYSTACK_PUBLIC_KEY_TEST=pk_test_YOUR_KEY_HERE
```

### 3. Start Backend
```bash
cd Backend/backend
mvn spring-boot:run
```

### 4. Test Payment
```bash
# Initialize payment
curl -X POST http://localhost:8080/api/payments/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "550e8400-e29b-41d4-a716-446655440000",
    "buyerId": "550e8400-e29b-41d4-a716-446655440001",
    "sellerId": "550e8400-e29b-41d4-a716-446655440002",
    "customerEmail": "test@example.com",
    "amount": 1000
  }'

# You'll get authorizationUrl - open in browser
# Use test card: 4111 1111 1111 1111

# Verify payment
curl -X GET "http://localhost:8080/api/payments/verify?reference=HIVEMARKET-xxxxx"

# Check seller wallet (should have 900.00)
curl -X GET http://localhost:8080/api/wallets/balance/550e8400-e29b-41d4-a716-446655440002
```

**Expected Result:** Seller wallet shows ₦900.00 (90% of ₦1000 payment)

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **PAYMENT_SETUP_QUICK_START.md** | Quick reference for testing |
| **PAYMENT_GATEWAY_SETUP.md** | Detailed configuration guide |
| **PAYMENT_IMPLEMENTATION_SUMMARY.md** | Complete implementation details |
| **PAYMENT_FLOW_DIAGRAM.md** | Visual flow diagrams |
| **.env.template** | Configuration template |

**Start with:** `PAYMENT_SETUP_QUICK_START.md`

---

## 🎯 Core Features Explained

### Test Mode
```
Purpose: Safely test payments without charging real money
Configuration: PAYSTACK_MODE=test
Test Card: 4111 1111 1111 1111
Duration: Use indefinitely during development
Cost: FREE
Security: Completely sandboxed from production
```

### Transaction Storage
```
When: Immediately upon payment initialization
What: Full transaction details saved to database
Table: transactions
Fields: reference, amount, buyerId, sellerId, status, email, timestamp
Visibility: View anytime via API or database
```

### Automatic Wallet Processing
```
When: After payment is verified as successful
What: Seller wallet immediately credited, platform gets commission
Seller Receives: 90% of payment amount
Platform Gets: 10% commission
Ledger: Complete trail in wallet_transactions table
Time: Usually within seconds
```

### Payment Dashboard
```
Buyer Can See:
  - All purchases (transaction history)
  - Payment status for each
  - Order details and timestamps

Seller Can See:
  - All sales (transaction history)
  - Earnings breakdown
  - Current wallet balance
  - Commission amounts
  - Withdrawal history
```

---

## 🔄 Complete Payment Flow

```
1. BUYER INITIATES PAYMENT
   ↓
2. POST /api/payments/initialize
   - Transaction saved with PENDING status
   - Authorization URL generated
   - Redirected to Paystack checkout
   ↓
3. BUYER COMPLETES PAYMENT ON PAYSTACK
   - Uses test card or real card (depending on mode)
   - Paystack confirms payment
   ↓
4. TWO WAYS WALLET IS CREDITED:
   
   Option A - Webhook:
   - Paystack sends webhook to /api/payments/callback
   - Status updated to SUCCESS
   - Wallet processed immediately
   
   Option B - Manual Verify:
   - Frontend calls GET /api/payments/verify
   - Status updated to SUCCESS
   - Wallet processed immediately
   ↓
5. WALLET PROCESSING HAPPENS:
   - Seller wallet: +90% of payment
   - Platform wallet: +10% commission
   - Ledger entries created for audit trail
   ↓
6. SELLER CAN SEE:
   - New balance in /api/wallets/balance
   - Transaction in /api/payments/history/seller
   - Can request withdrawal anytime
   ↓
7. BUYER CAN SEE:
   - Transaction in /api/payments/history/buyer
   - Order marked as paid
```

---

## 📊 Database Schema

### Transactions Table
Stores every payment attempt/completion
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  product_id UUID,
  buyer_id UUID,
  seller_id UUID,
  amount DECIMAL(19,2),
  reference VARCHAR(255) UNIQUE,
  status ENUM('PENDING', 'SUCCESS', 'FAILED', ...),
  payment_provider VARCHAR(50),
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
Stores balance for each seller and platform
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,
  balance DECIMAL(19,2),
  currency VARCHAR(3),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Wallet Transactions Table
Complete audit trail of all debits/credits
```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY,
  wallet_id UUID,
  transaction_id UUID FOREIGN KEY,
  type ENUM('SELLER_CREDIT', 'PLATFORM_COMMISSION', 'WITHDRAWAL', 'REFUND'),
  amount DECIMAL(19,2),
  description VARCHAR(500),
  status VARCHAR(50),
  created_at TIMESTAMP
);
```

---

## 🔑 API Endpoints Reference

### Payment Endpoints

#### Initialize Payment
```
POST /api/payments/initialize
Content-Type: application/json

Request:
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "buyerId": "550e8400-e29b-41d4-a716-446655440001",
  "sellerId": "550e8400-e29b-41d4-a716-446655440002",
  "customerEmail": "buyer@example.com",
  "amount": 10000
}

Response:
{
  "reference": "HIVEMARKET-a1b2c3d4e5f6",
  "authorizationUrl": "https://checkout.paystack.com/...",
  "accessCode": "...",
  "message": "Authorization URL created"
}
```

#### Verify Payment
```
GET /api/payments/verify?reference=HIVEMARKET-a1b2c3d4e5f6

Response:
{
  "reference": "HIVEMARKET-a1b2c3d4e5f6",
  "status": "success",
  "gatewayResponse": "Approved"
}
```

#### Webhook Endpoint
```
POST /api/payments/callback
(Sent automatically by Paystack)

Also available at:
POST /api/payments/webhook
```

### Dashboard Endpoints

#### Buyer Transaction History
```
GET /api/payments/history/buyer/{buyerId}

Response:
[
  {
    "id": "550e8400...",
    "reference": "HIVEMARKET-a1b2c3d4e5f6",
    "amount": 10000,
    "status": "SUCCESS",
    "createdAt": "2026-06-16T11:45:00"
  }
]
```

#### Seller Transaction History
```
GET /api/payments/history/seller/{sellerId}

Response: Same structure as buyer history
```

#### Transaction Details
```
GET /api/payments/transaction/{reference}

Response:
{
  "id": "550e8400...",
  "productId": "550e8400...",
  "buyerId": "550e8400...",
  "sellerId": "550e8400...",
  "reference": "HIVEMARKET-...",
  "amount": 10000,
  "status": "SUCCESS",
  "paymentProvider": "PAYSTACK",
  "customerEmail": "buyer@example.com",
  "createdAt": "2026-06-16T11:45:00",
  "paidAt": "2026-06-16T11:50:00"
}
```

#### Wallet Balance
```
GET /api/wallets/balance/{userId}

Response:
{
  "balance": 9000.00,
  "totalEarned": 18000.00,
  "pendingWithdrawals": 0.00
}
```

#### Withdraw
```
POST /api/wallets/withdraw
Content-Type: application/json

Request:
{
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "amount": 5000.00
}
```

---

## 🧪 Testing Checklist

### Test Mode Testing
- [ ] Got test API keys from Paystack
- [ ] Updated .env with test keys
- [ ] Set PAYSTACK_MODE=test
- [ ] Restarted backend
- [ ] Initialized payment (got authorizationUrl)
- [ ] Completed payment with test card
- [ ] Verified payment
- [ ] Checked seller wallet (90% of amount)
- [ ] Viewed transaction history
- [ ] Checked platform wallet (10% of amount)

### Edge Cases to Test
- [ ] Payment with invalid email
- [ ] Payment with zero amount
- [ ] Payment with negative amount
- [ ] Multiple payments from same buyer
- [ ] Verify same payment twice (no double-credit)
- [ ] Check seller with no transactions
- [ ] Withdraw more than available (should fail)

---

## 🚀 Production Deployment

### Pre-Production Checklist
```
□ Tested thoroughly in test mode
□ Got live API keys from Paystack
□ Updated .env with live keys
□ Changed PAYSTACK_MODE=live
□ Updated webhook URL in Paystack dashboard
□ Configured secure .env handling (not committed to git)
□ Set up database backups
□ Enabled error logging and monitoring
□ Tested one complete live transaction
□ Verified wallet processing works
□ Set up email notifications for withdrawals
```

### Going Live
```bash
# 1. Update .env
PAYSTACK_MODE=live
PAYSTACK_SECRET_KEY_LIVE=sk_live_...
PAYSTACK_PUBLIC_KEY_LIVE=pk_live_...

# 2. Update webhook URL in Paystack Dashboard
# Settings → Developer → Webhooks
# URL: https://yourdomain.com/api/payments/callback

# 3. Restart backend
mvn spring-boot:run

# 4. Test with real payment (small amount)
```

---

## ⚠️ Important Notes

### Never in Version Control
```
✓ Live API keys
✓ Production database passwords
✓ Sensitive configuration
✓ Real customer data

Use: Environment variables, secure vaults, `.env` in `.gitignore`
```

### Test Mode Limitations
```
✓ Transactions NOT visible in live Paystack dashboard
✓ Test transactions are sandboxed
✓ This is intentional - protects production data
✓ Your database stores all test transactions
✓ Use your database for test transaction records
```

### Commission Split
```
✓ Automatic 90/10 split
✓ 90% to seller immediately
✓ 10% to platform
✓ Adjustable in PaymentProcessingService if needed
✓ Changed on next payment after code update
```

---

## 🆘 Troubleshooting

### "Test transactions not showing on Paystack dashboard"
✓ **Expected behavior!** Test transactions are sandboxed
✓ Check your database transactions table instead
✓ All test data is safely stored in your HiveMarket database

### "Seller wallet not credited after payment"
1. Verify transaction status: `GET /api/payments/verify/{reference}`
2. Status should be "success" not "pending"
3. Check webhook was received (check backend logs)
4. Check seller wallet exists
5. Verify sellerId in payment request is correct

### "Authorization URL not working"
1. Check callback URL in .env
2. For local testing, use ngrok to expose localhost
3. Ensure webhook URL matches in Paystack dashboard

### "Multiple wallets for same user"
1. Wallet is created on-demand, first-time only
2. Check for duplicate user IDs in database
3. Wallet creation wrapped in `findByUserId(...).orElseGet(...)`

---

## 📞 Support

### Need Help?
1. **Quick start**: Read `PAYMENT_SETUP_QUICK_START.md`
2. **Detailed guide**: Read `PAYMENT_GATEWAY_SETUP.md`
3. **Flow diagrams**: See `PAYMENT_FLOW_DIAGRAM.md`
4. **Check logs**: `Backend/backend/target/Backend-0.0.1-SNAPSHOT.jar`

### Key Contacts
- **Paystack Support**: https://paystack.com/support
- **Your HiveMarket Team**: internal@hivemarket.com

---

## 📝 License & Security

### Security Best Practices
```
✓ Never hardcode API keys
✓ Use environment variables
✓ Keep .env out of git (.gitignore)
✓ Rotate API keys regularly
✓ Monitor transaction logs
✓ Backup database regularly
✓ Use HTTPS in production only
✓ Validate all user input
```

---

## ✅ Summary

Your HiveMarket payment system is **production-ready** with:

| Feature | Status |
|---------|--------|
| Test Mode | ✅ Ready |
| Live Mode | ✅ Ready |
| Transaction Storage | ✅ Complete |
| Wallet Processing | ✅ Automatic |
| Dashboard | ✅ Full Featured |
| Withdrawals | ✅ Implemented |
| Security | ✅ Configured |
| Documentation | ✅ Complete |

**Start testing now! Follow `PAYMENT_SETUP_QUICK_START.md`**

---

**Last Updated:** June 16, 2026  
**Version:** 1.0.0 - Production Ready
