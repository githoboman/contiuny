'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useState } from 'react';
import { bridgeUsdcToStacks } from '@/lib/ethereum/bridge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, Wallet, ExternalLink } from 'lucide-react';
import { useWallet } from '@/components/wallet/wallet-provider';
import { useAccount } from 'wagmi';

export function SimpleBridge({ onSuccess }: { onSuccess?: () => void }) {
    const { open } = useAppKit();
    const { address: ethAddress, isConnected: isEthConnected } = useAppKitAccount();
    const { connector } = useAccount(); // get wagmi connector/provider
    const { address: stxAddress } = useWallet();

    const [amount, setAmount] = useState('10');
    const [status, setStatus] = useState<'idle' | 'approving' | 'bridging' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleBridge = async () => {
        if (!ethAddress || !stxAddress) return;

        setStatus('approving');
        setErrorMsg(null);

        try {
            // Get provider from connector
            const provider = await connector?.getProvider();

            if (!provider) {
                throw new Error("Please connect your Ethereum wallet first");
            }

            const hash = await bridgeUsdcToStacks(
                parseFloat(amount),
                stxAddress,
                provider
            );

            setStatus('success');
            setTxHash(hash);
            onSuccess?.();
        } catch (e: any) {
            console.error('Bridge error:', e);
            setStatus('error');

            // Provide helpful error messages
            let errorMessage = e.message || "Bridge failed";

            if (errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch")) {
                errorMessage = "Network error. Please check your internet connection and try again.";
            } else if (errorMessage.includes("User rejected") || errorMessage.includes("denied")) {
                errorMessage = "Transaction was rejected. Please try again.";
            } else if (errorMessage.includes("insufficient funds")) {
                errorMessage = "Insufficient USDC balance or ETH for gas fees.";
            }

            setErrorMsg(errorMessage);
        }
    };

    return (
        <Card className="neo-border bg-white w-full max-w-md mx-auto">
            <CardHeader className="bg-black text-white neo-border-b">
                <CardTitle className="uppercase font-black flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-cyan-400" />
                    USDC Bridge
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Status Steps */}
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                    <span className={isEthConnected ? "text-green-600" : ""}>1. Eth Wallet</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className={status === 'success' ? "text-green-600" : ""}>2. Bridge</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>3. Stacks</span>
                </div>

                {!isEthConnected ? (
                    <div className="text-center space-y-4 py-4">
                        <p className="font-medium text-gray-600">Connect Ethereum wallet to bridge USDC</p>
                        <Button
                            onClick={() => open()}
                            className="w-full neo-border neo-shadow bg-blue-600 hover:bg-blue-700 text-white font-black uppercase"
                        >
                            Connect Wallet
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase">Amount (USDC)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="neo-input font-mono text-lg pr-16"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black bg-gray-100 px-2 py-1 rounded">
                                    USDC
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                            <strong>Recipient:</strong> <span className="font-mono">{stxAddress}</span>
                        </div>

                        {status === 'error' && (
                            <div className="bg-red-50 text-red-600 p-3 text-sm font-bold border border-red-200">
                                ⚠️ {errorMsg}
                            </div>
                        )}

                        {status === 'success' ? (
                            <div className="bg-green-50 text-green-700 p-4 border border-green-200 space-y-2">
                                <div className="font-black uppercase flex items-center gap-2">
                                    ✅ Bridge Initiated!
                                </div>
                                <p className="text-xs">
                                    Your USDCx will arrive on Stacks in ~15 minutes.
                                </p>
                                {txHash && (
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs underline flex items-center gap-1 font-mono break-all"
                                    >
                                        View TX <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                                <Button
                                    onClick={() => setStatus('idle')}
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2"
                                >
                                    Bridge More
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={handleBridge}
                                disabled={status !== 'idle' || !amount}
                                className="w-full h-12 neo-border neo-shadow bg-cyan-400 hover:bg-cyan-500 text-black font-black uppercase text-lg"
                            >
                                {status === 'approving' || status === 'bridging' ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    "Bridge to Stacks"
                                )}
                            </Button>
                        )}

                        <div className="text-[10px] text-center text-gray-400 uppercase font-medium">
                            Powered by Circle xReserve
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
