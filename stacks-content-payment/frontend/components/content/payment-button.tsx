'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../wallet/wallet-provider';
import { stacks } from '@/lib/stacks';
import { PaymentType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface PaymentButtonProps {
    contentId: number;
    priceStx: number;
    priceToken?: number;
    tokenContract?: string;
    onSuccess?: () => void;
}

type PaymentState = 'idle' | 'pending' | 'confirming' | 'success' | 'failed';

export function PaymentButton({ contentId, priceStx, priceToken, tokenContract, onSuccess }: PaymentButtonProps) {
    const { address, isConnected } = useWallet();
    const [paymentState, setPaymentState] = useState<PaymentState>('idle');
    const [txId, setTxId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<{ stx: number; usdcx: number }>({ stx: 0, usdcx: 0 });
    const [confirmationProgress, setConfirmationProgress] = useState(0);

    useEffect(() => {
        if (address) {
            fetchBalances();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]);

    const fetchBalances = async () => {
        try {
            const response = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${address}/balances`);
            const data = await response.json();
            const usdcxAddress = process.env.NEXT_PUBLIC_USDCX_ADDRESS || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx";

            setBalance({
                stx: parseInt(data.stx.balance) / 1000000,
                usdcx: (data.fungible_tokens[usdcxAddress]?.balance || 0) / 1000000
            });
        } catch (err) {
            console.error("Error fetching balances:", err);
        }
    };

    // Poll transaction status until confirmed
    async function pollTransactionStatus(txId: string): Promise<boolean> {
        const maxAttempts = 100; // 5 minutes (3s intervals) for Stacks block times

        for (let i = 0; i < maxAttempts; i++) {
            try {
                setConfirmationProgress(Math.min(95, (i / maxAttempts) * 100));

                const response = await fetch(
                    `https://api.testnet.hiro.so/extended/v1/tx/${txId}`
                );
                const tx = await response.json();

                if (tx.tx_status === 'success') {
                    setConfirmationProgress(100);
                    return true;
                }

                if (tx.tx_status === 'abort_by_response' ||
                    tx.tx_status === 'abort_by_post_condition') {
                    return false;
                }

                // Wait 3 seconds before next check
                await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (err) {
                console.error('Error polling transaction:', err);
            }
        }

        return false; // Timed out
    }

    const handlePayment = async (type: PaymentType) => {
        console.log('handlePayment called', { type, isConnected, address });

        if (!isConnected || !address) {
            console.error('Payment blocked: wallet not connected', { isConnected, address });
            setError('Please connect your wallet first');
            return;
        }

        console.log('Starting payment...', { type, contentId, address });
        setPaymentState('pending');
        setError(null);
        setConfirmationProgress(0);

        try {
            // Check balance before attempting payment
            if (type === 'stx') {
                console.log('Checking STX balance...', { balance: balance.stx, required: priceStx / 1000000 });
                if (balance.stx < priceStx / 1000000) {
                    throw new Error("Insufficient STX balance");
                }
            } else if (type === 'token' && priceToken) {
                console.log('Checking USDCx balance...', { balance: balance.usdcx, required: priceToken / 100 });
                if (balance.usdcx < priceToken / 100) {
                    throw new Error("Insufficient USDCx balance. Use the bridge to get more.");
                }
            }

            // Submit real blockchain transaction
            let result;

            if (type === 'stx') {
                console.log('Initiating STX transfer to creator...');

                // Get creator address from content
                const contentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/${contentId}`);
                if (!contentResponse.ok) {
                    throw new Error('Failed to fetch content details');
                }
                const contentData = await contentResponse.json();
                const creatorAddress = contentData.data.metadata.creator;

                // Execute direct STX transfer with MEMO for verification
                // This ensures money moves visibly and we can verify via Memo
                result = await stacks.transferStx(
                    creatorAddress,
                    priceStx,
                    `Payment for content #${contentId}`
                );
            } else if (type === 'token' && priceToken && tokenContract) {
                console.log('Initiating token transfer to creator...');

                // Get creator address
                const contentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/${contentId}`);
                if (!contentResponse.ok) {
                    throw new Error('Failed to fetch content details');
                }
                const contentData = await contentResponse.json();
                const creatorAddress = contentData.data.metadata.creator;

                // Execute token transfer
                result = await stacks.transferToken(
                    creatorAddress,
                    priceToken,
                    tokenContract,
                    `Payment for content #${contentId}`
                );
            }

            console.log('Transaction submitted:', result);

            if (!result) {
                throw new Error('Transaction failed to submit');
            }

            setTxId(result);
            setPaymentState('confirming');

            // Wait for transaction confirmation
            const confirmed = await pollTransactionStatus(result);

            if (!confirmed) {
                throw new Error('Transaction confirmation timeout or failed');
            }

            // Call backend to record payment and grant access
            console.log('Recording payment in backend...');
            const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/stx`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: address,
                    contentId,
                    txId: result
                })
            });

            if (!paymentResponse.ok) {
                throw new Error('Failed to record payment');
            }

            console.log('✅ Payment recorded successfully');
            setPaymentState('success');
            onSuccess?.();
            fetchBalances();
        } catch (err) {
            setPaymentState('failed');
            if (err instanceof Error) {
                if (err.message.includes('cancelled')) {
                    setError('Payment cancelled by user');
                } else {
                    setError(err.message);
                }
            } else {
                setError('Payment failed');
            }
        }
    };

    const handleRetry = () => {
        setPaymentState('idle');
        setError(null);
        setTxId(null);
        setConfirmationProgress(0);
    };

    if (!address) {
        console.log('PaymentButton: No address, wallet not connected');
        return (
            <Card className="neo-border neo-shadow bg-yellow-300">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-black">
                        <AlertCircle className="w-5 h-5" />
                        <p className="font-black uppercase">Connect wallet to purchase</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    console.log('PaymentButton: Wallet connected', { address, isConnected });

    // Confirming state
    if (paymentState === 'confirming' && txId) {
        return (
            <Card className="neo-border neo-shadow bg-cyan-400">
                <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-3 text-black">
                        <Clock className="w-6 h-6 animate-pulse" />
                        <div>
                            <p className="font-black text-lg uppercase">Confirming Payment...</p>
                            <p className="text-sm font-medium">Waiting for blockchain confirmation</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-black/20 h-3 neo-border">
                        <div
                            className="bg-black h-full transition-all duration-300"
                            style={{ width: `${confirmationProgress}%` }}
                        />
                    </div>

                    <div className="text-xs font-mono bg-white neo-border p-2 break-all select-all">
                        TX: {txId}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full neo-border neo-shadow-sm font-black uppercase"
                        onClick={() => window.open(`https://explorer.hiro.so/txid/${txId}?chain=testnet`, "_blank")}
                    >
                        View in Explorer <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Success state
    if (paymentState === 'success' && txId) {
        return (
            <Card className="neo-border neo-shadow bg-green-400">
                <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-3 text-black">
                        <CheckCircle2 className="w-6 h-6" />
                        <div>
                            <p className="font-black text-lg uppercase">Payment Confirmed!</p>
                            <p className="text-sm font-medium">Access granted</p>
                        </div>
                    </div>
                    <div className="text-xs font-mono bg-white neo-border p-2 break-all select-all">
                        TX: {txId}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full neo-border neo-shadow-sm font-black uppercase"
                        onClick={() => window.open(`https://explorer.hiro.so/txid/${txId}?chain=testnet`, "_blank")}
                    >
                        View in Explorer <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Failed state
    if (paymentState === 'failed') {
        return (
            <Card className="neo-border neo-shadow bg-red-400">
                <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-3 text-black">
                        <AlertCircle className="w-6 h-6" />
                        <div>
                            <p className="font-black text-lg uppercase">Payment Failed</p>
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    </div>
                    {txId && (
                        <div className="text-xs font-mono bg-white neo-border p-2 break-all select-all">
                            TX: {txId}
                        </div>
                    )}
                    <Button
                        onClick={handleRetry}
                        className="w-full bg-black text-white neo-border neo-shadow-sm font-black uppercase hover:bg-gray-800"
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const isUsdcx = tokenContract?.includes("usdcx") || tokenContract === process.env.NEXT_PUBLIC_USDCX_ADDRESS;

    // Idle state - show payment buttons
    return (
        <div className="space-y-4">
            {error && (
                <div className="p-3 bg-red-400 neo-border neo-shadow-sm text-black text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="font-bold">{error}</span>
                </div>
            )}

            <div className="grid gap-3">
                <Button
                    onClick={() => handlePayment('stx')}
                    disabled={paymentState === 'pending'}
                    className="w-full h-14 text-lg font-black relative group bg-orange-500 text-white neo-border neo-shadow transition-all neo-hover uppercase"
                >
                    {paymentState === 'pending' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <span>Pay {(priceStx / 1_000_000).toFixed(2)} STX</span>
                            <span className="text-[10px] opacity-70 font-normal">Balance: {balance.stx.toFixed(2)} STX</span>
                        </div>
                    )}
                </Button>

                {priceToken && tokenContract && (
                    <div className="space-y-2">
                        <Button
                            onClick={() => handlePayment('token')}
                            disabled={paymentState === 'pending'}
                            className="w-full h-14 text-lg font-black neo-border neo-shadow bg-cyan-400 text-black hover:bg-cyan-500 transition-all neo-hover uppercase"
                        >
                            {paymentState === 'pending' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span>Pay ${(priceToken / 100).toFixed(2)} {isUsdcx ? 'USDCx' : 'Token'}</span>
                                    <span className="text-[10px] opacity-70 font-normal">Balance: {balance.usdcx.toFixed(2)} USDCx</span>
                                </div>
                            )}
                        </Button>

                        {isUsdcx && balance.usdcx < (priceToken / 100) && (
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] text-red-500 font-black flex items-center gap-1 uppercase">
                                    <AlertCircle className="w-3 h-3" /> Insufficient USDCx
                                </span>
                                <a
                                    href="/creators/dashboard"
                                    className="text-[10px] text-orange-600 hover:underline flex items-center gap-1 font-black uppercase"
                                >
                                    Get USDCx →
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-50">
                <div className="h-px bg-current flex-1"></div>
                Secure Stacks Payment
                <div className="h-px bg-current flex-1"></div>
            </div>
        </div>
    );
}
