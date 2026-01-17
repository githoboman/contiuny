# BRIDGING GUIDE: Ethereum Sepolia to Stacks Testnet USDCx

This guide explains how to obtain USDCx on the Stacks Testnet using Circle's xReserve protocol. This is required to pay for content using USDCx on the platform.

## Prerequisites

1.  **Leather Wallet** (or Xverse) installed for Stacks.
2.  **MetaMask** (or any Ethereum wallet) installed for Ethereum Sepolia.

---

## Step 1: Get Ethereum Sepolia ETH
You need a small amount of Sepolia ETH to pay for gas on the Ethereum side.
- **Faucets:**
    - [Google Cloud Sepolia Faucet](https://cloud.google.com/application-strategies/faucets/ethereum)
    - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
    - [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/)

## Step 2: Get Testnet USDC (Sepolia)
Visit the official Circle faucet to get testnet USDC on Ethereum Sepolia.
- **Circle Faucet:** [faucet.circle.com](https://faucet.circle.com/)
- Select **Ethereum Sepolia** as the network.
- Input your Ethereum address.

## Step 3: Use the USDCx Portal
The easiest way to bridge is using the USDCx Bridge Portal.
- **Portal Link:** [bridge.usdcx.stacks.co](https://bridge.usdcx.stacks.co/) (Note: Check the official challenge docs for the latest link).

### Steps in the Portal:
1.  Connect your Ethereum Wallet (MetaMask).
2.  Connect your Stacks Wallet (Leather).
3.  Enter the amount of USDC to bridge.
4.  Approve the USDC transfer.
5.  Initiate the bridge.

## Step 4: Wait for Confirmation
Wait for the transaction to be confirmed on Ethereum. After confirmation, the Stacks Attestation Service will detect the deposit and mint USDCx on Stacks.
- **Timeframe:** 10-20 minutes.
- **Confirmation:** You can monitor your balance in the **Creator Dashboard** under the "Bridge USDCx" tab.

---

## Troubleshooting
- **Balance not appearing?** Ensure you are on the **Testnet** in your Stacks wallet.
- **Bridge failed?** Check the Ethereum transaction hash on [Sepolia Etherscan](https://sepolia.etherscan.io/).
- **Need more help?** Consult the official [USDCx Documentation](https://docs.usdcx.stacks.co/).
