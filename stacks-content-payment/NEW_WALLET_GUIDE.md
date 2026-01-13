# Creating a New Testnet Wallet

## 🔑 Generate New Wallet

You need a fresh testnet wallet to deploy the contracts without name conflicts.

### Option 1: Generate with Clarinet (Recommended)

```bash
# This will generate a new mnemonic
clarinet integrate
```

Then select "Generate new wallet" when prompted.

### Option 2: Use Online Tool

Go to: https://iancoleman.io/bip39/
1. Generate a new 12 or 24-word mnemonic
2. Copy the mnemonic phrase
3. Derive the Stacks address

### Option 3: Use Hiro Wallet

1. Install Hiro Wallet extension
2. Create new wallet
3. Export mnemonic (Settings → Secret Key)
4. Get testnet address

---

## 📝 Update Testnet.toml

Once you have your new mnemonic, update:
`settings/Testnet.toml`

Replace the mnemonic line with your new 12 or 24-word phrase.

---

## 💰 Get Testnet STX

After updating the mnemonic:

1. Get your new wallet address
2. Go to: https://explorer.hiro.so/sandbox/faucet?chain=testnet
3. Request 500 testnet STX
4. Wait 2-5 minutes

---

## 🚀 Deploy

Once you have STX, run:
```bash
clarinet deployments apply --testnet
```

---

**Let me know when you have your new mnemonic and I'll help you deploy!**
