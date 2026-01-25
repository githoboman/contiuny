import { ETHEREUM_CONFIG, USDC_ABI, XRESERVE_ABI } from './constants';
import {
    createPublicClient,
    createWalletClient,
    custom,
    http,
    pad,
    toHex,
    type WalletClient,
    type PublicClient
} from 'viem';
import { sepolia } from 'viem/chains';

import { c32addressDecode } from 'c32check';

// Helper to convert Stacks address to bytes32 for xReserve
// Helper to convert Stacks address to bytes32 for xReserve
// AnchorX Spec: 11-byte padding + version + hash160
function encodeStacksAddress(stxAddress: string): `0x${string}` {
    try {
        const decoded = c32addressDecode(stxAddress);
        const version = decoded[0]; // number
        const hash160 = decoded[1]; // hex string or Uint8Array

        // Convert version to 1 byte hex (2 chars)
        const versionHex = version.toString(16).padStart(2, '0');

        // Convert hash to hex
        let hash160Hex: string;
        if (typeof hash160 === 'string') {
            hash160Hex = hash160;
        } else {
            hash160Hex = Array.from(new Uint8Array(hash160))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }

        if (hash160Hex.length > 40) {
            hash160Hex = hash160Hex.slice(-40);
        }

        // Concatenate Version + Hash (1 byte + 20 bytes = 21 bytes)
        const combined = versionHex + hash160Hex;

        // Pad Start (Left Padding) to 32 bytes (64 hex chars)
        // 32 bytes - 21 bytes = 11 bytes padding (22 hex chars of zeros)
        const paddedHex = combined.padStart(64, '0');

        console.log('Encoded Stacks address (AnchorX Spec):', {
            input: stxAddress,
            version,
            hash160Hex,
            combined,
            final: `0x${paddedHex}`
        });

        return `0x${paddedHex}` as `0x${string}`;
    } catch (error) {
        console.error('Failed to encode Stacks address:', error);
        throw new Error(`Invalid Stacks address: ${stxAddress}`);
    }
}

// Re-implementing with proper types and logic
export async function bridgeUsdcToStacks(
    amount: number, // amount in human readable USDC (e.g. 10.5)
    stxRecipient: string,
    publicClient: PublicClient,
    walletClient: any // Wagmi Wallet Client (connector)
) {
    if (!publicClient) throw new Error("No Public Client found");
    if (!walletClient) throw new Error("No Wallet Client found");

    try {
        const [account] = await walletClient.requestAddresses();
        if (!account) throw new Error("Wallet not connected");

        // Convert amount to micro-units (6 decimals for USDC)
        const amountBigInt = BigInt(Math.floor(amount * 1_000_000));

        // 1. Check Allowance using the PUBLIC CLIENT (MetaMask provider)
        console.log(`Checking allowance...`);
        const allowance = await publicClient.readContract({
            address: ETHEREUM_CONFIG.USDC_ADDRESS as `0x${string}`,
            abi: USDC_ABI,
            functionName: 'allowance',
            args: [account, ETHEREUM_CONFIG.XRESERVE_ADDRESS as `0x${string}`]
        });

        if (allowance < amountBigInt) {
            console.log("Approving USDC...");
            const hash = await walletClient.writeContract({
                address: ETHEREUM_CONFIG.USDC_ADDRESS as `0x${string}`,
                abi: USDC_ABI,
                functionName: 'approve',
                args: [ETHEREUM_CONFIG.XRESERVE_ADDRESS as `0x${string}`, amountBigInt],
                account
            });

            // Wait for receipt using public client
            await publicClient.waitForTransactionReceipt({ hash });
            console.log("Approval confirmed");
        }

        // 2. Encode Recipient
        const recipientBytes32 = encodeStacksAddress(stxRecipient);

        // 3. Deposit to Remote
        console.log("Depositing to Remote...");

        // SIMULATE first to catch errors (Using MetaMask provider!)
        console.log("Simulating transaction...");
        const { request } = await publicClient.simulateContract({
            address: ETHEREUM_CONFIG.XRESERVE_ADDRESS as `0x${string}`,
            abi: XRESERVE_ABI,
            functionName: 'depositToRemote',
            args: [
                ETHEREUM_CONFIG.STACKS_DOMAIN,
                recipientBytes32,
                amountBigInt
            ],
            account,
        });

        // If simulation passes, execute write
        const hash = await walletClient.writeContract(request);

        return hash; // Success!

    } catch (error: any) {
        console.error("Bridge failed:", error);
        throw error;
    }
}
