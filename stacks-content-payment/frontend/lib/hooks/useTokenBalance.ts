import { useState, useEffect } from 'react';
import { CONTRACTS } from '@/lib/config';

const HIRO_API_URLS = [
    'https://api.testnet.hiro.so',
    'https://api.hiro.so',
];

export function useTokenBalance(address: string | null, tokenContract: string) {
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!address || !tokenContract) {
            setBalance(0);
            return;
        }

        const fetchBalance = async () => {
            setLoading(true);

            for (const apiUrl of HIRO_API_URLS) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    const response = await fetch(
                        `${apiUrl}/extended/v1/address/${address}/balances`,
                        {
                            signal: controller.signal,
                            headers: { 'Accept': 'application/json' }
                        }
                    );

                    clearTimeout(timeoutId);

                    if (!response.ok) continue;

                    const data = await response.json();

                    // Find the token balance
                    const tokenBalance = data.fungible_tokens?.[tokenContract]?.balance || '0';
                    setBalance(parseInt(tokenBalance) / 1_000_000); // Convert micro-units to full units
                    setLoading(false);
                    return; // Success!

                } catch (error) {
                    console.warn(`Failed to fetch balance from ${apiUrl}:`, error);
                    continue;
                }
            }

            // All attempts failed
            setBalance(0);
            setLoading(false);
        };

        fetchBalance();

        // Refresh every 30 seconds
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, [address, tokenContract]);

    return { balance, loading };
}

export function useUsdcxBalance(address: string | null) {
    return useTokenBalance(address, CONTRACTS.USDCX);
}
