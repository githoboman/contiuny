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

// Helper to convert Stacks address to bytes32 for xReserve
// xReserve expects the Stacks address encoded as bytes32
function encodeStacksAddress(stxAddress: string): `0x${string}` {
    // Convert Stacks address string to bytes and pad to 32 bytes
    // This is a simplified encoding - xReserve will decode it on their end
    const addressBytes = new TextEncoder().encode(stxAddress);

    // Create 32-byte buffer
    const bytes32 = new Uint8Array(32);
    bytes32.set(addressBytes.slice(0, Math.min(addressBytes.length, 32)));

    // Convert to hex string
    const hex = Array.from(bytes32)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return `0x${hex}` as `0x${string}`;
}

// Re-implementing with proper types and logic
export async function bridgeUsdcToStacks(
    amount: number, // amount in human readable USDC (e.g. 10.5)
    stxRecipient: string,
    ethereumProvider: any // window.ethereum or similar
) {
    if (!ethereumProvider) throw new Error("No Ethereum provider found");

    // Try with primary RPC, then fallbacks
    const rpcUrls = [ETHEREUM_CONFIG.RPC_URL, ...ETHEREUM_CONFIG.FALLBACK_RPC_URLS];
    let lastError = null;

    for (const rpcUrl of rpcUrls) {
        try {
            const publicClient = createPublicClient({
                chain: sepolia,
                transport: http(rpcUrl, {
                    timeout: 15000, // 15s timeout
                    retryCount: 2
                })
            });

            const walletClient = createWalletClient({
                chain: sepolia,
                transport: custom(ethereumProvider)
            });

            const [account] = await walletClient.requestAddresses();
            if (!account) throw new Error("Wallet not connected");

            // Convert amount to micro-units (6 decimals for USDC)
            const amountBigInt = BigInt(Math.floor(amount * 1_000_000));

            // 1. Check Allowance
            console.log(`Checking allowance via ${rpcUrl}...`);
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
                await publicClient.waitForTransactionReceipt({ hash });
                console.log("Approval confirmed");
            }

            // 2. Encode Recipient
            const recipientBytes32 = encodeStacksAddress(stxRecipient);

            // 3. Deposit to Remote
            console.log("Depositing to Remote...");
            const hash = await walletClient.writeContract({
                address: ETHEREUM_CONFIG.XRESERVE_ADDRESS as `0x${string}`,
                abi: XRESERVE_ABI,
                functionName: 'depositToRemote',
                args: [
                    ETHEREUM_CONFIG.STACKS_DOMAIN,
                    recipientBytes32,
                    amountBigInt
                ],
                account
            });

            return hash; // Success!

        } catch (error: any) {
            console.warn(`Bridge attempt failed with RPC ${rpcUrl}:`, error.message);
            lastError = error;
            // Continue to next RPC
        }
    }

    // All RPCs failed
    throw new Error(lastError?.message || "Bridge failed after all retries. Please check your network connection and try again.");
}


