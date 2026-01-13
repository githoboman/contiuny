# Testing Guide - What You Can Test Right Now

## ✅ Available Tests

### 1. Smart Contract Unit Tests (READY NOW)

**Run all tests:**
```bash
cd c:\Users\OWNER\Desktop\contiuny\stacks-content-payment
npm test
```

**Expected Output:**
- ✅ 27 tests passing
- Content Registry: 14 tests
- Payment Handler: 13 tests
- Duration: ~7-8 seconds

**What This Tests:**
- Content registration with IPFS hashes
- Price management and updates
- Payment processing with STX
- Access control and verification
- Duplicate payment prevention
- Multi-user scenarios
- Creator authorization
- Error handling

---

### 2. Interactive Contract Testing (Clarinet Console)

**Start the console:**
```bash
cd c:\Users\OWNER\Desktop\contiuny\stacks-content-payment
clarinet console
```

**Example Commands to Try:**

#### Register Content
```clarity
(contract-call? .content-registry register-content 
  "QmXyz123456789abcdefghijklmnopqrstuvwxyz" 
  u1000000 
  u"https://example.com/metadata.json")
```

#### Check Content Info
```clarity
(contract-call? .content-registry get-content-info u1)
```

#### Get Content Price
```clarity
(contract-call? .content-registry get-content-price u1)
```

#### Simulate Payment (as different user)
```clarity
::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
(contract-call? .payment-handler pay-for-content-stx u1)
```

#### Check Access
```clarity
(contract-call? .payment-handler has-access 
  'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG 
  u1)
```

#### Update Price (as creator)
```clarity
::set_tx_sender ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
(contract-call? .content-registry update-price u1 u2000000)
```

---

### 3. Contract Syntax Validation

**Check all contracts:**
```bash
cd c:\Users\OWNER\Desktop\contiuny\stacks-content-payment
clarinet check
```

**Expected Output:**
- ✅ 5 contracts checked
- Minor warnings for unchecked data (normal)
- No syntax errors

---

### 4. Simulated Deployment (Local Devnet)

**Start local devnet:**
```bash
clarinet integrate
```

**What This Does:**
- Spins up local Stacks blockchain
- Deploys all contracts
- Provides local API endpoint
- Allows testing with real transactions (local only)

**Access Points:**
- Stacks API: http://localhost:3999
- Bitcoin node: http://localhost:18443
- Explorer: http://localhost:8000

---

### 5. Manual Test Scenarios

#### Scenario 1: Complete Payment Flow
```bash
# 1. Run tests to verify
npm test

# 2. Start console
clarinet console

# 3. Register content (as creator)
(contract-call? .content-registry register-content 
  "QmTestContent123" u5000000 u"https://metadata.json")

# 4. Verify registration
(contract-call? .content-registry get-content-info u1)

# 5. Switch to buyer
::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG

# 6. Make payment
(contract-call? .payment-handler pay-for-content-stx u1)

# 7. Verify access
(contract-call? .payment-handler has-access 
  'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG u1)

# 8. Try duplicate payment (should fail)
(contract-call? .payment-handler pay-for-content-stx u1)
```

#### Scenario 2: Price Management
```bash
clarinet console

# Register content
(contract-call? .content-registry register-content 
  "QmContent" u1000000 u"https://meta.json")

# Update price
(contract-call? .content-registry update-price u1 u2000000)

# Verify new price
(contract-call? .content-registry get-content-price u1)

# Try unauthorized update (should fail)
::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
(contract-call? .content-registry update-price u1 u3000000)
```

#### Scenario 3: Content Deactivation
```bash
clarinet console

# Register content
(contract-call? .content-registry register-content 
  "QmContent" u1000000 u"https://meta.json")

# Deactivate
(contract-call? .content-registry deactivate-content u1)

# Check status
(contract-call? .content-registry is-content-active u1)

# Try to pay for inactive content (should fail)
::set_tx_sender ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
(contract-call? .payment-handler pay-for-content-stx u1)

# Reactivate
::set_tx_sender ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
(contract-call? .content-registry reactivate-content u1)
```

---

### 6. Test Coverage Analysis

**View test details:**
```bash
npm test -- --verbose
```

**What's Covered:**
- ✅ Content registration validation
- ✅ Price updates and authorization
- ✅ Payment processing
- ✅ Access verification
- ✅ Error conditions
- ✅ Multi-user interactions
- ✅ STX transfers
- ✅ Receipt generation
- ✅ Duplicate prevention

**Not Yet Covered:**
- ⏳ Access control contract tests
- ⏳ Subscription functionality
- ⏳ Timed access features
- ⏳ Platform fee calculations

---

### 7. Performance Testing

**Run tests with timing:**
```bash
npm test
```

**Current Performance:**
- Test execution: ~7-8 seconds
- 27 tests completed
- Average: ~260-300ms per test

---

## 🚫 What You CANNOT Test Yet

### Backend API
- ❌ REST API endpoints (not implemented)
- ❌ IPFS integration (not implemented)
- ❌ Authentication (not implemented)

### Frontend
- ❌ Wallet integration (not built)
- ❌ UI components (not built)
- ❌ Payment flow UI (not built)

### Testnet
- ❌ Real testnet deployment (contracts not deployed)
- ❌ Real STX transactions (need testnet deployment)
- ❌ Wallet interactions (need deployed contracts)

---

## 📋 Recommended Testing Workflow

### Quick Validation (2 minutes)
```bash
# 1. Syntax check
clarinet check

# 2. Run all tests
npm test
```

### Interactive Testing (10 minutes)
```bash
# 1. Start console
clarinet console

# 2. Test complete flow (see Scenario 1 above)

# 3. Test edge cases
# - Invalid prices
# - Unauthorized actions
# - Duplicate payments
```

### Deep Testing (30 minutes)
```bash
# 1. Run verbose tests
npm test -- --verbose

# 2. Start local devnet
clarinet integrate

# 3. Test with local blockchain
# - Deploy contracts
# - Make real transactions
# - Monitor events
```

---

## 🎯 Test Results You Should See

### Successful Test Run
```
✓ tests/content-registry.test.ts (14 tests)
✓ tests/payment-handler.test.ts (13 tests)

Test Files: 2 passed (2)
Tests: 27 passed (27)
Duration: ~7-8s
```

### Successful Console Test
```clarity
>> (contract-call? .content-registry register-content "QmTest" u1000000 u"meta")
(ok u1)

>> (contract-call? .content-registry get-content-info u1)
(some {
  creator: ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5,
  ipfs-hash: "QmTest",
  price-stx: u1000000,
  ...
})
```

---

## 🐛 Common Issues & Solutions

### Issue: Tests fail with "module not found"
**Solution:**
```bash
cd c:\Users\OWNER\Desktop\contiuny\stacks-content-payment
npm install
```

### Issue: Clarinet console won't start
**Solution:**
```bash
# Check Clarinet version
clarinet --version

# Should be 3.8.1 or higher
```

### Issue: Line ending errors
**Solution:** Already fixed - contracts use LF line endings

---

## 📊 What to Look For

### Green Flags ✅
- All 27 tests passing
- No syntax errors in `clarinet check`
- Successful contract calls in console
- Proper error messages for invalid operations
- STX transfers working correctly

### Red Flags ❌
- Any test failures
- Syntax errors
- Unexpected error codes
- Missing access grants
- Incorrect balances

---

## Next Steps After Testing

Once you've verified everything works:

1. **Deploy to Testnet** - Get real contract addresses
2. **Complete Backend** - Build API to interact with contracts
3. **Build Frontend** - Create UI for users
4. **End-to-End Testing** - Test complete user flow

---

## Quick Start Command

**Run this now to verify everything:**
```bash
cd c:\Users\OWNER\Desktop\contiuny\stacks-content-payment && npm test
```

Expected: ✅ 27/27 tests passing in ~7-8 seconds
