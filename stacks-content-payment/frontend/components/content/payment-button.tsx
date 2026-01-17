'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../wallet/wallet-provider';
import { stacks } from '@/lib/stacks';
import { PaymentType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PaymentButtonProps {
    contentId: number;
    priceStx: number;
    priceToken?: number;
    tokenContract?: string;
    onSuccess?: () => void;
}

export function PaymentButton({ contentId, priceStx, priceToken, tokenContract, onSuccess }: PaymentButtonProps) {
    const { address, isConnected } = useWallet();
    const [loading, setLoading] = useState(false);
    const [txId, setTxId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<{ stx: number; usdcx: number }>({ stx: 0, usdcx: 0 });

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
            const usdcxAddress = process.env.NEXT_PUBLIC_USDCX_ADDRESS || "SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.token-wusdcx";

            setBalance({
                stx: parseInt(data.stx.balance) / 1000000,
                usdcx: (data.fungible_tokens[usdcxAddress]?.balance || 0) / 1000000
            });
        } catch (err) {
            console.error("Error fetching balances:", err);
        }
    };

    const handlePayment = async (type: PaymentType) => {
        if (!isConnected || !address) {
            setError('Please connect your wallet first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let result;
            if (type === 'stx') {
                if (balance.stx < priceStx / 1000000) {
                    throw new Error("Insufficient STX balance");
                }
                result = await stacks.payWithSTX(contentId, priceStx);
            } else if (type === 'token' && tokenContract) {
                if (priceToken && balance.usdcx < priceToken / 100) {
                    throw new Error("Insufficient USDCx balance. Use the bridge to get more.");
                }
                result = await stacks.payWithToken(contentId, tokenContract);
            }

            setTxId(result || 'pending');
            onSuccess?.();
            fetchBalances();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <Card className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-yellow-800">
                        <AlertCircle className="w-5 h-5" />
                        <p className="font-medium">Connect your wallet to purchase this content</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (txId) {
        return (
            <Card className="border-green-200 bg-green-50/50">
                <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-3 text-green-800">
                        <CheckCircle2 className="w-6 h-6" />
                        <div>
                            <p className="font-bold text-lg">Payment Successful!</p>
                            <p className="text-sm opacity-80">Your access is being granted.</p>
                        </div>
                    </div>
                    <div className="text-xs font-mono bg-white p-2 rounded border border-green-200 break-all select-all">
                        TX: {txId}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-green-700 border-green-200"
                        onClick={() => window.open(`https://explorer.hiro.so/txid/${txId}?chain=testnet`, "_blank")}
                    >
                        View in Explorer <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const isUsdcx = tokenContract?.includes("usdcx") || tokenContract === process.env.NEXT_PUBLIC_USDCX_ADDRESS;

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid gap-3">
                <Button
                    onClick={() => handlePayment('stx')}
                    disabled={loading}
                    className="w-full h-14 text-lg font-semibold relative group bg-blue-600 hover:bg-blue-700"
                >
                    {loading ? (
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
                            disabled={loading}
                            variant="secondary"
                            className="w-full h-14 text-lg font-semibold border-2 border-purple-500/20 hover:border-purple-500/40 bg-purple-50 hover:bg-purple-100 text-purple-700"
                        >
                            {loading ? (
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
                                <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Insufficient USDCx
                                </span>
                                <a
                                    href="/creator/dashboard?tabs=bridge"
                                    className="text-[10px] text-purple-600 hover:underline flex items-center gap-1 font-medium"
                                >
                                    Get USDCx via Bridge <ArrowRight className="w-3 h-3" />
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                <div className="h-px bg-current flex-1"></div>
                Secure Stacks Payment
                <div className="h-px bg-current flex-1"></div>
            </div>
        </div>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
    );
}

