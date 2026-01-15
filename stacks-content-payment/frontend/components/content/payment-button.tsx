'use client';

import { useState } from 'react';
import { useWallet } from '../wallet/wallet-provider';
import { stacks } from '@/lib/stacks';
import { PaymentType } from '@/types';

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

    const handlePayment = async (type: PaymentType) => {
        if (!isConnected || !address) {
            alert('Please connect your wallet first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let result;
            if (type === 'stx') {
                result = await stacks.payWithSTX(contentId, priceStx);
            } else if (type === 'token' && tokenContract) {
                result = await stacks.payWithToken(contentId, tokenContract);
            }

            setTxId(result || 'pending');
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">Connect your wallet to purchase this content</p>
            </div>
        );
    }

    if (txId) {
        return (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">Payment Successful!</p>
                <p className="text-sm text-green-600 mt-1">Transaction ID: {txId.slice(0, 20)}...</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                    {error}
                </div>
            )}

            <button
                onClick={() => handlePayment('stx')}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
                {loading ? 'Processing...' : `Pay ${(priceStx / 1_000_000).toFixed(2)} STX`}
            </button>

            {priceToken && tokenContract && (
                <button
                    onClick={() => handlePayment('token')}
                    disabled={loading}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 font-medium"
                >
                    {loading ? 'Processing...' : `Pay $${(priceToken / 100).toFixed(2)} (xUSDC)`}
                </button>
            )}
        </div>
    );
}
